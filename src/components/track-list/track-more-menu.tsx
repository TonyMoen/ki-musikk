'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Download, Trash2 } from 'lucide-react'

interface TrackMoreMenuProps {
  onDownload: () => void
  onDelete: () => void
  isDownloading?: boolean
}

export function TrackMoreMenu({ onDownload, onDelete, isDownloading }: TrackMoreMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="w-9 h-9 flex items-center justify-center rounded-md text-[rgba(130,170,240,0.45)] hover:text-white transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-[rgba(15,25,50,0.95)] border border-[rgba(90,140,255,0.12)] backdrop-blur-lg shadow-xl min-w-[160px]"
      >
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
            onDownload()
          }}
          disabled={isDownloading}
          className="gap-2 cursor-pointer"
        >
          <Download className="h-4 w-4" />
          Last ned MP3
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[rgba(90,140,255,0.1)]" />
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="gap-2 text-red-400 focus:text-red-400 cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
          Slett
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
