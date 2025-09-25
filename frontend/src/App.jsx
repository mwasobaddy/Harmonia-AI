import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import FormPage from './pages/FormPage'
import About from './pages/About'
import Dashboard from './pages/Dashboard'

export default function App(){
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">MitigationAI</h1>
          <nav className="space-x-4">
            <Link to="/" className="text-sm">Home</Link>
            <Link to="/form" className="text-sm">Start</Link>
            <Link to="/dashboard" className="text-sm">Dashboard</Link>
            <Link to="/about" className="text-sm">About</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-6">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/form" element={<FormPage/>} />
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/about" element={<About/>} />
        </Routes>
      </main>
    </div>
  )
}
