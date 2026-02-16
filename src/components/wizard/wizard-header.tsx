'use client'

export function WizardHeader() {
  return (
    <div className="text-center space-y-3">
      <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-[#F26522]/15 text-[#F26522] border border-[#F26522]/20">
        Optimalisert for norsk uttale
      </span>
      <p className="text-sm text-[rgba(180,200,240,0.5)]">
        Skriv teksten, velg stil — ferdig på minutter
      </p>
    </div>
  )
}
