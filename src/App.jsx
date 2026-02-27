import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Expand, Minimize, Pause, Play, RotateCcw, Sparkles, Timer, Trash2 } from 'lucide-react';

const STORAGE_KEY = 'fluencyforge-progress-v1';

function App() {
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return { currentDay: 1, drillsCompletedToday: 0, currentStreak: 1 };
  });

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true,
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const completionPct = useMemo(() => (progress.currentDay / 30) * 100, [progress.currentDay]);

  const markRunComplete = () => {
    setProgress((prev) => ({ ...prev, drillsCompletedToday: prev.drillsCompletedToday + 1 }));
  };

  const completeDay = () => {
    setProgress((prev) => ({
      ...prev,
      currentDay: Math.min(prev.currentDay + 1, 30),
      currentStreak: prev.currentStreak + 1,
      drillsCompletedToday: 0,
    }));
  };

  const resetStats = () => {
    setProgress({ currentDay: 1, drillsCompletedToday: 0, currentStreak: 1 });
  };

  const installApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome !== 'accepted') return;
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 text-slate-100">
      <div className="mx-auto max-w-5xl p-3 sm:p-4">
        <header className="mb-3 rounded-2xl border border-violet-300/30 bg-gradient-to-r from-fuchsia-500/20 via-cyan-400/15 to-indigo-500/25 p-3 shadow-lg">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h1 className="text-xl font-bold text-white sm:text-2xl">FluencyForge</h1>
              <p className="text-xs text-violet-100/90 sm:text-sm">Star-Wars teleprompter trainer</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={completeDay}
                className="rounded-lg bg-gradient-to-r from-cyan-300 to-indigo-400 px-3 py-2 text-xs font-semibold text-slate-950 sm:text-sm"
              >
                Complete Day
              </button>
              <button
                type="button"
                onClick={resetStats}
                className="flex items-center gap-1 rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-xs sm:text-sm"
              >
                <Trash2 size={14} /> Reset Stats
              </button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <Stat label="Day" value={`${progress.currentDay}/30`} />
            <Stat label="Runs" value={progress.drillsCompletedToday} />
            <Stat label="Streak" value={`${progress.currentStreak}d`} />
          </div>

          <div className="mt-3">
            <div className="mb-1 flex justify-between text-[11px] text-violet-100/80">
              <span>30-Day Progress</span>
              <span>{Math.round(completionPct)}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/20">
              <div className="h-2 rounded-full bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300" style={{ width: `${completionPct}%` }} />
            </div>
          </div>
        </header>

        {!isInstalled && (
          <section className="mb-3 rounded-2xl border border-cyan-300/40 bg-cyan-500/10 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-cyan-100 sm:text-base">Install FluencyForge App</h2>
                <p className="text-xs text-cyan-100/85 sm:text-sm">
                  Install for quick access, full-screen experience, and smoother daily speaking practice.
                </p>
                {!deferredPrompt && <p className="mt-1 text-[11px] text-cyan-100/70">Tip: use HTTPS + Chrome/Edge and visit the app once to enable install prompt.</p>}
              </div>
              <button
                type="button"
                onClick={installApp}
                disabled={!deferredPrompt}
                className="flex shrink-0 items-center gap-1 rounded-lg bg-cyan-300 px-3 py-2 text-xs font-semibold text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-500 disabled:text-slate-200"
              >
                <Download size={14} /> {deferredPrompt ? 'Install App' : 'Install Not Available'}
              </button>
            </div>
          </section>
        )}

        <TeleprompterDrill onDrillComplete={markRunComplete} />
        <footer className="mt-4 text-center text-xs text-violet-100/70">
         © 2026 FluencyForge. Developed by <a href="https://shahrukh-cv.netlify.app/" target="_blank" rel="noreferrer" className="text-cyan-300 underline"> Mohd Shahrukh </a>
        </footer>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-white/25 bg-white/10 p-2">
      <p className="text-[10px] uppercase tracking-wide text-violet-100/80">{label}</p>
      <p className="text-sm font-semibold text-white sm:text-base">{value}</p>
    </div>
  );
}

function TeleprompterDrill({ onDrillComplete }) {
  const [text, setText] = useState(
    `In a galaxy where confident speakers are built, not born...\n\nToday you train your voice, your pace, and your flow.\n\nSpeak clearly. Speak calmly. Speak with power.`,
  );
  const [speed, setSpeed] = useState(28);
  const [textSize, setTextSize] = useState(30);
  const [lineSpacing, setLineSpacing] = useState(1.5);
  const [tilt, setTilt] = useState(22);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFsControls, setShowFsControls] = useState(false);

  const stageRef = useRef(null);
  const viewportRef = useRef(null);
  const contentRef = useRef(null);
  const yRef = useRef(0);
  const speedRef = useRef(speed);
  const pausedRef = useRef(paused);
  const tiltRef = useRef(tilt);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    tiltRef.current = tilt;
    applyTransform();
  }, [tilt]);

  const applyTransform = () => {
    if (!contentRef.current) return;
    contentRef.current.style.transform = `translate(-50%, ${yRef.current}px) rotateX(${tiltRef.current}deg)`;
  };

  useEffect(() => {
    const onFsChange = () => {
      const fs = document.fullscreenElement === stageRef.current;
      setIsFullscreen(fs);
      setShowFsControls(false);
    };

    window.addEventListener('fullscreenchange', onFsChange);
    return () => window.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  useEffect(() => {
    if (!running || !viewportRef.current || !contentRef.current) return undefined;

    yRef.current = viewportRef.current.clientHeight + 110;
    applyTransform();

    let rafId;
    let previous;

    const animate = (now) => {
      if (previous === undefined) previous = now;
      const dt = (now - previous) / 1000;
      previous = now;

      if (!pausedRef.current) {
        yRef.current -= speedRef.current * dt;
        applyTransform();

        const contentHeight = contentRef.current?.clientHeight ?? 0;
        if (yRef.current < -contentHeight - 100) {
          setRunning(false);
          setPaused(false);
          onDrillComplete();
          return;
        }
      }

      rafId = window.requestAnimationFrame(animate);
    };

    rafId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(rafId);
  }, [running, onDrillComplete]);

  useEffect(() => {
    applyTransform();
  }, [textSize, lineSpacing]);

  const toggleFullscreen = async () => {
    if (!stageRef.current) return;
    if (document.fullscreenElement === stageRef.current) await document.exitFullscreen();
    else await stageRef.current.requestFullscreen();
  };

  const restart = () => {
    if (!viewportRef.current) return;
    yRef.current = viewportRef.current.clientHeight + 110;
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
        const last = acc[acc.length - 1] || '';
        if (!sentence) return acc;
        if (!last || (last + ' ' + sentence).length > 110) acc.push(sentence.trim());
        else acc[acc.length - 1] = `${last} ${sentence}`.trim();
        return acc;
      }, []);

    setText(chunks.join('\n\n'));
  };

  const lines = text.split('\n').filter((line) => line.trim() !== '');

  const Controls = ({ floating = false }) => (
    <div
      onClick={(event) => event.stopPropagation()}
      onTouchStart={(event) => event.stopPropagation()}
      className={`grid gap-2 rounded-xl border p-2 sm:grid-cols-2 ${
        floating ? 'border-slate-700 bg-slate-900/95 text-slate-100' : 'border-violet-300/30 bg-white/10 text-violet-50'
      }`}
    >
      <Slider label={`Speed ${speed}`} min={12} max={70} value={speed} onChange={setSpeed} />
      <Slider label={`Size ${textSize}`} min={16} max={62} value={textSize} onChange={setTextSize} />
      <Slider label={`Spacing ${lineSpacing.toFixed(1)}`} min={1.1} max={2.2} step={0.1} value={lineSpacing} onChange={setLineSpacing} />
      <Slider label={`Tilt ${tilt}°`} min={0} max={35} value={tilt} onChange={setTilt} />

      <div className="sm:col-span-2 flex flex-wrap gap-2">
        <button type="button" onClick={() => setPaused((p) => !p)} className="rounded-lg border border-white/30 px-3 py-2 text-xs sm:text-sm">
          {paused ? <Play size={14} className="inline" /> : <Pause size={14} className="inline" />} {paused ? 'Resume' : 'Pause'}
        </button>
        <button type="button" onClick={restart} className="rounded-lg border border-white/30 px-3 py-2 text-xs sm:text-sm">
          <RotateCcw size={14} className="inline" /> Restart
        </button>
        <button type="button" onClick={toggleFullscreen} className="rounded-lg border border-white/30 px-3 py-2 text-xs sm:text-sm">
          {isFullscreen ? <Minimize size={14} className="inline" /> : <Expand size={14} className="inline" />} {isFullscreen ? 'Exit FS' : 'Fullscreen'}
        </button>
        <button type="button" onClick={() => { setRunning(false); setPaused(false); }} className="rounded-lg border border-white/30 px-3 py-2 text-xs sm:text-sm">
          Stop
        </button>
      </div>
    </div>
  );

  if (running) {
    return (
      <section className="rounded-2xl border border-violet-300/30 bg-slate-900/60 p-2 sm:p-3">
        <h2 className="mb-2 flex items-center gap-2 text-base font-semibold text-cyan-200 sm:text-lg">
          <Timer size={18} /> Teleprompter Live
        </h2>

        <div ref={stageRef} className="relative" onDoubleClick={() => isFullscreen && setShowFsControls(true)}>
          {!isFullscreen && <div className="mb-2"><Controls /></div>}

          <div className="rounded-xl bg-slate-950 p-1.5 sm:p-2">
            <div
              ref={viewportRef}
              className={`relative overflow-hidden bg-[radial-gradient(circle_at_top,_#1e293b_0%,_#020617_65%)] ${
                isFullscreen ? 'h-[100dvh] w-full rounded-none' : 'h-[52vh] min-h-[18rem] rounded-lg sm:h-[63vh]'
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
                  fontSize: `clamp(14px, ${textSize / 13}vw, ${textSize}px)`,
                  lineHeight: lineSpacing,
                }}
              >
                {lines.map((line, idx) => (
                  <p key={`${line}-${idx}`} className="mb-5 sm:mb-7">{line}</p>
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
                  className="fixed bottom-4 right-4 z-50 rounded-full bg-cyan-400/95 px-4 py-2 text-xs font-semibold text-slate-950"
                >
                  Reveal Controls
                </button>
              )}

              {showFsControls && (
                <div
                  className="fixed inset-0 z-50"
                  onClick={() => setShowFsControls(false)}
                  onTouchStart={() => setShowFsControls(false)}
                >
                  <div className="absolute inset-x-2 top-2 space-y-2 sm:inset-x-4">
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
                </div>
              )}
            </>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-violet-300/30 bg-slate-900/60 p-3 sm:p-4">
      <h2 className="mb-2 text-lg font-semibold text-cyan-200 sm:text-xl">Star-Wars Teleprompter</h2>
      <p className="mb-3 text-xs text-violet-100/85 sm:text-sm">Double tap/click in fullscreen to reveal controls. Speed and tilt update live without restarting crawl.</p>

      <textarea
        rows={6}
        value={text}
        onChange={(event) => setText(event.target.value)}
        className="w-full rounded-xl border border-violet-300/30 bg-slate-950/70 p-3 text-sm text-slate-100"
      />

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Slider label={`Speed ${speed}`} min={12} max={70} value={speed} onChange={setSpeed} light />
        <Slider label={`Font Size ${textSize}`} min={16} max={62} value={textSize} onChange={setTextSize} light />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={formatText} className="flex items-center gap-2 rounded-lg border border-violet-300/30 bg-white/10 px-3 py-2 text-xs sm:text-sm">
          <Sparkles size={15} /> Format Text
        </button>
        <button
          type="button"
          onClick={() => {
            setRunning(true);
            setPaused(false);
          }}
          className="rounded-lg bg-gradient-to-r from-cyan-300 to-fuchsia-300 px-4 py-2 text-xs font-semibold text-slate-950 sm:text-sm"
        >
          Run Crawl
        </button>
      </div>
    </section>
  );
}

function Slider({ label, min, max, step = 1, value, onChange, light = false }) {
  return (
    <label className={`text-xs sm:text-sm ${light ? 'text-violet-100' : ''}`}>
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
