export const LOGO_SRC = '/images/Timetracker_logo.svg'

export default function Logo({ className = 'h-10 w-10', alt = 'TimeTracker' }) {
  return (
    <img
      src={LOGO_SRC}
      alt={alt}
      className={`shrink-0 object-contain ${className}`}
      width={40}
      height={40}
      decoding="async"
    />
  )
}
