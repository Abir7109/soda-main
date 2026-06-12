# SODA Tool → Animation Mapping

> All 99 tools dispatched by `soda.py` mapped to their frontend animation components.

## Legend

| Status | Meaning |
|---|---|
| **✓ Unique** | Dedicated animation file, not shared with any other tool |
| **~ Shared** | Shares an animation file with other tools (candidate for splitting) |
| **✗ Default** | Falls back to `DefaultAnimation` with no custom visual |

---

## Unique Animations (11)

| Tool | Animation | Variant | Panel |
|---|---|---|---|
| `control_system` | SystemAnimation | control | — |
| `open_app` | AppLaunchAnim | launch | — |
| `execute_command` | TerminalAnim | exec | — |
| `run_code` | CodeAnim | exec | — |
| `screenshot` | ScreenshotAnim | capture | — |
| `set_reminder` | AiSchedulerAlarm | default | — |
| `get_weather` | AiWeatherDiagnostics | default | WeatherPanel |
| `get_system_status` | AiSystemMonitor | default | SystemStatusPanel |
| `show_tools` | ToolShowcaseAnim | showcase | — |
| `search_and_send_telegram` | SearchSendAnim | default | — |
| `shutdown_soda` | CloseAnim | window | — |

---

## Shared Animations (62)

### GitDeployAnim — ~14 tools

| Tool | Variant | Panel | Direction |
|---|---|---|---|
| `github_list_repos` | branch | GitHubPanel | bottom |
| `github_create_repo` | branch | GitHubPanel | bottom |
| `github_get_repo` | branch | GitHubPanel | bottom |
| `github_create_pr` | branch | GitHubPanel | bottom |
| `github_list_issues` | branch | GitHubPanel | bottom |
| `github_create_issue` | branch | GitHubPanel | bottom |
| `vercel_list_projects` | deploy | DeployPanel | bottom |
| `vercel_deploy` | deploy | DeployPanel | bottom |
| `vercel_list_deployments` | deploy | DeployPanel | bottom |
| `vercel_get_deployment` | deploy | DeployPanel | bottom |
| `netlify_list_sites` | deploy | DeployPanel | bottom |
| `netlify_get_site` | deploy | DeployPanel | bottom |
| `netlify_deploy` | deploy | DeployPanel | bottom |
| `netlify_create_site` | deploy | DeployPanel | bottom |
| `netlify_list_deploys` | deploy | DeployPanel | bottom |

### MemoryAnim — ~10 tools

| Tool | Variant |
|---|---|
| `remember_fact` | store |
| `recall_facts` | recall |
| `get_user_profile` | profile |
| `set_preference` | settings |
| `forget_fact` | store |
| `list_memory` | recall |
| `remember_person` | store |
| `recall_person` | recall |
| `remember_lesson` | store |
| `remember_face` | store |

### DataAnim — ~6 tools

| Tool | Variant | Panel | Direction |
|---|---|---|---|
| `get_news` | news | NewsPanel | top |
| `get_exchange_rate` | currency | CurrencyPanel | top |
| `list_processes` | processes | ProcessListPanel | right |
| `get_ip_info` | network | NetworkInfoPanel | top |
| `define_word` | define | — | — |
| `get_wikipedia_summary` | wiki | — | — |

### FileTreeAnim — ~5 tools

| Tool | Variant |
|---|---|
| `open_file` | open |
| `create_project` | create |
| `switch_project` | create |
| `list_projects` | list |
| `list_files` | list |

### WebpageAnim — ~5 tools

| Tool | Variant |
|---|---|
| `browse_webpage` | load |
| `open_browser` | open |
| `search_web` | open |
| `search_youtube` | open |
| `webview_action` | open |

### ScreenAnim — ~4 tools

| Tool | Variant |
|---|---|
| `analyze_screen` | analyze |
| `read_screen_text` | ocr |
| `get_active_window` | analyze |
| `recognize_face` | analyze |

### AiTerminalCompiler — ~3 tools

| Tool | Variant |
|---|---|
| `terminal_execute` | default |
| `plan_tasks` | default |
| `update_task` | default |

### CloseAnim — ~3 tools

| Tool | Variant |
|---|---|
| `close_window` | window |
| `close_panel` | panel |
| `shutdown_soda` | window |

### FileAnimation — ~2 tools

| Tool | Variant |
|---|---|
| `write_file` | write |
| `read_file` | read |

### SearchAnimation — ~2 tools

| Tool | Variant |
|---|---|
| `web_search_live` | radar |
| `show_search_results` | results |

### MessageAnimation — ~2 tools

| Tool | Variant |
|---|---|
| `send_whatsapp` | whatsapp |
| `send_discord` | discord |

### TelegramAnim — ~2 tools

| Tool | Variant |
|---|---|
| `send_telegram_message` | message |
| `send_telegram_file` | file |

### ClipboardAnim — ~2 tools

| Tool | Variant |
|---|---|
| `clipboard_read` | read |
| `clipboard_write` | write |

### ReminderAnim — ~2 tools

| Tool | Variant |
|---|---|
| `list_reminders` | list |
| `cancel_reminder` | cancel |

---

## DefaultAnimation — needs custom work (26 tools)

### Window Management (5)

| Tool | Description |
|---|---|
| `window_focus` | Focus a window by title |
| `window_list` | List open windows |
| `window_move` | Move/resize a window |
| `go_background` | Minimize SODA to tray |
| `come_back` | Restore SODA from tray |

### Calendar / Schedule (4)

| Tool | Description |
|---|---|
| `set_schedule` | Create calendar event |
| `list_schedules` | List calendar events |
| `delete_schedule` | Delete calendar event |
| `show_calendar` | Show calendar view |

### Mouse Input (4)

| Tool | Description |
|---|---|
| `mouse_click` | Click at coordinates |
| `mouse_move` | Move mouse cursor |
| `mouse_scroll` | Scroll mouse wheel |
| `mouse_drag` | Drag mouse between points |

### Keyboard Input (2)

| Tool | Description |
|---|---|
| `keyboard_type` | Type text via keyboard |
| `keyboard_press` | Press a keyboard hotkey |

### Notepad (4)

| Tool | Description |
|---|---|
| `notepad_open` | Open notepad tab |
| `notepad_write` | Write to notepad |
| `notepad_read` | Read from notepad |
| `view_file` | View file in notepad |

### State (3)

| Tool | Description |
|---|---|
| `go_to_sleep` | Enter sleep mode |
| `wake_up` | Exit sleep mode |
| `show_agents` | Show available agents |

### Planning (2)

| Tool | Description |
|---|---|
| `cancel_plan` | Cancel active task plan |
| `get_plan` | Get current task plan |

### Other (2)

| Tool | Description |
|---|---|
| `website` | Build / generate a website via Websmith |
| `create_folder` | Create a new folder on disk |
