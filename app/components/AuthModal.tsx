'use client'

import { useState } from 'react'
import { auth, db } from '../firebase/config'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useRouter } from 'next/navigation'

type AuthModalProps = {
  isSignUp?: boolean
}

export function AuthModal({ isSignUp = false }: AuthModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user
        await setDoc(doc(db, 'users', user.uid), {
          firstName,
          lastName,
          email,
          role: 'user',
          isVerified: false
        })
        await sendEmailVerification(user)
        setVerificationSent(true)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
        const user = auth.currentUser
        if (user && !user.emailVerified) {
          setError('Please verify your email before signing in.')
          await auth.signOut()
          return
        }
        setIsOpen(false)
        router.push('/profile')
      }
    } catch (error) {
      setError('Failed to authenticate. Please try again.')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={isSignUp ? "default" : "outline"}>{isSignUp ? "Sign Up" : "Sign In"}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isSignUp ? "Sign Up" : "Sign In"}</DialogTitle>
        </DialogHeader>
        {verificationSent ? (
          <div>
            <p>A verification email has been sent to {email}. Please check your inbox and verify your email before signing in.</p>
            <Button onClick={() => setIsOpen(false)} className="mt-4">Close</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <Input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <Input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </>
            )}
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full">
              {isSignUp ? "Sign Up" : "Sign In"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

