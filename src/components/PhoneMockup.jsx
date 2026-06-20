import React from 'react'
import './PhoneMockup.css'

export default function PhoneMockup() {
  return (
    <div className="phone-hero">
      <div className="phone-hero-shell">
        <div className="phone-hero-screen">
          <div className="phone-status-bar">
            <span>11:51</span>
            <div className="phone-status-icons">
              <span>●●●</span>
            </div>
          </div>
          <div className="phone-map">
            <MapSVG />
          </div>
          <div className="phone-job-card">
            <div className="phone-job-info">
              <strong>Construction Helper</strong>
              <span>Masoor, UP</span>
              <span className="phone-job-wage">₹500 / Day</span>
            </div>
            <button className="phone-apply-btn">Apply Now</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MapSVG() {
  return (
    <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="280" height="200" fill="#e8f5e9"/>
      {/* Grid roads */}
      <line x1="0" y1="60" x2="280" y2="60" stroke="white" strokeWidth="6"/>
      <line x1="0" y1="120" x2="280" y2="120" stroke="white" strokeWidth="6"/>
      <line x1="70" y1="0" x2="70" y2="200" stroke="white" strokeWidth="6"/>
      <line x1="140" y1="0" x2="140" y2="200" stroke="white" strokeWidth="6"/>
      <line x1="210" y1="0" x2="210" y2="200" stroke="white" strokeWidth="6"/>
      {/* Blocks */}
      <rect x="4" y="4" width="60" height="50" rx="4" fill="#c8e6c9"/>
      <rect x="76" y="4" width="58" height="50" rx="4" fill="#c8e6c9"/>
      <rect x="146" y="4" width="58" height="50" rx="4" fill="#a5d6a7"/>
      <rect x="216" y="4" width="60" height="50" rx="4" fill="#c8e6c9"/>
      <rect x="4" y="66" width="60" height="48" rx="4" fill="#a5d6a7"/>
      <rect x="76" y="66" width="58" height="48" rx="4" fill="#c8e6c9"/>
      <rect x="146" y="66" width="58" height="48" rx="4" fill="#c8e6c9"/>
      <rect x="216" y="66" width="60" height="48" rx="4" fill="#a5d6a7"/>
      <rect x="4" y="126" width="60" height="68" rx="4" fill="#c8e6c9"/>
      <rect x="76" y="126" width="58" height="68" rx="4" fill="#a5d6a7"/>
      <rect x="146" y="126" width="58" height="68" rx="4" fill="#c8e6c9"/>
      <rect x="216" y="126" width="60" height="68" rx="4" fill="#c8e6c9"/>
      {/* Location pin */}
      <circle cx="140" cy="90" r="28" fill="rgba(22,163,74,0.15)" stroke="rgba(22,163,74,0.3)" strokeWidth="1.5"/>
      <circle cx="140" cy="90" r="18" fill="rgba(22,163,74,0.25)" stroke="rgba(22,163,74,0.4)" strokeWidth="1.5"/>
      <g transform="translate(130, 78)">
        <path d="M10 0C6.13 0 3 3.13 3 7c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#16a34a"/>
      </g>
      {/* User icons on map */}
      <circle cx="80" cy="80" r="10" fill="white" stroke="#16a34a" strokeWidth="1.5"/>
      <text x="80" y="84" textAnchor="middle" fontSize="8" fill="#16a34a">👷</text>
      <circle cx="200" cy="50" r="10" fill="white" stroke="#16a34a" strokeWidth="1.5"/>
      <text x="200" y="54" textAnchor="middle" fontSize="8" fill="#16a34a">🚗</text>
      <circle cx="60" cy="145" r="10" fill="white" stroke="#16a34a" strokeWidth="1.5"/>
      <text x="60" y="149" textAnchor="middle" fontSize="8" fill="#16a34a">🚚</text>
    </svg>
  )
}
