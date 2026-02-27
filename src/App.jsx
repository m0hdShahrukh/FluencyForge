import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Expand,
  Minimize,
  Dumbbell,
  Flame,
  Gauge,
  LayoutDashboard,
  FastForward,
  MessageCircle,
  Mic,
  Pause,
  Play,
  Rewind,
  RotateCcw,
  Sparkles,
  Timer,
} from 'lucide-react';
import { aeqScenarios, dailyPlan, frameworks, plusOnePrompts, soloTalkWords } from './data/frameworkData';

const STORAGE_KEY = 'fluencyforge-progress-v1';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'gym', label: 'Training Gym', icon: Dumbbell },
  { id: 'library', label: 'Frameworks Library', icon: BookOpen },
];

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);

    return {
      currentDay: 1,
      drillsCompletedToday: 0,
      currentStreak: 1,
      checklist: {},
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

  const toggleChecklist = (index) => {
    setProgress((prev) => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [index]: !prev.checklist[index],
      },
    }));
  };

  const bumpDay = () => {
    setProgress((prev) => ({
      ...prev,
      currentDay: Math.min(prev.currentDay + 1, 30),
      currentStreak: prev.currentStreak + 1,
      drillsCompletedToday: 0,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200">
      <div className="mx-auto max-w-6xl p-4 sm:p-6">
        <header className="mb-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">FluencyForge</h1>
              <p className="text-sm text-slate-500">Talk daily. Think clearly. Build confident spoken fluency.</p>
            </div>
            <div className="w-full sm:w-72">
              <div className="mb-1 flex justify-between text-xs text-slate-500">
                <span>30-Day Speaking Upgrade</span>
                <span>Day {progress.currentDay}/30</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200">
                <div className="h-2 rounded-full bg-accent-500" style={{ width: `${completionPct}%` }} />
              </div>
            </div>
          </div>
        </header>

        <nav className="mb-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-900 p-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.id === activeTab;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active ? 'bg-white text-slate-900' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {activeTab === 'dashboard' && (
          <DashboardView
            progress={progress}
            dailyPlan={dailyPlan}
            onToggleChecklist={toggleChecklist}
            onBumpDay={bumpDay}
          />
        )}
        {activeTab === 'gym' && <TrainingGym onDrillComplete={markDrillComplete} />}
        {activeTab === 'library' && <FrameworksLibrary />}
      </div>
    </div>
  );
}

function DashboardView({ progress, dailyPlan, onToggleChecklist, onBumpDay }) {
  const todayTask = dailyPlan[progress.currentDay - 1];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Current Day" value={progress.currentDay} icon={Gauge} />
        <StatCard title="Drills Completed Today" value={progress.drillsCompletedToday} icon={CheckCircle2} />
        <StatCard title="Current Streak" value={`${progress.currentStreak} days`} icon={Flame} />
      </div>

      <section className="rounded-2xl border border-accent-100 bg-accent-50 p-5 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-slate-900">Introvert Myth Buster</h2>
        <p className="text-slate-700">Introvert ≠ Bad speaker. Introvert = Gains energy alone. Skill &gt; Personality type.</p>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Today&apos;s Spoken Mission</h2>
          <button
            onClick={onBumpDay}
            className="rounded-lg bg-accent-500 px-3 py-2 text-sm font-medium text-white hover:bg-accent-600"
          >
            Complete Day
          </button>
        </div>
        <p className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">{todayTask}</p>
        <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">30-day speaking checklist</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {dailyPlan.map((task, idx) => (
            <label key={task} className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
              <input
                type="checkbox"
                checked={Boolean(progress.checklist[idx])}
                onChange={() => onToggleChecklist(idx)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-accent-500 focus:ring-accent-500"
              />
              <span className="text-sm text-slate-700">Day {idx + 1}: {task}</span>
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="mb-2 flex items-center gap-2 text-slate-500">
        <Icon size={16} />
        <span className="text-sm">{title}</span>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function TrainingGym({ onDrillComplete }) {
  return (
    <div className="space-y-4">
      <SoloTalkDrill onDrillComplete={onDrillComplete} />
      <PlusOneDrill onDrillComplete={onDrillComplete} />
      <WhyChainDrill onDrillComplete={onDrillComplete} />
      <AEQDrill onDrillComplete={onDrillComplete} />
      <TeleprompterDrill onDrillComplete={onDrillComplete} />
    </div>
  );
}

function SoloTalkDrill({ onDrillComplete }) {
  const [word, setWord] = useState('Future');
  const [timeLeft, setTimeLeft] = useState(300);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return undefined;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setRunning(false);
          onDrillComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [running, onDrillComplete]);

  const generateWord = () => {
    setWord(soloTalkWords[Math.floor(Math.random() * soloTalkWords.length)]);
    setTimeLeft(300);
    setRunning(false);
  };

  return (
    <DrillCard title="Drill A: 5-Minute Solo Talk (Phase 6)" icon={Mic}>
      <p className="mb-3 text-sm text-slate-600">Speak continuously about the focus word. No typing, only talking.</p>
      <div className="flex flex-wrap items-center gap-3">
        <p className="rounded-xl bg-slate-100 px-3 py-2 text-xl font-semibold text-slate-900">{formatTime(timeLeft)}</p>
        <button onClick={generateWord} className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
          Generate Word
        </button>
        <button onClick={() => setRunning(true)} className="rounded-lg bg-accent-500 px-3 py-2 text-sm text-white hover:bg-accent-600">
          Start Timer
        </button>
      </div>
      <p className="mt-4 rounded-xl bg-slate-900 p-5 text-center text-3xl font-bold text-white">{word}</p>
    </DrillCard>
  );
}

function PlusOneDrill({ onDrillComplete }) {
  const [prompt, setPrompt] = useState(plusOnePrompts[0]);
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');

  const evaluate = () => {
    const wordCount = input.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount <= 1) {
      setResult('❌ Stop giving 1-word answers! Add one extra line.');
      return;
    }

    setResult('✅ Great +1 extension! Now speak that response naturally out loud.');
    onDrillComplete();
  };

  const randomizePrompt = () => {
    setPrompt(plusOnePrompts[Math.floor(Math.random() * plusOnePrompts.length)]);
    setInput('');
    setResult('');
  };

  return (
    <DrillCard title="Drill B: The +1 Rule Simulator (Phase 5)" icon={MessageCircle}>
      <p className="mb-3 text-sm text-slate-600">Say your response first, then type a short transcript to self-check depth.</p>
      <div className="rounded-xl bg-slate-100 p-3 text-sm text-slate-700">Friend: {prompt}</div>
      <textarea
        value={input}
        onChange={(event) => setInput(event.target.value)}
        rows={2}
        className="mt-3 w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-accent-500 focus:outline-none"
        placeholder="Type your spoken response transcript..."
      />
      <div className="mt-3 flex gap-2">
        <button onClick={evaluate} className="rounded-lg bg-accent-500 px-3 py-2 text-sm text-white hover:bg-accent-600">
          Check Reply
        </button>
        <button onClick={randomizePrompt} className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
          New Message
        </button>
      </div>
      {result && <p className="mt-2 text-sm font-medium text-slate-700">{result}</p>}
    </DrillCard>
  );
}

function WhyChainDrill({ onDrillComplete }) {
  const [answers, setAnswers] = useState(['', '', '', '', '']);

  const handleChange = (index, value) => {
    setAnswers((prev) => prev.map((item, idx) => (idx === index ? value : item)));
  };

  const finish = () => {
    if (answers.every((answer) => answer.trim().length > 0)) onDrillComplete();
  };

  return (
    <DrillCard title="Drill C: The 'Why' Chain (Phase 6)" icon={MessageCircle}>
      <p className="mb-3 text-sm text-slate-600">Speak every answer aloud before typing short bullets.</p>
      <div className="space-y-2">
        {[0, 1, 2, 3, 4].map((step) => (
          <div key={step} className="rounded-xl border border-slate-200 p-3">
            <p className="mb-1 text-sm font-medium text-slate-600">{step === 0 ? 'What do you like doing?' : 'Why?'}</p>
            <input
              value={answers[step]}
              onChange={(event) => handleChange(step, event.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-accent-500 focus:outline-none"
              placeholder={`Step ${step + 1} answer`}
            />
          </div>
        ))}
      </div>
      <button onClick={finish} className="mt-3 rounded-lg bg-accent-500 px-3 py-2 text-sm text-white hover:bg-accent-600">
        Complete Why Chain
      </button>
    </DrillCard>
  );
}

function AEQDrill({ onDrillComplete }) {
  const [scenario, setScenario] = useState(aeqScenarios[0]);
  const [acknowledge, setAcknowledge] = useState('');
  const [expand, setExpand] = useState('');
  const [question, setQuestion] = useState('');
  const [combined, setCombined] = useState('');

  const submit = () => {
    const line = `${acknowledge.trim()} ${expand.trim()} ${question.trim()}`.trim();
    if (!line) return;

    setCombined(line);
    onDrillComplete();
  };

  const randomize = () => {
    setScenario(aeqScenarios[Math.floor(Math.random() * aeqScenarios.length)]);
    setAcknowledge('');
    setExpand('');
    setQuestion('');
    setCombined('');
  };

  return (
    <DrillCard title="Drill D: The AEQ Formula Simulator (Phase 2)" icon={MessageCircle}>
      <p className="mb-3 text-sm text-slate-600">Train spoken flow: acknowledge, add detail, ask a smart follow-up.</p>
      <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-700">Statement: {scenario}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <input
          value={acknowledge}
          onChange={(event) => setAcknowledge(event.target.value)}
          placeholder="1. Acknowledge"
          className="rounded-lg border border-slate-300 p-2 text-sm"
        />
        <input
          value={expand}
          onChange={(event) => setExpand(event.target.value)}
          placeholder="2. Expand"
          className="rounded-lg border border-slate-300 p-2 text-sm"
        />
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="3. Question"
          className="rounded-lg border border-slate-300 p-2 text-sm"
        />
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={submit} className="rounded-lg bg-accent-500 px-3 py-2 text-sm text-white hover:bg-accent-600">
          Submit
        </button>
        <button onClick={randomize} className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
          New Statement
        </button>
      </div>
      {combined && (
        <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
          ✅ Spoken flow line: {combined}
        </p>
      )}
    </DrillCard>
  );
}

function TeleprompterDrill({ onDrillComplete }) {
  const [text, setText] = useState(
    `In a world where confident speakers are built, not born...

Today you train your voice, your flow, and your confidence.

Speak every line with clarity and power.`,
  );
  const [speed, setSpeed] = useState(28);
  const [textSize, setTextSize] = useState(34);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [crawlY, setCrawlY] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [styleMode, setStyleMode] = useState('classic');
  const [fontFamily, setFontFamily] = useState('system');
  const [lineSpacing, setLineSpacing] = useState(1.6);
  const stageRef = useRef(null);
  const viewportRef = useRef(null);
  const contentRef = useRef(null);

  const stylePresets = {
    classic: { label: 'Classic Crawl', tilt: 24, uppercase: true, textColor: 'text-amber-200', align: 'text-center' },
    flat: { label: 'Flat Reader', tilt: 0, uppercase: false, textColor: 'text-sky-100', align: 'text-left' },
    focus: { label: 'Focus Mode', tilt: 8, uppercase: false, textColor: 'text-slate-100', align: 'text-center' },
  };

  const fontClasses = {
    system: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono',
  };

  const activePreset = stylePresets[styleMode];

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === stageRef.current);
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  useEffect(() => {
    if (!running || !viewportRef.current) return;
    setCrawlY(viewportRef.current.clientHeight + 100);
  }, [running]);

  useEffect(() => {
    if (!running || !viewportRef.current || !contentRef.current) return undefined;

    let rafId;
    let previousTime;

    const animate = (currentTime) => {
      if (previousTime === undefined) previousTime = currentTime;
      const delta = (currentTime - previousTime) / 1000;
      previousTime = currentTime;

      if (!paused) {
        setCrawlY((prev) => prev - speed * delta);
      }

      rafId = window.requestAnimationFrame(animate);
    };

    rafId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(rafId);
  }, [running, speed, paused]);

  useEffect(() => {
    if (!running || !viewportRef.current || !contentRef.current) return;
    const contentHeight = contentRef.current.clientHeight;
    if (crawlY < -contentHeight - 80) {
      setRunning(false);
      setPaused(false);
      onDrillComplete();
    }
  }, [crawlY, running, onDrillComplete]);

  useEffect(() => {
    if (!running) return undefined;

    const onKeyDown = (event) => {
      if (event.target?.tagName === 'INPUT' || event.target?.tagName === 'TEXTAREA' || event.target?.tagName === 'SELECT') return;

      if (event.code === 'Space') {
        event.preventDefault();
        setPaused((prev) => !prev);
      }
      if (event.key === 'ArrowUp') setSpeed((prev) => Math.min(prev + 2, 56));
      if (event.key === 'ArrowDown') setSpeed((prev) => Math.max(prev - 2, 12));
      if (event.key === 'ArrowRight') setTextSize((prev) => Math.min(prev + 2, 54));
      if (event.key === 'ArrowLeft') setTextSize((prev) => Math.max(prev - 2, 18));
      if (event.key.toLowerCase() === 'r') {
        setCrawlY(viewportRef.current ? viewportRef.current.clientHeight + 100 : 0);
        setPaused(false);
      }
      if (event.key.toLowerCase() === 'f' && stageRef.current) {
        if (document.fullscreenElement === stageRef.current) {
          document.exitFullscreen();
        } else {
          stageRef.current.requestFullscreen();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [running]);

  const run = () => {
    if (!text.trim()) return;
    setRunning(true);
    setPaused(false);
  };

  const formatScript = () => {
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
        if (!last || (last + ' ' + sentence).length > 120) {
          acc.push(sentence.trim());
        } else {
          acc[acc.length - 1] = `${last} ${sentence}`.trim();
        }
        return acc;
      }, []);

    setText(chunks.join('\n\n'));
  };

  const stop = () => {
    setRunning(false);
    setPaused(false);
  };

  const resetPosition = () => {
    if (!viewportRef.current) return;
    setCrawlY(viewportRef.current.clientHeight + 100);
    setPaused(false);
  };

  const toggleFullscreen = async () => {
    if (!stageRef.current) return;

    if (document.fullscreenElement === stageRef.current) {
      await document.exitFullscreen();
      return;
    }

    await stageRef.current.requestFullscreen();
  };

  const lines = text.split('\n').filter((line) => line.trim() !== '');

  const TeleprompterControls = () => (
    <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2 lg:grid-cols-4">
      <label className="text-sm text-slate-700">
        Speed ({speed}px/s)
        <div className="mt-1 flex items-center gap-2">
          <button type="button" onClick={() => setSpeed((prev) => Math.max(12, prev - 2))} className="rounded-md border border-slate-300 p-1">
            <Rewind size={14} />
          </button>
          <input type="range" min="12" max="56" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} className="w-full" />
          <button type="button" onClick={() => setSpeed((prev) => Math.min(56, prev + 2))} className="rounded-md border border-slate-300 p-1">
            <FastForward size={14} />
          </button>
        </div>
      </label>

      <label className="text-sm text-slate-700">
        Text Size ({textSize}px)
        <input type="range" min="18" max="54" value={textSize} onChange={(event) => setTextSize(Number(event.target.value))} className="mt-1 w-full" />
      </label>

      <label className="text-sm text-slate-700">
        Style Mode
        <select
          value={styleMode}
          onChange={(event) => setStyleMode(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2"
        >
          {Object.entries(stylePresets).map(([value, meta]) => (
            <option key={value} value={value}>{meta.label}</option>
          ))}
        </select>
      </label>

      <label className="text-sm text-slate-700">
        Font
        <select
          value={fontFamily}
          onChange={(event) => setFontFamily(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2"
        >
          <option value="system">System</option>
          <option value="serif">Serif</option>
          <option value="mono">Monospace</option>
        </select>
      </label>

      <label className="text-sm text-slate-700 sm:col-span-2 lg:col-span-4">
        Line Spacing ({lineSpacing.toFixed(1)})
        <input
          type="range"
          min="1.1"
          max="2.2"
          step="0.1"
          value={lineSpacing}
          onChange={(event) => setLineSpacing(Number(event.target.value))}
          className="mt-1 w-full"
        />
      </label>

      <div className="flex flex-wrap items-center gap-2 sm:col-span-2 lg:col-span-4">
        <button
          type="button"
          onClick={() => setPaused((prev) => !prev)}
          className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100"
        >
          {paused ? <Play size={15} /> : <Pause size={15} />}
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button type="button" onClick={resetPosition} className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100">
          <RotateCcw size={15} /> Restart
        </button>
        <button
          type="button"
          onClick={toggleFullscreen}
          className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100"
        >
          {isFullscreen ? <Minimize size={16} /> : <Expand size={16} />}
          {isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
        </button>
        <button type="button" onClick={stop} className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100">Stop / Exit</button>
      </div>
      <p className="text-xs text-slate-500 sm:col-span-2 lg:col-span-4">
        Keyboard: Space play/pause · ↑/↓ speed · ←/→ text size · R restart · F fullscreen
      </p>
    </div>
  );

  if (running) {
    return (
      <DrillCard title="Drill E: Star-Wars Style Teleprompter" icon={Play}>
        <div ref={stageRef} className="space-y-3">
          <TeleprompterControls />

          <div className="rounded-xl bg-slate-950 p-2 sm:p-3">
            <div
              ref={viewportRef}
              className={`relative overflow-hidden bg-[radial-gradient(circle_at_top,_#1e293b_0%,_#020617_65%)] ${
                isFullscreen ? 'h-[100dvh] w-full rounded-none' : 'h-[55vh] min-h-[22rem] rounded-lg sm:h-[65vh]'
              }`}
              style={{ perspective: '520px' }}
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
              <div
                ref={contentRef}
                className={`absolute left-1/2 w-[88%] max-w-5xl ${activePreset.align} ${activePreset.textColor} ${fontClasses[fontFamily]} ${
                  activePreset.uppercase ? 'uppercase tracking-wide' : 'normal-case tracking-normal'
                }`}
                style={{
                  transform: `translate(-50%, ${crawlY}px) rotateX(${activePreset.tilt}deg)`,
                  transformOrigin: '50% 100%',
                  fontSize: `clamp(16px, ${textSize / 14}vw, ${textSize}px)`,
                  lineHeight: lineSpacing,
                }}
              >
                {lines.map((line, idx) => (
                  <p key={`${line}-${idx}`} className="mb-6 sm:mb-8">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DrillCard>
    );
  }

  return (
    <DrillCard title="Drill E: Star-Wars Style Teleprompter" icon={Play}>
      <p className="mb-3 text-sm text-slate-600">
        Paste your script and run it in classic crawl, flat reader, or focus mode. Fullscreen and keyboard controls work while running.
      </p>
      <textarea
        rows={6}
        value={text}
        onChange={(event) => setText(event.target.value)}
        className="w-full rounded-lg border border-slate-300 p-2 text-sm"
      />
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm text-slate-600">
          Speed ({speed}px/s)
          <input type="range" min="12" max="56" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} className="w-full" />
        </label>
        <label className="text-sm text-slate-600">
          Text Size ({textSize}px)
          <input type="range" min="18" max="54" value={textSize} onChange={(event) => setTextSize(Number(event.target.value))} className="w-full" />
        </label>
        <label className="text-sm text-slate-600">
          Style Mode
          <select
            value={styleMode}
            onChange={(event) => setStyleMode(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2"
          >
            {Object.entries(stylePresets).map(([value, meta]) => (
              <option key={value} value={value}>{meta.label}</option>
            ))}
          </select>
        </label>
        <label className="text-sm text-slate-600">
          Font
          <select
            value={fontFamily}
            onChange={(event) => setFontFamily(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2"
          >
            <option value="system">System</option>
            <option value="serif">Serif</option>
            <option value="mono">Monospace</option>
          </select>
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={formatScript} className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
          <Sparkles size={15} />
          Format Text
        </button>
        <button type="button" onClick={run} className="rounded-lg bg-accent-500 px-3 py-2 text-sm text-white hover:bg-accent-600">
          Run Crawl
        </button>
      </div>
    </DrillCard>
  );
}

function DrillCard({ title, icon: Icon, children }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
        <Icon size={18} />
        {title}
      </h3>
      {children}
    </section>
  );
}

function FrameworksLibrary() {
  const [openItem, setOpenItem] = useState(0);

  return (
    <div className="space-y-3">
      {frameworks.map((framework, idx) => {
        const isOpen = openItem === idx;
        return (
          <div key={framework.title} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <button className="flex w-full items-center justify-between" onClick={() => setOpenItem(isOpen ? -1 : idx)}>
              <h3 className="text-left text-base font-semibold text-slate-900">{framework.title}</h3>
              <span className="text-slate-500">{isOpen ? '-' : '+'}</span>
            </button>
            {isOpen && (
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
                {framework.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default App;
