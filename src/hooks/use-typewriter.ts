'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface UseTypewriterOptions {
  text: string
  speed?: number // ms per character
  enabled?: boolean
}

interface UseTypewriterReturn {
  displayText: string
  isAnimating: boolean
  skip: () => void
}

export function useTypewriter({
  text,
  speed = 20,
  enabled = true
}: UseTypewriterOptions): UseTypewriterReturn {
  const [displayText, setDisplayText] = useState('')
  const [isAnimating, setIsAnimating] = useState(false)
  const indexRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const textRef = useRef(text)

  const skip = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setDisplayText(textRef.current)
    setIsAnimating(false)
  }, [])

  useEffect(() => {
    textRef.current = text

    if (!enabled || !text) {
      setDisplayText(text)
      setIsAnimating(false)
      return
    }

    // Start animation
    indexRef.current = 0
    setDisplayText('')
    setIsAnimating(true)

    const animate = () => {
      if (indexRef.current < textRef.current.length) {
        indexRef.current++
        setDisplayText(textRef.current.slice(0, indexRef.current))
        timerRef.current = setTimeout(animate, speed)
      } else {
        setIsAnimating(false)
      }
    }

    timerRef.current = setTimeout(animate, speed)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [text, speed, enabled])

  return { displayText, isAnimating, skip }
}
