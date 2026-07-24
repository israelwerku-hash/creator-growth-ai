"use client";
import { useState } from "react";
import { Lock } from "lucide-react";

const niches = [
  { value: "fitness", label: "Fitness", multiplier: 0.1 },
  { value: "tech", label: "Tech", multiplier: 0.15 },
  { value: "beauty", label: "Beauty", multiplier: 0.12 },
  { value: "gaming", label: "Gaming", multiplier: 0.08 },
  { value: "finance", label: "Finance", multiplier: 0.2 },
];

export default function RevenuePage() {
  const [followers, setFollowers] = useState(10000);
  const [niche, setNiche] = useState(niches[0].value);
  const [revenue, setRevenue] = useState(
    10000 * niches[0].multiplier
  );

  const handleCalculate = () => {
    const selectedNiche = niches.find((n) => n.value === niche);
    if (selectedNiche) {
      setRevenue(followers * selectedNiche.multiplier);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-glow-burgundy p-8">
          <h2 className="text-3xl font-bold text-center mb-6">
            Revenue Estimator
          </h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="followers"
                className="block text-sm font-medium mb-2"
              >
                Follower Count
              </label>
              <input
                type="number"
                id="followers"
                value={followers}
                onChange={(e) => setFollowers(parseInt(e.target.value, 10))}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., 50000"
              />
            </div>
            <div>
              <label htmlFor="niche" className="block text-sm font-medium mb-2">
                Niche
              </label>
              <select
                id="niche"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {niches.map((n) => (
                  <option key={n.value} value={n.value} className="bg-gray-800">
                    {n.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleCalculate}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition duration-300"
            >
              Calculate
            </button>
          </div>
          <div className="mt-8 text-center">
            <p className="text-lg">Estimated Monthly Revenue:</p>
            <p className="text-4xl font-bold text-green-400">
              ${revenue.toLocaleString()}
            </p>
          </div>
          <div className="mt-8 pt-6 border-t border-white/20 flex items-center justify-center space-x-2 text-gray-400">
            <Lock size={16} />
            <span>Unlock Advanced Analytics with PRO</span>
          </div>
        </div>
      </div>
    </div>
  );
}
