import { useMemo } from 'react'
import SlidePanel from '../SlidePanel'
import { Database, FileText, Table, FileSpreadsheet } from 'lucide-react'

export default function ScrapedDataPanel({ visible, data, url, onClose, onExport }) {
  const rows = useMemo(() => {
    if (!data) return []
    let d = data
    if (typeof d === 'string') try { d = JSON.parse(d) } catch { return [{ value: d }] }
    if (!Array.isArray(d)) {
      if (typeof d === 'object' && d !== null) {
        for (const k of Object.keys(d)) {
          if (Array.isArray(d[k]) && d[k].length > 0 && typeof d[k][0] === 'object') return d[k]
        }
        return [d]
      }
      return [{ value: String(d) }]
    }
    return d
  }, [data])

  const headers = useMemo(() => {
    if (rows.length === 0) return []
    if (rows.length === 1 && rows[0].value !== undefined) return []
    return Object.keys(rows[0])
  }, [rows])

  const recordCount = rows.length

  return (
    <SlidePanel
      visible={visible}
      direction="left"
      title="SCRAPED DATA"
      icon={<Database size={11} />}
      accentColor="#00fbfb"
      onClose={onClose}
      autoDismissMs={0}
    >
      <div className="sp-scraped-url">
        <span className="sp-label">SOURCE</span>
        <span className="sp-value">{url || 'N/A'}</span>
      </div>

      <div className="sp-scraped-count">
        {recordCount} record{recordCount !== 1 ? 's' : ''} extracted
      </div>

      <div className="sp-scraped-table-wrap">
        {headers.length > 0 ? (
          <table className="sp-scraped-table">
            <thead>
              <tr>
                <th className="sp-scraped-idx">#</th>
                {headers.map(h => (
                  <th key={h}>{h.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td className="sp-scraped-idx">{i + 1}</td>
                  {headers.map(h => (
                    <td key={h}>{formatCell(row[h])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : rows.length === 1 ? (
          <div className="sp-scraped-text">{String(rows[0].value ?? '')}</div>
        ) : (
          <div className="sp-scraped-text">{JSON.stringify(data, null, 2)}</div>
        )}
      </div>

      <div className="sp-scraped-actions">
        <button className="sp-scraped-btn" onClick={() => onExport && onExport('markdown')}>
          <FileText size={12} /> Markdown
        </button>
        <button className="sp-scraped-btn" onClick={() => onExport && onExport('csv')}>
          <Table size={12} /> CSV
        </button>
        <button className="sp-scraped-btn" onClick={() => onExport && onExport('docx')}>
          <FileSpreadsheet size={12} /> DOCX
        </button>
      </div>
    </SlidePanel>
  )
}

function formatCell(val) {
  if (val === null || val === undefined) return ''
  if (typeof val === 'object') return JSON.stringify(val).slice(0, 120)
  return String(val).slice(0, 200)
}
