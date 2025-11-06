import { useState } from 'react'

function getInitials(name: string): string {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/).filter(p => p.length > 0)
  if (parts.length === 0) return 'U'
  if (parts.length === 1) return parts[0][0].toUpperCase()
  // For multiple words, take first letter of first word and first letter of last word
  // But if there's a middle initial (single letter), use that instead
  const first = parts[0][0]
  const last = parts[parts.length - 1][0]
  // If there's a middle part that's a single letter, use that
  if (parts.length === 3 && parts[1].length === 1) {
    return (first + parts[1]).toUpperCase()
  }
  return (first + last).toUpperCase()
}

function getInitialsColor(name: string): string {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
    'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'
  ]
  if (!name) return colors[0]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export default function Profile() {
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}') } catch { return {} }
  })()

  const [userImage, setUserImage] = useState<string>(() => {
    // Check for cached image first
    const cachedImage = localStorage.getItem(`user_image_${user?.id || user?.email || ''}`)
    if (cachedImage) {
      return cachedImage
    }
    
    // Check for imageUrl, image, or picture properties
    const imageUrl = user?.imageUrl || user?.image || user?.picture || user?.photoURL || user?.image_url || ''
    
    // Only use fallback if no image URL is available
    if (imageUrl && imageUrl.trim() !== '') {
      // Use the original URL as-is - don't modify it
      return imageUrl
    }
    return ''
  })

  const [showFallback, setShowFallback] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget
    const currentSrc = img.src
    
    // If it's a Google image that failed, try retrying a few times
    // This handles 429 rate limiting errors
    if (currentSrc.includes('googleusercontent.com') && retryCount < 3) {
      setRetryCount(prev => prev + 1)
      // Try again after a delay, using the original URL
      setTimeout(() => {
        const originalUrl = user?.imageUrl || user?.image || user?.picture || ''
        if (originalUrl) {
          setUserImage(originalUrl)
        }
      }, 2000 * retryCount) // Exponential backoff
      return
    }
    
    // Final fallback - show initials
    setShowFallback(true)
  }

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setShowFallback(false)
    
    // Cache the image as data URL when it successfully loads
    const img = e.currentTarget
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (ctx && img.complete && img.naturalWidth > 0) {
      try {
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        ctx.drawImage(img, 0, 0)
        const dataUrl = canvas.toDataURL('image/png')
        
        // Cache the image in localStorage
        const cacheKey = `user_image_${user?.id || user?.email || ''}`
        localStorage.setItem(cacheKey, dataUrl)
        
        // Update the image source to use cached version
        setUserImage(dataUrl)
      } catch (err) {
        // If canvas operations fail (CORS), just continue with original URL
        console.warn('Could not cache image:', err)
      }
    }
  }

  const userName = user?.name || 'User'
  const initials = getInitials(userName)
  const initialsColor = getInitialsColor(userName)

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold dark:text-slate-100">Profile</h2>
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 flex items-center gap-4">
        {showFallback || !userImage ? (
          <div className={`w-16 h-16 rounded-full ${initialsColor} flex items-center justify-center text-white font-semibold text-xl`}>
            {initials}
          </div>
        ) : (
          <img 
            key={`${userImage}-${retryCount}`}
            src={userImage} 
            alt="avatar" 
            className="w-16 h-16 rounded-full object-cover bg-slate-200 dark:bg-slate-700" 
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
          />
        )}
        <div>
          <div className="font-medium dark:text-slate-100">{user?.name || 'User'}</div>
          <div className="text-slate-500 dark:text-slate-400 text-sm">{user?.email || ''}</div>
        </div>
      </div>
    </div>
  )
}


