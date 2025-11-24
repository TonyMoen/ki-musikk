'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { computeDiff, mergeLyrics, type DiffLine } from '@/lib/phonetic/diff'
import type { PhoneticChange } from '@/types/song'

interface PhoneticDiffViewerProps {
  originalLyrics: string
  optimizedLyrics: string
  changes: PhoneticChange[]
  isOpen: boolean
  onClose: () => void
  onAccept: (mergedLyrics: string) => void
  onRevert: () => void
}

export function PhoneticDiffViewer({
  originalLyrics,
  optimizedLyrics,
  changes,
  isOpen,
  onClose,
  onAccept,
  onRevert
}: PhoneticDiffViewerProps) {
  const [diffLines, setDiffLines] = useState<DiffLine[]>([])

  // Compute diff when component mounts or lyrics change
  useEffect(() => {
    if (isOpen) {
      const computed = computeDiff(originalLyrics, optimizedLyrics, changes)
      setDiffLines(computed)
    }
  }, [originalLyrics, optimizedLyrics, changes, isOpen])

  // Toggle optimization for a specific line
  const toggleLineOptimization = (lineNumber: number) => {
    setDiffLines(prevLines =>
      prevLines.map(line =>
        line.lineNumber === lineNumber
          ? { ...line, isOptimizationEnabled: !line.isOptimizationEnabled }
          : line
      )
    )
  }

  // Handle accept - merge lyrics based on toggles
  const handleAccept = () => {
    const merged = mergeLyrics(originalLyrics, optimizedLyrics, diffLines)
    onAccept(merged)
  }

  // Handle revert - restore all original lyrics
  const handleRevert = () => {
    onRevert()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Forhåndsvisning av fonetiske endringer
          </DialogTitle>
          <DialogDescription>
            Se fonetiske optimaliseringer for autentisk norsk uttale. Grønne ord er endret.
            Du kan velge hvilke linjer som skal optimaliseres.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2 border-b border-gray-200">
            <div className="text-sm font-semibold text-gray-700 uppercase">
              Original tekst
            </div>
            <div className="text-sm font-semibold text-gray-700 uppercase">
              Optimert tekst
            </div>
          </div>

          {/* Diff lines - mobile: stacked, desktop: side-by-side */}
          <div className="space-y-3 max-h-[50vh] overflow-y-auto">
            {diffLines.map(line => (
              <div
                key={line.lineNumber}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                {/* Original side */}
                <div className="flex items-start space-x-3">
                  {/* Line number */}
                  <div className="flex-shrink-0 w-8 text-sm text-gray-400 font-mono text-right">
                    {line.lineNumber}
                  </div>

                  {/* Original text */}
                  <div className="flex-1 font-mono text-sm leading-relaxed">
                    {line.originalSegments.map((segment, idx) => (
                      <span
                        key={idx}
                        className={
                          segment.isChanged
                            ? 'bg-gray-200 text-gray-600'
                            : 'text-gray-800'
                        }
                      >
                        {segment.text}
                      </span>
                    ))}
                    {line.originalSegments.length === 1 &&
                      line.originalSegments[0].text === '' && (
                        <span className="text-gray-300 italic">
                          (tom linje)
                        </span>
                      )}
                  </div>
                </div>

                {/* Optimized side */}
                <div className="flex items-start space-x-3">
                  {/* Per-line toggle checkbox */}
                  <div className="flex-shrink-0 pt-1">
                    <Checkbox
                      id={`line-${line.lineNumber}`}
                      checked={!line.isOptimizationEnabled}
                      onCheckedChange={() =>
                        toggleLineOptimization(line.lineNumber)
                      }
                      aria-label={`Bruk original for linje ${line.lineNumber}`}
                      className="h-5 w-5"
                    />
                    <label
                      htmlFor={`line-${line.lineNumber}`}
                      className="sr-only"
                    >
                      Bruk original for linje {line.lineNumber}
                    </label>
                  </div>

                  {/* Optimized text */}
                  <div className="flex-1 font-mono text-sm leading-relaxed">
                    {line.optimizedSegments.map((segment, idx) => (
                      <span
                        key={idx}
                        className={
                          segment.isChanged && line.isOptimizationEnabled
                            ? 'bg-[#06D6A0] text-gray-900 font-medium'
                            : segment.isChanged && !line.isOptimizationEnabled
                            ? 'bg-gray-200 text-gray-600 line-through'
                            : 'text-gray-800'
                        }
                      >
                        {segment.text}
                      </span>
                    ))}
                    {line.optimizedSegments.length === 1 &&
                      line.optimizedSegments[0].text === '' && (
                        <span className="text-gray-300 italic">
                          (tom linje)
                        </span>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 p-3 bg-gray-50 rounded-lg text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-[#06D6A0] rounded"></div>
              <span className="text-gray-700">Fonetisk endret</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <span className="text-gray-700">Uendret / deaktivert</span>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox checked={false} className="h-4 w-4" disabled />
              <span className="text-gray-700">Huk av for å bruke original</span>
            </div>
          </div>

          {/* Statistics */}
          <div className="text-sm text-gray-600 text-center">
            {changes.length} fonetiske endringer funnet •{' '}
            {diffLines.filter(line => line.isOptimizationEnabled).length} linjer
            optimalisert
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleRevert}
            className="w-full sm:w-auto"
          >
            Tilbake til original
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Lukk
          </Button>
          <Button
            onClick={handleAccept}
            className="w-full sm:w-auto bg-[#E94560] hover:bg-[#d63d54] text-white"
          >
            Godta endringer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
