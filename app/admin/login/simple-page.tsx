'use client'

import { useState } from 'react'

export default function SimpleLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🚀 SIMPLE FORM SUBMITTED!', { email, password: '***' })
    alert(`Login attempt: ${email}`)
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-white text-2xl mb-6">Simple Login Test</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-3 bg-white/10 text-white rounded"
            required
          />
          
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-3 bg-white/10 text-white rounded"
            required
          />
          
          <button
            type="submit"
            onClick={() => console.log('🖱️ Button clicked!')}
            className="w-full bg-green-500 text-white p-3 rounded"
          >
            Test Login
          </button>
        </form>
      </div>
    </div>
  )
}



