import React from 'react'
import './Categories.css'

const categories = [
  {
    label: 'Construction\nHelper',
    icon: (
      <svg viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="20" fill="#f0fdf4"/>
        <g stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 10c-2 0-3.5 1-4 2.5L14 18h12l-2-5.5c-.5-1.5-2-2.5-4-2.5z"/>
          <path d="M13 18v2a7 7 0 0014 0v-2H13z"/>
          <path d="M17 28v4M23 28v4M14 32h12"/>
          <line x1="10" y1="18" x2="30" y2="18"/>
          <path d="M16 14.5h8"/>
        </g>
      </svg>
    ),
  },
  {
    label: 'Driver',
    icon: (
      <svg viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="20" fill="#f0fdf4"/>
        <g stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="16" width="24" height="12" rx="3"/>
          <path d="M11 16l2.5-6h13l2.5 6"/>
          <circle cx="13" cy="29" r="2.5"/>
          <circle cx="27" cy="29" r="2.5"/>
          <path d="M10 22h6M24 22h6"/>
        </g>
      </svg>
    ),
  },
  {
    label: 'Delivery\nBoy',
    icon: (
      <svg viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="20" fill="#f0fdf4"/>
        <g stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 22l3-8h12l4 6h3a2 2 0 010 4H8v-2z"/>
          <circle cx="13" cy="29" r="2.5"/>
          <circle cx="24" cy="29" r="2.5"/>
          <path d="M11 14h12v8"/>
          <path d="M22 14l4 6"/>
          <rect x="12" y="10" width="6" height="4" rx="1"/>
        </g>
      </svg>
    ),
  },
  {
    label: 'Electrician',
    icon: (
      <svg viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="20" fill="#f0fdf4"/>
        <g stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 8l-6 12h6l-4 12 10-14h-6L22 8z" fill="#bbf7d0" stroke="#16a34a"/>
        </g>
      </svg>
    ),
  },
  {
    label: 'Plumber',
    icon: (
      <svg viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="20" fill="#f0fdf4"/>
        <g stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 12h6v6a4 4 0 004 4h6"/>
          <path d="M24 26v4M20 28h8"/>
          <circle cx="28" cy="24" r="4"/>
          <path d="M10 14a3 3 0 100-6"/>
          <circle cx="10" cy="11" r="3"/>
          <path d="M14 12h-4"/>
        </g>
      </svg>
    ),
  },
  {
    label: 'Painter',
    icon: (
      <svg viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="20" fill="#f0fdf4"/>
        <g stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="11" y="10" width="18" height="12" rx="2"/>
          <path d="M15 22v6M25 22v6"/>
          <line x1="13" y1="28" x2="27" y2="28"/>
          <path d="M11 14h18"/>
          <path d="M20 28v4"/>
          <circle cx="20" cy="33" r="1.5" fill="#16a34a"/>
        </g>
      </svg>
    ),
  },
  {
    label: 'More\nJobs',
    icon: (
      <svg viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="20" fill="#f0fdf4"/>
        <g fill="#16a34a">
          <circle cx="14" cy="14" r="3"/>
          <circle cx="26" cy="14" r="3"/>
          <circle cx="14" cy="26" r="3"/>
          <circle cx="26" cy="26" r="3"/>
        </g>
      </svg>
    ),
  },
]

export default function Categories() {
  return (
    <section className="categories">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Popular Job Categories</h2>
          <a href="/categories" className="view-all">View all categories <ChevronIcon /></a>
        </div>
        <div className="categories-grid">
          {categories.map((cat, i) => (
            <a key={i} href="/jobs" className="category-card">
              <div className="category-icon">{cat.icon}</div>
              <span className="category-label">{cat.label}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  )
}
