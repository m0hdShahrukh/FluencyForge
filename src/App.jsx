import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Dumbbell,
  Flame,
  Gauge,
  LayoutDashboard,
  Play,
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
    if (saved) {
      return JSON.parse(saved);
    }
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
              <p className="text-sm text-slate-500">Build conversational fluency with daily cognitive drills.</p>
            </div>
            <div className="w-full sm:w-72">
              <div className="mb-1 flex justify-between text-xs text-slate-500">
                <span>30-Day Upgrade Plan</span>
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
          <DashboardView progress={progress} dailyPlan={dailyPlan} onToggleChecklist={toggleChecklist} onBumpDay={bumpDay} />
        )}
        {activeTab === 'gym' && <TrainingGym onDrillComplete={markDrillComplete} />}
        {activeTab === 'library' && <FrameworksLibrary />}
      </div>
    </div>
  );
}

function DashboardView({ progress, dailyPlan, onToggleChecklist, onBumpDay }) {
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
          <h2 className="text-lg font-semibold text-slate-900">Daily Checklist</h2>
          <button onClick={onBumpDay} className="rounded-lg bg-accent-500 px-3 py-2 text-sm font-medium text-white hover:bg-accent-600">
            Complete Day
          </button>
        </div>
        <div className="space-y-2">
          {dailyPlan.map((task, idx) => (
            <label key={task} className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
              <input
                type="checkbox"
                checked={Boolean(progress.checklist[idx])}
                onChange={() => onToggleChecklist(idx)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-accent-500 focus:ring-accent-500"
              />
              <span className="text-sm text-slate-700">{task}</span>
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
    <DrillCard title='Drill A: 5-Minute Solo Talk (Phase 6)' icon={Timer}>
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
    setResult('✅ Great +1 extension!');
    onDrillComplete();
  };

  const randomizePrompt = () => {
    setPrompt(plusOnePrompts[Math.floor(Math.random() * plusOnePrompts.length)]);
    setInput('');
    setResult('');
  };

  return (
    <DrillCard title='Drill B: The +1 Rule Simulator (Phase 5)' icon={Play}>
      <div className="rounded-xl bg-slate-100 p-3 text-sm text-slate-700">Friend: {prompt}</div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={2}
        className="mt-3 w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-accent-500 focus:outline-none"
        placeholder="Type your reply..."
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
    setAnswers((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const finish = () => {
    if (answers.every((answer) => answer.trim().length > 0)) {
      onDrillComplete();
    }
  };

  return (
    <DrillCard title="Drill C: The 'Why' Chain (Phase 6)" icon={Play}>
      <div className="space-y-2">
        {[0, 1, 2, 3, 4].map((step) => (
          <div key={step} className="rounded-xl border border-slate-200 p-3">
            <p className="mb-1 text-sm font-medium text-slate-600">
              {step === 0 ? 'What do you like doing?' : 'Why?'}
            </p>
            <input
              value={answers[step]}
              onChange={(e) => handleChange(step, e.target.value)}
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
  const [ack, setAck] = useState('');
  const [expand, setExpand] = useState('');
  const [question, setQuestion] = useState('');
  const [combined, setCombined] = useState('');

  const submit = () => {
    const line = `${ack.trim()} ${expand.trim()} ${question.trim()}`.trim();
    if (!line) return;
    setCombined(line);
    onDrillComplete();
  };

  const randomize = () => {
    setScenario(aeqScenarios[Math.floor(Math.random() * aeqScenarios.length)]);
    setAck('');
    setExpand('');
    setQuestion('');
    setCombined('');
  };

  return (
    <DrillCard title='Drill D: The AEQ Formula Simulator (Phase 2)' icon={Play}>
      <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-700">Statement: {scenario}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <input value={ack} onChange={(e) => setAck(e.target.value)} placeholder="1. Acknowledge" className="rounded-lg border border-slate-300 p-2 text-sm" />
        <input value={expand} onChange={(e) => setExpand(e.target.value)} placeholder="2. Expand" className="rounded-lg border border-slate-300 p-2 text-sm" />
        <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="3. Question" className="rounded-lg border border-slate-300 p-2 text-sm" />
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={submit} className="rounded-lg bg-accent-500 px-3 py-2 text-sm text-white hover:bg-accent-600">
          Submit
        </button>
        <button onClick={randomize} className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
          New Statement
        </button>
      </div>
      {combined && <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{combined}</p>}
    </DrillCard>
  );
}

function TeleprompterDrill({ onDrillComplete }) {
  const [text, setText] = useState('Paste your script here and run the prompter...');
  const [speed, setSpeed] = useState(40);
  const [textSize, setTextSize] = useState(26);
  const [running, setRunning] = useState(false);
  const [offset, setOffset] = useState(0);
  const viewportRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!running) return undefined;
    const interval = setInterval(() => {
      setOffset((prev) => prev + speed / 80);
    }, 50);
    return () => clearInterval(interval);
  }, [running, speed]);

  useEffect(() => {
    if (!running || !viewportRef.current || !contentRef.current) return;
    const viewportHeight = viewportRef.current.clientHeight;
    const contentHeight = contentRef.current.clientHeight;
    if (offset > contentHeight + viewportHeight) {
      setRunning(false);
      onDrillComplete();
    }
  }, [offset, running, onDrillComplete]);

  const run = () => {
    setOffset(0);
    setRunning(true);
  };

  if (running) {
    return (
      <DrillCard title='Drill E: The Teleprompter (Speaking Flow Practice)' icon={Play}>
        <div ref={viewportRef} className="relative h-72 overflow-hidden rounded-xl bg-slate-900 p-4">
          <div
            ref={contentRef}
            style={{ transform: `translateY(calc(100% - ${offset}px))`, fontSize: `${textSize}px` }}
            className="whitespace-pre-wrap text-center leading-relaxed text-slate-100 transition-transform"
          >
            {text}
          </div>
        </div>
        <button
          onClick={() => setRunning(false)}
          className="mt-3 rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
        >
          Stop / Exit
        </button>
      </DrillCard>
    );
  }

  return (
    <DrillCard title='Drill E: The Teleprompter (Speaking Flow Practice)' icon={Play}>
      <textarea
        rows={5}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full rounded-lg border border-slate-300 p-2 text-sm"
      />
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-slate-600">
          Speed Control ({speed})
          <input
            type="range"
            min="10"
            max="100"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label className="text-sm text-slate-600">
          Text Size ({textSize}px)
          <input
            type="range"
            min="18"
            max="44"
            value={textSize}
            onChange={(e) => setTextSize(Number(e.target.value))}
            className="w-full"
          />
        </label>
      </div>
      <button onClick={run} className="mt-3 rounded-lg bg-accent-500 px-3 py-2 text-sm text-white hover:bg-accent-600">
        Run Prompter
      </button>
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
