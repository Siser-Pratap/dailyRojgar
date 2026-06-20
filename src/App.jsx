import React, { useState } from 'react'
import Loader from './components/Loader'
import Header from './components/Header'
import Hero from './components/Hero'
import Categories from './components/Categories'
import JobListings from './components/JobListings'
import HowItWorks from './components/HowItWorks'
import Footer from './components/Footer'
import './App.css'

export default function App() {
  const [loading, setLoading] = useState(true)

  return (
    <>
      {loading && <Loader onDone={() => setLoading(false)} />}
      <div className={`app ${loading ? 'app--hidden' : 'app--visible'}`}>
        <Header />
        <main>
          <Hero />
          <Categories />
          <JobListings />
          <HowItWorks />
        </main>
        <Footer />
      </div>
    </>
  )
}
