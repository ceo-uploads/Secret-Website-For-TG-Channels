import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { ref, get, set, onValue, off } from 'firebase/database';
import { db } from '../firebase';

interface AuthContextType {
  user: User | null;
  login: (mobileOrUid: string, password: string) => Promise<void>;
  signup: (fullName: string, mobileNumber: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('adult_plus_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const userRef = ref(db, `users/${parsedUser.uid}`);
      
      const unsubscribe = onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUser(userData);
          localStorage.setItem('adult_plus_user', JSON.stringify(userData));
        } else {
          setUser(null);
          localStorage.removeItem('adult_plus_user');
        }
        setLoading(false);
      }, (error) => {
        console.error("Auth real-time update error:", error);
        setLoading(false);
      });

      return () => off(userRef);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (mobileOrUid: string, password: string) => {
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    if (snapshot.exists()) {
      const users = snapshot.val();
      const userEntry = Object.values(users).find((u: any) => 
        (u.mobileNumber?.toString() === mobileOrUid || u.uid?.toString() === mobileOrUid) && u.password === password
      ) as User | undefined;

      if (userEntry) {
        setUser(userEntry);
        localStorage.setItem('adult_plus_user', JSON.stringify(userEntry));
        
        // Setup listener for the newly logged in user
        const userRef = ref(db, `users/${userEntry.uid}`);
        onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setUser(userData);
            localStorage.setItem('adult_plus_user', JSON.stringify(userData));
          }
        });
      } else {
        throw new Error('Invalid credentials');
      }
    } else {
      throw new Error('No users found');
    }
  };

  const signup = async (fullName: string, mobileNumber: string, password: string) => {
    const uid = Math.floor(100000 + Math.random() * 900000).toString();
    const newUser: User = {
      uid,
      fullName,
      mobileNumber,
      password,
      createdAt: new Date().toISOString(),
    };

    const userRef = ref(db, `users/${uid}`);
    await set(userRef, newUser);
    setUser(newUser);
    localStorage.setItem('adult_plus_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('adult_plus_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
