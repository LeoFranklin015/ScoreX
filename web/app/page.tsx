"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import { Play, ArrowRight, Shield, Zap } from "lucide-react";

export default function Home() {
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false);
  const router = useRouter();

  const handleEnterClick = () => {
    setIsAnimationPlaying(true);
    // Navigate to dashboard after a short delay to show the animation
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden">
      {/* 3D Model Background - Always loaded, controlled by animation state */}
      <div className="absolute inset-0 z-0">
        <div className="sketchfab-embed-wrapper w-full h-full">
          <iframe 
            title="3D Rigged Messi Argentina Worldcup 2022" 
            className="w-full h-full object-cover"
            frameBorder="0" 
            allowFullScreen 
            allow="autoplay; fullscreen; xr-spatial-tracking" 
            src={`https://sketchfab.com/models/7b09d0ef5186435ea73b0b80f90043d9/embed?autostart=${isAnimationPlaying ? 1 : 0}&ui_theme=dark&ui_controls=1&ui_infos=0&ui_stop=0&ui_watermark=0&ui_animations=1&transparent=1`}
          />
        </div>
        {/* Overlay to darken the background model */}
        <div className="absolute inset-0 bg-zinc-950/70 backdrop-blur-sm"></div>
      </div>

      {/* Additional animated background elements overlay */}
      {!isAnimationPlaying && (
        <div className="absolute inset-0 z-[1] bg-gradient-to-br from-zinc-900/50 via-zinc-950/50 to-black/50">
          <div className="absolute top-20 left-20 w-72 h-72 bg-lime-400/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-32 right-32 w-96 h-96 bg-fuchsia-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-lime-400/3 rounded-full blur-2xl animate-ping"></div>
        </div>
      )}

      {/* Main Content - Always visible */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 md:p-8">
                      <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-lime-400 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-zinc-950" />
              </div>
              <h1 className="pixel-font text-2xl font-bold text-lime-400">CurveLeague</h1>
            </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6 md:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Hero Section */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="pixel-font text-5xl md:text-7xl font-bold bg-gradient-to-r from-lime-400 via-lime-300 to-lime-500 bg-clip-text text-transparent">
                  FOOTBALLER
                </h2>
                <h3 className="pixel-font text-4xl md:text-6xl font-bold text-zinc-100">
                  VERIFICATION
                </h3>
                <div className="w-24 h-1 bg-lime-400 mx-auto"></div>
              </div>
              
              <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                The ultimate football league platform featuring 3D Messi animation and advanced verification technology
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
              <Card className="bg-zinc-900/80 border-lime-400/20 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <Shield className="h-8 w-8 text-lime-400 mx-auto mb-3" />
                  <h4 className="font-semibold text-lime-400 mb-2">Secure Verification</h4>
                  <p className="text-sm text-zinc-400">Self Protocol integration for decentralized identity verification</p>
                </CardContent>
              </Card>
              
              <Card className="bg-zinc-900/80 border-fuchsia-500/20 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <Zap className="h-8 w-8 text-fuchsia-500 mx-auto mb-3" />
                  <h4 className="font-semibold text-fuchsia-500 mb-2">3D Interaction</h4>
                  <p className="text-sm text-zinc-400">Immersive 3D player cards with physics simulation</p>
                </CardContent>
              </Card>
              
              <Card className="bg-zinc-900/80 border-blue-400/20 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <Play className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                  <h4 className="font-semibold text-blue-400 mb-2">Real-time Data</h4>
                  <p className="text-sm text-zinc-400">Live player statistics from API-Football integration</p>
                </CardContent>
              </Card>
            </div>

            {/* Enter Button */}
            <div className="space-y-6">
              <Button
                onClick={handleEnterClick}
                className="pixel-font text-lg px-8 py-4 bg-lime-400 text-zinc-950 hover:bg-lime-500 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-lime-400/25 group"
              >
                <Play className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform" />
                Click here to enter
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <p className="text-sm text-zinc-500">
                Experience 3D Messi animation and enter the CurveLeague dashboard
              </p>
            </div>


          </div>
        </main>

        {/* Footer */}
        <footer className="p-6 md:p-8 text-center">
          <p className="text-zinc-600 text-sm">
            Powered by Self Protocol • Built with Next.js and Three.js
          </p>
        </footer>
      </div>
    </div>
  );
}
