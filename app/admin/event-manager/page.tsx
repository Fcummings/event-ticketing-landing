'use client'

import { EventManager } from '../../components/EventManager'
import { useAuth } from '../../context/AuthContext'

export default function EventManagerPage() {
  const { user, role } = useAuth()

  if (!user || role !== 'admin') {
    return <p>You do not have permission to access this page.</p>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Event Manager</h1>
      <EventManager />
    </div>
  )
}

