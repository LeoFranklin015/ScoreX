"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { QrCode, Copy, ExternalLink } from "lucide-react";

interface PlayerQRCodeProps {
  playerName?: string;
  playerId?: string;
  verificationUrl?: string;
}

export default function PlayerQRCode({ 
  playerName = "Footballer", 
  playerId = "default",
  verificationUrl = "/verify"
}: PlayerQRCodeProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [fullUrl, setFullUrl] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const baseUrl = window.location.origin;
      const url = `${baseUrl}${verificationUrl}?player=${playerId}`;
      setFullUrl(url);
      
      // Generate QR code URL using a QR code API service
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(url)}`;
      setQrCodeUrl(qrUrl);
    }
  }, [verificationUrl, playerId]);

  const copyToClipboard = async () => {
    if (!fullUrl) return;
    
    try {
      await navigator.clipboard.writeText(fullUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const openVerificationPage = () => {
    if (fullUrl) {
      window.open(fullUrl, "_blank");
    }
  };

  return (
    <Card className="bg-zinc-900 border-lime-400/20 hover:border-lime-400/40 transition-colors">
      <CardHeader className="text-center">
        <CardTitle className="pixel-font text-lime-400 flex items-center justify-center gap-2">
          <QrCode className="h-5 w-5" />
          Player Verification
        </CardTitle>
        <p className="text-sm text-zinc-400">
          Scan to verify identity and access sponsorship payouts
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* QR Code Display */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt={`QR Code for ${playerName} verification`}
                  className="w-64 h-64 object-contain"
                />
              ) : (
                <div className="w-64 h-64 bg-gray-200 animate-pulse flex items-center justify-center">
                  <p className="text-gray-500 text-sm">Generating QR Code...</p>
                </div>
              )}
            </div>
            
            {/* Glow effect */}
            <div className="absolute inset-0 bg-lime-400/10 rounded-lg blur-sm -z-10"></div>
          </div>
        </div>

        {/* Player Info */}
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-zinc-100">{playerName}</h3>
          <p className="text-sm text-zinc-400">Player ID: {playerId}</p>
        </div>

        {/* Instructions */}
        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
          <h4 className="text-sm font-medium text-zinc-200 mb-2">How to use:</h4>
          <ol className="text-xs text-zinc-400 space-y-1">
            <li>1. Scan the QR code with your phone camera</li>
            <li>2. Click the verification link</li>
            <li>3. Interact with the 3D player card</li>
            <li>4. Complete Self Protocol verification</li>
            <li>5. Access your payout dashboard</li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={copyToClipboard}
            variant="outline"
            className="flex-1 border-lime-400/20 text-lime-400 hover:bg-lime-400/10"
          >
            <Copy className="mr-2 h-4 w-4" />
            {linkCopied ? "Copied!" : "Copy Link"}
          </Button>
          
          <Button
            onClick={openVerificationPage}
            className="flex-1 bg-lime-400 text-zinc-950 hover:bg-lime-500"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Open
          </Button>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
          <div className="w-2 h-2 bg-lime-400 rounded-full"></div>
          <span>Secured by Self Protocol</span>
        </div>
      </CardContent>
    </Card>
  );
} 