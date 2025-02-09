'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../../context/AuthContext'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function AddEvent() {
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [image, setImage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!user) {
      setError('You must be logged in to add an event')
      return
    }

    try {
      await addDoc(collection(db, 'events'), {
        name,
        date,
        image,
      })
      router.push('/')
    } catch (error) {
      setError('Failed to add event. Please try again.')
    }
  }

  if (!user) {
    return <p>You must be logged in to access this page.</p>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Add New Event</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Event Name</label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">Event Date</label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image URL</label>
          <Input
            id="image"
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit">Add Event</Button>
      </form>
    </div>
  )
}

