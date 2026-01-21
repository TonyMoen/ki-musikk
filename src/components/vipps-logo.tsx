/**
 * Vipps Logo Component
 * Official Vipps brand logo for use in buttons and branding
 */

interface VippsLogoProps {
  className?: string
  width?: number
  height?: number
}

export function VippsLogo({ className, width = 24, height = 24 }: VippsLogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={width}
      height={height}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
        fill="#FF5B24"
      />
      <path
        d="M8.5 9.5l2 3.5-2 3.5h2l2-3.5-2-3.5h-2zm5 0l2 3.5-2 3.5h2l2-3.5-2-3.5h-2z"
        fill="white"
      />
    </svg>
  )
}

export function VippsLogoFull({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="80" height="24" rx="4" fill="#FF5B24" />
      <text
        x="40"
        y="16"
        textAnchor="middle"
        fill="white"
        fontSize="12"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        Vipps
      </text>
    </svg>
  )
}
