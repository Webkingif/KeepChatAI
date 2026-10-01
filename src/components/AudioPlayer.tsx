import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Volume2, Mic } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  duration?: number;
  fileName?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, duration, fileName }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Soundwave mock heights for authentic WhatsApp voice note waveform
  const waveformHeights = [
    30, 45, 65, 80, 50, 70, 95, 40, 60, 85, 100, 75, 55, 90, 65, 45, 80, 60, 40, 70, 90, 50, 35, 60,
    75, 45, 30, 55, 85, 65, 40, 25,
  ];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setTotalDuration(Math.round(audio.duration));
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.error('Audio playback error:', e);
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const time = Number(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const cycleSpeed = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const rates = [1, 1.5, 2];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    audio.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  const formatSeconds = (sec: number) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className="w-full max-w-md p-3.5 rounded-2xl bg-[#f0f2f5]/90 dark:bg-[#182229] border border-slate-200/80 dark:border-[#2a3942] shadow-2xs select-none">
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          className="w-11 h-11 rounded-full bg-[#00a884] hover:bg-[#008069] active:scale-95 text-white flex items-center justify-center shrink-0 shadow-md shadow-teal-900/10 transition-all cursor-pointer"
          title={isPlaying ? 'Pause' : 'Play voice note'}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-white stroke-none" />
          ) : (
            <Play className="w-5 h-5 fill-white stroke-none translate-x-0.5" />
          )}
        </button>

        {/* Middle Voice Waveform & Scrubber */}
        <div className="flex-1 min-w-0">
          {/* Waveform Visualization */}
          <div className="relative h-6 flex items-center gap-0.5 md:gap-1 px-1 overflow-hidden">
            {waveformHeights.map((h, i) => {
              const barPercent = (i / waveformHeights.length) * 100;
              const isPlayed = barPercent <= progressPercent;
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-colors duration-100 ${
                    isPlayed
                      ? 'bg-[#00a884] dark:bg-teal-400'
                      : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                  style={{ height: `${h}%` }}
                />
              );
            })}

            {/* Transparent range slider for scrubbing */}
            <input
              type="range"
              min={0}
              max={totalDuration || 1}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title="Seek audio"
            />
          </div>

          {/* Time & Duration Info */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium tabular-nums mt-1 px-1">
            <span>{formatSeconds(currentTime)}</span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[10px] text-teal-600 dark:text-teal-400">
                <Mic className="w-3 h-3" />
                Voice Note
              </span>
              <span>{formatSeconds(totalDuration)}</span>
            </div>
          </div>
        </div>

        {/* Speed button & Download button */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={cycleSpeed}
            className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200/80 dark:bg-[#202c33] text-slate-700 dark:text-slate-300 hover:bg-[#00a884] hover:text-white transition-colors cursor-pointer"
            title="Playback speed"
          >
            {playbackRate}x
          </button>
          <a
            href={src}
            download={fileName || 'voice-note.webm'}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            title="Download audio"
          >
            <Download className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
