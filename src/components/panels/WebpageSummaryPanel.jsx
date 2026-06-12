import SlidePanel from '../SlidePanel'
import { Globe } from 'lucide-react'

export default function WebpageSummaryPanel({ visible, url, content, success, images, onClose }) {
  return (
    <SlidePanel
      visible={visible}
      direction="bottom"
      title="WEBPAGE SUMMARY"
      icon={<Globe size={11} />}
      accentColor="#00fbfb"
      onClose={onClose}
      autoDismissMs={0}
    >
      {url && (
        <div className="sp-webpage-url">
          <span className="sp-label">SOURCE</span>
          <span className="sp-value">{url}</span>
        </div>
      )}

      {!success ? (
        <div className="sp-webpage-error">
          Could not fetch webpage content.
        </div>
      ) : (
        <>
          {images && images.length > 0 && (
            <div className="sp-webpage-images">
              {images.slice(0, 4).map((imgUrl, i) => (
                <div key={i} className="sp-webpage-img-wrapper">
                  <img
                    src={imgUrl}
                    alt=""
                    className="sp-webpage-img"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                </div>
              ))}
            </div>
          )}

          {content && (
            <div className="sp-webpage-content">
              {content}
            </div>
          )}

          {!content && (
            <div className="sp-empty">Loading webpage...</div>
          )}
        </>
      )}
    </SlidePanel>
  )
}
