/**
 * BackgroundDecoration
 *
 * Decorative-only background layer for the landing page. Renders:
 *   1. Six large SVG music icons positioned around the viewport edges
 *      so they sit behind the central content column (~640px wide).
 *      Each in a distinct accent color, slight rotation, ~7-9% opacity.
 *      Mobile: 3 of 6 visible, scaled smaller per design spec.
 *
 *   2. Two stacked feTurbulence noise layers for grain texture (fine +
 *      coarse). Encoded inline as data:image/svg+xml URLs.
 *
 * All elements:
 *   - position: fixed (don't scroll with content)
 *   - pointer-events: none, user-select: none
 *   - aria-hidden (decorative only)
 *   - Static — no animation or transforms over time
 *
 * Mounted only on the homepage to avoid noise on app routes (/sanger,
 * /innstillinger, etc.). Body bg + grain wouldn't make sense behind a
 * dense list view.
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

// Six icons positioned around the edges, avoiding the central 640-880px column.
// Hard-coded values for SSR/CSR consistency (no Math.random).
const ICONS: IconConfig[] = [
  {
    Icon: Music,
    color: ACCENT.orange,
    position: 'top-[5%] left-[2%]',
    desktopSize: 220,
    mobileSize: 110,
    rotation: -8,
    opacity: 0.085,
    mobileVisible: true,
  },
  {
    Icon: Music2,
    color: ACCENT.violet,
    position: 'top-[8%] right-[3%]',
    desktopSize: 200,
    mobileSize: 100,
    rotation: 6,
    opacity: 0.08,
    mobileVisible: false,
  },
  {
    Icon: Disc3,
    color: ACCENT.cyan,
    position: 'top-[42%] left-[-4%]',
    desktopSize: 240,
    mobileSize: 110,
    rotation: -15,
    opacity: 0.075,
    mobileVisible: true,
  },
  {
    Icon: Mic,
    color: ACCENT.magenta,
    position: 'top-[48%] right-[-3%]',
    desktopSize: 180,
    mobileSize: 90,
    rotation: 4,
    opacity: 0.085,
    mobileVisible: false,
  },
  {
    Icon: Headphones,
    color: ACCENT.peach,
    position: 'bottom-[8%] left-[5%]',
    desktopSize: 190,
    mobileSize: 100,
    rotation: -12,
    opacity: 0.08,
    mobileVisible: true,
  },
  {
    Icon: AudioLines,
    color: ACCENT.orange,
    position: 'bottom-[12%] right-[4%]',
    desktopSize: 210,
    mobileSize: 100,
    rotation: 8,
    opacity: 0.07,
    mobileVisible: false,
  },
]

// Inline SVG noise layers (fine grain + coarse grit) as data URIs.
// feTurbulence params per spec; alpha matrix tightens contrast so the
// noise reads as texture rather than haze.

const FINE_NOISE_SVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.85 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`
const COARSE_NOISE_SVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.35' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`

const fineNoiseUrl = `url("data:image/svg+xml;utf8,${FINE_NOISE_SVG.replace(/"/g, "'")}")`
const coarseNoiseUrl = `url("data:image/svg+xml;utf8,${COARSE_NOISE_SVG.replace(/"/g, "'")}")`

export function BackgroundDecoration() {
  return (
    <>
      {/* Layer 0: music icons (z-0, behind everything) */}
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

      {/* Layer 1: noise (z-1, above icons, below content) */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none fixed inset-0 z-[1]"
        style={{
          backgroundImage: fineNoiseUrl,
          backgroundRepeat: 'repeat',
          opacity: 0.55,
          mixBlendMode: 'overlay',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none select-none fixed inset-0 z-[1]"
        style={{
          backgroundImage: coarseNoiseUrl,
          backgroundRepeat: 'repeat',
          opacity: 0.18,
          mixBlendMode: 'soft-light',
        }}
      />
    </>
  )
}
