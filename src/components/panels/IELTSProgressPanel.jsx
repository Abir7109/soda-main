import React from 'react'

export default function IELTSProgressPanel({ data }) {
  if (!data) return null

  const { target_band, days_until_exam, hours_per_day,
          weekly_allocation, weekly_schedule, priority_areas, tips } = data

  return (
    <div style={{ padding: 20, height: '100%', overflowY: 'auto' }}>
      <div style={{
        fontFamily: 'Space Grotesk, sans-serif',
        fontSize: 11, color: 'var(--soda-accent)',
        letterSpacing: '0.15em', marginBottom: 4
      }}>
        IELTS STUDY PLAN
      </div>
      <div style={{
        fontFamily: 'Space Grotesk, sans-serif',
        fontSize: 22, fontWeight: 700,
        color: 'var(--soda-text)', marginBottom: 20
      }}>
        Personalized Plan
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 8, marginBottom: 20
      }}>
        <div style={{
          background: 'rgba(0, 240, 255, 0.03)',
          border: '1px solid rgba(0, 240, 255, 0.12)',
          padding: 12, textAlign: 'center'
        }}>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 24, fontWeight: 700,
            color: 'var(--soda-accent)'
          }}>
            {target_band}
          </div>
          <div style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 10, color: 'var(--soda-muted)'
          }}>
            TARGET BAND
          </div>
        </div>
        <div style={{
          background: days_until_exam && days_until_exam < 14
            ? 'rgba(255, 51, 85, 0.08)'
            : 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: 12, textAlign: 'center'
        }}>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 24, fontWeight: 700,
            color: days_until_exam && days_until_exam < 14
              ? 'var(--soda-error)' : 'var(--soda-muted)'
          }}>
            {days_until_exam !== null && days_until_exam !== undefined
              ? `${days_until_exam}d` : '—'}
          </div>
          <div style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 10, color: 'var(--soda-muted)'
          }}>
            UNTIL EXAM
          </div>
        </div>
      </div>

      {weekly_allocation && (
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 11, color: 'var(--soda-muted)',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            marginBottom: 10
          }}>
            Weekly Time Allocation ({hours_per_day}h/day)
          </div>
          {Object.entries(weekly_allocation).map(([module, hours]) => (
            <div key={module} style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', padding: '8px 12px',
              borderBottom: '1px solid rgba(255,255,255,0.04)'
            }}>
              <span style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 12, color: 'var(--soda-text)',
                textTransform: 'capitalize'
              }}>
                {module}
              </span>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 14, fontWeight: 600,
                color: 'var(--soda-accent)'
              }}>
                {hours}h/week
              </span>
            </div>
          ))}
        </div>
      )}

      {priority_areas && (
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 11, color: 'var(--soda-warning)',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            marginBottom: 10
          }}>
            Priority Areas
          </div>
          {priority_areas.map(([module, gap], i) => (
            <div key={module} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)'
            }}>
              <span style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 12, color: 'var(--soda-text)',
                textTransform: 'capitalize'
              }}>
                #{i + 1} {module}
              </span>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 12,
                color: gap > 0 ? 'var(--soda-warning)' : 'var(--soda-success)'
              }}>
                {gap > 0 ? `+${gap} gap` : 'on track'}
              </span>
            </div>
          ))}
        </div>
      )}

      {weekly_schedule && (
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 11, color: 'var(--soda-muted)',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            marginBottom: 10
          }}>
            Weekly Schedule
          </div>
          {Object.entries(weekly_schedule).map(([day, tasks]) => (
            <div key={day} style={{ marginBottom: 10 }}>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11, color: 'var(--soda-accent)',
                textTransform: 'uppercase', marginBottom: 4
              }}>
                {day}
              </div>
              {tasks.map((task, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 8, padding: '3px 0',
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 12, color: 'var(--soda-muted)',
                  marginLeft: 16
                }}>
                  <span style={{ color: 'var(--soda-accent)' }}>•</span>
                  {task}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {tips && (
        <div>
          <div style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 11, color: 'var(--soda-success)',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            marginBottom: 10
          }}>
            Tips
          </div>
          {tips.map((tip, i) => (
            <div key={i} style={{
              display: 'flex', gap: 8, padding: '5px 0',
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 12, color: 'var(--soda-text)'
            }}>
              <span style={{ color: 'var(--soda-success)' }}>→</span>
              {tip}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
