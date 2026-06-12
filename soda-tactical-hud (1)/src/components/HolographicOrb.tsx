import React, { useEffect, useRef } from 'react';
import { Volume2, Mic, CheckCircle2 } from 'lucide-react';

export interface HolographicOrbProps {
  size?: number;          // width/height in px
  micLevel?: number;        // 0–1 normalized mic amplitude
  isSpeaking?: boolean;  // Gemini is responding
  isListening?: boolean; // Mic is actively capturing
  lang?: 'en' | 'bn';         // 'en' or 'bn'
}

interface SpiralStream {
  angleOffset: number;
  speed: number;
  color: string;
  width: number;
}

interface InwardFlow {
  radiusScale: number;
  angleOffset: number;
  rotationSpeed: number;
  opacity: number;
}

export default function HolographicOrb({
  size = 400,
  micLevel = 0,
  isSpeaking = false,
  isListening = false,
  lang = 'en',
}: HolographicOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // High-performance state tracking
  const stateRef = useRef({
    // Rotation coefficients
    timer: 0,
    swirlAngle1: 0,
    swirlAngle2: 0,
    pulseFactor: 0,
    inwardFlows: [] as InwardFlow[],
    currentMicLevel: 0,
    lastTime: 0,
  });

  const propsRef = useRef({
    size,
    micLevel,
    isSpeaking,
    isListening,
    lang,
  });

  // Hot sync the props
  useEffect(() => {
    propsRef.current = { size, micLevel, isSpeaking, isListening, lang };
  }, [size, micLevel, isSpeaking, isListening, lang]);

  // One-time load or resize structure init
  useEffect(() => {
    // Generate inward-flowing spiral filaments
    const inwardFlows: InwardFlow[] = [];
    for (let i = 0; i < 8; i++) {
      inwardFlows.push({
        radiusScale: (i / 8) * 0.9 + 0.3, // staggered entry scales
        angleOffset: (i * Math.PI * 2) / 8 + Math.random() * 0.5,
        rotationSpeed: 0.6 + Math.random() * 0.8,
        opacity: 0.15 + Math.random() * 0.45,
      });
    }

    stateRef.current.inwardFlows = inwardFlows;
  }, [size]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const draw = (currentTime: number) => {
      const state = stateRef.current;
      const props = propsRef.current;

      if (state.lastTime === 0) {
        state.lastTime = currentTime;
      }
      const dt = Math.min(currentTime - state.lastTime, 50);
      state.lastTime = currentTime;
      const delta = dt / 1000;

      // Smoothened reactive dampener with strong inertia for super-fluid, organic transition curves
      state.currentMicLevel += (props.micLevel - state.currentMicLevel) * 0.06;

      // Increment rotation speeds gently based on sound levels
      const isSpeakingSpeed = props.isSpeaking ? 0.4 : 1.0;
      const speedMultiplier = isSpeakingSpeed * (1.0 + state.currentMicLevel * 1.5);

      state.timer += delta * (0.8 + state.currentMicLevel * 1.0);
      state.swirlAngle1 += 0.85 * speedMultiplier * delta; 
      state.swirlAngle2 -= 1.65 * speedMultiplier * delta; // Counter rotation corresponding to stylesheet fast reverse

      // Resize and handle retina scales
      const dpr = window.devicePixelRatio || 1;
      const targetSize = props.size;
      if (canvas.width !== targetSize * dpr || canvas.height !== targetSize * dpr) {
        canvas.width = targetSize * dpr;
        canvas.height = targetSize * dpr;
        canvas.style.width = `${targetSize}px`;
        canvas.style.height = `${targetSize}px`;
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, targetSize, targetSize);

      const cx = targetSize / 2;
      const cy = targetSize / 2;
      const baseRadius = targetSize * 0.35;

      // Gentle interactive swell rather than intensive jumping bounce
      const bounceIntensity = 1.0 + state.currentMicLevel * 0.12 + 0.03 * Math.sin(state.timer * 3);
      const activeRadius = baseRadius * bounceIntensity;

      // Colors defined exactly corresponding to the beautiful blue-cyan-purple core palette
      const colorCyan = 'rgba(0, 251, 251, 1)';
      const colorBlue = 'rgba(0, 100, 255, 1)';
      const colorTeal = 'rgba(13, 148, 136, 1)';
      const colorPurple = 'rgba(147, 51, 234, 1)';
      const colorViolet = 'rgba(109, 40, 217, 1)';

      const primaryGlow = props.isSpeaking ? colorPurple : colorCyan;
      const secondaryGlow = props.isSpeaking ? colorViolet : colorBlue;

      // 1. DEEP RADIAL CORONA BACKDROP
      ctx.save();
      const corona = ctx.createRadialGradient(cx, cy, activeRadius * 0.1, cx, cy, activeRadius * 1.7);
      if (props.isSpeaking) {
        corona.addColorStop(0, 'rgba(124, 58, 237, 0.45)');
        corona.addColorStop(0.3, 'rgba(109, 40, 217, 0.2)');
        corona.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        corona.addColorStop(0, 'rgba(0, 251, 251, 0.4)');
        corona.addColorStop(0.3, 'rgba(0, 100, 255, 0.2)');
        corona.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }
      ctx.fillStyle = corona;
      ctx.fillRect(0, 0, targetSize, targetSize);
      ctx.restore();

      // 2. STITCH-STYLE INNER GAS LAYER (High contrast swirling background elements)
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      
      const gasFlares = 8;
      for (let i = 0; i < gasFlares; i++) {
        const angle = state.swirlAngle1 + (i * Math.PI * 2) / gasFlares;
        const outerX = cx + Math.cos(angle) * activeRadius;
        const outerY = cy + Math.sin(angle) * activeRadius;

        const gasGrad = ctx.createRadialGradient(outerX, outerY, 4, outerX, outerY, activeRadius * 0.9);
        if (props.isSpeaking) {
          gasGrad.addColorStop(0, 'rgba(168, 85, 247, 0.25)');
          gasGrad.addColorStop(0.5, 'rgba(109, 40, 217, 0.08)');
          gasGrad.addColorStop(1, 'rgba(0,0,0,0)');
        } else {
          gasGrad.addColorStop(0, 'rgba(0, 251, 251, 0.25)');
          gasGrad.addColorStop(0.5, 'rgba(0, 100, 255, 0.08)');
          gasGrad.addColorStop(1, 'rgba(0,0,0,0)');
        }
        ctx.fillStyle = gasGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, activeRadius * 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 3. INWARD FLOWING STREAM FIBERS (The whirlpool vortex visual of the reference image)
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      
      state.inwardFlows.forEach((flow, i) => {
        // Slow decay towards the white hole centerpiece
        flow.radiusScale -= 0.12 * (1.0 + state.currentMicLevel * 1.5) * delta;
        if (flow.radiusScale <= 0.15) {
          flow.radiusScale = 1.15; // recycle flow
          flow.angleOffset = Math.random() * Math.PI * 2;
        }

        const radiusNow = activeRadius * flow.radiusScale;
        const armAngle = state.swirlAngle2 * 1.2 + flow.angleOffset;

        ctx.beginPath();
        const flowGradient = ctx.createRadialGradient(cx, cy, radiusNow * 0.1, cx, cy, radiusNow);
        
        if (props.isSpeaking) {
          flowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
          flowGradient.addColorStop(0.2, 'rgba(168, 85, 247, 0.8)');
          flowGradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.45)');
          flowGradient.addColorStop(1, 'rgba(0,0,0,0)');
        } else {
          flowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
          flowGradient.addColorStop(0.15, 'rgba(56, 189, 248, 0.9)');
          flowGradient.addColorStop(0.4, 'rgba(0, 100, 255, 0.55)');
          flowGradient.addColorStop(0.85, 'rgba(13, 148, 136, 0.12)');
          flowGradient.addColorStop(1, 'rgba(0,0,0,0)');
        }

        ctx.strokeStyle = flowGradient;
        ctx.lineWidth = (3.5 + state.currentMicLevel * 6.5) * flow.radiusScale;

        // Spiral drawing: r(theta) = k * theta
        const spiralRotations = Math.PI * 1.5;
        let p_initialized = false;

        for (let rad = 0; rad <= spiralRotations; rad += 0.08) {
          // Calculate decaying spiral segment
          const proportion = rad / spiralRotations;
          const currentFilamentRad = radiusNow * Math.pow(1.0 - proportion, 0.85);

          // Fast vortex rotation inside the spiral path
          const theta = armAngle - rad * 1.6;
          const sx = cx + Math.cos(theta) * currentFilamentRad;
          const sy = cy + Math.sin(theta) * currentFilamentRad;

          if (!p_initialized) {
            ctx.moveTo(sx, sy);
            p_initialized = true;
          } else {
            ctx.lineTo(sx, sy);
          }
        }
        ctx.stroke();
      });
      ctx.restore();

      // 4. PLASMATIC FLAME HALO EDGE (Gives the fuzzy hot solar-plasma edge matching the image)
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.beginPath();
      
      const steps = 90;
      for (let i = 0; i <= steps; i++) {
        const phi = (i / steps) * Math.PI * 2;
        // Layered low or modulated frequency waves for a smoother, fluid wavelike swelling instead of sharp spikes
        let rExtra = 0;
        if (props.isSpeaking) {
          // Speak mode uses ultra-fluid, large, sweeping wave motions (broad swellings)
          const wave1 = Math.sin(phi * 4 + state.timer * 3.5) * 11;
          const wave2 = Math.cos(phi * 6 - state.timer * 5.0) * 7;
          const voiceSwell = Math.sin(phi * 2 + state.timer * 7.0) * (state.currentMicLevel * 18);
          rExtra = wave1 + wave2 + voiceSwell;
        } else {
          // Listen/Idle state is kept pleasantly smooth and flowing
          const wave1 = Math.sin(phi * 5 + state.timer * 4.0) * 7;
          const wave2 = Math.cos(phi * 8 - state.timer * 6.0) * 4;
          const soundRippler = Math.sin(phi * 6 + state.timer * 11.0) * (state.currentMicLevel * 11);
          rExtra = wave1 + wave2 + soundRippler;
        }
        
        const dynamicRadius = activeRadius * 1.02 + rExtra;

        const ex = cx + Math.cos(phi) * dynamicRadius;
        const ey = cy + Math.sin(phi) * dynamicRadius;

        if (i === 0) {
          ctx.moveTo(ex, ey);
        } else {
          ctx.lineTo(ex, ey);
        }
      }
      ctx.closePath();
      
      const outerFlareGrad = ctx.createRadialGradient(cx, cy, activeRadius * 0.7, cx, cy, activeRadius * 1.15);
      if (props.isSpeaking) {
        outerFlareGrad.addColorStop(0, 'rgba(168, 85, 247, 0.1)');
        outerFlareGrad.addColorStop(0.85, 'rgba(147, 51, 234, 0.7)');
        outerFlareGrad.addColorStop(1, 'rgba(255, 255, 255, 1.0)');
      } else {
        outerFlareGrad.addColorStop(0, 'rgba(0, 100, 255, 0.05)');
        outerFlareGrad.addColorStop(0.82, 'rgba(34, 211, 238, 0.82)');
        outerFlareGrad.addColorStop(1, 'rgba(255, 255, 255, 1.0)');
      }
      
      ctx.strokeStyle = outerFlareGrad;
      ctx.lineWidth = 3.5 + state.currentMicLevel * 6.0;
      ctx.shadowBlur = 15;
      ctx.shadowColor = primaryGlow;
      ctx.stroke();
      ctx.restore();

      // 5. INTENSE PULSATING CORES (Just like the blinding white centerpiece in the image)
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      
      const corePulse = (props.isSpeaking ? 0.06 : 0.045) * Math.sin(state.timer * 4.5);
      const coreRadius = activeRadius * (0.33 + corePulse + state.currentMicLevel * 0.35);

      const centerCore = ctx.createRadialGradient(cx, cy, coreRadius * 0.05, cx, cy, coreRadius);
      centerCore.addColorStop(0, 'rgba(255,255,255,1.0)');
      centerCore.addColorStop(0.2, 'rgba(255,255,255,0.95)');
      centerCore.addColorStop(0.55, props.isSpeaking ? 'rgba(168,85,247,0.75)' : 'rgba(34,211,238,0.75)');
      centerCore.addColorStop(0.85, props.isSpeaking ? 'rgba(79,70,229,0.3)' : 'rgba(0,100,255,0.3)');
      centerCore.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = centerCore;
      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 6. DETAILED HOLOGRAPHIC OVERLAY LINES (Keeps HUD military precision)
      ctx.save();
      ctx.strokeStyle = props.isSpeaking ? 'rgba(168, 85, 247, 0.28)' : 'rgba(0, 251, 251, 0.25)';
      ctx.lineWidth = 0.85;
      ctx.beginPath();
      ctx.arc(cx, cy, activeRadius * 0.98, 0, Math.PI * 2);
      ctx.stroke();

      // Rotating tick dashes at current visual border
      ctx.beginPath();
      ctx.arc(cx, cy, activeRadius * 1.05 + 6, 0, Math.PI * 2);
      ctx.setLineDash([3, 24]);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = props.isSpeaking ? 'rgba(168, 85, 247, 0.15)' : 'rgba(0, 100, 255, 0.15)';
      ctx.stroke();
      ctx.restore();

      // 8. REFLECTED CRITICAL CURVE HIGH-SHINE (Glossy tactile screen look)
      ctx.save();
      ctx.beginPath();
      const shine = ctx.createLinearGradient(cx * 0.6, cy * 0.5, cx * 1.4, cy * 1.45);
      shine.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
      shine.addColorStop(0.4, 'rgba(255, 255, 255, 0.08)');
      shine.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.arc(cx - 6, cy - 6, activeRadius * 0.93, Math.PI * 1.0, Math.PI * 1.8);
      ctx.lineTo(cx, cy);
      ctx.closePath();
      ctx.fillStyle = shine;
      ctx.fill();
      ctx.restore();

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  const isBn = lang === 'bn';
  const getLabel = () => {
    if (isSpeaking) return isBn ? 'বলছি' : 'Speaking';
    if (isListening) return isBn ? 'শুনছি' : 'Listening';
    return isBn ? 'অপেক্ষা' : 'Idle';
  };

  return (
    <div id="orb-frame" className="flex flex-col items-center justify-center select-none">
      {/* Container wrapper carrying requested CSS shadow parameters */}
      <div 
        id="orb-wrapper"
        className="relative flex items-center justify-center transition-all duration-300"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          filter: isSpeaking 
            ? 'drop-shadow(0 0 40px rgba(168,85,247,0.3))'
            : 'drop-shadow(0 0 40px rgba(0,251,251,0.3))'
        }}
      >
        <canvas 
          ref={canvasRef} 
          id="canvas-core"
          className="block z-10"
        />
        
        {/* Futuristic calibration rings overlay */}
        <div className="absolute inset-0 border border-slate-900/40 rounded-full scale-[1.06] pointer-events-none" />
      </div>

      {/* SODA HUD label plate */}
      <div 
        id="status-plate" 
        className={`mt-6 px-4 py-1.5 border rounded-full backdrop-blur-md transition-all duration-300 flex items-center gap-2.5 font-mono text-xs ${
          isSpeaking 
            ? 'text-purple-400 border-purple-500/25 bg-purple-500/5' 
            : isListening 
              ? 'text-cyan-400 border-cyan-500/25 bg-cyan-500/5' 
              : 'text-slate-500 border-slate-900/80 bg-slate-950/20'
        }`}
      >
        <span className={`w-2 h-2 rounded-full ${
          isSpeaking ? 'bg-purple-400 animate-pulse' : isListening ? 'bg-cyan-400 animate-ping' : 'bg-slate-700'
        }`} />
        <span className="font-semibold uppercase tracking-widest">{getLabel()}</span>
        
        {/* Dynamic mic amplitude indicator indicator */}
        {(isListening || isSpeaking) && (
          <span className="text-[10px] opacity-65">
            / {(micLevel * 100).toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  );
}
