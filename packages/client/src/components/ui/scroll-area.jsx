'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * ScrollArea - Simple scrollable container
 * Using native overflow with custom scrollbar styling (no Base UI primitive needed)
 */
function ScrollArea({ className, children, orientation = 'vertical', ...props }) {
  const orientationClass =
    orientation === 'horizontal'
      ? 'overflow-x-auto overflow-y-hidden'
      : 'overflow-y-auto overflow-x-hidden'

  return (
    <div
      data-slot="scroll-area"
      className={cn(
        'relative size-full rounded-[inherit]',
        orientationClass,
        'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border/60 hover:scrollbar-thumb-border/80',
        'transition-[color,box-shadow] outline-none',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * ScrollBar - Custom scrollbar styling component
 * Note: Actual scrollbar rendering is handled by CSS (scrollbar-* utilities)
 * This component is kept for API compatibility with previous interface
 */
function ScrollBar({ className, orientation = 'vertical', ...props }) {
  // This component is a no-op - scrollbars are styled via Tailwind CSS utilities
  // Kept for backwards compatibility with existing code
  return null
}

export { ScrollArea, ScrollBar }
