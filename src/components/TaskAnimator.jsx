import { useEffect, useState, useRef } from 'react'
import socket from '../services/SocketService'
import { getCategory, CATEGORIES } from './animations'
import FileAnimation from './animations/FileAnimation'
import SearchAnimation from './animations/SearchAnimation'
import SystemAnimation from './animations/SystemAnimation'
import MessageAnimation from './animations/MessageAnimation'
import DefaultAnimation from './animations/DefaultAnimation'

const STATUS_LABELS = {
  pending: 'awaiting',
  running: 'running',
  done: 'complete',
  error: 'failed',
  cancelled: 'cancelled',
  idle: 'idle'
}

const STATUS_CLASS = {
  done: 'is-done',
  error: 'is-error',
  running: 'is-running',
  pending: 'is-running',
  cancelled: 'is-cancelled'
}

function AnimationStage({ category, status }) {
  switch (category) {
    case CATEGORIES.FILE: return <FileAnimation status={status} />
    case CATEGORIES.SEARCH: return <SearchAnimation status={status} />
    case CATEGORIES.SYSTEM: return <SystemAnimation status={status} />
    case CATEGORIES.MESSAGE: return <MessageAnimation status={status} />
    default: return <DefaultAnimation status={status} />
  }
}

export default function TaskAnimator() {
  const [task, setTask] = useState(null)
  const lastConfirmationRef = useRef(null)
  const pendingIdRef = useRef(null)

  useEffect(() => {
    if (!socket) return

    const onConnect = () => {
      setTask(null)
    }

    const onConfirm = (data) => {
      if (!data || !data.id) return
      lastConfirmationRef.current = data
      pendingIdRef.current = data.id
      setTask({
        id: data.id,
        tool: data.tool || 'unknown',
        args: data.args || {},
        status: 'pending',
        category: getCategory(data.tool)
      })
    }

    const handleResolve = (event) => {
      const id = pendingIdRef.current
      if (!id) return
      const detail = event && event.detail
      const confirmed = detail && typeof detail.confirmed === 'boolean' ? detail.confirmed : true
      setTask((prev) => {
        if (!prev || prev.id !== id) return prev
        if (prev.status === 'done' || prev.status === 'error' || prev.status === 'cancelled') return prev
        if (!confirmed) {
          pendingIdRef.current = null
          lastConfirmationRef.current = null
          return { ...prev, status: 'cancelled' }
        }
        return { ...prev, status: 'running' }
      })
    }

    const onToolResult = () => {
      setTask((prev) => {
        if (!prev || prev.status === 'done') return prev
        return { ...prev, status: 'done' }
      })
      setTimeout(() => setTask(null), 500)
    }

    window.addEventListener('soda:tool-resolved', handleResolve)

    socket.on('connect', onConnect)
    socket.on('tool_confirmation_request', onConfirm)
    socket.on('tool_result', onToolResult)
    socket.connect()

    return () => {
      socket.off('connect', onConnect)
      socket.off('tool_confirmation_request', onConfirm)
      socket.off('tool_result', onToolResult)
      window.removeEventListener('soda:tool-resolved', handleResolve)
    }
  }, [])

  // Keep visible until next command — no auto-dismiss

  if (!task) {
    return (
      <div className="task-animator">
        <div className="task-animator-idle">[ SYSTEM IDLE ]</div>
      </div>
    )
  }

  return (
    <div className="task-animator">
      <div className="task-animator-stage">
        <AnimationStage category={task.category} status={task.status} />
      </div>
      <div className="task-animator-info">
        <div className="task-animator-name">{task.tool}</div>
        <div className={`task-animator-status ${STATUS_CLASS[task.status] || ''}`}>
          {STATUS_LABELS[task.status] || task.status}
        </div>
      </div>
    </div>
  )
}
