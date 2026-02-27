import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Expand,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Timer,
} from 'lucide-react';

const STORAGE_KEY = 'fluencyforge-progress-v1';

function App() {
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);

    return {
      currentDay: 1,
      drillsCompletedToday: 0,
      currentStreak: 1,
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const completionPct = useMemo(() => (progress.currentDay / 30) * 100, [progress.currentDay]);

  const markDrillComplete = () => {
    setProgress((prev) => ({
      ...prev,
      drillsCompletedToday: prev.drillsCompletedToday + 1,
    }));
  };

  const completeDay = () => {
    setProgress((prev) => ({
      ...prev,
      currentDay: Math.min(prev.currentDay + 1, 30),
      currentStreak: prev.currentStreak + 1,
      drillsCompletedToday: 0,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100">
      <div className="mx-auto max-w-5xl p-4 sm:p-6">
        <header className="mb-5 rounded-3xl border border-indigo-400/30 bg-gradient-to-r from-indigo-600/30 via-cyan-500/20 to-fuchsia-500/20 p-5 shadow-xl shadow-indigo-900/30 backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">FluencyForge</h1>
              <p className="text-sm text-indigo-100/90">Star-Wars speaking crawl trainer • mobile-friendly practice</p>
            </div>
            <button
              type="button"
              onClick={completeDay}
              className="rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 px-4 py-2 text-sm font-semibold text-slate-950"
            >
              Complete Day
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <MiniStat label="Current Day" value={`${progress.currentDay}/30`} />
            <MiniStat label="Runs Today" value={progress.drillsCompletedToday} />
            <MiniStat label="Current Streak" value={`${progress.currentStreak} days`} />
          </div>

          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-indigo-100/80">
              <span>30-Day Progress</span>
              <span>{Math.round(completionPct)}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/20">
              <div className="h-2 rounded-full bg-gradient-to-r from-cyan-300 to-fuchsia-400" style={{ width: `${completionPct}%` }} />
            </div>
          </div>
        </header>

        <TeleprompterDrill onDrillComplete={markDrillComplete} />
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur">
      <p className="text-xs uppercase tracking-wide text-indigo-100/80">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function TeleprompterDrill({ onDrillComplete }) {
  const [text, setText] = useState(
    `In a galaxy where confident speakers are built, not born...\n\nToday you train your voice, your pace, and your flow.\n\nSpeak clearly. Speak calmly. Speak with power.`,
  );
  const [speed, setSpeed] = useState(28);
  const [textSize, setTextSize] = useState(34);
  const [lineSpacing, setLineSpacing] = useState(1.6);
  const [tilt, setTilt] = useState(24);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFsControls, setShowFsControls] = useState(false);

  const stageRef = useRef(null);
  const viewportRef = useRef(null);
  const contentRef = useRef(null);
  const yRef = useRef(0);

  const applyTransform = () => {
    if (!contentRef.current) return;
    contentRef.current.style.transform = `translate(-50%, ${yRef.current}px) rotateX(${tilt}deg)`;
  };

  useEffect(() => {
    const onFs = () => {
      const active = document.fullscreenElement === stageRef.current;
      setIsFullscreen(active);
      setShowFsControls(false);
    };
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  useEffect(() => {
    if (!running || !viewportRef.current || !contentRef.current) return undefined;

    yRef.current = viewportRef.current.clientHeight + 120;
    applyTransform();

    let raf;
    let prev;

    const tick = (now) => {
      if (prev === undefined) prev = now;
      const dt = (now - prev) / 1000;
      prev = now;

      if (!paused) {
        yRef.current -= speed * dt;
        applyTransform();

        const h = contentRef.current ? contentRef.current.clientHeight : 0;
        if (yRef.current < -h - 100) {
          setRunning(false);
          setPaused(false);
          onDrillComplete();
          return;
        }
      }

      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [running, paused, speed, tilt, onDrillComplete]);

  useEffect(() => {
    applyTransform();
  }, [textSize, lineSpacing, tilt]);

  const toggleFullscreen = async () => {
    if (!stageRef.current) return;
    if (document.fullscreenElement === stageRef.current) {
      await document.exitFullscreen();
    } else {
      await stageRef.current.requestFullscreen();
    }
  };

  const resetRun = () => {
    if (!viewportRef.current) return;
    yRef.current = viewportRef.current.clientHeight + 120;
    applyTransform();
    setPaused(false);
  };

  const formatText = () => {
    const cleaned = text
      .replace(/\r/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .join(' ')
      .replace(/\s{2,}/g, ' ')
      .trim();

    if (!cleaned) return;

    const chunks = cleaned
      .split(/(?<=[.!?])\s+/)
      .reduce((acc, sentence) => {
        if (!sentence) return acc;
        const last = acc[acc.length - 1] || '';
        if (!last || (last + ' ' + sentence).length > 115) acc.push(sentence.trim());
        else acc[acc.length - 1] = `${last} ${sentence}`.trim();
        return acc;
      }, []);

    setText(chunks.join('\n\n'));
  };

  const Controls = ({ floating = false }) => (
    <div
      className={`grid gap-3 rounded-2xl border p-3 sm:grid-cols-2 ${
        floating ? 'border-slate-700 bg-slate-900/95 text-slate-100 backdrop-blur' : 'border-indigo-300/30 bg-white/10 text-indigo-50'
      }`}
    >
      <Slider label={`Speed (${speed}px/s)`} min={12} max={70} value={speed} onChange={(v) => setSpeed(v)} />
      <Slider label={`Font Size (${textSize}px)`} min={16} max={62} value={textSize} onChange={(v) => setTextSize(v)} />
      <Slider label={`Line Spacing (${lineSpacing.toFixed(1)})`} min={1.1} max={2.2} step={0.1} value={lineSpacing} onChange={(v) => setLineSpacing(v)} />
      <Slider label={`Tilt (${tilt}°)`} min={0} max={35} value={tilt} onChange={(v) => setTilt(v)} />

      <div className="sm:col-span-2 flex flex-wrap gap-2">
        <button type="button" onClick={() => setPaused((p) => !p)} className="rounded-lg border border-white/30 px-3 py-2 text-sm">
          {paused ? <Play size={14} className="inline" /> : <Pause size={14} className="inline" />} {paused ? ' Resume' : ' Pause'}
        </button>
        <button type="button" onClick={resetRun} className="rounded-lg border border-white/30 px-3 py-2 text-sm">
          <RotateCcw size={14} className="inline" /> Restart
        </button>
        <button type="button" onClick={toggleFullscreen} className="rounded-lg border border-white/30 px-3 py-2 text-sm">
          {isFullscreen ? <Minimize size={14} className="inline" /> : <Expand size={14} className="inline" />} {isFullscreen ? ' Exit FS' : ' Fullscreen'}
        </button>
        <button type="button" onClick={() => { setRunning(false); setPaused(false); }} className="rounded-lg border border-white/30 px-3 py-2 text-sm">
          Stop
        </button>
      </div>
    </div>
  );

  const lines = text.split('\n').filter((line) => line.trim() !== '');

  if (running) {
    return (
      <section className="rounded-3xl border border-indigo-300/30 bg-slate-900/60 p-3 shadow-2xl shadow-indigo-900/20">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-cyan-200">
          <Timer size={18} /> Star-Wars Teleprompter (Live)
        </h2>

        <div ref={stageRef} className="relative">
          {!isFullscreen && <div className="mb-3"><Controls /></div>}

          <div className="rounded-2xl bg-slate-950 p-2">
            <div
              ref={viewportRef}
              className={`relative overflow-hidden bg-[radial-gradient(circle_at_top,_#1e293b_0%,_#020617_65%)] ${
                isFullscreen ? 'h-[100dvh] w-full rounded-none' : 'h-[55vh] min-h-[20rem] rounded-xl sm:h-[65vh]'
              }`}
              style={{ perspective: '520px' }}
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50" />
              <div
                ref={contentRef}
                className="absolute left-1/2 w-[90%] max-w-4xl text-center font-semibold uppercase tracking-wide text-amber-200"
                style={{
                  transform: `translate(-50%, ${yRef.current}px) rotateX(${tilt}deg)`,
                  transformOrigin: '50% 100%',
                  fontSize: `clamp(15px, ${textSize / 13}vw, ${textSize}px)`,
                  lineHeight: lineSpacing,
                }}
              >
                {lines.map((line, i) => (
                  <p key={`${line}-${i}`} className="mb-6 sm:mb-8">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {isFullscreen && (
            <>
              {!showFsControls && (
                <button
                  type="button"
                  onClick={() => setShowFsControls(true)}
                  className="fixed bottom-5 right-5 z-50 rounded-full bg-cyan-500/90 px-4 py-2 text-xs font-semibold text-slate-950"
                >
                  Reveal Controls
                </button>
              )}
              {showFsControls && (
                <div className="fixed inset-x-2 top-2 z-50 space-y-2 sm:inset-x-4">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowFsControls(false)}
                      className="rounded-full bg-slate-900/95 px-3 py-1 text-xs text-white"
                    >
                      Hide Controls
                    </button>
                  </div>
                  <Controls floating />
                </div>
              )}
            </>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-indigo-300/30 bg-slate-900/60 p-5 shadow-xl shadow-indigo-900/20">
      <h2 className="mb-2 text-xl font-semibold text-cyan-200">Star-Wars Teleprompter</h2>
      <p className="mb-4 text-sm text-indigo-100/80">Focus mode speaking practice with mobile-ready controls and fullscreen reveal panel.</p>

      <textarea
        rows={7}
        value={text}
        onChange={(event) => setText(event.target.value)}
        className="w-full rounded-xl border border-indigo-200/30 bg-slate-950/70 p-3 text-sm text-slate-100"
      />

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Slider label={`Speed (${speed}px/s)`} min={12} max={70} value={speed} onChange={(v) => setSpeed(v)} light />
        <Slider label={`Font Size (${textSize}px)`} min={16} max={62} value={textSize} onChange={(v) => setTextSize(v)} light />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={formatText}
          className="flex items-center gap-2 rounded-xl border border-indigo-200/30 bg-white/10 px-3 py-2 text-sm text-indigo-50"
        >
          <Sparkles size={15} /> Format Text
        </button>
        <button
          type="button"
          onClick={() => { setRunning(true); setPaused(false); }}
          className="rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-400 px-4 py-2 text-sm font-semibold text-slate-950"
        >
          Run Crawl
        </button>
      </div>
    </section>
  );
}

function Slider({ label, min, max, step = 1, value, onChange, light = false }) {
  return (
    <label className={`text-sm ${light ? 'text-indigo-100' : ''}`}>
      {label}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-1 w-full accent-cyan-400"
      />
    </label>
  );
}

export default App;
