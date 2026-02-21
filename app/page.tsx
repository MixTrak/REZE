"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Browser from "@/components/Browser";
import Intro from "@/components/Intro";
import Auth from "@/components/Auth";
import { User } from "@/lib/types";

export default function Home() {
  const [step, setStep] = useState<'intro' | 'auth' | 'app' | 'loading'>('loading');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('reze_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setStep('app');
      } catch (e) {
        localStorage.removeItem('reze_user');
        setStep('intro');
      }
    } else {
      setStep('intro');
    }
  }, []);

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    localStorage.setItem('reze_user', JSON.stringify(authenticatedUser));
    setStep('app');
  };

  if (step === 'loading') {
    return (
      <main className="flex flex-col items-center justify-center h-screen w-screen bg-black">
        <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin" />
      </main>
    )
  }

  if (step === 'intro') {
    return (
      <main className="flex flex-col items-center justify-center h-screen w-screen bg-black">
        <Intro onEnter={() => setStep('auth')} />
      </main>
    );
  }

  if (step === 'auth' || !user) {
    return (
      <main className="flex flex-col items-center justify-center h-screen w-screen bg-black">
        <Auth onAuthSuccess={handleAuthSuccess} />
      </main>
    );
  }

  return (
    <main className="flex flex-col sm:flex-row h-screen w-screen overflow-hidden bg-black">
      <div className="w-full h-16 sm:w-20 sm:h-screen shrink-0">
        <Sidebar user={user} setUser={setUser} />
      </div>
      <div className="flex-1 w-full overflow-auto">
        <Browser user={user} />
      </div>
    </main>
  );
}
