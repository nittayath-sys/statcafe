/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { 
  Coffee, 
  TrendingUp, 
  Sparkles, 
  Zap, 
  Clock, 
  RefreshCcw,
  BarChart3,
  Activity,
  DollarSign,
  Calendar,
  Package,
  Play,
  History,
  Coins,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { calculateMean, calculateSD, randomNormal } from '@/src/lib/stats';
import { useGameStore } from '@/src/store/gameStore';
import StatChart from '@/src/components/StatChart';
import BaristaFeedback from '@/src/components/BaristaFeedback';
import VibeAnalytics from '@/src/components/VibeAnalytics';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const { day, money, history, nextDay, resetGame, highScore } = useGameStore();
  
  // UI State
  const [view, setView] = useState<'home' | 'vibe'>('home');
  const [brewTip, setBrewTip] = useState<string>('Brewing a fresh tip for you...');
  const [isLoadingTip, setIsLoadingTip] = useState(false);
  const [currentVibe, setCurrentVibe] = useState(88);
  
  // Control Panel State
  const [orderBeans, setOrderBeans] = useState(50);
  const [price, setPrice] = useState(60);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    fetchBrewTip();
  }, []);

  // Web Audio API Sound System
  const playSound = (type: "start" | "gameover" | "win") => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const audioCtx = new AudioContext();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    if (type === "start") {
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } else if (type === "gameover") {
      oscillator.type = "sawtooth";
      oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.5);
      gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } else {
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.3);
    }
  };

  const fetchBrewTip = async () => {
    setIsLoadingTip(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Give me a short, punchy, and creative barista tip or a fun coffee fact in a Pop-Art style. Max 20 words.",
      });
      setBrewTip(response.text || "Coffee is the fuel for creativity!");
    } catch (error) {
      setBrewTip("Stay caffeinated, stay bold!");
    } finally {
      setIsLoadingTip(false);
    }
  };

  const handleStartDay = () => {
    playSound("start");
    nextDay(orderBeans, price);
    
    // Play special sound for outliers if they just happened
    const lastDay = history[history.length - 1];
    if (lastDay?.event) {
      if (lastDay.event.includes("✨")) playSound("win");
      if (lastDay.event.includes("🌧️")) playSound("gameover");
    }

    if (day % 3 === 0) fetchBrewTip();
  };

  if (!isClient) return null;

  // ดึงเหตุการณ์ล่าสุดมาแสดง (ถ้ามี)
  const lastEvent = history.length > 0 ? history[history.length - 1].event : null;

  // Win/Loss Conditions
  const isGameOver = money <= 0;
  const isWin = day > 30 && money > 0;

  if (isGameOver || isWin) {
    const isNewRecord = isWin && money >= highScore;

    return (
      <div className="antialiased bg-pop-yellow/10 min-h-screen flex items-center justify-center p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`pop-card max-w-sm w-full text-center space-y-6 ${isWin ? 'bg-pop-blue' : 'bg-pop-pink text-white'}`}
        >
          {isNewRecord && (
            <motion.div 
              animate={{ rotate: [-3, 3, -3] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="bg-pop-yellow text-black font-black py-2 px-4 rounded-full mb-4 inline-block border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              🏆 สถิติใหม่ระดับโลก!
            </motion.div>
          )}
          <h1 className="text-4xl font-black uppercase leading-none">
            {isWin ? "🎉 ยินดีด้วยบอส!" : "💀 ล้มละลาย!"}
          </h1>
          <p className="text-lg font-bold">
            {isWin 
              ? `บริหารครบ 30 วัน กำไรสุทธิ ${money.toLocaleString()} บาท!` 
              : "เงินทุนหมดแล้ว! ลองดูกราฟและจัดการ SD ใหม่ในรอบหน้านะ"}
          </p>
          <div className="bg-white/20 p-3 rounded-xl border-2 border-black/20">
            <p className="text-[10px] font-black uppercase opacity-60">คะแนนสูงสุด</p>
            <p className="text-2xl font-black">฿{highScore.toLocaleString()}</p>
          </div>
          <button 
            onClick={() => {
              playSound("start");
              resetGame();
            }}
            className="pop-button bg-pop-yellow text-black w-full flex items-center justify-center gap-2"
          >
            <RefreshCcw /> เปิดร้านใหม่
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="antialiased bg-pop-yellow/10 min-h-screen">
      <main className="min-h-screen max-w-md mx-auto bg-white border-x-4 border-black shadow-2xl relative overflow-hidden flex flex-col selection:bg-pop-pink selection:text-white">
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-48">
          {/* Header */}
          <header className="flex flex-col gap-3 mb-6">
            <div className="flex justify-between items-center pop-card bg-pop-dark text-white p-4">
              <div className="flex items-center gap-2">
                <Calendar className="text-pop-blue w-5 h-5" />
                <span className="font-black text-lg">วันที่ {day}/30</span>
              </div>
              <div className="flex items-center gap-2">
                <Coins className="text-pop-yellow w-5 h-5" />
                <span className="font-black text-lg">฿{money.toLocaleString()}</span>
              </div>
            </div>
            {highScore > 0 && (
              <div className="flex items-center justify-center gap-2 px-4 py-1 bg-pop-yellow border-2 border-black rounded-full self-center -mt-5 z-10 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <TrendingUp className="w-3 h-3 text-pop-pink" />
                <span className="text-[10px] font-black uppercase">คะแนนสูงสุด: ฿{highScore.toLocaleString()}</span>
              </div>
            )}
          </header>

          {/* ป้ายประกาศ Outlier Event! */}
          {lastEvent && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-pop-dark text-pop-yellow pop-card animate-vibe flex items-center gap-3 py-3 border-pop-yellow mb-6"
            >
              <Zap className="w-8 h-8 shrink-0" fill="currentColor" />
              <p className="font-bold">{lastEvent}</p>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {view === 'home' ? (
              <motion.div 
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <BaristaFeedback history={history} />

                <StatChart history={history} />

                <div className="pop-card bg-white flex flex-col gap-6">
                  <h2 className="font-black text-xl uppercase border-b-4 border-black pb-2 flex items-center gap-2">
                    <Zap className="text-pop-blue" /> Control Panel
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between font-black text-xs uppercase">
                        <label>สั่งเมล็ดกาแฟ (฿10/แก้ว)</label>
                        <span className="text-pop-pink">{orderBeans} แก้ว</span>
                      </div>
                      <input 
                        type="range" 
                        min="10" 
                        max="150" 
                        step="10"
                        value={orderBeans} 
                        onChange={(e) => setOrderBeans(Number(e.target.value))}
                        className="w-full accent-pop-pink h-3 rounded-lg appearance-none bg-gray-200 border-2 border-black"
                      />
                      <p className="text-[10px] text-gray-500 font-bold uppercase">ต้นทุนวันนี้: ฿{orderBeans * 10}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between font-black text-xs uppercase">
                        <label>ตั้งราคาขายต่อแก้ว</label>
                        <span className="text-pop-blue">฿{price}</span>
                      </div>
                      <input 
                        type="range" 
                        min="20" 
                        max="120" 
                        step="5"
                        value={price} 
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="w-full accent-pop-blue h-3 rounded-lg appearance-none bg-gray-200 border-2 border-black"
                      />
                      <p className="text-[10px] text-gray-500 font-bold uppercase">ระวัง! ราคาแกว่งทำให้ค่า SD พุ่งนะ</p>
                    </div>
                  </div>
                </div>

                {/* AI Tip Integrated */}
                <div className="pop-card bg-pop-pink/10 border-pop-pink/30 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="text-pop-pink w-4 h-4" />
                    <span className="text-[10px] font-black uppercase text-pop-pink">Brew Wisdom</span>
                  </div>
                  <p className="text-sm font-bold italic text-pop-dark">"{brewTip}"</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="vibe"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <VibeAnalytics history={history} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Bar */}
        <nav className="absolute bottom-0 left-0 right-0 bg-white border-t-4 border-black flex justify-around p-2 z-[60]">
          <button 
            onClick={() => setView('home')}
            className={`flex flex-col items-center gap-1 p-2 transition-all ${view === 'home' ? 'text-pop-pink scale-110' : 'text-gray-400'}`}
          >
            <Coffee className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase">หน้าร้าน</span>
          </button>
          <button 
            onClick={() => setView('vibe')}
            className={`flex flex-col items-center gap-1 p-2 transition-all ${view === 'vibe' ? 'text-pop-blue scale-110' : 'text-gray-400'}`}
          >
            <Activity className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase">วิเคราะห์</span>
          </button>
        </nav>

        {/* Action Button */}
        {view === 'home' && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-50">
            <button 
              onClick={handleStartDay}
              className="pop-button bg-pop-yellow text-black text-xl flex items-center justify-center gap-2 w-full py-4"
            >
              <Play fill="currentColor" className="w-6 h-6" /> เปิดร้านเลย!
            </button>
          </div>
        )}

        {/* Footer */}
        <footer className="p-4 text-center border-t-2 border-black bg-white">
          <p className="font-black uppercase text-[10px] opacity-30">© 2026 StatCafe Barista Co.</p>
        </footer>
      </main>
    </div>
  );
}
