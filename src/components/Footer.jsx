import React from 'react'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <p className="footer-name">Daily Rojgar – Rozgar har din, aapke liye</p>
          <p className="footer-copy">© 2024 Daily Rojgar. All rights reserved.</p>
        </div>

        <div className="footer-download">
          <span>Download Our App</span>
        </div>

        <div className="footer-badges">
          <a href="#" className="store-badge store-badge--google">
            <div className="store-icon">
              <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
                <path d="M3.18 23.76c.33.17.7.18 1.05.02l12.08-6.98-2.85-2.85L3.18 23.76z" fill="#EA4335"/>
                <path d="M20.82 10.23L17.3 8.2l-3.14 3.14 3.14 3.14 3.55-2.05c1.01-.58 1.01-2.02-.03-2.6v.4z" fill="#FBBC05"/>
                <path d="M1.44 1.6C1.17 1.9 1 2.32 1 2.85v18.3c0 .53.17.95.44 1.25l.08.07 10.24-10.24v-.24L1.52 1.53l-.08.07z" fill="#4285F4"/>
                <path d="M14.31 11.99l2.99-2.99-12.07-6.97c-.35-.2-.75-.22-1.08-.08l10.16 10z" fill="#34A853"/>
              </svg>
            </div>
            <div className="store-text">
              <span className="store-label">GET IT ON</span>
              <span className="store-name">Google Play</span>
            </div>
          </a>

          <a href="#" className="store-badge store-badge--apple">
            <div className="store-icon">
              <svg viewBox="0 0 24 24" fill="white" width="24" height="24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.19 1.28-2.17 3.82.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.75zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            </div>
            <div className="store-text">
              <span className="store-label">Download on the</span>
              <span className="store-name">App Store</span>
            </div>
          </a>
        </div>
      </div>
    </footer>
  )
}
