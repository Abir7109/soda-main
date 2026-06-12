import React from 'react'

export default function IELTSReadingPanel({ data }) {
  if (!data) return null

  if (data.type === 'results') {
    const { score, total, percentage, estimated_band, results } = data
    return (
      <div style={{ padding: 20, height: '100%', overflowY: 'auto' }}>
        <div style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 11, color: 'var(--soda-accent)',
          letterSpacing: '0.15em', marginBottom: 16
        }}>
          READING RESULTS
        </div>

        <div style={{
          display: 'flex', gap: 12, marginBottom: 20
        }}>
          <div style={{
            flex: 1, background: 'rgba(0, 240, 255, 0.03)',
            border: '1px solid rgba(0, 240, 255, 0.12)',
            padding: '14px 16px', textAlign: 'center'
          }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 28, fontWeight: 700,
              color: 'var(--soda-accent)'
            }}>
              {score}/{total}
            </div>
            <div style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 10, color: 'var(--soda-muted)',
              letterSpacing: '0.08em', textTransform: 'uppercase'
            }}>
              Correct
            </div>
          </div>
          <div style={{
            flex: 1, background: 'rgba(0, 255, 136, 0.03)',
            border: '1px solid rgba(0, 255, 136, 0.12)',
            padding: '14px 16px', textAlign: 'center'
          }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 28, fontWeight: 700,
              color: 'var(--soda-success)'
            }}>
              {estimated_band}
            </div>
            <div style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 10, color: 'var(--soda-muted)',
              letterSpacing: '0.08em', textTransform: 'uppercase'
            }}>
              Band
            </div>
          </div>
          <div style={{
            flex: 1, background: 'rgba(255, 170, 0, 0.03)',
            border: '1px solid rgba(255, 170, 0, 0.12)',
            padding: '14px 16px', textAlign: 'center'
          }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 28, fontWeight: 700,
              color: 'var(--soda-warning)'
            }}>
              {percentage}%
            </div>
            <div style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 10, color: 'var(--soda-muted)',
              letterSpacing: '0.08em', textTransform: 'uppercase'
            }}>
              Score
            </div>
          </div>
        </div>

        <div style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 11, color: 'var(--soda-muted)',
          letterSpacing: '0.1em', textTransform: 'uppercase',
          marginBottom: 12
        }}>
          Question Review
        </div>

        {results?.map((r, i) => (
          <div key={i} style={{
            background: r.is_correct
              ? 'rgba(0, 255, 136, 0.04)'
              : 'rgba(255, 51, 85, 0.04)',
            border: `1px solid ${r.is_correct
              ? 'rgba(0, 255, 136, 0.15)'
              : 'rgba(255, 51, 85, 0.15)'}`,
            padding: 12, marginBottom: 8
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', marginBottom: 6
            }}>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10, color: 'var(--soda-muted)',
                textTransform: 'uppercase'
              }}>
                Q{r.question_number} — {r.type?.replace(/_/g, ' ')}
              </span>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11,
                color: r.is_correct ? 'var(--soda-success)' : 'var(--soda-error)'
              }}>
                {r.is_correct ? 'CORRECT' : 'WRONG'}
              </span>
            </div>
            <div style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 12, color: 'var(--soda-text)',
              marginBottom: 6
            }}>
              {r.question}
            </div>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              color: 'var(--soda-accent)', marginBottom: 2
            }}>
              Your answer: <span style={{ color: r.is_correct ? 'var(--soda-success)' : 'var(--soda-error)' }}>
                {r.your_answer}
              </span>
            </div>
            {!r.is_correct && (
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11,
                color: 'var(--soda-success)', marginBottom: 4
              }}>
                Correct: {r.correct_answer}
              </div>
            )}
            <div style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 11, color: 'var(--soda-muted)',
              fontStyle: 'italic', marginTop: 4
            }}>
              {r.explanation}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const { title, text, questions, time_suggested_minutes } = data

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 11, color: 'var(--soda-accent)',
          letterSpacing: '0.15em', marginBottom: 4
        }}>
          READING PASSAGE
        </div>
        <div style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 18, fontWeight: 600,
          color: 'var(--soda-text)'
        }}>
          {title}
        </div>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11, color: 'var(--soda-muted)',
          marginTop: 4
        }}>
          {questions?.length} questions · {time_suggested_minutes} min suggested
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          padding: 16, marginBottom: 20,
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 13, lineHeight: 1.7,
          color: 'var(--soda-text)',
          whiteSpace: 'pre-line'
        }}>
          {text}
        </div>

        <div style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 11, color: 'var(--soda-muted)',
          letterSpacing: '0.1em', textTransform: 'uppercase',
          marginBottom: 12
        }}>
          Questions
        </div>

        {questions?.map((q, i) => (
          <div key={i} style={{
            background: 'rgba(0, 240, 255, 0.03)',
            border: '1px solid rgba(0, 240, 255, 0.1)',
            padding: 12, marginBottom: 8
          }}>
            <div style={{
              display: 'flex', gap: 8, marginBottom: 4
            }}>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10, color: 'var(--soda-accent)',
                minWidth: 24
              }}>
                Q{q.number}.
              </span>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10, color: 'var(--soda-muted)',
                textTransform: 'uppercase'
              }}>
                {q.type?.replace(/_/g, ' ')}
              </span>
            </div>
            <div style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 13, color: 'var(--soda-text)',
              marginLeft: 32
            }}>
              {q.question}
            </div>
            {q.options && (
              <div style={{ marginLeft: 32, marginTop: 8 }}>
                {q.options.map((opt, oi) => (
                  <div key={oi} style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 11, color: 'var(--soda-muted)',
                    padding: '2px 0'
                  }}>
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
