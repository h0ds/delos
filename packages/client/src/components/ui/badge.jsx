'use client'

import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-squircle font-medium outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-64 [&_svg:not([class*='opacity-'])]:opacity-90 [&_svg:not([class*='size-'])]:size-3.5 sm:[&_svg:not([class*='size-'])]:size-3 [&_svg]:pointer-events-none [&_svg]:shrink-0 [button,a&]:cursor-pointer [button,a&]:pointer-coarse:after:absolute [button,a&]:pointer-coarse:after:size-full [button,a&]:pointer-coarse:after:min-h-11 [button,a&]:pointer-coarse:after:min-w-11",
  {
    defaultVariants: {
      size: 'default',
      variant: 'default'
    },
    variants: {
      size: {
        default: 'h-6 min-w-6 px-2 text-sm sm:h-5 sm:min-w-5 sm:text-xs',
        lg: 'h-7 min-w-7 px-2.5 text-base sm:h-6 sm:min-w-6 sm:text-sm',
        sm: 'h-5 min-w-5 px-1.5 text-xs sm:h-4.5 sm:min-w-4.5 sm:text-[.625rem]'
      },
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/80 transition-colors',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
        error: 'bg-destructive/20 text-destructive hover:bg-destructive/30',
        info: 'bg-info/20 text-info hover:bg-info/30',
        outline: 'bg-muted/40 text-foreground hover:bg-muted/60',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        success: 'bg-success/20 text-success hover:bg-success/30',
        warning: 'bg-warning/20 text-warning hover:bg-warning/30',
        bullish: 'bg-bullish/20 text-bullish hover:bg-bullish/30',
        bearish: 'bg-bearish/20 text-bearish hover:bg-bearish/30'
      }
    }
  }
)

function Badge({ className, variant, size, render, ...props }) {
  const defaultProps = {
    className: cn(badgeVariants({ className, size, variant })),
    'data-slot': 'badge'
  }

  return useRender({
    defaultTagName: 'span',
    props: mergeProps(defaultProps, props),
    render
  })
}

export { Badge, badgeVariants }
