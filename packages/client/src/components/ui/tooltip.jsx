import { useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Tooltip component with hover behavior
 * Displays a small text label when hovering over children
 *
 * @param {Object} props
 * @param {string} props.text - Tooltip text to display
 * @param {ReactNode} props.children - Element to apply tooltip to
 * @param {string} props.position - Tooltip position: 'top', 'bottom', 'left', 'right'
 * @param {string} props.className - Additional CSS classes
 */
export function Tooltip({ text, children, position = 'top', className = '', side = 'top' }) {
  const [isVisible, setIsVisible] = useState(false)

  if (!text) return children

  // Position mapping
  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2'
  }

  // Arrow positioning
  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-border border-l-transparent border-r-transparent border-b-transparent',
    bottom:
      'bottom-full left-1/2 -translate-x-1/2 border-b-border border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-border border-t-transparent border-b-transparent border-r-transparent',
    right:
      'right-full top-1/2 -translate-y-1/2 border-r-border border-t-transparent border-b-transparent border-l-transparent'
  }

  const finalPosition = side || position

  return (
    <div className="relative inline-block group">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-block"
      >
        {children}
      </div>

      {/* Tooltip */}
      {isVisible && (
        <div
          className={cn(
            'absolute z-50 px-2.5 py-1.5 whitespace-nowrap',
            'text-xs font-mono text-foreground/90',
            'bg-card/95 border border-border/60',
            'rounded-md shadow-lg backdrop-blur-sm',
            'pointer-events-none animate-fade-in',
            positionClasses[finalPosition],
            className
          )}
        >
          {text}

          {/* Arrow */}
          <div className={cn('absolute w-0 h-0', 'border-4', arrowClasses[finalPosition])} />
        </div>
      )}
    </div>
  )
}

/**
 * Alternative: CSS-only tooltip (no JavaScript)
 * Use with data-tooltip attribute:
 * <span className="tooltip-trigger" data-tooltip="Help text">Hover me</span>
 */
export const tooltipStyles = `
  .tooltip-trigger {
    position: relative;
    cursor: help;
  }

  .tooltip-trigger::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: calc(100% + 0.5rem);
    left: 50%;
    transform: translateX(-50%);
    padding: 0.375rem 0.625rem;
    background-color: oklch(0.12 0.01 260);
    border: 1px solid oklch(0.22 0.01 260);
    color: oklch(0.75 0 0);
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem;
    border-radius: 0.375rem;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 150ms ease-out;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 50;
  }

  .tooltip-trigger:hover::after {
    opacity: 1;
  }

  /* Arrow for tooltip */
  .tooltip-trigger::before {
    content: '';
    position: absolute;
    bottom: calc(100% - 0.25rem);
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: oklch(0.22 0.01 260);
    opacity: 0;
    pointer-events: none;
    transition: opacity 150ms ease-out;
    z-index: 50;
  }

  .tooltip-trigger:hover::before {
    opacity: 1;
  }
`
