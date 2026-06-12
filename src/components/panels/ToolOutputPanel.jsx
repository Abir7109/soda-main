import SlidePanel from '../SlidePanel'
import { Terminal, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

const STATUS_CONFIG = {
  pending: { icon: <AlertTriangle size={11} />, color: '#ffe2ab', label: 'PENDING CONFIRMATION' },
  running: { icon: <Terminal size={11} />, color: '#00fbfb', label: 'RUNNING' },
  done: { icon: <CheckCircle size={11} />, color: '#00fbfb', label: 'COMPLETE' },
  error: { icon: <XCircle size={11} />, color: '#ffb4ab', label: 'FAILED' },
}

export default function ToolOutputPanel({ visible, toolName, status = 'running', output, args, onConfirm, onDeny, onClose }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.running

  return (
    <SlidePanel
      visible={visible}
      direction="bottom"
      title={`${toolName?.toUpperCase() || 'TOOL'} — ${config.label}`}
      icon={config.icon}
      accentColor={config.color}
      onClose={onClose}
      autoDismissMs={0}
    >
      {/* Show args preview for write_file */}
      {args && toolName === 'write_file' && (
        <div className="sp-tool-preview">
          <div className="sp-tool-preview-header">
            <span className="sp-label">FILE</span>
            <span className="sp-value">{args.path}</span>
          </div>
          {args.content && (
            <pre className="sp-tool-preview-content">{args.content.slice(0, 2000)}{args.content.length > 2000 ? '\n...' : ''}</pre>
          )}
        </div>
      )}

      {/* Show args for other tools */}
      {args && toolName !== 'write_file' && (
        <div className="sp-tool-args">
          {Object.entries(args).map(([key, val]) => (
            <div key={key} className="sp-tool-arg-row">
              <span className="sp-label">{key}</span>
              <span className="sp-value">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Output */}
      {output && (
        <pre className="sp-output-pre" style={{ color: status === 'error' ? '#ffb4ab' : '#c8c8c8' }}>
          {output}
        </pre>
      )}

      {/* Confirmation buttons for pending tools */}
      {status === 'pending' && onConfirm && (
        <div className="sp-confirm-bar">
          <button className="sp-confirm-btn sp-confirm-allow" onClick={onConfirm}>
            ALLOW
          </button>
          {onDeny && (
            <button className="sp-confirm-btn sp-confirm-deny" onClick={onDeny}>
              DENY
            </button>
          )}
        </div>
      )}
    </SlidePanel>
  )
}
