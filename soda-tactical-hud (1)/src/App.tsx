import React, { useState, useEffect, useRef } from 'react';
import HolographicOrb from './components/HolographicOrb';
import { Mic, MicOff, Languages, Play, Square, Sparkles } from 'lucide-react';

export default function App() {
  const [micLevel, setMicLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lang, setLang] = useState<'en' | 'bn'>('en');

  // Real-world Microphone feed
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Audio Context and Stream References
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  // Toggle active live microphone capturing
  const toggleMicrophone = async () => {
    if (isMicEnabled) {
      stopMicrophone();
      return;
    }

    try {
      setPermissionError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioCtx();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsMicEnabled(true);
      setIsListening(true);
      setIsSpeaking(false);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Volume evaluation loop driving the absolute bounce velocity
      const analyze = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        // Map the volume average into a highly representative, gentle, and normalized amplitude float [0.0 - 1.0]
        let level = (average / 150) * 0.8;
        if (level > 1.0) level = 1.0;
        if (level < 0.005) level = 0.0;

        setMicLevel(level);
        animationRef.current = requestAnimationFrame(analyze);
      };

      animationRef.current = requestAnimationFrame(analyze);

    } catch (err: any) {
      console.error(err);
      setPermissionError(err.message || 'Microphone capture blocked or not found.');
    }
  };

  const stopMicrophone = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    setIsMicEnabled(false);
    setIsListening(false);
    setMicLevel(0);
  };

  // Simulated AI Talkback routine
  // Triggered when user wants to see the gorgeous cyan -> purple color shifting state
  const simulateAITalkback = () => {
    stopMicrophone();
    setIsSpeaking(true);
    setIsListening(false);

    let start = Date.now();
    const duration = 6000; // 6 seconds

    const runSimulation = () => {
      const elapsed = Date.now() - start;
      if (elapsed >= duration) {
        setIsSpeaking(false);
        setMicLevel(0);
        return;
      }

      // Generate conversational wave pulses driving mic level
      const pulseWave = 0.35 + 0.35 * Math.sin(elapsed * 0.015) * Math.sin(elapsed * 0.004) + (Math.random() * 0.12);
      setMicLevel(Math.max(0.01, Math.min(1.0, pulseWave)));

      animationRef.current = requestAnimationFrame(runSimulation);
    };

    animationRef.current = requestAnimationFrame(runSimulation);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const isBn = lang === 'bn';

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col justify-between select-none font-mono relative overflow-hidden">
      
      {/* HUD Diagonal Cyber Scars / Details */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t border-l border-slate-900 pointer-events-none" />
      <div className="absolute top-0 right-0 w-32 h-32 border-t border-r border-slate-900 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b border-l border-slate-900 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b border-r border-slate-900 pointer-events-none" />

      {/* Tiny subtle aesthetic grid dots background */}
      <div className="absolute inset-0 bg-[radial-gradient(#111827_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

      {/* 1. TOP MINIMALIST DECK */}
      <header className="px-8 py-5 flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#00FBFB] animate-pulse" />
          <span className="font-semibold text-xs tracking-widest text-[#00FBFB] uppercase">SODA TACTICAL GATEWAY</span>
        </div>

        {/* Translation pills */}
        <div className="flex bg-slate-950/80 border border-slate-800/80 rounded-full p-1">
          <button
            onClick={() => setLang('en')}
            className={`px-3 py-1 text-[10px] font-semibold tracking-widest rounded-full transition-all cursor-pointer ${
              lang === 'en' 
                ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-bold' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang('bn')}
            className={`px-3 py-1 text-[10px] font-semibold tracking-widest rounded-full transition-all cursor-pointer ${
              lang === 'bn' 
                ? 'bg-purple-500/15 border border-purple-500/30 text-purple-400 font-bold' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            বাংলা
          </button>
        </div>
      </header>

      {/* 2. THE VISUAL CORE CENTRIC DECK */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 z-10 relative">
        <div id="central-column" className="flex flex-col items-center max-w-xl w-full text-center">
          
          {/* Holographic Orb sitting prominently in the center */}
          <div className="my-2 cursor-pointer transition-transform duration-300 hover:scale-[1.02]" onClick={toggleMicrophone}>
            <HolographicOrb 
              size={420}
              micLevel={micLevel}
              isSpeaking={isSpeaking}
              isListening={isListening}
              lang={lang}
            />
          </div>

          {/* Simple subtitle indicating status action */}
          <p className="text-slate-500 text-xs tracking-wider max-w-xs leading-relaxed mt-4">
            {isListening 
              ? (isBn ? 'ওরবটি চারপাশের আওয়াজে প্রতিক্রিয়া জানাচ্ছে।' : 'Orb is actively tracking ambient sounds around you.')
              : isSpeaking 
                ? (isBn ? 'কৃত্রিম বুদ্ধিমত্তা ভয়েস রিপ্লাই সিমুলেট করছে...' : 'Simulating dynamic Gemini speech response waveform...')
                : (isBn ? 'ওরবটি সক্রিয় করতে নিচে ক্লিক করুন।' : 'Engage your microphone below to activate the tactical core.')}
          </p>

          {/* Clean tactical buttons dock */}
          <div className="flex flex-wrap justify-center gap-3.5 mt-8 max-w-sm w-full">
            {!isMicEnabled ? (
              <button
                onClick={toggleMicrophone}
                className="flex-1 flex items-center justify-center gap-2 border border-cyan-500/40 hover:border-cyan-400 bg-cyan-950/15 text-cyan-400 font-mono font-semibold text-xs tracking-widest py-3 px-5 rounded-full transition-all cursor-pointer shadow-[0_0_20px_rgba(0,251,251,0.06)] active:scale-95"
              >
                <Mic className="w-4 h-4 animate-pulse" />
                <span>{isBn ? 'মাইক্রোফোন চালু' : 'ENGAGE AUDIO'}</span>
              </button>
            ) : (
              <button
                onClick={toggleMicrophone}
                className="flex-1 flex items-center justify-center gap-2 border border-red-500/40 hover:border-red-400 bg-red-950/15 text-red-400 font-mono font-semibold text-xs tracking-widest py-3 px-5 rounded-full transition-all cursor-pointer active:scale-95"
              >
                <MicOff className="w-4 h-4" />
                <span>{isBn ? 'মাইক্রোফোন বন্ধ' : 'DISENGAGE AUDIO'}</span>
              </button>
            )}

            {/* Simulated responding toggle */}
            <button
              onClick={simulateAITalkback}
              disabled={isSpeaking}
              className={`flex items-center justify-center gap-2 border font-mono font-semibold text-xs tracking-widest py-3 px-5 rounded-full transition-all active:scale-95 cursor-pointer ${
                isSpeaking 
                  ? 'border-purple-500/20 text-purple-500/50 bg-transparent cursor-not-allowed'
                  : 'border-purple-500/40 hover:border-purple-400 text-purple-400 bg-purple-950/10 shadow-[0_0_15px_rgba(168,85,247,0.06)]'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isBn ? 'এআই সিমুলেশন' : 'SIMULATE GEMINI'}</span>
            </button>
          </div>

          {permissionError && (
            <div className="mt-4 text-[10px] text-red-400 border border-red-950/50 bg-red-950/10 px-3 py-1.5 rounded text-center max-w-xs">
              ⚠️ {permissionError}
            </div>
          )}

        </div>
      </main>

      {/* 3. FOOTER */}
      <footer className="px-8 py-4 bg-transparent border-t border-slate-950 text-[10px] text-slate-600 flex justify-between shrink-0 font-mono tracking-widest">
        <span>SODA TACTICAL HUD SYSTEM</span>
        <span>UTC 2026-06-04</span>
      </footer>
    </div>
  );
}
