import { ReactNode } from 'react'
import { cn } from '@/lib/utils' // You'll need to create this utility

interface TypographyProps {
  children: ReactNode
  className?: string
}

// Heading Components
export function H1({ children, className }: TypographyProps) {
  return (
    <h1 className={cn(
      "text-4xl md:text-6xl font-black tracking-tight text-white leading-tight",
      className
    )}>
      {children}
    </h1>
  )
}

export function H2({ children, className }: TypographyProps) {
  return (
    <h2 className={cn(
      "text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight",
      className
    )}>
      {children}
    </h2>
  )
}

export function H3({ children, className }: TypographyProps) {
  return (
    <h3 className={cn(
      "text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight",
      className
    )}>
      {children}
    </h3>
  )
}

export function H4({ children, className }: TypographyProps) {
  return (
    <h4 className={cn(
      "text-xl md:text-2xl font-bold tracking-tight text-white leading-tight",
      className
    )}>
      {children}
    </h4>
  )
}

// Body Text Components
export function BodyLarge({ children, className }: TypographyProps) {
  return (
    <p className={cn(
      "text-lg md:text-xl font-medium text-gray-300 leading-relaxed",
      className
    )}>
      {children}
    </p>
  )
}

export function Body({ children, className }: TypographyProps) {
  return (
    <p className={cn(
      "text-base md:text-lg font-medium text-gray-400 leading-relaxed",
      className
    )}>
      {children}
    </p>
  )
}

export function BodySmall({ children, className }: TypographyProps) {
  return (
    <p className={cn(
      "text-sm md:text-base font-medium text-gray-400 leading-relaxed",
      className
    )}>
      {children}
    </p>
  )
}

// Special Text Components
export function Highlight({ children, className }: TypographyProps) {
  return (
    <span className={cn(
      "text-yellow-500 font-bold text-glow-yellow",
      className
    )}>
      {children}
    </span>
  )
}

export function Muted({ children, className }: TypographyProps) {
  return (
    <span className={cn(
      "text-gray-500 font-normal",
      className
    )}>
      {children}
    </span>
  )
}

// Usage examples:
export function TypographyShowcase() {
  return (
    <div className="space-y-8 p-8">
      <H1>Main Hero Title</H1>
      <H2>Section Heading</H2>
      <H3>Card Title</H3>
      <H4>Small Heading</H4>
      <BodyLarge>
        This is large body text for hero descriptions and important content.
      </BodyLarge>
      <Body>
        This is regular body text for most content and descriptions.
      </Body>
      <BodySmall>
        This is small body text for meta information and captions.
      </BodySmall>
      <Body>
        Text with <Highlight>highlighted yellow</Highlight> and <Muted>muted gray</Muted> sections.
      </Body>
    </div>
  )
}
