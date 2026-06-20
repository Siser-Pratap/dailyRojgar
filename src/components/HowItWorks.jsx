import React from 'react'
import './HowItWorks.css'

const steps = [
  {
    num: '1',
    title: 'Register',
    desc: 'Create your account as a worker or employer.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="16" r="8" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"/>
        <path d="M8 40c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="34" cy="14" r="1" fill="#16a34a"/>
        <path d="M34 10v4M34 14h4" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    num: '2',
    title: 'Find or Post Job',
    desc: 'Search jobs near you or post a job in minutes.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <circle cx="22" cy="22" r="12" stroke="#16a34a" strokeWidth="2"/>
        <path d="M31 31l8 8" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"/>
        <line x1="22" y1="17" x2="22" y2="27" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"/>
        <line x1="17" y1="22" x2="27" y2="22" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    num: '3',
    title: 'Apply or Hire',
    desc: 'Apply for jobs or hire workers with one click.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <rect x="10" y="10" width="28" height="36" rx="3" stroke="#16a34a" strokeWidth="2"/>
        <path d="M16 20h16M16 26h16M16 32h10" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"/>
        <path d="M28 8v6l4-2-4-4z" fill="#16a34a"/>
      </svg>
    ),
  },
  {
    num: '4',
    title: 'Earn & Get Paid',
    desc: 'Complete work and get paid daily.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <rect x="8" y="16" width="32" height="22" rx="3" stroke="#16a34a" strokeWidth="2"/>
        <path d="M8 22h32" stroke="#16a34a" strokeWidth="2"/>
        <circle cx="24" cy="30" r="4" stroke="#16a34a" strokeWidth="2"/>
        <path d="M16 10h16" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export default function HowItWorks() {
  return (
    <section className="how">
      <div className="container">
        <h2 className="how-title">How Daily Rojgar Works?</h2>
        <div className="how-grid">
          {steps.map((step, i) => (
            <div key={i} className="how-step">
              <div className="how-number">{step.num}</div>
              {i < steps.length - 1 && <div className="how-connector" />}
              <div className="how-icon">{step.icon}</div>
              <h3 className="how-step-title">{step.title}</h3>
              <p className="how-step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
