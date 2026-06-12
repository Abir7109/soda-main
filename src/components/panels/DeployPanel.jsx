import SlidePanel from '../SlidePanel'
import { Cloud, Globe, ExternalLink, Clock } from 'lucide-react'

function DeployCard({ deploy, label }) {
  const stateStr = deploy.state?.toLowerCase?.() || deploy.state || ''
  const stateColor = ['ready', 'published', 'success'].includes(stateStr) ? '#4ade80'
    : stateStr === 'error' || stateStr === 'failed' ? '#ffb4ab'
    : '#ffe2ab'

  return (
    <div className="hud-card"
      onClick={() => deploy.url && window.open(deploy.url, '_blank')}>
      <div className="hud-card-title">
        <Globe size={10} />
        {deploy.name || deploy.project || deploy.id?.slice(0, 8)}
        {label && <span className="hud-badge" style={{ borderColor: `${stateColor}44`, color: stateColor }}>{label}</span>}
      </div>
      {deploy.description && <div className="hud-card-desc">{deploy.description}</div>}
      <div className="hud-card-meta">
        {deploy.state && (
          <span className="hud-badge" style={{ borderColor: `${stateColor}66`, color: stateColor }}>
            {deploy.state}
          </span>
        )}
        {deploy.url && (
          <span className="hud-card-meta-item">
            <ExternalLink size={8} /> {deploy.url.slice(0, 40)}
          </span>
        )}
        {deploy.updated_at && (
          <span className="hud-card-meta-item">
            <Clock size={8} /> {deploy.updated_at}
          </span>
        )}
      </div>
      {deploy.logs && (
        <pre style={{
          fontSize: 9, marginTop: 6, color: 'rgba(200,200,200,0.6)',
          maxHeight: 80, overflow: 'auto', whiteSpace: 'pre-wrap',
          borderTop: '1px solid rgba(0,251,251,0.06)', paddingTop: 4,
        }}>
          {deploy.logs}
        </pre>
      )}
    </div>
  )
}

export default function DeployPanel({ visible, data, onClose }) {
  if (!data) return null

  const deployments = data.deployments || data.deploys || []
  const project = data.project || data.site || {}
  const deploy = data.deploy || {}
  const hasDeployData = deployments.length > 0 || project.name || deploy.id

  if (!hasDeployData) {
    return (
      <SlidePanel visible={visible} direction="bottom" title="DEPLOY" icon={<Cloud size={11} />}
        accentColor="#ffe2ab" onClose={onClose} autoDismissMs={0}>
        <div className="sp-empty">No deployment data</div>
      </SlidePanel>
    )
  }

  return (
    <SlidePanel visible={visible} direction="bottom" title="DEPLOY" icon={<Cloud size={11} />}
      accentColor="#ffe2ab" onClose={onClose} autoDismissMs={0}>
      <div>

        {project.name && (
          <DeployCard deploy={project} label={project.framework || 'site'} />
        )}

        {deploy.id && (
          <DeployCard deploy={deploy} label="current" />
        )}

        {deployments.length > 0 && (
          <>
            <span className="hud-label" style={{ marginTop: 8 }}>DEPLOYMENTS ({deployments.length})</span>
            {deployments.map((d, i) => (
              <DeployCard key={i} deploy={d} />
            ))}
          </>
        )}
      </div>
    </SlidePanel>
  )
}
