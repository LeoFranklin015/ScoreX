"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Progress } from "../components/ui/progress"
import { ScrollArea } from "../components/ui/scroll-area"
import { Swords, Clock, Zap, Star } from "lucide-react"

export default function Matches() {
  const [currentScore, setCurrentScore] = useState({ you: 247, opponent: 189 })
  const [confidence, setConfidence] = useState(73)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScore((prev) => ({
        you: prev.you + Math.floor(Math.random() * 3),
        opponent: prev.opponent + Math.floor(Math.random() * 2),
      }))
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const yourSquad = [
    { name: "Kylian Mbappé", position: "Forward", points: 45, status: "active" },
    { name: "Pedri", position: "Midfielder", points: 32, status: "active" },
    { name: "Virgil van Dijk", position: "Defender", points: 28, status: "injured" },
    { name: "Alisson", position: "Goalkeeper", points: 22, status: "active" },
  ]

  const opponentSquad = [
    { name: "Erling Haaland", position: "Forward", points: 38, status: "active" },
    { name: "Kevin De Bruyne", position: "Midfielder", points: 35, status: "active" },
    { name: "Rúben Dias", position: "Defender", points: 25, status: "active" },
    { name: "Ederson", position: "Goalkeeper", points: 18, status: "active" },
  ]

  const liveFeed = [
    { time: "89'", player: "Mbappé", event: "Goal", points: "+5", type: "goal" },
    { time: "76'", player: "Haaland", event: "Goal", points: "+5", type: "goal" },
    { time: "65'", player: "Pedri", event: "Assist", points: "+3", type: "assist" },
    { time: "45'", player: "Van Dijk", event: "Clean Sheet", points: "+2", type: "defense" },
    { time: "32'", player: "De Bruyne", event: "Key Pass", points: "+1", type: "assist" },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="pixel-font text-4xl font-bold text-lime-400 mb-2">Match Arena</h1>
        <p className="text-zinc-400">Battle royale is live. May the best portfolio win.</p>
      </div>

      {/* Match Header */}
      <Card className="glitch-border bg-zinc-900/50 mb-6">
        <CardHeader>
          <CardTitle className="pixel-font text-lime-400 flex items-center">
            <Swords className="mr-2 h-5 w-5" />
            H2H Showdown - Week 15
          </CardTitle>
          <CardDescription className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />3 days, 14 hours remaining
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="text-lg font-bold text-fuchsia-500">YOU</div>
              <div className="text-4xl font-bold pixel-font text-lime-400">{currentScore.you}</div>
              <Badge className="bg-lime-400/20 text-lime-400">Leading</Badge>
            </div>
            <div className="text-center space-y-4">
              <div className="text-zinc-400">VS</div>
              <Progress value={(currentScore.you / (currentScore.you + currentScore.opponent)) * 100} className="h-2" />
              <div className="text-sm text-zinc-400">{confidence}% confidence you'll win</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-lg font-bold text-orange-400">OPPONENT</div>
              <div className="text-4xl font-bold pixel-font text-orange-400">{currentScore.opponent}</div>
              <Badge variant="outline" className="border-orange-400 text-orange-400">
                Trailing
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Squad Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="glitch-border bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="pixel-font text-lime-400">Your Squad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {yourSquad.map((player, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-zinc-800/50 rounded flicker-border"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center">
                      <Star className="h-5 w-5 text-lime-400" />
                    </div>
                    <div>
                      <div className="font-bold text-white">{player.name}</div>
                      <div className="text-sm text-zinc-400">{player.position}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-lime-400">{player.points}</div>
                    <Badge variant={player.status === "active" ? "default" : "destructive"} className="text-xs">
                      {player.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glitch-border bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="pixel-font text-orange-400">Opponent Squad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {opponentSquad.map((player, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center">
                      <Star className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                      <div className="font-bold text-white">{player.name}</div>
                      <div className="text-sm text-zinc-400">{player.position}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-orange-400">{player.points}</div>
                    <Badge variant={player.status === "active" ? "default" : "destructive"} className="text-xs">
                      {player.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Feed */}
      <Card className="glitch-border bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="pixel-font text-lime-400 flex items-center">
            <Zap className="mr-2 h-5 w-5" />
            Live Points Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {liveFeed.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-zinc-400 font-mono">{event.time}</div>
                    <div className="font-bold text-white">{event.player}</div>
                    <div className="text-sm text-zinc-400">{event.event}</div>
                  </div>
                  <Badge
                    className={`${
                      event.type === "goal"
                        ? "bg-lime-400/20 text-lime-400"
                        : event.type === "assist"
                          ? "bg-fuchsia-500/20 text-fuchsia-500"
                          : "bg-purple-400/20 text-purple-400"
                    }`}
                  >
                    {event.points}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
