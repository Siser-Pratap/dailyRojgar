import React, { useState } from 'react'
import './Header.css'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="header">
      <div className="container header-inner">
        <a href="/" className="logo">
          <span className="logo-line1">
            <span className="logo-daily">DAILY</span>
            <span className="logo-rojgar"> ROJGAR</span>
          </span>
          <span className="logo-tagline">Rozgar har din, aapke liye</span>
        </a>

        <nav className={`nav ${menuOpen ? 'nav--open' : ''}`}>
          <a href="/" className="nav-link nav-link--active">Home</a>
          <a href="/jobs" className="nav-link">Find Jobs</a>
          <a href="/post" className="nav-link">Post Job</a>
          <a href="/dashboard" className="nav-link">Dashboard</a>
          <a href="/contact" className="nav-link">Contact Us</a>
        </nav>

        <div className="header-actions">
          <button className="btn-login">Login</button>
          <button className="btn-register">Register</button>
        </div>

        <button
          className={`hamburger ${menuOpen ? 'hamburger--open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  )
}
