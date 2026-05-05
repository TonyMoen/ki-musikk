'use client'

interface TrackListHeaderProps {
  showMoreMenu?: boolean
}

export function TrackListHeader({ showMoreMenu = false }: TrackListHeaderProps) {
  return (
    <div
      className="hidden sm:grid items-center gap-3 px-4 py-2 border-b border-[var(--border-soft)] text-[10px] uppercase tracking-wider text-[var(--ink-4)] font-medium"
      style={{
        gridTemplateColumns: showMoreMenu
          ? '32px 1fr 60px 120px 36px 36px 36px'
          : '32px 1fr 60px 120px 36px 36px',
      }}
    >
      <span className="text-center">#</span>
      <span>Tittel</span>
      <span className="text-right">Tid</span>
      <span className="text-right">Dato</span>
      <span aria-hidden="true" />
      <span aria-hidden="true" />
      {showMoreMenu && <span aria-hidden="true" />}
    </div>
  )
}
