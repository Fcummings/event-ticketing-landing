'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

type UserRole = 'user' | 'admin';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  role: UserRole;
  isVerified: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, role: 'user', isVerified: false });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>('user');
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setRole(userData.role as UserRole || 'user');
            setIsVerified(user.emailVerified);
            
            // Update user document with verification status if it has changed
            if (userData.isVerified !== user.emailVerified) {
              await setDoc(doc(db, 'users', user.uid), { isVerified: user.emailVerified }, { merge: true });
            }
          } else {
            console.error('User document does not exist');
            setRole('user');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setRole('user');
        }
      } else {
        setRole('user');
        setIsVerified(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, role, isVerified }}>
      {children}
    </AuthContext.Provider>
  );
};

