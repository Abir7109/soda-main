import React from 'react'

export default function IELTSVocabPanel({ data }) {
  if (!data) return null

  const { topic, vocabulary, band_upgrades } = data

  return (
    <div style={{ padding: 20, height: '100%', overflowY: 'auto' }}>
      <div style={{
        fontFamily: 'Space Grotesk, sans-serif',
        fontSize: 11, color: 'var(--soda-accent)',
        letterSpacing: '0.15em', marginBottom: 4
      }}>
        IELTS VOCABULARY
      </div>
      <div style={{
        fontFamily: 'Space Grotesk, sans-serif',
        fontSize: 22, fontWeight: 700,
        color: 'var(--soda-text)', textTransform: 'uppercase',
        marginBottom: 20
      }}>
        {topic}
      </div>

      {vocabulary && Object.keys(vocabulary).length > 0 ? (
        <>
          {Object.entries(vocabulary).map(([type, words]) => (
            <div key={type} style={{ marginBottom: 20 }}>
              <div style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 10, color: 'var(--soda-accent)',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                marginBottom: 8
              }}>
                {type}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {words.map((word, i) => (
                  <span key={i} style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 12,
                    background: 'rgba(0, 240, 255, 0.06)',
                    border: '1px solid rgba(0, 240, 255, 0.15)',
                    padding: '4px 10px',
                    color: 'var(--soda-text)'
                  }}>
                    {word}
                  </span>
                ))}
              </div>
            </div>
          ))}

          <div style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 11, color: 'var(--soda-muted)',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            marginBottom: 12, marginTop: 20
          }}>
            Band Upgrades
          </div>

          {band_upgrades && Object.entries(band_upgrades).map(([level, upgrades]) => (
            <div key={level} style={{ marginBottom: 16 }}>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10, color: 'var(--soda-warning)',
                textTransform: 'uppercase', marginBottom: 8,
                letterSpacing: '0.08em'
              }}>
                {level.replace(/_/g, ' → ')}
              </div>
              {Object.entries(upgrades).map(([basic, better]) => (
                <div key={basic} style={{
                  display: 'flex', gap: 10, padding: '5px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  alignItems: 'center'
                }}>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 12, color: 'var(--soda-error)',
                    minWidth: 60
                  }}>
                    {basic}
                  </span>
                  <span style={{ color: 'var(--soda-muted)' }}>→</span>
                  <span style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 12, color: 'var(--soda-success)'
                  }}>
                    {better}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </>
      ) : (
        <div style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 13, color: 'var(--soda-muted)',
          padding: 20, textAlign: 'center'
        }}>
          {data.message || 'No vocabulary data available.'}
        </div>
      )}
    </div>
  )
}
