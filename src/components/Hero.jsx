import React from 'react'
import './Hero.css'
import PhoneMockup from './PhoneMockup'

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero-inner">
        <div className="hero-content">
          <span className="hero-badge">
            <span className="hero-badge-dot" />
            Rozgar har din, aapke liye
          </span>

          <h1 className="hero-heading">
            Find Daily Work<br />
            <span className="hero-heading-accent">Near You</span>
          </h1>

          <p className="hero-subtext">
            Find trusted daily jobs near you. Register, apply<br />
            and start earning.
          </p>

          <div className="search-bar">
            <div className="search-field">
              <SearchIcon />
              <input type="text" placeholder="Search job or role" />
            </div>
            <div className="search-divider" />
            <div className="search-field">
              <LocationIcon />
              <input type="text" defaultValue="Masoor, Uttar Pradesh" />
            </div>
            <div className="search-divider" />
            <div className="search-field search-field--near">
              <NearMeIcon />
              <span>Near me</span>
            </div>
            <button className="search-btn">Search Jobs</button>
          </div>

          <div className="hero-trust">
            <div className="trust-item">
              <ShieldIcon />
              <span>Verified Jobs</span>
            </div>
            <div className="trust-item">
              <ClockIcon />
              <span>Daily Payments</span>
            </div>
            <div className="trust-item">
              <UsersIcon />
              <span>Trusted Employers</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <PhoneMockup />
          <div className="hero-person">
            <img
              src="https://images.unsplash.com/photo-1618151313441-bc79b11e5090?w=320&h=400&fit=crop&crop=face"
              alt="Worker"
              className="hero-person-img"
            />
          </div>
          <div className="hero-cta-card">
            <p>Kaam aapke paas,</p>
            <p>Rozgar har din!</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  )
}

function NearMeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="10"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/>
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}
