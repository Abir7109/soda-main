import React, { useState } from 'react'

const BandPill = ({ label, score }) => {
  const color = score >= 7 ? 'var(--soda-success)' :
                score >= 6 ? 'var(--soda-accent)' :
                score >= 5 ? 'var(--soda-warning)' : 'var(--soda-error)'
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', padding: '8px 12px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      marginBottom: 6
    }}>
      <span style={{
        fontFamily: 'Space Grotesk, sans-serif',
        fontSize: 12, color: 'var(--soda-muted)',
        textTransform: 'uppercase', letterSpacing: '0.08em'
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
}

export default function IELTSWritingPanel({ data }) {
  const [activeTab, setActiveTab] = useState('scores')

  if (!data) return null

  if (data.task && data.prompt) {
    return (
      <div style={{ padding: 20, height: '100%', overflowY: 'auto' }}>
        <div style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 11, color: 'var(--soda-accent)',
          letterSpacing: '0.15em', marginBottom: 12
        }}>
          WRITING {data.task?.toUpperCase()}
        </div>
        <div style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 13, color: 'var(--soda-muted)',
          textTransform: 'uppercase', letterSpacing: '0.08em',
          marginBottom: 8
        }}>
          {data.type?.replace('_', ' ')} Task
        </div>

        <div style={{
          background: 'rgba(0, 240, 255, 0.04)',
          border: '1px solid rgba(0, 240, 255, 0.2)',
          padding: 16, marginBottom: 16,
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 14, lineHeight: 1.6,
          color: 'var(--soda-text)'
        }}>
          {data.prompt || data.description}
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <div style={{
            flex: 1, background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '10px 14px'
          }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 20, color: 'var(--soda-warning)'
            }}>
              {data.time_allowed}
            </div>
            <div style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 10, color: 'var(--soda-muted)'
            }}>
              TIME ALLOWED
            </div>
          </div>
          <div style={{
            flex: 1, background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '10px 14px'
          }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 20, color: 'var(--soda-accent)'
            }}>
              {data.minimum_words}+
            </div>
            <div style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 10, color: 'var(--soda-muted)'
            }}>
              MIN WORDS
            </div>
          </div>
        </div>

        {data.structure_guide?.length > 0 && (
          <div>
            <div style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 11, color: 'var(--soda-muted)',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              marginBottom: 8
            }}>
              Suggested Structure
            </div>
            {data.structure_guide.map((step, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, padding: '6px 0',
                borderBottom: '1px solid rgba(255,255,255,0.04)'
              }}>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11, color: 'var(--soda-accent)',
                  minWidth: 20
                }}>
                  {i + 1}.
                </span>
                <span style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 12, color: 'var(--soda-text)'
                }}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const { band_scores, overall_band, specific_improvements,
          vocabulary_analysis, grammar_analysis,
          model_introduction, band7_checklist, overall_comment } = data

  const tabs = ['scores', 'grammar', 'vocabulary', 'improve', 'checklist']

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 11, color: 'var(--soda-accent)',
          letterSpacing: '0.15em', marginBottom: 6
        }}>
          WRITING EVALUATION
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
        </div>
        <div style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 12, color: 'var(--soda-muted)',
          marginTop: 4, fontStyle: 'italic'
        }}>
          {overall_comment}
        </div>
      </div>

      <div style={{
        display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: '8px 4px',
            background: activeTab === tab
              ? 'rgba(0, 240, 255, 0.08)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === tab
              ? '2px solid var(--soda-accent)' : '2px solid transparent',
            color: activeTab === tab
              ? 'var(--soda-accent)' : 'var(--soda-muted)',
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 10, letterSpacing: '0.08em',
            textTransform: 'uppercase', cursor: 'pointer'
          }}>
            {tab}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {activeTab === 'scores' && band_scores && (
          <div>
            <BandPill label="Task Achievement" score={band_scores.task_achievement} />
            <BandPill label="Coherence & Cohesion" score={band_scores.coherence_cohesion} />
            <BandPill label="Lexical Resource" score={band_scores.lexical_resource} />
            <BandPill label="Grammatical Range" score={band_scores.grammatical_range} />
          </div>
        )}

        {activeTab === 'grammar' && grammar_analysis && (
          <div>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 14, color: 'var(--soda-error)',
              marginBottom: 12
            }}>
              {grammar_analysis.error_count} errors found
            </div>
            {grammar_analysis.errors?.map((err, i) => (
              <div key={i} style={{
                background: 'rgba(255, 51, 85, 0.05)',
                border: '1px solid rgba(255, 51, 85, 0.2)',
                padding: 12, marginBottom: 8
              }}>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11, color: 'var(--soda-error)',
                  textDecoration: 'line-through', marginBottom: 4
                }}>
                  {err.original}
                </div>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11, color: 'var(--soda-success)',
                  marginBottom: 4
                }}>
                  ✓ {err.corrected}
                </div>
                <div style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 10, color: 'var(--soda-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.08em'
                }}>
                  {err.error_type}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'vocabulary' && vocabulary_analysis && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 11, color: 'var(--soda-muted)',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                marginBottom: 8
              }}>
                Upgrade Suggestions
              </div>
              {vocabulary_analysis.upgrade_suggestions?.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 12, padding: '6px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  alignItems: 'center'
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
                    fontSize: 12, color: 'var(--soda-success)'
                  }}>
                    {s.academic_alternative}
                  </span>
                </div>
              ))}
            </div>
            {vocabulary_analysis.overused_words?.length > 0 && (
              <div>
                <div style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 11, color: 'var(--soda-muted)',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  marginBottom: 8
                }}>
                  Overused Words
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {vocabulary_analysis.overused_words.map((w, i) => (
                    <span key={i} style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 12,
                      background: 'rgba(255, 170, 0, 0.1)',
                      border: '1px solid rgba(255, 170, 0, 0.3)',
                      padding: '3px 8px',
                      color: 'var(--soda-warning)'
                    }}>
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'improve' && specific_improvements && (
          <div>
            {specific_improvements.map((imp, i) => (
              <div key={i} style={{
                background: 'rgba(0, 240, 255, 0.03)',
                border: '1px solid rgba(0, 240, 255, 0.1)',
                padding: 12, marginBottom: 10
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 10, color: 'var(--soda-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.08em'
                  }}>
                    Priority {imp.priority}: {imp.area}
                  </span>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 10, color: 'var(--soda-success)'
                  }}>
                    {imp.band_gain}
                  </span>
                </div>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11, color: 'var(--soda-error)',
                  textDecoration: 'line-through', marginBottom: 4,
                  fontStyle: 'italic'
                }}>
                  "{imp.before}"
                </div>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11, color: 'var(--soda-success)',
                  fontStyle: 'italic'
                }}>
                  ✓ "{imp.after}"
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'checklist' && (
          <div>
            {model_introduction && (
              <div style={{ marginBottom: 16 }}>
                <div style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 11, color: 'var(--soda-muted)',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  marginBottom: 8
                }}>
                  Model Band 8+ Introduction
                </div>
                <div style={{
                  background: 'rgba(0, 255, 136, 0.04)',
                  border: '1px solid rgba(0, 255, 136, 0.15)',
                  padding: 12,
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 13, lineHeight: 1.6,
                  color: 'var(--soda-text)', fontStyle: 'italic'
                }}>
                  {model_introduction}
                </div>
              </div>
            )}
            {band7_checklist && (
              <div>
                <div style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 11, color: 'var(--soda-muted)',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  marginBottom: 8
                }}>
                  Band 7 Checklist
                </div>
                {band7_checklist.map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 10, padding: '7px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.04)'
                  }}>
                    <span style={{ color: 'var(--soda-accent)' }}>□</span>
                    <span style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 12, color: 'var(--soda-text)'
                    }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
