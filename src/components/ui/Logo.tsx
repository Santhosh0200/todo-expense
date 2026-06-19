import { cn } from "../../lib/cn";

/**
 * Fluxa logomark — an abstract, forward-leaning "F" built from a stem and two
 * offset bars. The skew suggests flow / forward motion; the gradient matches the
 * app's primary token. Self-contained, so it renders identically in any theme.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      role="img"
      aria-label="Fluxa"
    >
      <defs>
        <linearGradient id="fluxa-mark" x1="6" y1="4" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B7CFF" />
          <stop offset="1" stopColor="#5B4CF0" />
        </linearGradient>
      </defs>
      <g transform="translate(4 0) skewX(-9)" fill="url(#fluxa-mark)">
        <rect x="9" y="6" width="4.6" height="20" rx="2.3" />
        <rect x="9" y="6" width="13" height="4.6" rx="2.3" />
        <rect x="9" y="13.4" width="9" height="4.6" rx="2.3" />
      </g>
    </svg>
  );
}

/** Full lockup: mark + "Fluxa" wordmark. Wordmark uses the theme's foreground token. */
export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoMark className="h-7 w-7" />
      <span className="text-xl font-semibold tracking-tight text-foreground">Fluxa</span>
    </div>
  );
}
