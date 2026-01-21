import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { Button } from './button'

/**
 * Sheet/Drawer component that slides in from the side
 * Perfect for filters, settings, and side content
 *
 * @param {Object} props
 * @param {string} props.title - Sheet title
 * @param {ReactNode} props.children - Sheet content
 * @param {ReactNode} props.trigger - Element that triggers sheet
 * @param {string} props.side - Which side to slide from: 'left', 'right'
 * @param {number} props.width - Width in pixels (default 320)
 * @param {boolean} props.open - Controlled open state
 * @param {function} props.onOpenChange - Callback when open state changes
 */
export function Sheet({
  title,
  children,
  trigger,
  side = 'left',
  width = 320,
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

  // Animation classes based on side
  const sideClasses = {
    left: {
      enter: 'translate-x-0',
      exit: '-translate-x-full',
      position: 'left-0'
    },
    right: {
      enter: 'translate-x-0',
      exit: 'translate-x-full',
      position: 'right-0'
    }
  }

  const animClass = sideClasses[side]

  return (
    <>
      {/* Trigger */}
      {trigger && (
        <div onClick={() => handleOpenChange(true)} className="inline-block">
          {trigger}
        </div>
      )}

      {/* Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-fade-in"
          onClick={() => handleOpenChange(false)}
        />
      )}

      {/* Sheet */}
      <div
        className={cn(
          'fixed top-0 h-screen z-50',
          'bg-card border border-border/60',
          'transition-transform duration-300 ease-out',
          `${animClass.position} w-full`,
          `w-[${width}px] max-w-[90vw]`,
          isOpen ? animClass.enter : animClass.exit,
          className
        )}
        style={{ width: `${Math.min(width, 90)}vw` }}
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
        <div className="overflow-y-auto h-[calc(100%-60px)] p-4">{children}</div>
      </div>
    </>
  )
}

/**
 * Sheet content wrapper
 */
export function SheetContent({ className, children }) {
  return <div className={cn('space-y-4', className)}>{children}</div>
}

/**
 * Sheet header
 */
export function SheetHeader({ className, children }) {
  return <div className={cn('space-y-2 mb-4', className)}>{children}</div>
}
