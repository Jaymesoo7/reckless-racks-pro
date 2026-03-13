"use client";
import React, { useState, useEffect, useMemo } from "react";
import { TEAM_ROSTER, OPPONENTS, SL_POINTS_REQ } from "@/lib/constants";

const getMatchPoints = (loserBalls: number, loserSL: number) => {
  const table: Record<number, { range: [number, number], pts: number }[]> = {
    1: [{range: [0, 2], pts: 0}, {range: [3, 3], pts: 1}, {range: [4, 4], pts: 2}, {range: [5, 6], pts: 3}, {range: [7, 7], pts: 4}, {range: [8, 8], pts: 5}, {range: [9, 10], pts: 6}, {range: [11, 11], pts: 7}, {range: [12, 13], pts: 8}],
    2: [{range: [0, 3], pts: 0}, {range: [4, 5], pts: 1}, {range: [6, 7], pts: 2}, {range: [8, 8], pts: 3}, {range: [9, 10], pts: 4}, {range: [11, 12], pts: 5}, {range: [13, 14], pts: 6}, {range: [15, 16], pts: 7}, {range: [17, 18], pts: 8}],
    3: [{range: [0, 4], pts: 0}, {range: [5, 6], pts: 1}, {range: [7, 9], pts: 2}, {range: [10, 11], pts: 3}, {range: [12, 14], pts: 4}, {range: [15, 16], pts: 5}, {range: [17, 19], pts: 6}, {range: [20, 21], pts: 7}, {range: [22, 24], pts: 8}],
    4: [{range: [0, 5], pts: 0}, {range: [6, 8], pts: 1}, {range: [9, 11], pts: 2}, {range: [12, 14], pts: 3}, {range: [15, 18], pts: 4}, {range: [19, 21], pts: 5}, {range: [22, 24], pts: 6}, {range: [25, 27], pts: 7}, {range: [28, 30], pts: 8}],
    5: [{range: [0, 6], pts: 0}, {range: [7, 10], pts: 1}, {range: [11, 14], pts: 2}, {range: [15, 18], pts: 3}, {range: [19, 22], pts: 4}, {range: [23, 26], pts: 5}, {range: [27, 29], pts: 6}, {range: [30, 33], pts: 7}, {range: [34, 37], pts: 8}],
    6: [{range: [0, 8], pts: 0}, {range: [9, 12], pts: 1}, {range: [13, 17], pts: 2}, {range: [18, 22], pts: 3}, {range: [23, 27], pts: 4}, {range: [28, 31], pts: 5}, {range: [32, 36], pts: 6}, {range: [37, 40], pts: 7}, {range: [41, 45], pts: 8}],
    7: [{range: [0, 10], pts: 0}, {range: [11, 15], pts: 1}, {range: [16, 21], pts: 2}, {range: [22, 26], pts: 3}, {range: [27, 32], pts: 4}, {range: [33, 37], pts: 5}, {range: [38, 43], pts: 6}, {range: [44, 49], pts: 7}, {range: [50, 54], pts: 8}],
    8: [{range: [0, 13], pts: 0}, {range: [14, 19], pts: 1}, {range: [20, 26], pts: 2}, {range: [27, 32], pts: 3}, {range: [33, 39], pts: 4}, {range: [40, 45], pts: 5}, {range: [46, 52], pts: 6}, {range: [53, 58], pts: 7}, {range: [59, 64], pts: 8}],
    9: [{range: [0, 17], pts: 0}, {range: [18, 24], pts: 1}, {range: [25, 31], pts: 2}, {range: [32, 38], pts: 3}, {range: [39, 46], pts: 4}, {range: [47, 53], pts: 5}, {range: [54, 60], pts: 6}, {range: [61, 67], pts: 7}, {range: [68, 74], pts: 8}]
  };
  const levels = table[loserSL];
  if (!levels) return 9;
  const match = levels.find(l => loserBalls >= l.range[0] && loserBalls <= l.range[1]);
  return match ? match.pts : 9;
};

const calculateLiveScore = (ourPts: number, ourReq: number, ourSL: number, oppPts: number, oppReq: number, oppSL: number) => {
  if (!ourSL || !oppSL) return { us: 0, them: 0 };
  const ourProgress = ourPts / ourReq;
  const oppProgress = oppPts / oppReq;
  if (ourProgress >= 1 || ourProgress >= oppProgress) {
    const lp = getMatchPoints(oppPts, oppSL);
    return { us: 20 - lp, them: lp };
  } else {
    const lp = getMatchPoints(ourPts, ourSL);
    return { us: lp, them: 20 - lp };
  }
};

const RosterTable = ({ title, sub, players, usage, isOurTeam, attendance, toggleAttendance }: any) => (
  <div className="bg-[#111] border border-[#333] p-3">
    <div className="mb-4">
      <h2 className="text-[#FFFFFF] font-bold uppercase text-[10px] tracking-widest">{sub}</h2>
      <h1 className={`${isOurTeam ? 'text-[#ff5500]' : 'text-[#3399ff]'} text-2xl font-black uppercase tracking-tighter leading-none`}>{title}</h1>
    </div>
    <div className="grid grid-cols-12 text-[9px] font-black text-[#FFFFFF] uppercase border-b border-[#333] pb-2 mb-2">
      <div className="col-span-1 text-center">IN</div>
      <div className="col-span-4 text-white font-black">Player Name</div>
      <div className="col-span-1 text-center text-white">SL</div>
      <div className="col-span-2 text-center text-white">W/P</div>
      <div className="col-span-2 text-center text-white">Win%</div>
      <div className="col-span-2 text-right text-[#ff5500]">PPM</div>
    </div>
    <div className="space-y-1">
      {players.map((p: any) => {
        const playCount = usage[p.name] || 0;
        const isMaxed = playCount >= 2;
        const isPresent = attendance ? attendance[p.name] !== false : true;
        return (
          <div key={p.id} className={`grid grid-cols-12 text-[10px] py-1 border-b border-[#222] items-center ${isMaxed || !isPresent ? 'opacity-20 grayscale' : ''}`}>
            <div className="col-span-1 flex justify-center">
              <input type="checkbox" checked={isPresent} onChange={() => toggleAttendance(p.name)} className={isOurTeam ? "accent-[#ff5500]" : "accent-[#3399ff]"} />
            </div>
            <div className="col-span-4 text-white font-black truncate">
              {p.name} {playCount === 1 && <span className="text-[#00ff00] text-[8px] ml-1">[1x]</span>}
              <div className="text-[8px] text-[#FFFFFF]">#{p.id}</div>
              {isOurTeam && p.mp < 4 && !isMaxed && <div className="text-[10px] text-[#ff0000] font-black uppercase animate-pulse">Needs {4-p.mp} for Playoffs</div>}
            </div>
            <div className="col-span-1 text-center font-black text-white">{p.sl}</div>
            <div className="col-span-2 text-center text-white">{p.won}/{p.mp}</div>
            <div className="col-span-2 text-center text-white">{p.winPct}%</div>
            <div className="col-span-2 text-right font-black text-[#ff5500]">{p.ppm.toFixed(2)}</div>
          </div>
        );
      })}
    </div>
  </div>
);

export default function WarRoom() {
  const [matchLocation, setMatchLocation] = useState<string>("");
  const [teamRoster, setTeamRoster] = useState<any[]>(TEAM_ROSTER);
  const [opponents, setOpponents] = useState<any[]>(OPPONENTS);
  const [isUploading, setIsUploading] = useState(false);

  const [matches, setMatches] = useState(Array(5).fill(null).map(() => ({ ourP: "", oppP: "", ourPts: 0, oppPts: 0 })));
  const [tossWinner, setTossWinner] = useState<"us" | "them" | "">("");
  const [firstLead, setFirstLead] = useState<"us" | "them" | "">("us");
  const [weeksLeft, setWeeksLeft] = useState(6);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [startTime, setStartTime] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err) {}
    };
    requestWakeLock();
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') requestWakeLock();
    });

    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
      setCurrentDate(now.toLocaleDateString());
    }, 1000);
    
    const saved = localStorage.getItem("recklessLocationV61");
    if (saved) {
      const data = JSON.parse(saved);
      if (data.matchLocation) setMatchLocation(data.matchLocation);
      if (data.matches) setMatches(data.matches);
      if (data.startTime) setStartTime(data.startTime);
      if (data.tossWinner) setTossWinner(data.tossWinner);
      if (data.firstLead) setFirstLead(data.firstLead);
      if (data.weeksLeft) setWeeksLeft(data.weeksLeft);
      if (data.attendance) setAttendance(data.attendance);
      if (data.teamRoster) setTeamRoster(data.teamRoster);
      if (data.opponents) setOpponents(data.opponents);
    }
    setIsLoaded(true);
    
    return () => {
      clearInterval(timer);
      if (wakeLock) wakeLock.release();
    };
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("recklessLocationV61", JSON.stringify({ matchLocation, matches, startTime, tossWinner, firstLead, weeksLeft, attendance, teamRoster, opponents }));
    }
  }, [matchLocation, matches, startTime, tossWinner, firstLead, weeksLeft, attendance, teamRoster, opponents, isLoaded]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success && json.data) {
        if (json.data.matchLocation) setMatchLocation(json.data.matchLocation);
        if (json.data.team && json.data.team.length > 0) setTeamRoster(json.data.team);
        if (json.data.opponents && json.data.opponents.length > 0) setOpponents(json.data.opponents);
        alert("Rosters and location successfully updated!");
      } else {
        alert("Failed to parse image data.");
      }
    } catch (err) {
      alert("Upload error.");
    }
    setIsUploading(false);
  };

  const toggleAttendance = (name: string) => {
    setAttendance(prev => ({ ...prev, [name]: !(prev[name] !== false) }));
  };

  const ourUsage = matches.reduce((acc, m) => { if(m.ourP) acc[m.ourP] = (acc[m.ourP] || 0) + 1; return acc; }, {} as Record<string, number>);
  const oppUsage = matches.reduce((acc, m) => { if(m.oppP) acc[m.oppP] = (acc[m.oppP] || 0) + 1; return acc; }, {} as Record<string, number>);
  
  const totalSL = matches.reduce((sum, m) => sum + (teamRoster.find(r => r.name === m.ourP)?.sl || 0), 0);
  const totalOppSL = matches.reduce((sum, m) => sum + (opponents.find(o => o.name === m.oppP)?.sl || 0), 0);
  
  const matchesLeftTonight = matches.filter(m => !m.ourP).length;
  
  const teamScores = useMemo(() => {
    return matches.reduce((acc, m) => {
      const our = teamRoster.find(r => r.name === m.ourP);
      const opp = opponents.find(o => o.name === m.oppP);
      const s = calculateLiveScore(m.ourPts, our ? SL_POINTS_REQ[our.sl as keyof typeof SL_POINTS_REQ] : 0, our?.sl || 0, m.oppPts, opp ? SL_POINTS_REQ[opp.sl as keyof typeof SL_POINTS_REQ] : 0, opp?.sl || 0);
      return { us: acc.us + s.us, them: acc.them + s.them };
    }, { us: 0, them: 0 });
  }, [matches, teamRoster, opponents]);

  const simulations = useMemo(() => {
    let ourAvailable = teamRoster.filter(p => (ourUsage[p.name] || 0) === 0 && (attendance[p.name] !== false));
    let oppAvailable = opponents.filter(p => (oppUsage[p.name] || 0) === 0 && (attendance[p.name] !== false));

    if (ourAvailable.length < matchesLeftTonight) {
        const ourDoublePlay = teamRoster.filter(p => (ourUsage[p.name] || 0) === 1 && (attendance[p.name] !== false));
        ourAvailable = [...ourAvailable, ...ourDoublePlay];
    }
    if (oppAvailable.length < matchesLeftTonight) {
        const oppDoublePlay = opponents.filter(p => (oppUsage[p.name] || 0) === 1 && (attendance[p.name] !== false));
        oppAvailable = [...oppAvailable, ...oppDoublePlay];
    }

    const scoreDiff = teamScores.us - teamScores.them;
    const activeMatch = matches.find(m => m.oppP && !m.ourP);
    const targetOpp = activeMatch ? opponents.find(o => o.name === activeMatch.oppP) : null;

    return ourAvailable.map(p => {
        let mod = 1.0;
        if (p.mp < 3) mod = 0.85;
        else if (p.mp >= 6) mod = 1.05;
        
        const adjustedPPM = p.ppm * mod;
        let scoreStateBonus = 0;
        if (scoreDiff > 5) scoreStateBonus = (p.winPct / 100) * 2;
        else if (scoreDiff < -5) scoreStateBonus = (adjustedPPM / 20) * 2;

        let leadBonus = 0;
        if (firstLead === "us" && (p.sl === 4 || p.sl === 5)) leadBonus = 3;

        const matchesNeeded = 4 - p.mp;
        let eligibilityUrgency = (matchesNeeded > 0) ? (matchesNeeded >= weeksLeft ? 10000 : matchesNeeded * 150) : 0;

        let bestOpp = null;
        let expectedNetPoints = 0;

        if (targetOpp) {
           const oppAdjustedPPM = targetOpp.ppm || 10;
           let gapPenalty = 0;
           if (Math.abs(p.sl - targetOpp.sl) > 2) {
               gapPenalty = (firstLead === "them" && p.sl < targetOpp.sl) ? -0.5 : -2;
           }
           expectedNetPoints = adjustedPPM - oppAdjustedPPM + gapPenalty;
           bestOpp = { name: targetOpp.name, sl: targetOpp.sl, net: expectedNetPoints };
        } else {
           const oppStats = oppAvailable.map(o => {
               const oppAdjustedPPM = o.ppm || 10;
               let gapPenalty = 0;
               if (Math.abs(p.sl - o.sl) > 2) gapPenalty = -2;
               return { name: o.name, sl: o.sl, net: adjustedPPM - oppAdjustedPPM + gapPenalty };
           }).sort((a,b) => b.net - a.net);
           bestOpp = oppStats[0];
           expectedNetPoints = bestOpp?.net || 0;
        }

        const finalRank = adjustedPPM + scoreStateBonus + leadBonus + eligibilityUrgency + expectedNetPoints;

        return { 
            name: p.name, 
            vs: bestOpp?.name || "TBD", 
            edge: expectedNetPoints, 
            sl: p.sl, 
            rank: finalRank, 
            isUrgent: matchesNeeded >= weeksLeft && matchesNeeded > 0 
        };
      }).sort((a, b) => b.rank - a.rank).slice(0, matchesLeftTonight);
  }, [ourUsage, oppUsage, weeksLeft, attendance, matchesLeftTonight, matches, teamScores, firstLead, teamRoster, opponents]);

  const recommendation = useMemo(() => {
      const activeMatch = matches.find(m => m.oppP && !m.ourP);
      if (!activeMatch || simulations.length === 0) return null;
      return { opp: activeMatch.oppP, our: simulations[0].name, edge: simulations[0].edge };
  }, [simulations, matches]);

  if (!isLoaded) return <div className="bg-black text-[#ff5500] p-20 font-black italic text-center text-3xl uppercase">Loading iPad Interface...</div>;

  return (
    <main className="min-h-screen bg-black text-white p-4 font-mono italic">
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center border-b-4 border-[#ff5500] mb-6 pb-4 gap-4">
        <div className="flex gap-6 items-center">
            <div>
                <div className="text-[10px] text-white font-black mb-1">{currentDate} // {currentTime}</div>
                <h1 className="text-3xl font-black uppercase tracking-tighter leading-none italic text-white">RECKLESS <span className="text-[#ff5500]">COMMAND</span></h1>
            </div>
            {matchLocation && (
              <div className="bg-[#1a1a1a] p-3 border-2 border-[#ff5500]">
                  <div className="text-[10px] text-[#ff5500] font-black uppercase mb-1 font-black">Location</div>
                  <div className="text-2xl font-black text-white">{matchLocation}</div>
              </div>
            )}
            <div className="bg-[#1a1a1a] p-3 border-2 border-[#ff5500]">
                <div className="text-[10px] text-[#ff5500] font-black uppercase mb-1 font-black">Weeks Left</div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setWeeksLeft(Math.max(1, weeksLeft - 1))} className="bg-[#333] px-2 text-white font-black">-</button>
                    <span className="text-2xl font-black text-white">{weeksLeft}</span>
                    <button onClick={() => setWeeksLeft(weeksLeft + 1)} className="bg-[#333] px-2 text-white font-black">+</button>
                </div>
            </div>
        </div>
        <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase">
          <div className="bg-[#111] border border-[#555] p-2 text-center font-black">
             <div className="text-white mb-1 underline">Roster</div>
             <label className="cursor-pointer bg-[#3399ff] text-black px-4 py-1 inline-block font-black transition-all active:scale-95">
                 {isUploading ? "SCANNING..." : "UPLOAD IMAGES"}
                 <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} disabled={isUploading} />
             </label>
          </div>
          <div className="bg-[#111] border border-[#555] p-2 text-center font-black">
             <div className="text-white mb-1 underline">Timer</div>
             {!startTime ? <button onClick={() => setStartTime(new Date().toLocaleTimeString())} className="bg-[#00ff00] text-black px-4 py-1">START</button> : <span className="text-[#00ff00]">{startTime}</span>}
          </div>
          <div className="bg-[#111] border border-[#555] p-2 font-black">
            <div className="text-white mb-1 underline text-center font-black">Toss / Lead</div>
            <div className="flex gap-2">
                <button onClick={() => setTossWinner(tossWinner === "us" ? "" : "us")} className={`px-4 py-1 font-black transition-all ${tossWinner==='us' ? 'bg-[#ff5500] text-black shadow-[0_0_15px_#ff5500]' : 'border-2 border-[#444] text-[#444]'}`}>WE WON TOSS</button>
                <button onClick={() => setFirstLead(firstLead === "us" ? "them" : "us")} className={`px-4 py-1 font-black transition-all ${firstLead === 'us' ? 'bg-[#ff5500] text-black shadow-[0_0_15px_#ff5500]' : 'bg-[#3399ff] text-black shadow-[0_0_15px_#3399ff]'}`}>
                   {firstLead === 'us' ? 'WE LEAD' : 'THEY LEAD'}
                </button>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className={`px-4 py-1 border-2 flex flex-col items-center justify-center transition-colors ${totalOppSL > 23 ? 'bg-[#ff0000] border-white animate-pulse shadow-[0_0_20px_#ff0000]' : 'bg-[#111] border-[#3399ff]'}`}>
               <span className="text-[10px] text-[#3399ff] mb-1 tracking-widest">THEM SL</span>
               <span className="text-3xl font-black text-white leading-none">{totalOppSL}<span className="text-sm text-[#888]">/23</span></span>
            </div>
            <div className={`px-4 py-1 border-2 flex flex-col items-center justify-center transition-colors ${totalSL > 23 ? 'bg-[#ff0000] border-white animate-pulse shadow-[0_0_20px_#ff0000]' : 'bg-[#111] border-[#ff5500]'}`}>
               <span className="text-[10px] text-[#ff5500] mb-1 tracking-widest">US SL</span>
               <span className="text-3xl font-black text-white leading-none">{totalSL}<span className="text-sm text-[#888]">/23</span></span>
            </div>
          </div>

        </div>
      </header>

      {recommendation && (
        <div className="mb-4 bg-[#ff5500] text-black p-5 font-black text-2xl uppercase flex justify-between border-4 border-white shadow-[0_0_30px_#ff5500] animate-pulse">
          <span>COACH: PLAY {recommendation.our} vs {recommendation.opp}</span>
          <span className="bg-black text-[#ff5500] px-4">{recommendation.edge > 0 ? '+' : ''}{recommendation.edge.toFixed(1)} NET PTS</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 mb-4">
        <RosterTable title="Screw it" sub="HOME" players={opponents} usage={oppUsage} isOurTeam={false} attendance={attendance} toggleAttendance={toggleAttendance} />
        <div className="xl:col-span-2 space-y-4">
          {matches.map((m, i) => {
            const our = teamRoster.find(r => r.name === m.ourP);
            const opp = opponents.find(o => o.name === m.oppP);
            const ourReq = our ? SL_POINTS_REQ[our.sl as keyof typeof SL_POINTS_REQ] : 0;
            const oppReq = opp ? SL_POINTS_REQ[opp.sl as keyof typeof SL_POINTS_REQ] : 0;
            const score = calculateLiveScore(m.ourPts, ourReq, our?.sl || 0, m.oppPts, oppReq, opp?.sl || 0);
            const usWin = m.ourPts >= ourReq && ourReq > 0;
            const themWin = m.oppPts >= oppReq && oppReq > 0;

            return (
              <div key={i} className={`flex flex-col bg-[#0a0a0a] border-2 p-4 relative overflow-hidden transition-colors ${usWin ? 'border-[#ff5500]' : themWin ? 'border-[#3399ff]' : 'border-[#333]'}`}>
                <div className="flex justify-between items-center mb-6">
                  <div className="text-center flex-1">
                    <div className="text-[10px] text-white font-black uppercase mb-1 font-black">THEM SCORE</div>
                    <div className={`text-3xl font-black ${themWin ? 'text-[#3399ff]' : 'text-white'}`}>{score.them}</div>
                    {themWin && <div className="text-[10px] text-[#3399ff] font-black animate-pulse uppercase font-black">Match Winner</div>}
                  </div>
                  <div className="text-white font-black text-xl italic opacity-20 px-8 font-black uppercase tracking-widest">Match {i+1}</div>
                  <div className="text-center flex-1">
                    <div className="text-[10px] text-white font-black uppercase mb-1 font-black">US SCORE</div>
                    <div className={`text-3xl font-black ${usWin ? 'text-[#ff5500]' : 'text-white'}`}>{score.us}</div>
                    {usWin && <div className="text-[10px] text-[#ff5500] font-black animate-pulse uppercase font-black">Match Winner</div>}
                  </div>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <div className="flex-1 flex flex-col gap-3">
                    <select className="bg-black text-white font-black text-[11px] p-2 border border-[#444]" value={m.oppP} onChange={e => { const n = [...matches]; n[i].oppP = e.target.value; setMatches(n); }}>
                      <option value="">-- OPPONENT --</option>
                      {opponents.filter(p => ((oppUsage[p.name] || 0) < 2 && attendance[p.name] !== false) || m.oppP === p.name).map(p => <option key={p.id} value={p.name}>{p.name} (SL{p.sl})</option>)}
                    </select>
                    
                    <div className="flex items-center gap-1">
                        <span className="text-[10px] text-[#3399ff] font-black uppercase mr-2">Balls:</span>
                        <button onClick={() => { 
                            const n = [...matches]; n[i].oppPts = Math.max(0, m.oppPts - 1); setMatches(n); 
                        }} className="bg-[#222] text-[#3399ff] w-10 h-12 flex items-center justify-center font-black text-3xl border border-[#3399ff] active:bg-[#3399ff] active:text-black transition-all active:scale-95">-</button>
                        <div className="bg-black text-[#3399ff] border-y-2 border-[#3399ff] h-12 w-14 flex items-center justify-center text-3xl font-black">{m.oppPts}</div>
                        <button onClick={() => { 
                            const ceiling = oppReq > 0 ? oppReq : 99;
                            const n = [...matches]; n[i].oppPts = Math.min(ceiling, m.oppPts + 1); setMatches(n); 
                        }} className="bg-[#222] text-[#3399ff] w-10 h-12 flex items-center justify-center font-black text-3xl border border-[#3399ff] active:bg-[#3399ff] active:text-black transition-all active:scale-95">+</button>
                        <span className="text-white text-lg font-black italic ml-2">/ {oppReq}</span>
                    </div>

                  </div>
                  <div className="flex-1 flex flex-col gap-3 items-end">
                    <select className="bg-black text-white font-black text-[11px] p-2 border border-[#444] w-full" value={m.ourP} onChange={e => { const n = [...matches]; n[i].ourP = e.target.value; setMatches(n); }}>
                      <option value="">-- RECKLESS --</option>
                      {teamRoster.filter(p => ((ourUsage[p.name] || 0) < 2 && attendance[p.name] !== false) || m.ourP === p.name).map(p => <option key={p.id} value={p.name}>{p.name} (SL{p.sl})</option>)}
                    </select>

                    <div className="flex items-center gap-1">
                        <span className="text-white text-lg font-black italic mr-2">{ourReq} \</span>
                        <button onClick={() => { 
                            const n = [...matches]; n[i].ourPts = Math.max(0, m.ourPts - 1); setMatches(n); 
                        }} className="bg-[#222] text-[#ff5500] w-10 h-12 flex items-center justify-center font-black text-3xl border border-[#ff5500] active:bg-[#ff5500] active:text-black transition-all active:scale-95">-</button>
                        <div className="bg-black text-[#ff5500] border-y-2 border-[#ff5500] h-12 w-14 flex items-center justify-center text-3xl font-black">{m.ourPts}</div>
                        <button onClick={() => { 
                            const ceiling = ourReq > 0 ? ourReq : 99;
                            const n = [...matches]; n[i].ourPts = Math.min(ceiling, m.ourPts + 1); setMatches(n); 
                        }} className="bg-[#222] text-[#ff5500] w-10 h-12 flex items-center justify-center font-black text-3xl border border-[#ff5500] active:bg-[#ff5500] active:text-black transition-all active:scale-95">+</button>
                        <span className="text-[10px] text-[#ff5500] font-black uppercase ml-2">:Balls</span>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
          <div className="bg-[#111] p-6 border-4 border-[#ff5500] flex justify-between items-center shadow-2xl">
             <div className="flex flex-col">
                <span className="text-[12px] text-white font-black uppercase tracking-widest font-black">Team Total</span>
                <span className="text-[#3399ff] text-5xl font-black italic">THEM: {teamScores.them}</span>
             </div>
             <div className="text-right flex flex-col">
                <span className="text-[12px] text-white font-black uppercase tracking-widest text-right font-black">Team Total</span>
                <span className="text-[#ff5500] text-5xl font-black italic">US: {teamScores.us}</span>
             </div>
          </div>
          <button onClick={() => confirm("Reset?") && (setMatches(Array(5).fill(null).map(() => ({ ourP: "", oppP: "", ourPts: 0, oppPts: 0 }))), setStartTime(null), setFirstLead("us"), setTossWinner(""))} className="w-full bg-[#cc0000] text-white font-black py-4 uppercase text-sm border-2 border-white font-black hover:bg-red-800 transition-colors">Reset All Matches</button>
        </div>
        <RosterTable title="Reckless Racks" sub="AWAY" players={teamRoster} usage={ourUsage} isOurTeam={true} attendance={attendance} toggleAttendance={toggleAttendance} />
      </div>

      <div className="bg-black p-8 border-t-8 border-[#ff5500]">
        <h3 className="text-white font-black text-3xl uppercase mb-10 underline italic text-center tracking-tighter font-black">Season-Optimized Strategy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
           <div className={`p-8 border-l-8 ${firstLead === 'us' ? 'border-[#ff5500] bg-[#1a0a00]' : 'border-white bg-[#000]'}`}>
              <div className="text-white text-sm font-black mb-8 uppercase italic underline decoration-[#ff5500] decoration-4 font-black">Lead Priority</div>
              <div className="space-y-8">
                 {simulations.map((p, i) => (
                   <div key={i} className="flex justify-between items-center border-b border-[#333] pb-6">
                     <div>
                       <div className="text-[14px] font-black uppercase text-[#aaa] tracking-widest font-black">{i === 0 ? "URGENT LEAD" : `NEXT MATCH`}</div>
                       <div className={`font-black uppercase text-4xl tracking-tighter ${p.isUrgent ? 'text-[#ff0000]' : 'text-white'}`}>{p.name}</div>
                       {p.isUrgent && <div className="text-[12px] text-[#ff0000] font-black animate-pulse mt-1 uppercase font-black">Season Lock: Must Play</div>}
                     </div>
                     <div className={`font-black italic text-6xl ${p.isUrgent ? 'text-[#ff0000]' : 'text-[#ff5500]'}`}>SL{p.sl}</div>
                   </div>
                 ))}
              </div>
           </div>
           <div className={`p-8 border-l-8 ${firstLead === 'them' ? 'border-[#3399ff] bg-[#000a1a]' : 'border-white bg-[#000]'}`}>
              <div className="text-white text-sm font-black mb-8 uppercase italic underline decoration-[#3399ff] decoration-4 font-black">Counter Priority</div>
              <div className="space-y-8">
                 {simulations.map((m, i) => (
                   <div key={i} className="flex justify-between items-center border-b border-[#333] pb-6">
                     <div>
                       <div className="text-[14px] font-black uppercase text-[#aaa] tracking-widest text-white font-black">Strategic Matchup</div>
                       <div className="font-black uppercase text-4xl tracking-tighter text-white">{m.name} <span className="text-white text-xl uppercase font-black">vs</span> {m.vs}</div>
                     </div>
                     <div className={`font-black italic text-lg uppercase ${m.edge > 0 ? 'text-[#00ff00]' : 'text-[#ff0000]'}`}>
                        {m.edge > 0 ? `+${m.edge.toFixed(1)}` : `${m.edge.toFixed(1)}`} NET PTS
                     </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </main>
  );
}
