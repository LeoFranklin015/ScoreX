"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { CheckCircle, Shield, User, Clock, QrCode } from "lucide-react";
import Lanyard from "../components/lanyard/Lanyard";
import { useVerification } from "../lib/verification-context";

// Mock Self Protocol verification
interface MockSelfVerification {
  id: string;
  name: string;
  nationality: string;
  dateOfBirth: string;
  gender: string;
  isVerified: boolean;
  minimumAge: number;
  ofac: boolean;
  playerProfile?: {
    team: string;
    position: string;
    bondValue: number;
    pendingPayout: number;
  };
}

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setVerifiedPlayer, isPlayerVerified, verifiedPlayer } = useVerification();
  const [verificationStep, setVerificationStep] = useState<'scan' | 'verifying' | 'verified' | 'error'>('scan');
  const [verificationData, setVerificationData] = useState<MockSelfVerification | null>(null);
  const [countdown, setCountdown] = useState(30);
  
  // Current player data for the card (either from URL params or verification data)
  const [currentPlayerData, setCurrentPlayerData] = useState({
    name: "Player Card",
    team: "Tap to Verify",
    id: "PLAYER_001"
  });

  // Handle URL parameters and existing verification
  useEffect(() => {
    const playerId = searchParams.get('player');
    console.log('URL Player ID:', playerId);
    
    // If already verified, show verified player data
    if (isPlayerVerified() && verifiedPlayer && !playerId) {
      console.log('Using verified player data:', verifiedPlayer.name);
      setCurrentPlayerData({
        name: verifiedPlayer.name,
        team: verifiedPlayer.playerProfile.team,
        id: verifiedPlayer.id.slice(-8).toUpperCase()
      });
      setVerificationStep('verified');
      setVerificationData({
        id: verifiedPlayer.id,
        name: verifiedPlayer.name,
        nationality: verifiedPlayer.nationality,
        dateOfBirth: verifiedPlayer.dateOfBirth,
        gender: verifiedPlayer.gender,
        isVerified: verifiedPlayer.isVerified,
        minimumAge: 18,
        ofac: true,
        playerProfile: verifiedPlayer.playerProfile
      });
    } else if (playerId) {
      // Set player data from URL parameter - this should override verified player
      console.log('Setting player from URL parameter');
      const playerNames: { [key: string]: { name: string, team: string } } = {
        'mbappe_001': { name: 'Kylian Mbappé', team: 'Real Madrid' },
        'haaland_002': { name: 'Erling Haaland', team: 'Manchester City' },
        'messi_003': { name: 'Lionel Messi', team: 'Inter Miami' },
        'bellingham_004': { name: 'Jude Bellingham', team: 'Real Madrid' },
        'pedri_005': { name: 'Pedri', team: 'Barcelona' },
      };
      
      if (playerNames[playerId]) {
        console.log('Found player:', playerNames[playerId].name);
        setCurrentPlayerData({
          name: playerNames[playerId].name,
          team: playerNames[playerId].team,
          id: playerId.toUpperCase()
        });
        // Reset verification step for new player
        setVerificationStep('scan');
        setVerificationData(null);
      } else {
        console.log('Player ID not found, using default');
        setCurrentPlayerData({
          name: "Unknown Player",
          team: "Unknown Team",
          id: playerId.toUpperCase()
        });
        setVerificationStep('scan');
        setVerificationData(null);
      }
    } else {
      // No URL parameter and no verified player
      console.log('Using default player card');
      setCurrentPlayerData({
        name: "Player Card",
        team: "Tap to Verify",
        id: "PLAYER_001"
      });
      setVerificationStep('scan');
      setVerificationData(null);
    }
  }, [searchParams]); // Removed dependencies to avoid conflicts

  // Generate mock verification data based on current player
  const generateMockVerificationResponse = (): MockSelfVerification => {
    const playerProfiles: { [key: string]: any } = {
      'Kylian Mbappé': {
        id: "0x4b4b30e2E7c6463b03CdFFD6c42329D357205334",
        nationality: "French",
        dateOfBirth: "1998-12-20",
        team: "Real Madrid",
        position: "Forward",
        bondValue: 15000,
        pendingPayout: 850.50
      },
      'Erling Haaland': {
        id: "0x5c5c40f3F8d7574c04DfGGe7d53339E468316445",
        nationality: "Norwegian",
        dateOfBirth: "2000-07-21",
        team: "Manchester City",
        position: "Forward",
        bondValue: 12000,
        pendingPayout: 720.30
      },
      'Lionel Messi': {
        id: "0x6d6d50g4G9e8685d15EgHHf8e64440F579427556",
        nationality: "Argentine",
        dateOfBirth: "1987-06-24",
        team: "Inter Miami",
        position: "Forward",
        bondValue: 18000,
        pendingPayout: 950.80
      },
      'Jude Bellingham': {
        id: "0x7e7e60h5H0f9796e26FhIIg9f75551G680538667",
        nationality: "English",
        dateOfBirth: "2003-06-29",
        team: "Real Madrid",
        position: "Midfielder",
        bondValue: 8000,
        pendingPayout: 480.25
      },
      'Pedri': {
        id: "0x8f8f70i6I1g0807f37GiJJh0g86662H791649778",
        nationality: "Spanish",
        dateOfBirth: "2002-11-25",
        team: "Barcelona",
        position: "Midfielder",
        bondValue: 6500,
        pendingPayout: 390.75
      }
    };

    // Debug: Log current player data
    console.log('Current Player Data:', currentPlayerData);
    console.log('Available profiles:', Object.keys(playerProfiles));
    
    const profile = playerProfiles[currentPlayerData.name];
    if (!profile) {
      console.warn(`No profile found for player: ${currentPlayerData.name}, using current player data`);
      // Use current player data if no profile match found
      return {
        id: `0x${Math.random().toString(16).substr(2, 40)}`, // Generate random ID
        name: currentPlayerData.name,
        nationality: "Unknown",
        dateOfBirth: "1990-01-01",
        gender: "Male",
        isVerified: true,
        minimumAge: 18,
        ofac: true,
        playerProfile: {
          team: currentPlayerData.team,
          position: "Player",
          bondValue: 10000,
          pendingPayout: 500.00
        }
      };
    }
    
    return {
      id: profile.id,
      name: currentPlayerData.name,
      nationality: profile.nationality,
      dateOfBirth: profile.dateOfBirth,
      gender: "Male",
      isVerified: true,
      minimumAge: 18,
      ofac: true,
      playerProfile: {
        team: profile.team,
        position: profile.position,
        bondValue: profile.bondValue,
        pendingPayout: profile.pendingPayout
      }
    };
  };

  // Handle card click to start verification
  const handleCardClick = () => {
    if (verificationStep === 'scan') {
      setVerificationStep('verifying');
      
      // Mock verification process
      setTimeout(() => {
        const mockResponse = generateMockVerificationResponse();
        setVerificationData(mockResponse);
        setVerificationStep('verified');
        
        // Save verification data to context
        const verifiedPlayerData = {
          id: mockResponse.id,
          name: mockResponse.name,
          nationality: mockResponse.nationality,
          dateOfBirth: mockResponse.dateOfBirth,
          gender: mockResponse.gender,
          isVerified: true,
          verificationDate: new Date().toISOString(),
          playerProfile: {
            team: mockResponse.playerProfile!.team,
            position: mockResponse.playerProfile!.position,
            bondValue: mockResponse.playerProfile!.bondValue,
            pendingPayout: mockResponse.playerProfile!.pendingPayout,
            performanceScore: 95,
            totalPaid: 3420.75,
            roi: 22.8,
            lastPayout: "2024-01-15"
          }
        };
        
        setVerifiedPlayer(verifiedPlayerData);
        
        // Update the card display
        setCurrentPlayerData({
          name: verifiedPlayerData.name,
          team: verifiedPlayerData.playerProfile.team,
          id: verifiedPlayerData.id.slice(-8).toUpperCase()
        });
      }, 3000);
    }
  };

  // Countdown timer for verification timeout
  useEffect(() => {
    if (verificationStep === 'verifying' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setVerificationStep('error');
    }
  }, [verificationStep, countdown]);

  // Navigate to payout page
  const handleProceedToPayout = () => {
    router.push('/payout');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left side - 3D Lanyard */}
          <div className="h-screen relative">
            <Lanyard 
              position={[0, 0, 20]} 
              gravity={[0, -40, 0]}
              onCardClick={handleCardClick}
              playerName={currentPlayerData.name}
              playerTeam={currentPlayerData.team}
              playerId={currentPlayerData.id}
            />
            
            {/* Overlay instructions */}
            <div className="absolute top-4 left-4 right-4 z-10">
              <Card className="bg-zinc-900/80 backdrop-blur-sm border-lime-400/20">
                <CardHeader className="pb-3">
                  <CardTitle className="pixel-font text-lime-400 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Player Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-zinc-300">
                    {verificationStep === 'scan' && "Click on the player card to start verification"}
                    {verificationStep === 'verifying' && "Verifying your identity..."}
                    {verificationStep === 'verified' && "Verification complete! Proceed to collect your payout."}
                    {verificationStep === 'error' && "Verification failed. Please try again."}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right side - Verification Status */}
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h1 className="pixel-font text-4xl font-bold text-lime-400 mb-4">
                Footballer Verification
              </h1>
              <p className="text-zinc-400 text-lg">
                Verify your identity with Self Protocol to access your sponsorship payouts
              </p>
            </div>

            {/* Verification Steps */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  verificationStep !== 'scan' ? 'bg-lime-400 text-zinc-950' : 'bg-zinc-700 text-zinc-400'
                }`}>
                  {verificationStep !== 'scan' ? <CheckCircle className="h-4 w-4" /> : '1'}
                </div>
                <span className="text-zinc-300">Click on player card to initiate scan</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  verificationStep === 'verified' ? 'bg-lime-400 text-zinc-950' : 
                  verificationStep === 'verifying' ? 'bg-yellow-400 text-zinc-950' : 'bg-zinc-700 text-zinc-400'
                }`}>
                  {verificationStep === 'verified' ? <CheckCircle className="h-4 w-4" /> : 
                   verificationStep === 'verifying' ? <Clock className="h-4 w-4" /> : '2'}
                </div>
                <span className="text-zinc-300">Identity verification via Self Protocol</span>
                {verificationStep === 'verifying' && (
                  <Badge variant="outline" className="border-yellow-400 text-yellow-400">
                    {countdown}s remaining
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  verificationStep === 'verified' ? 'bg-lime-400 text-zinc-950' : 'bg-zinc-700 text-zinc-400'
                }`}>
                  {verificationStep === 'verified' ? <CheckCircle className="h-4 w-4" /> : '3'}
                </div>
                <span className="text-zinc-300">Access payout dashboard</span>
              </div>
            </div>

            {/* Verification Results */}
            {verificationStep === 'verified' && verificationData && (
              <Card className="bg-zinc-900 border-lime-400/20">
                <CardHeader>
                  <CardTitle className="pixel-font text-lime-400 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Verification Successful
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-zinc-400">Player Name</p>
                      <p className="text-zinc-100 font-medium">{verificationData.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Nationality</p>
                      <p className="text-zinc-100 font-medium">{verificationData.nationality}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Team</p>
                      <p className="text-zinc-100 font-medium">{verificationData.playerProfile?.team}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Position</p>
                      <p className="text-zinc-100 font-medium">{verificationData.playerProfile?.position}</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-zinc-700 pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-zinc-400">Pending Payout</p>
                        <p className="text-2xl font-bold text-lime-400">
                          ${verificationData.playerProfile?.pendingPayout.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-zinc-400">Bond Value</p>
                        <p className="text-lg font-semibold text-zinc-100">
                          ${verificationData.playerProfile?.bondValue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              {verificationStep === 'verified' && (
                <Button 
                  onClick={handleProceedToPayout}
                  className="pixel-font bg-lime-400 text-zinc-950 hover:bg-lime-500 flex-1"
                >
                  Proceed to Payout Dashboard
                </Button>
              )}
              
              {verificationStep === 'error' && (
                <Button 
                  onClick={() => {
                    setVerificationStep('scan');
                    setCountdown(30);
                  }}
                  className="pixel-font bg-red-400 text-zinc-950 hover:bg-red-500 flex-1"
                >
                  Try Again
                </Button>
              )}
              
              {verificationStep === 'scan' && (
                <Button 
                  onClick={handleCardClick}
                  className="pixel-font bg-zinc-700 text-zinc-100 hover:bg-zinc-600 flex-1"
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  Start Verification
                </Button>
              )}
            </div>

            {/* Security Notice */}
            <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-lime-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-zinc-200">Secure Verification</p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Your identity is verified using Self Protocol's secure decentralized infrastructure. 
                    No personal data is stored on our servers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 