"use client";
import React, { useState, useEffect } from "react";
import { TEAM_ROSTER, OPPONENTS, SL_POINTS_REQ } from "@/lib/constants";

export default function WarRoom() {
  const [matches, setMatches] = useState(Array(5).fill({ ourP: "", oppP: "" }));
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("recklessLineupV5");
    if (saved) {
      setMatches(JSON.parse(saved));
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("recklessLineupV5", JSON.stringify(matches));
    }
  }, [matches, isLoaded]);

  const updateMatch = (index: number, field: "ourP" | "oppP", val: string) => {
    const newMatches = [...matches];
    newMatches[index] = { ...newMatches[index], [field]: val };
    setMatches(newMatches);
  };

  const totalSL = matches.reduce((sum, match) => {
    const p = TEAM_ROSTER.find(r => r.name === match.ourP);
    return sum + (p ? p.sl : 0);
  }, 0);

  if (!isLoaded) return <div className="min-h-screen bg-black text-orange-600 p-12 font-mono font-black text-2xl">LOADING WAR ROOM...</div>;

  return (
    <main className="min-h-screen bg-black text-white p-8 md:p-12 font-mono italic">
      <header className="flex justify-between items-end border-b-4 border-orange-600 pb-4 mb-8">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
          RECKLESS RACKS <span className="text-orange-600">PRO DASHBOARD</span>
        </h1>
        <div className={`p-4 border-2 transition-colors duration-300 ${totalSL > 23 ? 'border-red-600 bg-red-900/50 animate-pulse' : 'border-zinc-800 bg-zinc-900'}`}>
          <div className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">23-Rule Tracker</div>
          <div className={`text-4xl font-black ${totalSL > 23 ? 'text-red-500' : 'text-white'}`}>{totalSL} <span className="text-lg text-zinc-600">/ 23</span></div>
        </div>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-orange-600 font-bold underline uppercase text-xl mb-6">Match Lineup</h2>
          {[0, 1, 2, 3, 4].map((i) => {
            const ourPlayer = TEAM_ROSTER.find(r => r.name === matches[i].ourP);
            const oppPlayer = OPPONENTS.find(r => r.name === matches[i].oppP);
            const ourReq = ourPlayer ? (SL_POINTS_REQ as any)[ourPlayer.sl] : "-";
            const oppReq = oppPlayer ? (SL_POINTS_REQ as any)[oppPlayer.sl] : "-";
            
            let edgeDisplay = null;
            if (ourPlayer && oppPlayer) {
              const modifier = ourPlayer.mp < 3 ? 0.85 : (ourPlayer.mp <= 5 ? 1.00 : 1.05);
              const adjPPM = ourPlayer.ppm * modifier;
              const ourWinPct = (adjPPM / 20) * 100;
              const diff = ourWinPct - oppPlayer.win;
              
              edgeDisplay = (
                <div className={`text-xs font-black px-2 py-1 mt-1 text-center tracking-widest ${diff >= 0 ? 'text-orange-500' : 'text-red-500'}`}>
                  {diff >= 0 ? '+' : ''}{diff.toFixed(1)}% EDGE
                </div>
              );
            }

            return (
              <div key={i} className="bg-zinc-900 p-4 border border-zinc-800 flex flex-col md:flex-row justify-between items-center shadow-lg gap-4">
                <span className="font-black text-zinc-600 text-xl w-24">MATCH {i + 1}</span>
                
                <div className="flex flex-1 gap-4 w-full items-center">
                  <div className="flex-1 flex items-center gap-2">
                    <select 
                      className="bg-black border border-zinc-700 text-white p-3 flex-1 focus:border-orange-600 outline-none font-bold text-sm"
                      value={matches[i].ourP}
                      onChange={(e) => updateMatch(i, "ourP", e.target.value)}
                    >
                      <option value="">-- Our Player --</option>
                      {TEAM_ROSTER.map(p => (
                        <option key={p.name} value={p.name}>{p.name} (SL {p.sl})</option>
                      ))}
                    </select>
                    <div className="w-12 text-center font-black text-orange-500 text-2xl">{ourReq}</div>
                  </div>

                  <div className="flex flex-col items-center justify-center min-w-[100px]">
                    <div className="font-black text-zinc-600">VS</div>
                    {edgeDisplay}
                  </div>

                  <div className="flex-1 flex items-center gap-2">
                    <div className="w-12 text-center font-black text-orange-500 text-2xl">{oppReq}</div>
                    <select 
                      className="bg-black border border-zinc-700 text-white p-3 flex-1 focus:border-orange-600 outline-none font-bold text-sm"
                      value={matches[i].oppP}
                      onChange={(e) => updateMatch(i, "oppP", e.target.value)}
                    >
                      <option value="">-- Opponent --</option>
                      {OPPONENTS.map(p => (
                        <option key={p.name} value={p.name}>{p.name} (SL {p.sl})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="space-y-8">
          <section className="bg-zinc-900 p-6 border border-zinc-800 shadow-xl">
            <h2 className="text-orange-600 font-bold mb-4 underline uppercase">Playbook Roster Stats</h2>
            <ul className="space-y-3 text-sm">
              {TEAM_ROSTER.map(p => {
                const modifier = p.mp < 3 ? 0.85 : (p.mp <= 5 ? 1.00 : 1.05);
                const adjPPM = (p.ppm * modifier).toFixed(2);
                const isRisk = p.mp < 4;
                
                return (
                  <li key={p.name} className="flex flex-col border-b border-zinc-800 pb-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold">{p.name}</span>
                      <span className="font-bold text-orange-500 italic uppercase">SL {p.sl} | ADJ {adjPPM}</span>
                    </div>
                    {isRisk && (
                      <div className="text-[10px] text-red-500 font-bold uppercase tracking-widest animate-pulse">
                        ! PLAYOFF THRESHOLD RISK: {p.mp}/4 MATCHES
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
