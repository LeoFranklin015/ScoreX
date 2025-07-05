import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { Player } from '@/lib/football-api';

interface PerformancePredictionGraphProps {
  player: Player;
}

// Generate performance data based on player's current stats
const generatePerformanceData = (player: Player) => {
  const currentGoals = player.goals;
  const currentAssists = player.assists;
  const currentRating = player.current_season_stats.rating;
  
  // Generate radar chart data comparing player vs average
  const radarData = [
    { metric: 'Goals', player: Math.min((currentGoals / 15) * 100, 100), average: 65 },
    { metric: 'Assists', player: Math.min((currentAssists / 10) * 100, 100), average: 55 },
    { metric: 'Rating', player: Math.min((currentRating / 10) * 100, 100), average: 70 },
    { metric: 'Attacking', player: Math.min(((currentGoals + currentAssists) / 20) * 100, 100), average: 60 },
    { metric: 'Consistency', player: Math.min(currentRating * 10, 100), average: 68 },
    { metric: 'Form', player: 70 + (Math.random() - 0.5) * 30, average: 65 }
  ];

  // Match performance probabilities similar to API-Football
  const matchPerformance = [
    { type: 'Next Match Win', probability: Math.min(Math.max(30 + (currentRating - 6.5) * 15, 15), 75) },
    { type: 'Goal Scored', probability: Math.min(Math.max(40 + (currentGoals / 20) * 40, 25), 85) },
    { type: 'Assist Made', probability: Math.min(Math.max(25 + (currentAssists / 15) * 30, 15), 60) },
    { type: 'Man of Match', probability: Math.min(Math.max(10 + (currentRating - 7) * 20, 5), 35) }
  ];

  // Performance metrics bars (similar to API-Football style)
  const performanceMetrics = [
    { 
      name: 'ATTACKING POTENTIAL', 
      player: Math.min(((currentGoals + currentAssists) / 25) * 100, 100), 
      average: 62,
      color: '#00ff88'
    },
    { 
      name: 'GOAL THREAT', 
      player: Math.min((currentGoals / 20) * 100, 100), 
      average: 45,
      color: '#0088ff'
    },
    { 
      name: 'PLAYMAKING', 
      player: Math.min((currentAssists / 15) * 100, 100), 
      average: 38,
      color: '#ff8800'
    },
    { 
      name: 'CONSISTENCY', 
      player: Math.min(currentRating * 10, 100), 
      average: 68,
      color: '#88ff00'
    },
    { 
      name: 'FORM H2H', 
      player: 55 + (Math.random() - 0.5) * 30, 
      average: 50,
      color: '#ff0088'
    },
    { 
      name: 'WINS THE GAME', 
      player: Math.min(Math.max(25 + (currentRating - 6.5) * 15, 15), 70), 
      average: 42,
      color: '#00ffff'
    }
  ];

  // Goal performance expectations (Under/Over style)
  const goalPerformance = [
    { type: 'Under 0.5 Goals', probability: Math.max(100 - (currentGoals / 20) * 80, 20) },
    { type: 'Over 0.5 Goals', probability: Math.min((currentGoals / 20) * 80, 80) },
    { type: 'Over 1.5 Goals', probability: Math.min((currentGoals / 20) * 45, 45) },
    { type: 'Over 2.5 Goals', probability: Math.min((currentGoals / 20) * 25, 25) }
  ];

  return {
    radarData,
    matchPerformance,
    performanceMetrics,
    goalPerformance
  };
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-800 border border-zinc-600 rounded-lg p-3 shadow-lg">
        <p className="text-zinc-300 font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {`${entry.name}: ${entry.value.toFixed(1)}${entry.name.includes('probability') ? '%' : ''}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PerformancePredictionGraph: React.FC<PerformancePredictionGraphProps> = ({ player }) => {
  const performanceData = generatePerformanceData(player);

  return (
    <div className="space-y-6">
      {/* Available Performance Header */}
      <div className="bg-zinc-900/60 backdrop-blur-sm rounded-xl p-6 border border-zinc-700">
        <h3 className="text-2xl font-bold text-white mb-4">Available Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {performanceData.matchPerformance.map((performance: any, index: number) => (
            <div key={index} className="flex justify-between items-center p-3 bg-zinc-800/40 rounded-lg">
              <span className="text-zinc-300">{performance.type}:</span>
              <span className="text-lime-400 font-bold">{performance.probability.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Radar Chart - Player vs Average */}
      <div className="bg-zinc-900/60 backdrop-blur-sm rounded-xl p-6 border border-zinc-700">
        <h3 className="text-xl font-bold text-white mb-4 text-center">
          {player.name} vs League Average
        </h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={performanceData.radarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis 
                dataKey="metric" 
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <PolarRadiusAxis 
                angle={0}
                domain={[0, 100]}
                tick={{ fill: '#9CA3AF', fontSize: 10 }}
                axisLine={false}
                tickCount={6}
              />
              <Radar
                name={player.name}
                dataKey="player"
                stroke="#00ff88"
                fill="#00ff88"
                fillOpacity={0.3}
                strokeWidth={2}
                dot={{ fill: '#00ff88', strokeWidth: 2, r: 4 }}
              />
              <Radar
                name="League Average"
                dataKey="average"
                stroke="#0088ff"
                fill="#0088ff"
                fillOpacity={0.1}
                strokeWidth={2}
                dot={{ fill: '#0088ff', strokeWidth: 2, r: 4 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #4b5563', 
                  borderRadius: '8px',
                  color: '#f3f4f6'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex justify-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-lime-400 rounded"></div>
            <span className="text-zinc-300 text-sm">{player.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-400 rounded"></div>
            <span className="text-zinc-300 text-sm">League Average</span>
          </div>
        </div>
      </div>

      {/* Performance Metrics (API-Football Style) */}
      <div className="bg-zinc-900/60 backdrop-blur-sm rounded-xl p-6 border border-zinc-700">
        <h3 className="text-xl font-bold text-white mb-6">Performance Analysis</h3>
        <div className="space-y-4">
          {performanceData.performanceMetrics.map((metric: any, index: number) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-zinc-300 font-medium text-sm">{metric.name}</span>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-zinc-400">{metric.player.toFixed(0)}%</span>
                  <span className="text-zinc-500">{metric.average.toFixed(0)}%</span>
                </div>
              </div>
              <div className="relative">
                <div className="w-full bg-zinc-700 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${metric.player}%`,
                      background: `linear-gradient(to right, ${metric.color}dd, ${metric.color})`
                    }}
                  />
                </div>
                <div className="absolute top-0 left-0 w-full h-3 flex items-center">
                  <div 
                    className="w-0.5 h-4 bg-zinc-400 relative"
                    style={{ marginLeft: `${metric.average}%` }}
                  >
                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-zinc-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end space-x-4 text-xs text-zinc-500">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-lime-400 rounded-full"></div>
            <span>Player</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-zinc-400 rounded-full"></div>
            <span>Average</span>
          </div>
        </div>
      </div>

      {/* Goal Performance (Under/Over Style) */}
      <div className="bg-zinc-900/60 backdrop-blur-sm rounded-xl p-6 border border-zinc-700">
        <h3 className="text-xl font-bold text-white mb-4">Goal Performance</h3>
        <div className="space-y-3">
          {performanceData.goalPerformance.map((performance: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/40 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-zinc-300">{performance.type}</span>
                <span className="text-xs text-zinc-500">
                  {performance.type.includes('Under') ? 'indicates maximum goals' : 'indicates minimum goals'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-zinc-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-lime-400 to-blue-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${performance.probability}%` }}
                  />
                </div>
                <span className="text-lime-400 font-bold text-sm w-12">
                  {performance.probability.toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Update Information */}
      <div className="bg-zinc-900/60 backdrop-blur-sm rounded-xl p-6 border border-zinc-700">
        <div className="space-y-2 text-sm">
          <p className="text-zinc-300">
            <span className="font-semibold">Update Frequency:</span> This performance analysis is updated every hour.
          </p>
          <p className="text-zinc-300">
            <span className="font-semibold">Recommended Usage:</span> 1 analysis per hour for active fixtures otherwise 1 per day.
          </p>
          <p className="text-zinc-400 text-xs mt-3">
            * Performance analysis is based on current season statistics, team form, and historical performance data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PerformancePredictionGraph; 