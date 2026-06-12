# Calendar Scheduler Feature

## Overview
When user says "save a schedule for [subject] tomorrow at 8", SODA:
1. Saves the schedule to persistent JSON storage
2. Registers it in **Windows Task Scheduler** as a fallback (so even if SODA goes offline, Windows fires a notification on time)
3. Opens an animated floating window with analog clock, calendar, and schedule list

## Windows Task Scheduler Fallback
When `set_schedule` is called, also run `schtasks.exe /create` to register a one-shot task:

```
schtasks /create /tn "SODA_Schedule_<id>" /tr "powershell -WindowStyle Hidden -Command \"...\"" /sc ONCE /st <HH:MM> /sd <YYYY/MM/DD> /f
```

The PowerShell command uses Windows' built-in `NotifyIcon` API (no extra packages) to show a system tray balloon notification:

```
Add-Type -AssemblyName System.Windows.Forms;
$n = New-Object System.Windows.Forms.NotifyIcon;
$n.Icon = [System.Drawing.SystemIcons]::Information;
$n.BalloonTipTitle = 'SODA Schedule';
$n.BalloonTipText = '<title> at <time>';
$n.Visible = $true;
$n.ShowBalloonTip(30000);
Start-Sleep 30;
$n.Dispose()
```

When `delete_schedule` or `cancel_plan` is called, also run `schtasks /delete /tn "SODA_Schedule_<id>" /f` to clean up.

## Files to Create

### 1. `backend/schedules.py` (NEW)
Persistent schedule storage (JSON at `projects/long_term_memory/schedules.json`):
- `set_schedule(title, date, time, details)` — parses "tomorrow" → ISO date, saves, registers Windows task via `schtasks.exe`, returns schedule with id
- `list_schedules()` — returns all schedules sorted by date/time
- `delete_schedule(sid)` — removes from JSON + runs `schtasks /delete` to clean up
- `_register_windows_task(schedule)` — internal: builds `schtasks.exe /create` command with PowerShell toast notification
- `_unregister_windows_task(task_name)` — internal: runs `schtasks.exe /delete`

### 2. `src/components/ScheduleWindow.jsx` (NEW)
Floating window content rendered inside `<FloatingWindow>`:
- **Top-left**: SVG analog clock — circle face, hour/minute/second hands, updates via `setInterval(1000)`, real current time
- **Below clock**: Calendar grid — current month, dates with schedules highlighted (colored dot/badge), animated pulse on scheduled date
- **Bottom list**: All saved schedules in text format with title, date, time, details

## Files to Modify

### 3. `backend/tools.py`
Add tool definitions:
- `set_schedule_tool` — params: `title` (string), `date` (string, "tomorrow"/"today"/"YYYY-MM-DD"), `time` (string, optional "HH:MM"), `details` (string, optional)
- `list_schedules_tool` — zero-param
- `delete_schedule_tool` — param: `id` (string)
Add all three to `tools_list` (now 87 tools)

### 4. `backend/soda.py`
- Add `import schedules` at top
- Add system prompt entries: "SCHEDULE: set_schedule to save events with date/time. Calendar + analog clock window opens automatically. Schedules also registered in Windows Task Scheduler so they fire even if SODA is offline."
- Add handlers for `set_schedule`, `list_schedules`, `delete_schedule`
- `set_schedule` handler: calls `schedules.set_schedule(...)`, emits `open_schedule` with schedule data + all schedules
- `delete_schedule` handler: calls `schedules.delete_schedule(...)`, emits `open_schedule` with remaining schedules
- Add `"set_schedule"`, `"list_schedules"`, `"delete_schedule"` to both auto-allow lists

### 5. `src/App.jsx`
- Add socket event handler for `'open_schedule'`:
  ```js
  const onOpenSchedule = (data) => {
    if (data && data.schedule) openFloatingWindow('schedule_panel', 'SCHEDULE', { type: 'schedule', data }, 460, 60, 480, 520)
  }
  ```
- Register handler in socket useEffect + cleanup

### 6. `src/components/FloatingContent` switch
- Add case `content.type === 'schedule'` → render `<ScheduleWindow data={content.data} />`

## Data Payload (Backend → Frontend)
```json
{
  "schedule": { "id": "a1b2c3d4", "title": "meeting", "date": "2026-06-05", "time": "08:00", "details": "Team standup" },
  "all_schedules": [ /* all saved schedules for calendar view */ ]
}
```

## UI Details
### Analog Clock (SVG, ~120×120px)
- Dark circle face with neon cyan glow (#00fbfb)
- Hour markers: 12 large ticks (12, 3, 6, 9 with numbers, rest thin lines)
- Hour hand: short, thick, white
- Minute hand: long, medium, white
- Second hand: thin, red, with center dot
- All hands rotate via CSS `transform: rotate(Xdeg)` with smooth `transition`
- `useEffect` + `setInterval(1000)` to update

### Calendar Grid
- Current month, 7-column grid (Su Mo Tu We Th Fr Sa)
- Dates with schedules get a small colored dot below them
- The newly added schedule's date gets an animated pulse/glow ring
- Month/year header at top

### Schedule List
- Cards stacked vertically, each showing: date badge | title | time | details
- Scrollable if many entries
- Delete button on each card (frontend-only for v1, or calls `delete_schedule`)

## Architecture Flow
```
User: "save meeting tomorrow at 8"
  → AI: set_schedule(title="meeting", date="tomorrow", time="08:00")
  → backend/schedules.py:
      1. Parses "tomorrow" → "2026-06-05"
      2. Saves to schedules.json
      3. Runs schtasks.exe /create with PowerShell toast notification
      4. Returns schedule
  → backend/soda.py handler:
      Emits 'open_schedule' { schedule, all_schedules }
  → frontend App.jsx:
      Opens floating window with type='schedule'
  → ScheduleWindow.jsx:
      Renders analog clock + calendar + schedule list
```
