import SlidePanel from '../SlidePanel'
import { ArrowRightLeft } from 'lucide-react'

export default function CurrencyPanel({ visible, data, onClose }) {
  if (!data) return null
  if (data.error) {
    return (
      <SlidePanel visible={visible} direction="top" title="CURRENCY" icon={<ArrowRightLeft size={11} />}
        accentColor="#ffe2ab" onClose={onClose} autoDismissMs={0}>
        <div className="sp-empty">{data.error}</div>
      </SlidePanel>
    )
  }

  const from = data.from || data.base || 'USD'
  const to = data.to || data.target || 'INR'
  const rate = data.rate ?? data.exchange_rate ?? '--'
  const amount = data.amount ?? 1
  const result = data.result ?? (rate !== '--' ? (amount * rate).toFixed(2) : '--')

  return (
    <SlidePanel visible={visible} direction="top" title="CURRENCY" icon={<ArrowRightLeft size={11} />}
      accentColor="#ffe2ab" onClose={onClose} autoDismissMs={0}>
      <div className="sp-currency-panel">
        <div className="sp-currency-conversion">
          <div className="sp-currency-from">
            <span className="sp-currency-amount">{amount}</span>
            <span className="sp-currency-code">{from}</span>
          </div>
          <div className="sp-currency-arrow">
            <svg viewBox="0 0 30 20" width="30" height="20">
              <line x1="2" y1="10" x2="22" y2="10" stroke="#ffe2ab" strokeWidth="1.5" strokeOpacity="0.5" />
              <polygon points="20,6 28,10 20,14" fill="#ffe2ab" fillOpacity="0.5" />
            </svg>
          </div>
          <div className="sp-currency-to">
            <span className="sp-currency-amount">{result}</span>
            <span className="sp-currency-code">{to}</span>
          </div>
        </div>
        <div className="sp-currency-rate">
          1 {from} = {rate} {to}
        </div>
      </div>
    </SlidePanel>
  )
}
