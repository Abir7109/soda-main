import { useEffect, useRef } from 'react'
import SlidePanel from '../SlidePanel'
import { FileText, Clipboard, Code } from 'lucide-react'

const TYPE_CONFIG = {
  file: { icon: <FileText size={11} />, title: 'FILE OUTPUT', accent: '#00fbfb' },
  clipboard: { icon: <Clipboard size={11} />, title: 'CLIPBOARD', accent: '#ffe2ab' },
  code: { icon: <Code size={11} />, title: 'CODE OUTPUT', accent: '#00fbfb' },
}

export default function FileOutputPanel({ visible, type = 'file', title, content, success, onClose }) {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.file
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [content])

  return (
    <SlidePanel
      visible={visible}
      direction="bottom"
      title={title || config.title}
      icon={config.icon}
      accentColor={config.accent}
      onClose={onClose}
      autoDismissMs={0}
    >
      {content ? (
        <pre
          className="sp-output-pre"
          style={{ color: success === false ? '#ffb4ab' : '#c8c8c8' }}
        >
          {content}
        </pre>
      ) : (
        <div className="sp-empty">Processing...</div>
      )}
    </SlidePanel>
  )
}
