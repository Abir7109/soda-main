import { useState, useEffect, useRef } from 'react'
import socket from '../../services/SocketService'
import SlidePanel from '../SlidePanel'

export default function TaskTerminalPanel({ visible, onClose }) {
  const [plan, setPlan] = useState(null)
  const scrollRef = useRef(null)
  const hasScrolledRef = useRef(false)

  useEffect(() => {
    if (!visible) return
    const onUpdate = (data) => setPlan(data)
    const onClear = (d) => { if (!d || d.panel === 'task_terminal') setPlan(null) }

    socket.on('task_plan_update', onUpdate)
    socket.on('close_panel', onClear)

    return () => {
      socket.off('task_plan_update', onUpdate)
      socket.off('close_panel', onClear)
    }
  }, [visible])

  useEffect(() => {
    if (scrollRef.current && !hasScrolledRef.current && plan?.tasks?.length) {
      hasScrolledRef.current = true
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [plan?.tasks])

  return (
    <SlidePanel visible={visible} direction="left" title="TASK PLAN" onClose={onClose}>
      {plan && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>
              {plan.title}
            </span>
            <span style={{
              color: plan.status === 'completed' ? 'var(--success)' : 'var(--accent)',
              fontSize: 10, fontWeight: 600,
              padding: '2px 8px', borderRadius: 10,
              border: '1px solid',
              borderColor: plan.status === 'completed' ? 'rgba(34,197,94,0.3)' : 'var(--border-accent)',
            }}>
              {plan.status === 'completed' ? 'done' : 'running'}
            </span>
          </div>

          <div ref={scrollRef} style={{ overflowY: 'auto', maxHeight: 280, marginBottom: 8 }}>
            {plan.tasks?.map((task, i) => {
              const taskColors = {
                pending: 'var(--text-dim)',
                running: 'var(--accent)',
                done: 'var(--success)',
                failed: 'var(--error)',
              }
              const icons = {
                done: '✓',
                failed: '✗',
                running: '◉',
                pending: '○',
              }
              return (
                <div key={task.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '4px 0' }}>
                  <span style={{ color: taskColors[task.status] || 'var(--text-dim)', fontSize: 12, lineHeight: '18px', flexShrink: 0 }}>
                    {icons[task.status] || '○'}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'var(--text-primary)', fontSize: 12, lineHeight: '18px' }}>
                      {task.title}
                    </div>
                    {task.description && (
                      <div style={{ color: 'var(--text-dim)', fontSize: 10, lineHeight: '14px', marginTop: 1 }}>
                        {task.description}
                      </div>
                    )}
                    {task.result && (
                      <div style={{ color: 'var(--text-dim)', fontSize: 10, lineHeight: '14px', marginTop: 1 }}>
                        {task.result}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{
            paddingTop: 6, borderTop: '1px solid var(--border)',
            color: 'var(--text-dim)', fontSize: 10,
          }}>
            {plan.tasks?.filter(t => t.status === 'done' || t.status === 'failed').length || 0}/{plan.tasks?.length || 0} tasks complete
          </div>
        </>
      )}
    </SlidePanel>
  )
}
