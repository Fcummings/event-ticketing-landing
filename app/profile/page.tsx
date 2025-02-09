'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { doc, getDoc, setDoc, arrayUnion, arrayRemove, collection, getDocs } from 'firebase/firestore'
import { db, auth } from '../firebase/config'
import { Button } from "@/components/ui/button"
import Image from 'next/image'
import { sendEmailVerification } from 'firebase/auth'

interface Event {
  id: string;
  name: string;
  date: string;
  image: string;
  description: string;
}

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  favoriteEvents?: string[];
}

export default function Profile() {
  const { user, isVerified } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [favoriteEvents, setFavoriteEvents] = useState<Event[]>([])
  const [allEvents, setAllEvents] = useState<Event[]>([])
  const [verificationSent, setVerificationSent] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUserData()
      fetchAllEvents()
    }
  }, [user])

  const fetchUserData = async () => {
    if (!user) return
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    if (userDoc.exists()) {
      const data = userDoc.data() as UserData
      setUserData(data)
      if (data.favoriteEvents) {
        fetchFavoriteEvents(data.favoriteEvents)
      }
    }
  }

  const fetchFavoriteEvents = async (favoriteEventIds: string[]) => {
    const favoriteEventPromises = favoriteEventIds.map((eventId) => 
      getDoc(doc(db, 'events', eventId))
    )
    const favoriteEventDocs = await Promise.all(favoriteEventPromises)
    const favoriteEvents = favoriteEventDocs
      .filter(doc => doc.exists())
      .map(doc => ({ id: doc.id, ...doc.data() } as Event))
    setFavoriteEvents(favoriteEvents)
  }

  const fetchAllEvents = async () => {
    const eventsCollection = await getDocs(collection(db, 'events'))
    const events = eventsCollection.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event))
    setAllEvents(events)
  }

  const toggleFavorite = async (event: Event) => {
    if (!user || !userData || !isVerified) return

    const userRef = doc(db, 'users', user.uid)
    const isFavorite = favoriteEvents.some(e => e.id === event.id)

    if (isFavorite) {
      await setDoc(userRef, {
        favoriteEvents: arrayRemove(event.id)
      }, { merge: true })
      setFavoriteEvents(favoriteEvents.filter(e => e.id !== event.id))
    } else {
      await setDoc(userRef, {
        favoriteEvents: arrayUnion(event.id)
      }, { merge: true })
      setFavoriteEvents([...favoriteEvents, event])
    }
  }

  const resendVerificationEmail = async () => {
    if (user) {
      try {
        await sendEmailVerification(user)
        setVerificationSent(true)
      } catch (error) {
        console.error('Error sending verification email:', error)
      }
    }
  }

  if (!user || !userData) {
    return <p>Please sign in to view your profile.</p>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
      <p className="mb-2">Name: {userData.firstName} {userData.lastName}</p>
      <p className="mb-4">Email: {userData.email}</p>
      
      {!isVerified && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
          <p className="font-bold">Email not verified</p>
          <p>Please verify your email to access all features.</p>
          {verificationSent ? (
            <p className="mt-2">Verification email sent. Please check your inbox.</p>
          ) : (
            <Button onClick={resendVerificationEmail} className="mt-2">Resend Verification Email</Button>
          )}
        </div>
      )}

      {isVerified && (
        <>
          <h2 className="text-xl font-semibold mb-4">Your Favorite Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteEvents.map(event => (
              <div key={event.id} className="border rounded-lg p-4">
                <Image src={event.image || "/placeholder.svg"} alt={event.name} width={300} height={200} className="w-full h-40 object-cover mb-2" />
                <h3 className="font-semibold">{event.name}</h3>
                <p className="text-sm text-gray-600">{event.date}</p>
                <Button onClick={() => toggleFavorite(event)} className="mt-2">Remove from Favorites</Button>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-semibold mt-8 mb-4">All Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allEvents.map(event => (
              <div key={event.id} className="border rounded-lg p-4">
                <Image src={event.image || "/placeholder.svg"} alt={event.name} width={300} height={200} className="w-full h-40 object-cover mb-2" />
                <h3 className="font-semibold">{event.name}</h3>
                <p className="text-sm text-gray-600">{event.date}</p>
                <Button onClick={() => toggleFavorite(event)} className="mt-2">
                  {favoriteEvents.some(e => e.id === event.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                </Button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

