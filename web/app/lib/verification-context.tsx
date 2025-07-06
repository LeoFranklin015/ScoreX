"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface VerifiedPlayer {
  id: string;
  name: string;
  nationality: string;
  dateOfBirth: string;
  gender: string;
  isVerified: boolean;
  verificationDate: string;
  playerProfile: {
    team: string;
    position: string;
    bondValue: number;
    pendingPayout: number;
    performanceScore: number;
    totalPaid: number;
    roi: number;
    lastPayout: string;
  };
}

interface VerificationContextType {
  verifiedPlayer: VerifiedPlayer | null;
  setVerifiedPlayer: (player: VerifiedPlayer | null) => void;
  isPlayerVerified: (playerId?: string) => boolean;
  clearVerification: () => void;
}

const VerificationContext = createContext<VerificationContextType | undefined>(undefined);

export function VerificationProvider({ children }: { children: ReactNode }) {
  const [verifiedPlayer, setVerifiedPlayerState] = useState<VerifiedPlayer | null>(null);

  // Load verification from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('verifiedPlayer');
    if (stored) {
      try {
        const player = JSON.parse(stored);
        // Check if verification is still valid (within 24 hours)
        const verificationDate = new Date(player.verificationDate);
        const now = new Date();
        const hoursDiff = (now.getTime() - verificationDate.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
          setVerifiedPlayerState(player);
        } else {
          // Clear expired verification
          localStorage.removeItem('verifiedPlayer');
        }
      } catch (error) {
        console.error('Error loading verification:', error);
        localStorage.removeItem('verifiedPlayer');
      }
    }
  }, []);

  const setVerifiedPlayer = (player: VerifiedPlayer | null) => {
    setVerifiedPlayerState(player);
    if (player) {
      localStorage.setItem('verifiedPlayer', JSON.stringify(player));
    } else {
      localStorage.removeItem('verifiedPlayer');
    }
  };

  const isPlayerVerified = (playerId?: string) => {
    if (!verifiedPlayer) return false;
    if (playerId) {
      return verifiedPlayer.id === playerId && verifiedPlayer.isVerified;
    }
    return verifiedPlayer.isVerified;
  };

  const clearVerification = () => {
    setVerifiedPlayer(null);
  };

  return (
    <VerificationContext.Provider
      value={{
        verifiedPlayer,
        setVerifiedPlayer,
        isPlayerVerified,
        clearVerification,
      }}
    >
      {children}
    </VerificationContext.Provider>
  );
}

export function useVerification() {
  const context = useContext(VerificationContext);
  if (context === undefined) {
    throw new Error('useVerification must be used within a VerificationProvider');
  }
  return context;
} 