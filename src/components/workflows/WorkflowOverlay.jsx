import { Suspense, useEffect, useRef } from 'react'
import { getWorkflowComponent } from './index'
import '../../styles/workflows.css'

export default function WorkflowOverlay({ workflow, data, onComplete }) {
  const Component = getWorkflowComponent(workflow)
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      if (onComplete) onComplete()
    }, 60000)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [onComplete])

  if (!Component) return null

  return (
    <div className="wf-overlay">
      <button className="wf-dismiss-btn" onClick={onComplete} title="Dismiss workflow">
        ✕ DISMISS
      </button>
      <Suspense fallback={null}>
        <Component data={data} onComplete={onComplete} />
      </Suspense>
    </div>
  )
}
