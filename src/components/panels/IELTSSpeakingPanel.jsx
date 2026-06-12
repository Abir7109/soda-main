import React, { useState } from 'react'

export default function IELTSSpeakingPanel({ data }) {
  const [tab, setTab] = useState('scores')

  if (!data) return null

  if (data.part && !data.overall_band) {
    return (
      <div style={{ padding: 20, height: '100%', overflowY: 'auto' }}>
        <div style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 11, color: 'var(--soda-accent)',
          letterSpacing: '0.15em', marginBottom: 8
        }}>
          SPEAKING PART {data.part}
        </div>

        {data.topic && (
          <div style={{
            background: 'rgba(0, 240, 255, 0.04)',
            border: '1px solid rgba(0, 240, 255, 0.2)',
            padding: 20, marginBottom: 16
          }}>
            <div style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 16, fontWeight: 600,
              color: 'var(--soda-text)', marginBottom: 16
            }}>
              {data.topic}
            </div>
            <div style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 12, color: 'var(--soda-muted)',
              marginBottom: 6, textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}>
              You should say:
            </div>
            {data.bullet_points?.map((point, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '5px 0' }}>
                <span style={{ color: 'var(--soda-accent)' }}>•</span>
                <span style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 13, color: 'var(--soda-text)'
                }}>
                  {point}
                </span>
              </div>
            ))}
          </div>
        )}

        {data.prep_time_seconds && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <div style={{
              flex: 1, background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)', padding: 12
            }}>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 22, color: 'var(--soda-warning)'
              }}>
                {data.prep_time_seconds}s
              </div>
              <div style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 10, color: 'var(--soda-muted)'
              }}>
                PREP TIME
              </div>
            </div>
            <div style={{
              flex: 1, background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)', padding: 12
            }}>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 22, color: 'var(--soda-accent)'
              }}>
                {data.speak_time_seconds}s
              </div>
              <div style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 10, color: 'var(--soda-muted)'
              }}>
                SPEAK TIME
              </div>
            </div>
          </div>
        )}

        {data.questions && (
          <div>
            <div style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 11, color: 'var(--soda-muted)',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              marginBottom: 10
            }}>
              Discussion Questions
            </div>
            {data.questions.map((q, i) => (
              <div key={i} style={{
                background: 'rgba(0, 240, 255, 0.03)',
                border: '1px solid rgba(0, 240, 255, 0.1)',
                padding: 10, marginBottom: 8
              }}>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11, color: 'var(--soda-accent)'
                }}>
                  Q{i + 1}:{' '}
                </span>
                <span style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 13, color: 'var(--soda-text)'
                }}>
                  {q}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const { band_scores, overall_band, strengths, improvements,
          vocabulary_feedback, grammar_errors,
          band7_tip, filler_words_count } = data

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
          SPEAKING EVALUATION
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 40, fontWeight: 700,
            color: overall_band >= 7
              ? 'var(--soda-success)' : 'var(--soda-warning)'
          }}>
            {overall_band}
          </span>
          <span style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 14, color: 'var(--soda-muted)'
          }}>
            Overall Band
          </span>
          {filler_words_count > 0 && (
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11, color: 'var(--soda-error)',
              background: 'rgba(255,51,85,0.1)',
              padding: '2px 8px'
            }}>
              {filler_words_count} filler words
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {['scores', 'feedback', 'grammar', 'vocab'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '8px 4px',
            background: tab === t ? 'rgba(0, 240, 255, 0.08)' : 'transparent',
            border: 'none',
            borderBottom: tab === t
              ? '2px solid var(--soda-accent)' : '2px solid transparent',
            color: tab === t ? 'var(--soda-accent)' : 'var(--soda-muted)',
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 10, letterSpacing: '0.08em',
            textTransform: 'uppercase', cursor: 'pointer'
          }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {tab === 'scores' && band_scores && (
          <div>
            {[
              ['Fluency & Coherence', band_scores.fluency_coherence],
              ['Lexical Resource', band_scores.lexical_resource],
              ['Grammatical Range', band_scores.grammatical_range],
              ['Pronunciation', band_scores.pronunciation]
            ].map(([label, score]) => {
              const color = score >= 7 ? 'var(--soda-success)' :
                           score >= 6 ? 'var(--soda-accent)' :
                           score >= 5 ? 'var(--soda-warning)' : 'var(--soda-error)'
              return (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', padding: '10px 12px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  marginBottom: 6
                }}>
                  <span style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 12, color: 'var(--soda-muted)'
                  }}>
                    {label}
                  </span>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 18, fontWeight: 700, color
                  }}>
                    {score}
                  </span>
                </div>
              )
            })}

            {band7_tip && (
              <div style={{
                marginTop: 12,
                background: 'rgba(0, 255, 136, 0.05)',
                border: '1px solid rgba(0, 255, 136, 0.2)',
                padding: 12
              }}>
                <div style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 10, color: 'var(--soda-success)',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  marginBottom: 6
                }}>
                  Top Tip to Reach Band 7
                </div>
                <div style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 13, color: 'var(--soda-text)'
                }}>
                  {band7_tip}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'feedback' && (
          <div>
            {strengths?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 11, color: 'var(--soda-success)',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  marginBottom: 8
                }}>
                  Strengths
                </div>
                {strengths.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, padding: '5px 0' }}>
                    <span style={{ color: 'var(--soda-success)' }}>✓</span>
                    <span style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 12, color: 'var(--soda-text)'
                    }}>
                      {s}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {improvements?.length > 0 && (
              <div>
                <div style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 11, color: 'var(--soda-warning)',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  marginBottom: 8
                }}>
                  Improvements
                </div>
                {improvements.map((imp, i) => (
                  <div key={i} style={{
                    background: 'rgba(255, 170, 0, 0.05)',
                    border: '1px solid rgba(255, 170, 0, 0.15)',
                    padding: 10, marginBottom: 8
                  }}>
                    <div style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 12, color: 'var(--soda-warning)',
                      marginBottom: 6
                    }}>
                      {imp.issue}
                    </div>
                    <div style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 11, color: 'var(--soda-error)',
                      textDecoration: 'line-through', fontStyle: 'italic',
                      marginBottom: 3
                    }}>
                      "{imp.example_from_response}"
                    </div>
                    <div style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 11, color: 'var(--soda-success)',
                      fontStyle: 'italic', marginBottom: 4
                    }}>
                      ✓ "{imp.better_version}"
                    </div>
                    <div style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 10, color: 'var(--soda-accent)'
                    }}>
                      {imp.band_impact}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'grammar' && grammar_errors && (
          <div>
            {grammar_errors.length === 0 ? (
              <div style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 13, color: 'var(--soda-success)',
                textAlign: 'center', padding: 20
              }}>
                No grammar errors detected!
              </div>
            ) : (
              grammar_errors.map((err, i) => (
                <div key={i} style={{
                  background: 'rgba(255, 51, 85, 0.05)',
                  border: '1px solid rgba(255, 51, 85, 0.2)',
                  padding: 10, marginBottom: 8
                }}>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 11, color: 'var(--soda-error)',
                    textDecoration: 'line-through', marginBottom: 4
                  }}>
                    {err.error}
                  </div>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 11, color: 'var(--soda-success)', marginBottom: 4
                  }}>
                    ✓ {err.correction}
                  </div>
                  <div style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 10, color: 'var(--soda-muted)',
                    textTransform: 'uppercase'
                  }}>
                    {err.type}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'vocab' && vocabulary_feedback && (
          <div>
            {vocabulary_feedback.suggested_upgrades?.map((s, i) => (
              <div key={i} style={{
                display: 'flex', gap: 8, padding: '7px 0',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                alignItems: 'center', flexWrap: 'wrap'
              }}>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 12, color: 'var(--soda-error)'
                }}>
                  {s.used}
                </span>
                <span style={{ color: 'var(--soda-muted)' }}>→</span>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 12, color: 'var(--soda-warning)'
                }}>
                  {s.better}
                </span>
                <span style={{ color: 'var(--soda-muted)' }}>→</span>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 12, color: 'var(--soda-success)'
                }}>
                  {s.best}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
