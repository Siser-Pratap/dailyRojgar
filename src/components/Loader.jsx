import React, { useEffect, useState } from 'react'
import './Loader.css'

export default function Loader({ onDone }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(timer)
          setTimeout(onDone, 200)
          return 100
        }
        return p + 4
      })
    }, 30)
    return () => clearInterval(timer)
  }, [onDone])

  return (
    <div className="loader">
      <div className="loader-inner">
        <div className="loader-logo">
          <span className="loader-logo-daily">DAILY</span>
          <span className="loader-logo-rojgar"> ROJGAR</span>
        </div>
        <p className="loader-tagline">Rozgar har din, aapke liye</p>
        <div className="loader-bar-track">
          <div className="loader-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  )
}
