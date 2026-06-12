import SlidePanel from '../SlidePanel'
import { GitBranch, Star, GitPullRequest, AlertCircle, ExternalLink } from 'lucide-react'

function RepoCard({ repo }) {
  return (
    <a href={repo.url} target="_blank" rel="noopener noreferrer" className="hud-card"
      style={{ display: 'block', textDecoration: 'none' }}>
      <div className="hud-card-title">
        <GitBranch size={10} />
        {repo.name}
        {(repo.isPrivate || repo.private) && <span className="hud-badge" style={{ borderColor: 'rgba(0,251,251,0.2)', color: 'rgba(255,255,255,0.4)' }}>private</span>}
      </div>
      {repo.description && <div className="hud-card-desc">{repo.description}</div>}
      <div className="hud-card-meta">
        {repo.language && <span className="hud-card-meta-item">{repo.language}</span>}
        <span className="hud-card-meta-item"><Star size={8} /> {repo.stargazersCount || repo.stargazers_count || 0}</span>
      </div>
    </a>
  )
}

function IssueCard({ issue }) {
  return (
    <a href={issue.url} target="_blank" rel="noopener noreferrer" className="hud-card"
      style={{ display: 'block', textDecoration: 'none' }}>
      <div className="hud-card-title">
        {issue.state === 'open' ? <AlertCircle size={10} /> : <GitPullRequest size={10} />}
        #{issue.number} {issue.title}
      </div>
      {issue.body && <div className="hud-card-desc">{issue.body.slice(0, 200)}</div>}
      <div className="hud-card-meta">
        <span className="hud-badge" style={{
          borderColor: issue.state === 'open' ? '#4ade8066' : '#00fbfb44',
          color: issue.state === 'open' ? '#4ade80' : '#00fbfb',
        }}>
          {issue.state}
        </span>
        <span className="hud-card-meta-item">{issue.updatedAt || issue.updated_at}</span>
      </div>
    </a>
  )
}

function PRCard({ pr }) {
  return (
    <a href={pr.url} target="_blank" rel="noopener noreferrer" className="hud-card"
      style={{ display: 'block', textDecoration: 'none' }}>
      <div className="hud-card-title">
        <GitPullRequest size={10} />
        #{pr.number} {pr.title}
      </div>
      <div className="hud-card-meta">
        <span className="hud-badge" style={{
          borderColor: pr.state === 'open' ? '#4ade8066' : '#abf5d166',
          color: pr.state === 'open' ? '#4ade80' : '#abf5d1',
        }}>
          {pr.state}
        </span>
        {pr.merged && <span className="hud-badge" style={{ borderColor: '#abf5d166', color: '#abf5d1' }}>merged</span>}
      </div>
    </a>
  )
}

export default function GitHubPanel({ visible, data, onClose }) {
  if (!data) return null

  const repos = data.repos || []
  const issues = data.issues || []
  const prs = data.pull_requests || []
  const repo = data.repo || data
  const hasRepoData = repos.length > 0 || issues.length > 0 || prs.length > 0 || repo.name

  if (!hasRepoData) {
    return (
      <SlidePanel visible={visible} direction="bottom" title="GITHUB" icon={<GitBranch size={11} />}
        accentColor="#abf5d1" onClose={onClose} autoDismissMs={0}>
        <div className="sp-empty">No data</div>
      </SlidePanel>
    )
  }

  return (
    <SlidePanel visible={visible} direction="bottom" title="GITHUB" icon={<GitBranch size={11} />}
      accentColor="#abf5d1" onClose={onClose} autoDismissMs={0}>
      <div>

        {repo.name && (
          <RepoCard repo={repo} />
        )}

        {repos.length > 0 && (
          <>
            <div style={{ marginTop: repos.length > 1 ? 8 : 0 }}>
              <span className="hud-label">REPOSITORIES ({repos.length})</span>
            </div>
            {repos.map((r, i) => (
              <RepoCard key={i} repo={r} />
            ))}
          </>
        )}

        {issues.length > 0 && (
          <>
            <span className="hud-label" style={{ marginTop: 8 }}>ISSUES ({issues.length})</span>
            {issues.map((issue, i) => (
              <IssueCard key={i} issue={issue} />
            ))}
          </>
        )}

        {prs.length > 0 && (
          <>
            <span className="hud-label" style={{ marginTop: 8 }}>PULL REQUESTS ({prs.length})</span>
            {prs.map((pr, i) => (
              <PRCard key={i} pr={pr} />
            ))}
          </>
        )}
      </div>
    </SlidePanel>
  )
}
