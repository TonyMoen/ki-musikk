'use client'

export function TrackListHeader() {
  return (
    <div
      className="hidden sm:grid items-center px-4 py-2 border-b border-[rgba(90,140,255,0.1)] text-[10px] uppercase tracking-wider text-[rgba(130,170,240,0.35)] font-medium"
      style={{ gridTemplateColumns: '36px 1fr 50px 100px 36px 36px' }}
    >
      <span className="text-center">#</span>
      <span>Tittel</span>
      <span className="text-right">Tid</span>
      <span className="text-right">Dato</span>
      <span />
      <span />
    </div>
  )
}
