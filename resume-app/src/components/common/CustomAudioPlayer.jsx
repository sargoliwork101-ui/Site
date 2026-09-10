/**
 * ============================================================================
 * MODERN CUSTOM AUDIO & PODCAST PLAYER COMPONENT
 * ============================================================================
 * 
 * Features:
 * 1. Play / Pause with smooth HTML5 Audio API controls
 * 2. Scrubbable Timeline Progress Bar & Time Tracker (MM:SS)
 * 3. Playback Rate Multiplier (1.0x, 1.25x, 1.5x, 2.0x)
 * 4. Volume & Mute Controls
 * 5. Animated Sound Waveform Visualizer Bars
 * 6. Full Persian & English Localization with formatNum digits
 * 7. Graceful Error Handling (silently handles offline / missing URLs)
 *
 * @module CustomAudioPlayer
 */

import React, { useState, useRef, useEffect } from 'react';
import { formatNum } from '../../utils/numberHelper';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Headphones,
  Sparkles,
  Radio,
  Gauge
} from 'lucide-react';

export const CustomAudioPlayer = ({
  audioUrl,
  titleFa,
  titleEn,
  durationStr,
  isFa = true,
  primaryColor = '#00ffcc',
  variant = 'standard', // 'standard' | 'compact' | 'hero'
  subtitleFa = 'نسخه صوتی مقاله / پادکست مهندسی',
  subtitleEn = 'Audio Podcast & Narration'
}) => {
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // If no audioUrl provided or invalid, return null for graceful degradation
  if (!audioUrl || typeof audioUrl !== 'string' || audioUrl.trim() === '' || audioUrl === '#') {
    return null;
  }

  // Format seconds to mm:ss
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return formatNum(formatted, isFa);
  };

  // Toggle Play / Pause
  const togglePlay = (e) => {
    e?.stopPropagation();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setHasError(false);
        })
        .catch((err) => {
          console.warn('Audio playback error:', err);
          setHasError(true);
          setIsPlaying(false);
        });
    }
  };

  // Time update listener
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Metadata loaded listener
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoaded(true);
      setHasError(false);
    }
  };

  // Handle Seek / Scrub
  const handleProgressClick = (e) => {
    e?.stopPropagation();
    if (!progressBarRef.current || !audioRef.current || !duration) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const isRtl = document.documentElement.dir === 'rtl';
    const clickPos = isRtl ? (rect.right - e.clientX) : (e.clientX - rect.left);
    const newProgress = Math.max(0, Math.min(1, clickPos / rect.width));
    const newTime = newProgress * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Toggle Mute
  const toggleMute = (e) => {
    e?.stopPropagation();
    if (!audioRef.current) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioRef.current.muted = nextMute;
  };

  // Change Volume
  const handleVolumeChange = (e) => {
    e?.stopPropagation();
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  // Cycle Playback Speed
  const cyclePlaybackRate = (e) => {
    e?.stopPropagation();
    const rates = [1, 1.25, 1.5, 2];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  // Reset Audio
  const handleReset = (e) => {
    e?.stopPropagation();
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const displayTitle = isFa ? (titleFa || 'فایل صوتی اختصاصی') : (titleEn || titleFa || 'Audio Track');
  const displaySubtitle = isFa ? subtitleFa : subtitleEn;

  if (hasError) {
    return null; // Graceful degradation if audio fails to load
  }

  // HERO VARIANT (Streamlined voice intro pill)
  if (variant === 'hero') {
    return (
      <div
        className="inline-flex items-center gap-3 p-2 pr-3.5 pl-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-xl transition-all hover:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          onError={() => setHasError(true)}
          preload="metadata"
        />

        <button
          type="button"
          onClick={togglePlay}
          className="w-9 h-9 rounded-xl flex items-center justify-center font-bold transition-all shadow-md shrink-0 text-slate-950 hover:scale-105 active:scale-95"
          style={{ backgroundColor: primaryColor }}
          title={isPlaying ? (isFa ? 'توقف پخش پیام صوتی' : 'Pause Voice Intro') : (isFa ? 'پخش پیام صوتی معرفی' : 'Play Voice Intro')}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950 translate-x-0.5 rtl:-translate-x-0.5" />}
        </button>

        <div className="flex flex-col min-w-0 pr-1 rtl:pr-1 ltr:pl-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white truncate">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
            <span className="truncate">{displayTitle}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
            <span>{isPlaying ? formatTime(currentTime) : (durationStr || formatTime(duration))}</span>
            <span>•</span>
            <span className="text-cyan-400">{isFa ? 'معرفی صوتی' : 'Voice Intro'}</span>
          </div>
        </div>

        {/* Animated Sound Waves when playing */}
        {isPlaying && (
          <div className="flex items-end gap-0.5 h-4 px-1.5 shrink-0">
            {[0.4, 0.9, 0.6, 1.0, 0.5, 0.8].map((h, i) => (
              <div
                key={i}
                className="w-1 bg-cyan-400 rounded-full animate-bounce"
                style={{
                  height: `${h * 100}%`,
                  animationDelay: `${i * 120}ms`,
                  animationDuration: '600ms',
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // STANDARD FULL AUDIO / PODCAST PLAYER (For Blog Posts & Dedicated Modals)
  return (
    <div
      className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-xl space-y-3.5 select-none"
      onClick={(e) => e.stopPropagation()}
    >
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onError={() => setHasError(true)}
        preload="metadata"
      />

      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md border border-cyan-500/30"
            style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
          >
            <Headphones className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-white truncate">
              {displayTitle}
            </h4>
            <p className="text-[11px] text-cyan-400/80 font-mono flex items-center gap-1 mt-0.5">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>{displaySubtitle}</span>
            </p>
          </div>
        </div>

        {/* Speed Multiplier Pill */}
        <button
          type="button"
          onClick={cyclePlaybackRate}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-[11px] font-mono font-bold transition-all shrink-0"
          title={isFa ? 'تغییر سرعت پخش فایل صوتی (۱x، ۱.۲۵x، ۱.۵x، ۲x)' : 'Cycle Playback Speed (1x, 1.25x, 1.5x, 2x)'}
        >
          {formatNum(playbackRate, isFa)}x
        </button>
      </div>

      {/* Scrubbable Progress Timeline Bar */}
      <div className="space-y-1">
        <div
          ref={progressBarRef}
          onClick={handleProgressClick}
          className="h-2 w-full bg-slate-800 rounded-full overflow-hidden cursor-pointer relative group p-0.5"
          title={isFa ? 'کلیک کنید تا به این نقطه از صوت بپرید' : 'Click to seek in audio'}
        >
          <div
            className="h-full rounded-full transition-all duration-150 relative shadow-sm"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: primaryColor,
              boxShadow: `0 0 10px ${primaryColor}80`
            }}
          />
        </div>

        {/* Time Trackers */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-0.5">
          <span>{formatTime(currentTime)}</span>
          <span>{duration > 0 ? formatTime(duration) : (durationStr || '00:00')}</span>
        </div>
      </div>

      {/* Control Buttons Toolbar */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          {/* Play / Pause Main Button */}
          <button
            type="button"
            onClick={togglePlay}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs text-slate-950 transition-all hover:scale-105 active:scale-95 shadow-lg"
            style={{ backgroundColor: primaryColor }}
            title={isPlaying ? (isFa ? 'توقف پخش صوت' : 'Pause Audio') : (isFa ? 'پخش فایل صوتی' : 'Play Audio')}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-slate-950" />
                <span>{isFa ? 'توقف' : 'Pause'}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-950 translate-x-0.5 rtl:-translate-x-0.5" />
                <span>{isFa ? 'پخش صوت' : 'Play Audio'}</span>
              </>
            )}
          </button>

          {/* Reset to Start Button */}
          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title={isFa ? 'بازگشت به ابتدای صوت' : 'Restart from beginning'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Volume Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMute}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
            title={isMuted ? (isFa ? 'فعال کردن صدا' : 'Unmute') : (isFa ? 'بی‌صدا کردن' : 'Mute')}
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 sm:w-20 accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            title={isFa ? 'تنظیم بلندی صدا' : 'Volume Level'}
          />
        </div>
      </div>
    </div>
  );
};
