import type { ReactNode } from 'react'

export function Logo({ light = false }: { light?: boolean }) {
  return <span className={`brand ${light ? 'brand-light' : ''}`}><svg width="31" height="34" viewBox="0 0 36 40" fill="none" aria-hidden="true"><path d="M3 11 18 3l15 8-15 8L3 11Z" fill="currentColor" /><path d="m3 21 15-8 15 8-15 8L3 21Z" fill="currentColor" opacity=".78" /><path d="m3 31 15-8 15 8-15 8L3 31Z" fill="currentColor" opacity=".5" /></svg><span>scifer<span className="brand-period">.</span></span></span>
}

export function Eyebrow({ children, number }: { children: ReactNode; number?: string }) {
  return <div className="eyebrow">{number ? <span className="section-number">{number}</span> : <span className="status-dot" />}{children}</div>
}

