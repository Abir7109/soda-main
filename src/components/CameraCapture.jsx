import { useEffect, useRef } from 'react'
import socket from '../services/SocketService'

export default function CameraCapture() {
  const streamRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    let active = true

    async function captureFrame() {
      const canvas = canvasRef.current
      const video = videoRef.current
      if (!canvas || !video || video.readyState < 2) return null
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, 640, 480)
      return new Promise(resolve => {
        canvas.toBlob(blob => {
          if (!blob) { resolve(null); return }
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result.split(',')[1])
          reader.readAsDataURL(blob)
        }, 'image/jpeg', 0.6)
      })
    }

    async function start() {
      try {
        console.log('[CameraCapture] Requesting camera...')
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' }
        })
        if (!active) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        console.log('[CameraCapture] Camera streaming')

        const video = document.createElement('video')
        video.srcObject = stream
        video.setAttribute('playsinline', '')
        video.play()
        videoRef.current = video

        const canvas = document.createElement('canvas')
        canvas.width = 640
        canvas.height = 480
        canvasRef.current = canvas

        video.onloadeddata = async () => {
          const b64 = await captureFrame()
          if (b64) socket.emit('video_frame', { image: b64 })
        }
      } catch (err) {
        console.warn('[CameraCapture] Camera unavailable:', err?.message)
      }
    }

    const onRequestFrame = async (data) => {
      const b64 = await captureFrame()
      if (b64) socket.emit('face_frame_response', { id: data.id, image: b64 })
    }

    socket.on('request_face_frame', onRequestFrame)
    start()

    return () => {
      active = false
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
      socket.off('request_face_frame', onRequestFrame)
    }
  }, [])

  return null
}
