import React from 'react'
import './JobListings.css'

const jobs = [
  {
    title: 'Construction Helper',
    location: 'Masoor, Uttar Pradesh',
    wage: '₹500 / Day',
    type: 'Full Time',
    badge: 'Today',
    icon: (
      <svg viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="8" fill="#f0fdf4"/>
        <g stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 10c-2 0-3.5 1-4 2.5L14 18h12l-2-5.5c-.5-1.5-2-2.5-4-2.5z"/>
          <path d="M13 18v2a7 7 0 0014 0v-2H13z"/>
          <path d="M17 28v3M23 28v3M14 31h12"/>
          <line x1="10" y1="18" x2="30" y2="18"/>
        </g>
      </svg>
    ),
  },
  {
    title: 'Driver',
    location: 'Masoor, Uttar Pradesh',
    wage: '₹700 / Day',
    type: 'Full Time',
    badge: 'Today',
    icon: (
      <svg viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="8" fill="#f0fdf4"/>
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
    title: 'Delivery Boy',
    location: 'Masoor, Uttar Pradesh',
    wage: '₹450 / Day',
    type: 'Part Time',
    badge: 'Today',
    icon: (
      <svg viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="8" fill="#f0fdf4"/>
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
]

export default function JobListings() {
  return (
    <section className="jobs">
      <div className="container jobs-inner">
        <div className="jobs-left">
          <div className="section-header">
            <h2 className="section-title">Jobs Near You</h2>
            <a href="/jobs" className="view-all">View all jobs <ChevronIcon /></a>
          </div>

          <div className="jobs-list">
            {jobs.map((job, i) => (
              <div key={i} className="job-card">
                <div className="job-icon">{job.icon}</div>
                <div className="job-info">
                  <div className="job-top">
                    <h3 className="job-title">{job.title}</h3>
                    <span className="job-badge">Today</span>
                  </div>
                  <div className="job-location">
                    <PinIcon />
                    <span>{job.location}</span>
                  </div>
                  <div className="job-meta">
                    <span className="job-wage">{job.wage}</span>
                    <span className="job-dot">•</span>
                    <span className="job-type">{job.type}</span>
                  </div>
                </div>
                <button className="job-apply">Apply Now</button>
              </div>
            ))}
          </div>
        </div>

        <div className="jobs-right">
          <PhoneMockup2 />
        </div>
      </div>
    </section>
  )
}

function PhoneMockup2() {
  return (
    <div className="phone2-shell">
      <div className="phone2-screen">
        <div className="phone2-header">
          <div className="phone2-logo">
            <span style={{color:'#111',fontWeight:800,fontSize:11}}>DAILY </span>
            <span style={{color:'#16a34a',fontWeight:800,fontSize:11}}>ROJGAR</span>
            <div className="phone2-bell">🔔</div>
          </div>
          <div className="phone2-location">
            <span>📍 Masoor, Uttar Pradesh ∨</span>
          </div>
        </div>

        <div className="phone2-banner">
          <div className="phone2-banner-text">
            <strong>Find Jobs Near You</strong>
            <span>100+ new jobs available today</span>
          </div>
          <button className="phone2-search-btn">Search Jobs</button>
        </div>

        <div className="phone2-cats-row">
          <div className="phone2-section-hdr">
            <span>Popular Categories</span>
            <span style={{color:'#16a34a',fontSize:9}}>View all</span>
          </div>
          <div className="phone2-cats">
            {['Helper','Driver','Delivery','Electrician'].map(c => (
              <div key={c} className="phone2-cat">
                <div className="phone2-cat-icon">👷</div>
                <span>{c}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="phone2-jobs-row">
          <div className="phone2-section-hdr">
            <span>Recommended Jobs</span>
            <span style={{color:'#16a34a',fontSize:9}}>View all</span>
          </div>
          <div className="phone2-job-item">
            <div className="phone2-job-icon">👷</div>
            <div className="phone2-job-txt">
              <strong>Construction Helper</strong>
              <span>Masoor, UP</span>
              <span>₹500 / Day</span>
            </div>
            <button className="phone2-apply">Apply</button>
          </div>
        </div>

        <div className="phone2-nav">
          {['🏠','💼','➕','📋','👤'].map((ic, i) => (
            <div key={i} className={`phone2-nav-item ${i === 0 ? 'active' : ''}`}>{ic}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  )
}

function PinIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  )
}
