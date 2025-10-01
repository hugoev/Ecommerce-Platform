import * as React from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

interface DialogProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface DialogContentProps {
  children: React.ReactNode
  className?: string
}

interface DialogHeaderProps {
  children: React.ReactNode
  className?: string
}

interface DialogTitleProps {
  children: React.ReactNode
  className?: string
}

interface DialogDescriptionProps {
  children: React.ReactNode
  className?: string
}

const Dialog: React.FC<DialogProps> = ({ children, open, onOpenChange }) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange?.(false)}
      />

      {/* Content */}
      <div className="relative z-50">
        {children}
      </div>
    </div>
  )
}

const DialogContent: React.FC<DialogContentProps> = ({ children, className }) => (
  <div className={cn(
    "relative w-full max-w-lg bg-white rounded-lg shadow-lg p-6",
    className
  )}>
    {children}
  </div>
)

const DialogHeader: React.FC<DialogHeaderProps> = ({ children, className }) => (
  <div className={cn("mb-4", className)}>
    {children}
  </div>
)

const DialogTitle: React.FC<DialogTitleProps> = ({ children, className }) => (
  <h2 className={cn("text-lg font-semibold text-gray-900", className)}>
    {children}
  </h2>
)

const DialogDescription: React.FC<DialogDescriptionProps> = ({ children, className }) => (
  <p className={cn("text-sm text-gray-600 mt-2", className)}>
    {children}
  </p>
)

const DialogClose: React.FC<{ onClick: () => void; className?: string }> = ({ onClick, className }) => (
  <button
    onClick={onClick}
    className={cn(
      "absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity",
      className
    )}
  >
    <X className="h-4 w-4" />
    <span className="sr-only">Close</span>
  </button>
)

const DialogTrigger: React.FC<{ children: React.ReactNode; onClick: () => void }> = ({ children, onClick }) => (
  <div onClick={onClick}>
    {children}
  </div>
)

const DialogFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn("flex justify-end space-x-2 mt-6", className)}>
    {children}
  </div>
)

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogTrigger,
  DialogFooter,
}
