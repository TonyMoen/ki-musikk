'use client'

export function WizardHeader() {
  return (
    <div className="text-center space-y-3">
      <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-[#F26522]/15 text-[#F26522] border border-[#F26522]/20">
        Autentisk norsk uttale
      </span>
      <h1 className="text-2xl sm:text-3xl font-bold text-white">
        Lag den perfekte festsangen
      </h1>
      <p className="text-sm text-gray-400">
        KI-generert musikk med ekte norsk stemme
      </p>
    </div>
  )
}
