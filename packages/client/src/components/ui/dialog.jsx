import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { Button } from './button'

/**
 * Modal/Dialog component with overlay
 * Can be controlled or uncontrolled (with trigger)
 *
 * @param {Object} props
 * @param {string} props.title - Dialog title
 * @param {ReactNode} props.children - Dialog content
 * @param {ReactNode} props.trigger - Element that triggers dialog
 * @param {boolean} props.open - Controlled open state
 * @param {function} props.onOpenChange - Callback when open state changes
 * @param {string} props.className - Additional CSS classes for content
 */
export function Dialog({
  title,
  children,
  trigger,
  open: controlledOpen,
  onOpenChange,
  className = ''
}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen

  const handleOpenChange = newOpen => {
    if (!isControlled) {
      setInternalOpen(newOpen)
    }
    onOpenChange?.(newOpen)
  }

  // Close on Escape key
  useEffect(() => {
    const handleEscape = e => {
      if (e.key === 'Escape' && isOpen) {
        handleOpenChange(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <>
      {/* Trigger */}
      {trigger && (
        <div onClick={() => handleOpenChange(true)} className="inline-block">
          {trigger}
        </div>
      )}

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => handleOpenChange(false)}
        />
      )}

      {/* Modal Dialog */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          onClick={e => {
            // Only close if clicking the backdrop through the dialog
            if (e.target === e.currentTarget) {
              handleOpenChange(false)
            }
          }}
        >
          <div
            className={cn(
              'pointer-events-auto',
              'relative max-w-md w-full mx-4',
              'bg-card border border-border/60',
              'rounded-lg shadow-lg',
              'animate-scale-in',
              'max-h-[90vh] overflow-y-auto',
              className
            )}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between p-4 border-b border-border/30">
                <h2 className="text-lg font-semibold">{title}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenChange(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Content */}
            <div className="p-4">{children}</div>
          </div>
        </div>
      )}
    </>
  )
}

/**
 * Dialog content wrapper component
 */
export function DialogContent({ className, children }) {
  return <div className={cn('space-y-4', className)}>{children}</div>
}

/**
 * Dialog header component
 */
export function DialogHeader({ className, children }) {
  return <div className={cn('space-y-2', className)}>{children}</div>
}

/**
 * Dialog description component
 */
export function DialogDescription({ className, children }) {
  return <div className={cn('text-sm text-muted-foreground', className)}>{children}</div>
}
