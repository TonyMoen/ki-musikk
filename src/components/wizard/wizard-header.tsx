'use client'

/**
 * Trust badge shown above the hero. Pulse is decorative (CSS only) — two
 * staggered expanding rings give a richer, more attention-grabbing effect
 * than a single ping.
 */
export function WizardHeader() {
  return (
    <div className="flex justify-center">
      <span className="inline-flex items-center gap-2.5 px-4 py-1.5 text-sm font-medium rounded-full bg-[#F26522]/15 text-[#F26522] border border-[#F26522]/30">
        <span
          className="relative flex h-2.5 w-2.5 items-center justify-center"
          aria-hidden="true"
        >
          {/* Two staggered rings expand outward and fade */}
          <span className="absolute inline-flex h-full w-full rounded-full bg-[#F26522]/70 animate-pulse-ring" />
          <span
            className="absolute inline-flex h-full w-full rounded-full bg-[#F26522]/50 animate-pulse-ring"
            style={{ animationDelay: '0.6s' }}
          />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#F26522]" />
        </span>
        Optimalisert for norsk uttale
      </span>
    </div>
  )
}
