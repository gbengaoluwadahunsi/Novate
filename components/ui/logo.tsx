import Image from "next/image"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface LogoProps {
  width?: number
  height?: number
  className?: string
  alt?: string
}

export function Logo({ 
  width = 160, 
  height = 160, 
  className = "", 
  alt = "NovateScribe Logo" 
}: LogoProps) {
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return light version during SSR
    return (
      <Image
        src="/novateLogo-removebg-preview2.png"
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={{ width: 'auto', height: 'auto' }}
        priority
      />
    )
  }

  // Determine current theme
  const currentTheme = theme === 'system' ? systemTheme : theme
  const isDark = currentTheme === 'dark'

  return (
    <Image
      src={isDark ? "/darkmodelogo.png" : "/novateLogo-removebg-preview2.png"}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={{ width: 'auto', height: 'auto' }}
      priority
    />
  )
}

// Simple logo component for cases where we just need the image path
export function LogoImage({ isDark = false }: { isDark?: boolean }) {
  if (isDark) {
    // For dark mode, we'll use CSS filter to make text white
    return "/novateLogo-removebg-preview2.png"
  }
  return "/novateLogo-removebg-preview2.png"
}

// Logo with text that changes color based on theme
export function LogoWithText({ 
  width = 160, 
  height = 160, 
  className = "", 
  showText = true 
}: LogoProps & { showText?: boolean }) {
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentTheme = mounted ? (theme === 'system' ? systemTheme : theme) : 'light'
  const isDark = currentTheme === 'dark'

  return (
    <div className="flex items-center gap-2">
      <Logo width={width} height={height} className={className} />
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
            NovateScribe
            <sup className={`text-xs font-normal ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              ™
            </sup>
          </span>
        </div>
      )}
    </div>
  )
} 