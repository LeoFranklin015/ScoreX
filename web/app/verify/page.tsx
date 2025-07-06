"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { CheckCircle, Shield, User, Clock, QrCode } from "lucide-react";
import Lanyard from "../components/lanyard/Lanyard";
import { useVerification } from "../lib/verification-context";
import { countries, getUniversalLink } from "@selfxyz/core";
import {
  SelfQRcodeWrapper,
  SelfAppBuilder,
  type SelfApp,
} from "@selfxyz/qrcode";

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
  const searchParams = useSearchParams();
  const { setVerifiedPlayer, isPlayerVerified, verifiedPlayer } =
    useVerification();
  const [verificationStep, setVerificationStep] = useState<
    "scan" | "verifying" | "verified" | "error"
  >("scan");
  const [verificationData, setVerificationData] =
    useState<MockSelfVerification | null>(null);
  const [countdown, setCountdown] = useState(30);

  // Current player data for the card (either from URL params or verification data)
  const [currentPlayerData, setCurrentPlayerData] = useState({
    name: "Player Card",
    team: "Tap to Verify",
    id: "PLAYER_001",
    playerImageUrl: "/placeholder.svg",
  });

  const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
  const [universalLink, setUniversalLink] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const excludedCountries = useMemo(() => [countries.NORTH_KOREA], []);

  // Handle URL parameters and fetch real player data from API
  useEffect(() => {
    const playerId = searchParams.get("player");
    console.log("URL Player ID:", playerId);

    // If already verified, show verified player data
    if (isPlayerVerified() && verifiedPlayer && !playerId) {
      console.log("Using verified player data:", verifiedPlayer.name);
      setCurrentPlayerData({
        name: verifiedPlayer.name,
        team: verifiedPlayer.playerProfile.team,
        id: verifiedPlayer.id.slice(-8).toUpperCase(),
        playerImageUrl: "/placeholder.svg",
      });
      setVerificationStep("verified");
      setVerificationData({
        id: verifiedPlayer.id,
        name: verifiedPlayer.name,
        nationality: verifiedPlayer.nationality,
        dateOfBirth: verifiedPlayer.dateOfBirth,
        gender: verifiedPlayer.gender,
        isVerified: verifiedPlayer.isVerified,
        minimumAge: 18,
        ofac: true,
        playerProfile: verifiedPlayer.playerProfile,
      });
    } else if (playerId) {
      // Fetch real player data from API
      console.log("Fetching player data from API for ID:", playerId);

      const fetchPlayerData = async () => {
        try {
          const response = await fetch(`/api/players?id=${playerId}`);
          if (!response.ok) {
            throw new Error("Failed to fetch player data");
          }

          const data = await response.json();
          console.log("API Player data:", data);

          if (data && data.player) {
            setCurrentPlayerData({
              name: data.player.name,
              team: data.statistics[0]?.team.name || "Unknown Team",
              id: playerId.toUpperCase(),
              playerImageUrl: data.player.photo || "/placeholder.svg",
            });
            // Reset verification step for new player
            setVerificationStep("scan");
            setVerificationData(null);
          } else {
            console.log("Player data not found, using default");
            setCurrentPlayerData({
              name: "Unknown Player",
              team: "Unknown Team",
              id: playerId.toUpperCase(),
              playerImageUrl: "/placeholder.svg",
            });
            setVerificationStep("scan");
            setVerificationData(null);
          }
        } catch (error) {
          console.error("Error fetching player data:", error);
          setCurrentPlayerData({
            name: "Unknown Player",
            team: "Unknown Team",
            id: playerId.toUpperCase(),
            playerImageUrl: "/placeholder.svg",
          });
          setVerificationStep("scan");
          setVerificationData(null);
        }
      };

      fetchPlayerData();
    } else {
      // No URL parameter and no verified player
      console.log("Using default player card");
      setCurrentPlayerData({
        name: "Player Card",
        team: "Tap to Verify",
        id: "PLAYER_001",
        playerImageUrl: "/placeholder.svg",
      });
      setVerificationStep("scan");
      setVerificationData(null);
    }
  }, [searchParams]); // Removed dependencies to avoid conflicts

  useEffect(() => {
    try {
      const app = new SelfAppBuilder({
        version: 2,
        appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || "Self Workshop",
        scope: process.env.NEXT_PUBLIC_SELF_SCOPE || "player-verification",
        endpoint: `${
          process.env.NEXT_PUBLIC_SELF_ENDPOINT ||
          "0xBe7c6B96092156F7C6DcD576E042af3E6cE817b5"
        }`,
        logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png",
        userId: "0x4b4b30e2E7c6463b03CdFFD6c42329D357205334",
        endpointType: "staging_celo",
        userIdType: "hex",
        userDefinedData: "abc",
        disclosures: {
          minimumAge: 18,
          ofac: true,
          excludedCountries: [
            countries.NORTH_KOREA,
            countries.IRAN,
            countries.RUSSIA,
          ],
          name: true,
          nationality: true,
          date_of_birth: true,
          gender: true,
        },
      }).build();
      setSelfApp(app);
      setUniversalLink(getUniversalLink(app));
    } catch (error) {
      console.error("Failed to initialize Self app:", error);
    }
  }, []);

  const displayToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Generate mock verification data based on real API data
  const generateMockVerificationResponse =
    async (): Promise<MockSelfVerification> => {
      const playerId = searchParams.get("player");

      if (!playerId) {
        // Fallback for when no player ID is provided
        return {
          id: `0x${Math.random().toString(16).substr(2, 40)}`,
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
            pendingPayout: 500.0,
          },
        };
      }

      try {
        // Fetch real player data from API
        const response = await fetch(`/api/players?id=${playerId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch player data");
        }

        const data = await response.json();
        console.log("API Player data for verification:", data);

        if (data && data.player) {
          // Calculate bond value based on player stats
          const primaryStat = data.statistics[0];
          const goals = primaryStat?.goals?.total || 0;
          const assists = primaryStat?.goals?.assists || 0;
          const appearances = primaryStat?.games?.appearences || 0;

          // Simple bond value calculation based on performance
          const bondValue = Math.max(
            5000,
            goals * 500 + assists * 300 + appearances * 100
          );
          const pendingPayout = Math.round(
            bondValue * 0.05 + Math.random() * 100
          );

          return {
            id: `0x${Math.random().toString(16).substr(2, 40)}`,
            name: data.player.name,
            nationality: data.player.nationality,
            dateOfBirth: data.player.birth?.date || "1990-01-01",
            gender: "Male",
            isVerified: true,
            minimumAge: 18,
            ofac: true,
            playerProfile: {
              team: primaryStat?.team?.name || "Unknown Team",
              position: primaryStat?.games?.position || "Player",
              bondValue: bondValue,
              pendingPayout: pendingPayout,
            },
          };
        } else {
          throw new Error("Invalid player data structure");
        }
      } catch (error) {
        console.error("Error fetching player data for verification:", error);

        // Fallback to current player data
        return {
          id: `0x${Math.random().toString(16).substr(2, 40)}`,
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
            pendingPayout: 500.0,
          },
        };
      }
    };

  // Generate verification data using real API
  const generateVerificationData = async (): Promise<MockSelfVerification> => {
    return await generateMockVerificationResponse();
  };

  // Handle card click to start verification
  const handleCardClick = async () => {
    if (verificationStep === "scan") {
      setVerificationStep("verifying");

      // Mock verification process with real API data
      setTimeout(async () => {
        try {
          const mockResponse = await generateMockVerificationResponse();
          setVerificationData(mockResponse);
          setVerificationStep("verified");

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
              lastPayout: "2024-01-15",
            },
          };

          setVerifiedPlayer(verifiedPlayerData);

          // Update the card display
          setCurrentPlayerData({
            name: verifiedPlayerData.name,
            team: verifiedPlayerData.playerProfile.team,
            id: verifiedPlayerData.id.slice(-8).toUpperCase(),
            playerImageUrl: "/placeholder.svg",
          });
        } catch (error) {
          console.error("Verification failed:", error);
          setVerificationStep("error");
        }
      }, 3000);
    }
  };

  // Countdown timer for verification timeout
  useEffect(() => {
    if (verificationStep === "verifying" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setVerificationStep("error");
    }
  }, [verificationStep, countdown]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left side - 3D Lanyard */}
          <div className="h-screen relative flex flex-col items-center justify-center">
            <Lanyard
              position={[0, 0, 20]}
              gravity={[0, -40, 0]}
              playerName={currentPlayerData.name}
              playerTeam={currentPlayerData.team}
              playerId={currentPlayerData.id}
              playerImageUrl={currentPlayerData.playerImageUrl}
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
                    {verificationStep === "scan" &&
                      "Scan the QR code on the right with Self Protocol App to start verification"}
                    {verificationStep === "verifying" &&
                      "Verifying your identity..."}
                    {verificationStep === "verified" &&
                      "Verification complete! Your identity has been successfully verified."}
                    {verificationStep === "error" &&
                      "Verification failed. Please try again."}
                  </p>
                </CardContent>
              </Card>
            </div>
            {/* Toast notification (keep global for now) */}
            {showToast && (
              <div className="fixed bottom-4 right-4 bg-zinc-800 text-white py-2 px-4 rounded shadow-lg animate-fade-in text-sm">
                {toastMessage}
              </div>
            )}
          </div>

          {/* Right side - Verification Status and QR */}
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h1 className="pixel-font text-4xl font-bold text-lime-400 mb-4">
                Footballer Verification
              </h1>
              <p className="text-zinc-400 text-lg">
                Verify your identity with Self Protocol to access your
                sponsorship payouts
              </p>
            </div>

            {/* Verification Steps */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    verificationStep !== "scan"
                      ? "bg-lime-400 text-zinc-950"
                      : "bg-zinc-700 text-zinc-400"
                  }`}
                >
                  {verificationStep !== "scan" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    "1"
                  )}
                </div>
                <span className="text-zinc-300">
                  Scan QR code to initiate verification
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    verificationStep === "verified"
                      ? "bg-lime-400 text-zinc-950"
                      : verificationStep === "verifying"
                      ? "bg-yellow-400 text-zinc-950"
                      : "bg-zinc-700 text-zinc-400"
                  }`}
                >
                  {verificationStep === "verified" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : verificationStep === "verifying" ? (
                    <Clock className="h-4 w-4" />
                  ) : (
                    "2"
                  )}
                </div>
                <span className="text-zinc-300">
                  Identity verification via Self Protocol
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    verificationStep === "verified"
                      ? "bg-lime-400 text-zinc-950"
                      : "bg-zinc-700 text-zinc-400"
                  }`}
                >
                  {verificationStep === "verified" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    "3"
                  )}
                </div>
                <span className="text-zinc-300">
                  Identity verification complete
                </span>
              </div>
            </div>

            {/* Verification Results */}
            {verificationStep === "verified" && verificationData && (
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
                      <p className="text-zinc-100 font-medium">
                        {verificationData.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Nationality</p>
                      <p className="text-zinc-100 font-medium">
                        {verificationData.nationality}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Team</p>
                      <p className="text-zinc-100 font-medium">
                        {verificationData.playerProfile?.team}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Position</p>
                      <p className="text-zinc-100 font-medium">
                        {verificationData.playerProfile?.position}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-zinc-700 pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-zinc-400">Pending Payout</p>
                        <p className="text-2xl font-bold text-lime-400">
                          $
                          {verificationData.playerProfile?.pendingPayout.toFixed(
                            2
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-zinc-400">Bond Value</p>
                        <p className="text-lg font-semibold text-zinc-100">
                          $
                          {verificationData.playerProfile?.bondValue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              {verificationStep === "verified" && (
                <div className="flex-1 text-center">
                  <div className="bg-lime-400/10 border border-lime-400/20 rounded-lg p-4">
                    <CheckCircle className="h-8 w-8 text-lime-400 mx-auto mb-2" />
                    <p className="text-lime-400 font-bold">
                      Verification Complete!
                    </p>
                    <p className="text-zinc-400 text-sm">
                      Your identity has been successfully verified
                    </p>
                  </div>
                </div>
              )}

              {verificationStep === "error" && (
                <Button
                  onClick={() => {
                    setVerificationStep("scan");
                  }}
                  className="pixel-font bg-red-400 text-zinc-950 hover:bg-red-500 flex-1"
                >
                  Try Again
                </Button>
              )}
            </div>

            {/* Security Notice */}
            <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-lime-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-zinc-200">
                    Secure Verification
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Your identity is verified using Self Protocol's secure
                    decentralized infrastructure. No personal data is stored on
                    our servers.
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code for Self Protocol */}
            {verificationStep === "scan" && (
              <div className="flex flex-col items-center mb-6">
                {selfApp ? (
                  <SelfQRcodeWrapper
                    selfApp={selfApp}
                    onSuccess={() => {
                      setVerificationStep("verifying");
                      setTimeout(() => {
                        setVerificationStep("verified");
                        setVerifiedPlayer({
                          id: currentPlayerData.id,
                          name: currentPlayerData.name,
                          nationality: "Verified",
                          dateOfBirth: "Verified",
                          gender: "Verified",
                          isVerified: true,
                          verificationDate: new Date().toISOString(),
                          playerProfile: {
                            team: currentPlayerData.team,
                            position: "Player",
                            bondValue: 10000,
                            pendingPayout: 500.0,
                            performanceScore: 95,
                            totalPaid: 3420.75,
                            roi: 22.8,
                            lastPayout: "2024-01-15",
                          },
                        });
                      }, 1000);
                    }}
                    onError={() => {
                      setVerificationStep("error");
                      displayToast("Error: Failed to verify identity");
                    }}
                  />
                ) : (
                  <div className="w-[256px] h-[256px] bg-gray-200 animate-pulse flex items-center justify-center">
                    <p className="text-gray-500 text-sm">Loading QR Code...</p>
                  </div>
                )}
                <div className="flex flex-row gap-2 mt-4">
                  <Button
                    type="button"
                    onClick={() => {
                      if (!universalLink) return;
                      navigator.clipboard.writeText(universalLink).then(() => {
                        displayToast("Universal link copied to clipboard!");
                      });
                    }}
                    className="bg-zinc-700 text-zinc-100 hover:bg-zinc-600"
                    disabled={!universalLink}
                  >
                    Copy Universal Link
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      if (!universalLink) return;
                      window.open(universalLink, "_blank");
                      displayToast("Opening Self App...");
                    }}
                    className="bg-blue-600 text-white hover:bg-blue-500"
                    disabled={!universalLink}
                  >
                    Open Self App
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
