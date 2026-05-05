/**
 * BackgroundDecoration
 *
 * Decorative-only background layer for the landing page. Renders six
 * large SVG music icons positioned around the viewport edges so they sit
 * behind the central content column (~640px wide). Each in a distinct
 * accent color, slight rotation, ~7-9% opacity.
 *
 * Mobile: 3 of 6 visible, scaled smaller per design spec.
 *
 * All elements:
 *   - position: fixed (don't scroll with content)
 *   - pointer-events: none, user-select: none
 *   - aria-hidden (decorative only)
 *   - Static — no animation or transforms over time
 *
 * Mounted only on the homepage to avoid noise on app routes (/sanger,
 * /innstillinger, etc.).
 */

import {
  Music,
  Music2,
  Disc3,
  Mic,
  Headphones,
  AudioLines,
  type LucideIcon,
} from 'lucide-react'

// Accent colors — orange brand + 4 supporting hues per spec
const ACCENT = {
  orange: '#F26522',
  violet: '#8B5CF6',
  cyan: '#06B6D4',
  magenta: '#EC4899',
  peach: '#FBA871',
} as const

interface IconConfig {
  Icon: LucideIcon
  color: string
  /** Tailwind position classes (e.g., 'top-[5%] left-[2%]') */
  position: string
  /** Size in px on desktop */
  desktopSize: number
  /** Size in px on mobile (only relevant if mobileVisible) */
  mobileSize: number
  /** Rotation in degrees (-18 to +8 per spec) */
  rotation: number
  /** Opacity 0.07-0.09 per spec */
  opacity: number
  /** Whether this icon is visible on <sm screens */
  mobileVisible: boolean
}

// Six icons framing the central content column, sitting just outside the
// 720px card on desktop. Hard-coded for SSR/CSR consistency (no Math.random).
const ICONS: IconConfig[] = [
  {
    Icon: Music,
    color: ACCENT.orange,
    position: 'top-[5%] left-[7%]',
    desktopSize: 220,
    mobileSize: 110,
    rotation: -8,
    opacity: 0.085,
    mobileVisible: true,
  },
  {
    Icon: Music2,
    color: ACCENT.violet,
    position: 'top-[7%] right-[7%]',
    desktopSize: 200,
    mobileSize: 100,
    rotation: 6,
    opacity: 0.08,
    mobileVisible: false,
  },
  {
    Icon: Disc3,
    color: ACCENT.cyan,
    position: 'top-[42%] left-[5%]',
    desktopSize: 240,
    mobileSize: 110,
    rotation: -15,
    opacity: 0.075,
    mobileVisible: true,
  },
  {
    Icon: Mic,
    color: ACCENT.magenta,
    position: 'top-[48%] right-[5%]',
    desktopSize: 180,
    mobileSize: 90,
    rotation: 4,
    opacity: 0.085,
    mobileVisible: false,
  },
  {
    Icon: Headphones,
    color: ACCENT.peach,
    position: 'bottom-[10%] left-[9%]',
    desktopSize: 190,
    mobileSize: 100,
    rotation: -12,
    opacity: 0.08,
    mobileVisible: true,
  },
  {
    Icon: AudioLines,
    color: ACCENT.orange,
    position: 'bottom-[10%] right-[7%]',
    desktopSize: 210,
    mobileSize: 100,
    rotation: 8,
    opacity: 0.07,
    mobileVisible: false,
  },
]

export function BackgroundDecoration() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none fixed inset-0 z-0 overflow-hidden"
    >
      {ICONS.map(
        (
          { Icon, color, position, desktopSize, mobileSize, rotation, opacity, mobileVisible },
          idx
        ) => (
          <div
            key={idx}
            className={`absolute ${position} ${mobileVisible ? '' : 'hidden sm:block'}`}
            style={{
              transform: `rotate(${rotation}deg)`,
              opacity,
            }}
          >
            {/* Desktop size */}
            <Icon
              color={color}
              className="hidden sm:block"
              style={{ width: desktopSize, height: desktopSize }}
              strokeWidth={1.4}
            />
            {/* Mobile size (only renders when mobileVisible is true via parent class) */}
            {mobileVisible && (
              <Icon
                color={color}
                className="sm:hidden"
                style={{ width: mobileSize, height: mobileSize }}
                strokeWidth={1.4}
              />
            )}
          </div>
        )
      )}
    </div>
  )
}
