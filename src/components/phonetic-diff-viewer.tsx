'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Sparkles, Check } from 'lucide-react'
import { computeDiff, mergeLyrics, type DiffLine } from '@/lib/phonetic/diff'
import type { PhoneticChange } from '@/types/song'
import { cn } from '@/lib/utils'

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
  const [activeTab, setActiveTab] = useState<'all' | 'changes'>('all')

  // Compute diff when component mounts or lyrics change
  useEffect(() => {
    if (isOpen) {
      const computed = computeDiff(originalLyrics, optimizedLyrics, changes)
      setDiffLines(computed)
    }
  }, [originalLyrics, optimizedLyrics, changes, isOpen])

  // Get lines with changes
  const linesWithChanges = useMemo(() =>
    diffLines.filter(line => line.hasChanges),
    [diffLines]
  )

  // Count selected changes
  const selectedCount = useMemo(() =>
    linesWithChanges.filter(line => line.isOptimizationEnabled).length,
    [linesWithChanges]
  )

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

  // Select/deselect all changes
  const toggleAll = () => {
    const allSelected = selectedCount === linesWithChanges.length
    setDiffLines(prevLines =>
      prevLines.map(line =>
        line.hasChanges
          ? { ...line, isOptimizationEnabled: !allSelected }
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

  // Get change info for a line (original word → optimized word)
  const getChangeInfo = (line: DiffLine): { original: string; optimized: string }[] => {
    const lineChanges = changes.filter(c => c.lineNumber === line.lineNumber)
    return lineChanges.map(c => ({ original: c.original, optimized: c.optimized }))
  }

  // Check if line is a section marker like [Verse 1], [Chorus]
  const isSectionMarker = (line: DiffLine): boolean => {
    const text = line.originalSegments.map(s => s.text).join('').trim()
    return /^\[.+\]$/.test(text)
  }

  // Render line text with highlighted changes
  const renderLineText = (line: DiffLine) => {
    return line.optimizedSegments.map((segment, idx) => (
      <span
        key={idx}
        className={cn(
          segment.isChanged && line.isOptimizationEnabled
            ? 'bg-[#10B981] text-white px-1 rounded'
            : ''
        )}
      >
        {segment.text}
      </span>
    ))
  }

  // Lines to display based on active tab
  const displayLines = activeTab === 'all' ? diffLines : linesWithChanges

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-[#E94560]" />
            <h2 className="text-xl font-semibold">Optimaliser norsk uttale</h2>
          </div>
          <p className="text-sm text-gray-500">
            AI synger bedre med disse justeringene
          </p>

          {/* Stats */}
          <div className="flex items-center gap-3 mt-4">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#10B981]">
              <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
              {changes.length} endringer funnet
            </span>
            <span className="text-sm text-gray-400">
              {selectedCount} av {linesWithChanges.length} valgt
            </span>
          </div>

          {/* Tabs */}
          <div className="flex items-center justify-between mt-4 border-b border-gray-200">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('all')}
                className={cn(
                  'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                  activeTab === 'all'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                Alle linjer
              </button>
              <button
                onClick={() => setActiveTab('changes')}
                className={cn(
                  'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                  activeTab === 'changes'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                Kun endringer ({linesWithChanges.length})
              </button>
            </div>
            <button
              onClick={toggleAll}
              className="text-sm text-[#10B981] hover:text-[#059669] font-medium pb-2"
            >
              {selectedCount === linesWithChanges.length ? 'Avmerk alle' : 'Velg alle'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <div className="space-y-2">
            {displayLines.map(line => {
              const lineText = line.originalSegments.map(s => s.text).join('')
              const isMarker = isSectionMarker(line)
              const changeInfos = getChangeInfo(line)

              // Section markers
              if (isMarker) {
                return (
                  <div key={line.lineNumber} className="py-2">
                    <span className="text-sm font-mono text-gray-400">{lineText}</span>
                  </div>
                )
              }

              // Lines without changes (only shown in "all" tab)
              if (!line.hasChanges) {
                return (
                  <div key={line.lineNumber} className="py-1">
                    <span className="text-sm font-mono text-gray-400">{lineText}</span>
                  </div>
                )
              }

              // Lines with changes - shown as cards
              return (
                <div
                  key={line.lineNumber}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-colors',
                    line.isOptimizationEnabled
                      ? 'border-[#10B981]/50 bg-[#10B981]/5'
                      : 'border-gray-200 bg-gray-50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <div className="flex-shrink-0 pt-0.5">
                      <Checkbox
                        id={`line-${line.lineNumber}`}
                        checked={line.isOptimizationEnabled}
                        onCheckedChange={() => toggleLineOptimization(line.lineNumber)}
                        className={cn(
                          'h-5 w-5 rounded-full',
                          line.isOptimizationEnabled
                            ? 'bg-[#10B981] border-[#10B981] data-[state=checked]:bg-[#10B981]'
                            : ''
                        )}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Change indicators */}
                      <div className="flex flex-wrap gap-3 mb-2">
                        {changeInfos.map((info, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500 font-mono">{info.original}</span>
                            <span className="text-gray-400">→</span>
                            <span className="bg-[#10B981] text-white px-1.5 py-0.5 rounded font-mono text-xs">
                              {info.optimized}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Full line with highlights */}
                      <div className="text-sm font-mono text-gray-700">
                        {renderLineText(line)}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 pt-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleRevert}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            Tilbakestill alle
          </button>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Avbryt
            </Button>
            <Button
              onClick={handleAccept}
              className="bg-[#E94560] hover:bg-[#d63d54] text-white"
            >
              Bruk {selectedCount} endringer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
