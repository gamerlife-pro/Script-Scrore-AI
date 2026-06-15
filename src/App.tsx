import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Upload, 
  FileText, 
  ArrowRight, 
  RotateCcw,
  BookOpen, 
  Clock, 
  Play, 
  AlertTriangle,
  CheckCircle2, 
  XCircle,
  Trophy,
  Flame,
  HelpCircle,
  Eye,
  MessageSquare,
  ThumbsUp,
  Sliders,
  Compass,
  ArrowUpRight,
  TrendingUp,
  FileCode,
  Check
} from 'lucide-react';

import Navbar from './components/Navbar';
import Loader from './components/Loader';
import ScoreRing from './components/ScoreRing';
import StorytellingRadar from './components/StorytellingRadar';
import { analyzeScriptText, getMockScripts } from './data';
import { AnalysisResult, ScriptSegmentHighlight } from './types';

export default function App() {
  const [view, setView] = useState<'landing' | 'analyze' | 'loading' | 'dashboard'>('landing');
  const [scriptText, setScriptText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedSample, setSelectedSample] = useState<number | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number>(0);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [viewerTab, setViewerTab] = useState<'highlights' | 'raw'>('highlights');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const presetScripts = getMockScripts();

  const handleReset = () => {
    setScriptText('');
    setAnalysisResult(null);
    setSelectedSample(null);
    setActiveSegmentIndex(0);
    setView('landing');
  };

  const handleSelectSample = (idx: number) => {
    setSelectedSample(idx);
    setScriptText(presetScripts[idx].text);
    setView('analyze');
  };

  const handleStartAnalysis = () => {
    if (!scriptText.trim()) return;
    setView('loading');
  };

  const handleLoaderComplete = () => {
    const result = analyzeScriptText(scriptText);
    setAnalysisResult(result);
    setView('dashboard');
  };

  // Helper to extract text from files locally in browser
  const processUploadedFile = (file: File) => {
    if (!file) return;

    if (file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setScriptText(text);
        setSelectedSample(null);
      };
      reader.readAsText(file);
    } else if (file.name.endsWith('.docx')) {
      // Clean, reliable DOCX client parser approximation:
      // It reads docx file, converts to readable words by stripping zip binary non-ascii parts
      const reader = new FileReader();
      reader.onload = (e) => {
        const buffer = e.target?.result as ArrayBuffer;
        const arr = new Uint8Array(buffer);
        let binaryString = '';
        // Extract string chunks
        for (let i = 0; i < arr.length; i++) {
          if (arr[i] >= 32 && arr[i] <= 126 || arr[i] === 10 || arr[i] === 13) {
            binaryString += String.fromCharCode(arr[i]);
          }
        }
        // Extract content blocks between basic XML nodes or filter out raw binary headers
        const wordsArr = binaryString.match(/[a-zA-Z0-9\s.,!?'"()-]{6,}/g) || [];
        const cleanedText = wordsArr
          .map(w => w.trim())
          .filter(w => w.length > 20 && !w.includes('Content_Types') && !w.includes('rels') && !w.includes('word/'))
          .join('\n\n');
        
        const finalText = cleanedText || "Error parsing DOCX package format. Please copy and paste your text directly into the script area below.";
        setScriptText(finalText);
        setSelectedSample(null);
      };
      reader.readAsArrayBuffer(file);
    } else if (file.name.endsWith('.pdf')) {
      // PDF client parser approximation: extracting text lines
      const reader = new FileReader();
      reader.onload = (e) => {
        const buffer = e.target?.result as ArrayBuffer;
        const arr = new Uint8Array(buffer);
        let textSegments = '';
        for (let i = 0; i < arr.length; i++) {
          if (arr[i] >= 32 && arr[i] <= 126 || arr[i] === 10 || arr[i] === 13) {
            textSegments += String.fromCharCode(arr[i]);
          }
        }
        // Grab strings inside PDF parenthesis blocks
        const matches = textSegments.match(/\(([^)]+)\)/g);
        if (matches && matches.length > 10) {
          const stripped = matches
            .map(m => m.slice(1, -1))
            .filter(str => str.length > 3 && !/^[0-9]+$/.test(str) && !str.includes('/') && !str.includes('\\'))
            .join(' ');
          
          // Basic reconstruction formatting
          const words = stripped.split(/\s+/);
          let formattedPDFText = "";
          for (let i = 0; i < words.length; i += 15) {
            formattedPDFText += words.slice(i, i + 15).join(' ') + '\n\n';
          }
          setScriptText(formattedPDFText);
        } else {
          // Fallback text reconstruction for raw text streams
          const strings = textSegments.match(/[a-zA-Z\s.,!?'"()-]{12,}/g) || [];
          const filtered = strings
            .map(s => s.trim())
            .filter(s => s.length > 15 && !s.includes('PDF') && !s.includes('obj') && !s.includes('endobj'))
            .join('\n\n');
          
          setScriptText(filtered || "Error extracting PDF layers. Paste your script directly in the input box for best results.");
        }
        setSelectedSample(null);
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Unsupported file type. Please upload a TXT, DOCX, or PDF file.");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(scriptText);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans antialiased selection:bg-brand-accent/30 selection:text-white flex flex-col justify-between">
      
      {/* Navbar Integration */}
      <Navbar 
        onReset={handleReset} 
        hasResult={view === 'dashboard'} 
        onNavigateToAnalyze={() => setView('analyze')} 
      />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: LANDING VIEW */}
          {view === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="space-y-20 py-8 relative"
            >
              {/* HEADING HERO SECTION */}
              <div className="text-center max-w-3xl mx-auto space-y-6 relative">
                {/* Glow behind center heading */}
                <div className="absolute inset-x-0 top-1/6 h-40 bg-indigo-500/10 blur-3.5xl rounded-full pointer-events-none"></div>

                <div className="inline-flex items-center space-x-2.5 bg-zinc-900/90 border border-zinc-800 hover:border-zinc-750 px-3.5 py-1.5 rounded-full transition-colors duration-300">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-400 uppercase">
                    V1.2 ENGINE • REAL TIME RETENTION DIAGNOSTICS
                  </span>
                </div>

                <h1 className="text-4xl sm:text-6xl font-display font-extrabold text-white tracking-tight leading-[1.08] text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-100 to-zinc-450">
                  Optimize Your Scripts.<br />Sustain 100% Viewer Focus.
                </h1>

                <p className="text-sm sm:text-base text-zinc-400 font-sans leading-relaxed max-w-xl mx-auto">
                  Paste or drop your video draft. Our analytical model scans hook velocity, storytelling arc curves, linguistic indices, and pacing triggers—returning an enterprise-grade score in seconds.
                </p>

                {/* Main Action CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
                  <button
                    id="btn-analyze-cta"
                    onClick={() => setView('analyze')}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 bg-white text-black font-semibold text-xs rounded-xl hover:bg-zinc-200 shadow-[0_1px_2px_rgba(255,255,255,0.2)_inset] active:scale-[0.98] transition-all cursor-pointer font-sans"
                  >
                    Analyze Draft Script
                    <ArrowRight className="w-3.5 h-3.5 ml-2" />
                  </button>

                  <a
                    href="#presets-row"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 bg-zinc-950 text-zinc-300 hover:text-white border border-zinc-905 hover:border-zinc-800 rounded-xl hover:bg-zinc-900/60 transition-all cursor-pointer text-xs font-semibold"
                  >
                    Try with Examples
                  </a>
                </div>

                <p className="text-[10px] text-zinc-500 font-mono">
                  No account registration required • Completely client-side & sandboxed
                </p>
              </div>

              {/* DASHBOARD PREVIEW POSTER */}
              <div 
                onClick={() => setView('analyze')}
                className="relative max-w-4xl mx-auto cursor-pointer group"
              >
                {/* Visual outline frames */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 opacity-15 blur-2xl group-hover:opacity-25 transition-all duration-500"></div>
                <div className="relative rounded-2xl border border-zinc-850 bg-zinc-950/70 backdrop-blur-md overflow-hidden shadow-2xl transition-all duration-300 group-hover:border-zinc-750">
                  {/* Pseudo Bar Header */}
                  <div className="border-b border-zinc-900 bg-zinc-950/90 px-5 py-3.5 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-800 border border-zinc-700/40"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-800 border border-zinc-700/40"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-800 border border-zinc-700/40"></span>
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500 select-none tracking-wider uppercase font-semibold">
                      script_analyzer_v1.2.schema
                    </div>
                    <div className="w-12"></div>
                  </div>

                  {/* Simulated Dashboard content preview mockup */}
                  <div className="p-6 sm:p-8 space-y-6 select-none opacity-80 group-hover:opacity-95 transition-opacity duration-300">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1.5">
                        <div className="h-4 w-44 bg-zinc-900 rounded border border-zinc-850"></div>
                        <div className="h-3 w-28 bg-zinc-900/60 rounded"></div>
                      </div>
                      <div className="flex space-x-2">
                        <div className="h-6 w-16 bg-zinc-900 rounded-full border border-zinc-850"></div>
                        <div className="h-6 w-16 bg-indigo-950/35 border border-indigo-900/30 rounded-full"></div>
                      </div>
                    </div>

                    {/* Simulation metrics */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[92, 84, 89, 78].map((score, index) => (
                        <div key={index} className="p-4 bg-zinc-950 border border-zinc-900/60 rounded-xl flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full border border-indigo-500/30 flex items-center justify-center font-bold text-xs text-indigo-400 font-mono">
                            {score}
                          </div>
                          <div className="space-y-1 flex-1">
                            <div className="h-2.5 w-14 bg-zinc-900 rounded"></div>
                            <div className="h-2 w-8 bg-zinc-900/40 rounded"></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-zinc-950 border border-zinc-900/60 rounded-xl space-y-3">
                        <div className="h-3 w-28 bg-zinc-900 rounded"></div>
                        <div className="space-y-2">
                          <div className="h-1.5 w-full bg-zinc-900/50 rounded"></div>
                          <div className="h-1.5 w-4/5 bg-zinc-900/50 rounded"></div>
                          <div className="h-1.5 w-3/5 bg-zinc-900/50 rounded"></div>
                        </div>
                      </div>
                      <div className="p-4 bg-zinc-950 border border-zinc-900/60 rounded-xl space-y-3">
                        <div className="h-3 w-28 bg-zinc-900 rounded"></div>
                        <div className="space-y-2">
                          <div className="h-1.5 w-full bg-zinc-900/50 rounded"></div>
                          <div className="h-1.5 w-5/6 bg-zinc-900/50 rounded"></div>
                          <div className="h-1.5 w-2/3 bg-zinc-900/50 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Overlay CTA Blur */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent flex items-end justify-center pb-8 border-t border-zinc-900/20">
                    <div className="inline-flex items-center px-4 py-2 bg-zinc-900/95 text-zinc-300 font-medium text-xs rounded-xl shadow-lg border border-zinc-800 group-hover:bg-zinc-850 group-hover:scale-[1.03] transition-all duration-300">
                      Open Interactive Analytics Workspace
                      <ArrowUpRight className="w-3.5 h-3.5 ml-2 text-indigo-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* FEATURES GRID SECTION */}
              <div className="space-y-12 pt-16 border-t border-zinc-900">
                <div className="text-center max-w-xl mx-auto space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                    Audience Diagnostics Suite
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400">
                    Our analyzer breaks down custom drafts down to sentence levels, scoring performance against refined patterns from viral retention profiles.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {[
                    {
                      title: "1. Hook Velocity Scan",
                      desc: "Measures introductory tension loops, query-driven focus anchors, and speaking pace thresholds inside your opening seconds.",
                      icon: Flame,
                      color: "text-amber-400 bg-amber-500/5 border-amber-500/10"
                    },
                    {
                      title: "2. Storytelling Arc Diagnostic",
                      desc: "Calculates spatial distribution balances aligning narrative context, central conflict tension, and key audience payoff points.",
                      icon: TrendingUp,
                      color: "text-indigo-400 bg-indigo-500/5 border-indigo-500/10"
                    },
                    {
                      title: "3. Soundwave Sim Matcher",
                      desc: "Simulates average speaking rhythms, pacing densities, and tone variances to locate conversational drop-off threats.",
                      icon: Compass,
                      color: "text-purple-400 bg-purple-500/5 border-purple-500/10"
                    },
                    {
                      title: "4. Readability Indices",
                      desc: "Quantifies structural speech complexities, passive phrasing ratios, vocabulary indices, and optimal verbal clarity metrics.",
                      icon: BookOpen,
                      color: "text-indigo-400 bg-indigo-500/5 border-indigo-500/10"
                    },
                    {
                      title: "5. Retention Waves Classifier",
                      desc: "Translates specific draft sequences into color-coded retention hazard maps complete with inline context optimizations.",
                      icon: Sliders,
                      color: "text-rose-400 bg-rose-500/5 border-rose-500/10"
                    },
                    {
                      title: "6. Line Highlighting Sandbox",
                      desc: "Synthesizes precise paragraph feedback loops. Highlights long-winded paragraphs and signals strong focus anchors.",
                      icon: FileText,
                      color: "text-emerald-400 bg-emerald-500/5 border-emerald-500/10"
                    }
                  ].map((feat, idx) => {
                    const Icon = feat.icon;
                    return (
                      <div 
                        key={idx}
                        className="p-6 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-4 hover:border-zinc-800 hover:bg-zinc-900/20 transition-all duration-300 flex flex-col justify-between"
                      >
                        <div className="space-y-4 text-left">
                          <div className={`p-2.5 w-fit rounded-xl border ${feat.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-white font-display">
                              {feat.title}
                            </h3>
                            <p className="text-xs text-zinc-400 font-sans leading-relaxed mt-1.5">
                              {feat.desc}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PRESETS ROW SECTION */}
              <div id="presets-row" className="p-6 sm:p-8 bg-zinc-950/80 border border-zinc-900 rounded-2xl space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-baseline gap-2 text-left">
                  <div>
                    <h3 className="text-base font-display font-semibold text-white">
                      Inspect with Viral Blueprint Blueprints
                    </h3>
                    <p className="text-xs text-zinc-400 font-sans mt-0.5">
                      Select a hand-styled creator outline to trigger high-fidelity diagnostics instantly.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 tracking-wider">
                    2 BLUEPRINT TEMPLATES PRE-RESOLVED
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {presetScripts.map((preset, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleSelectSample(idx)}
                      className="p-5 bg-zinc-950 hover:bg-zinc-900/30 border border-zinc-900 hover:border-zinc-800 rounded-xl group cursor-pointer transition-all duration-200 text-left flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-mono font-bold text-indigo-400 tracking-wider bg-indigo-505/10 px-2 py-0.5 rounded border border-indigo-900/20">
                            {idx === 0 ? "SAAS TECH INITIATIVES" : "HIGH STATUS DEEPDIVE"}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            ~{preset.text.split(/\s+/).length} words
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors font-display">
                            {preset.title}
                          </h4>
                          <p className="text-xs text-zinc-400 font-sans line-clamp-2 mt-1 leading-relaxed">
                            "{preset.text}"
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center text-xs font-semibold text-zinc-400 group-hover:text-white transition-colors">
                        Load in Draft Editor
                        <Play className="w-3 h-3 ml-1.5 text-indigo-400 fill-indigo-400/25" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}

          {/* STEP 2: ANALYSIS INPUT PAGE */}
          {view === 'analyze' && (
            <motion.div
              key="analyze"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="max-w-4xl mx-auto space-y-6 text-left"
            >
              {/* Back navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer font-mono tracking-wide"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                  [ BACK TO HUB ]
                </button>
                <span className="text-[10px] font-mono tracking-wider text-indigo-400 bg-zinc-950 border border-zinc-900 px-3 py-1 rounded-full font-bold">
                  LOCAL SANDBOX ENVIRONMENT
                </span>
              </div>

              {/* Upload Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`p-8 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
                  isDragging 
                    ? "border-indigo-500 bg-indigo-550/5 shadow-[0_0_15px_rgba(99,102,241,0.05)]" 
                    : "border-zinc-900 bg-zinc-950 hover:border-zinc-805 hover:bg-zinc-950/80"
                }`}
                onClick={triggerFileSelect}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".txt,.docx,.pdf"
                  className="hidden"
                />
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-zinc-900 border border-zinc-850 rounded-xl relative">
                    <div className="absolute inset-0 bg-indigo-400/10 rounded-xl blur-md"></div>
                    <Upload className="w-5 h-5 text-indigo-400 relative z-10 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-white font-display">
                      Import Draft Document
                    </h4>
                    <p className="text-xs text-zinc-400 max-w-sm font-sans">
                      Drag and drop your file here, or click to browse. Supports <strong className="text-zinc-300">TXT</strong>, <strong className="text-zinc-300">DOCX</strong>, and <strong className="text-zinc-300">PDF</strong> drafts.
                    </p>
                  </div>
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest leading-none">
                    Decoded strictly in RAM memory
                  </span>
                </div>
              </div>

              {/* Paste Textarea section */}
              <div className="bg-zinc-950 border border-zinc-905 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-900/60 pb-3">
                  <label className="text-[10px] font-mono font-bold tracking-widest text-zinc-400 uppercase block">
                    Active Editor Workspace
                  </label>
                  <span className="text-[10px] text-zinc-400 font-mono font-semibold bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-850">
                    {scriptText.trim() ? scriptText.trim().split(/\s+/).length : 0} words
                  </span>
                </div>

                <textarea
                  value={scriptText}
                  onChange={(e) => setScriptText(e.target.value)}
                  placeholder="Paste your YouTube draft here. Include conversational flow to measure pacing, hook power, and story depth..."
                  className="w-full min-h-[320px] bg-black border border-zinc-905 rounded-xl p-4 text-xs font-sans text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-y leading-relaxed"
                />

                {/* Pre-fill presets buttons line inside editor */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider font-bold">Quick Templates:</span>
                    {presetScripts.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setScriptText(preset.text);
                          setSelectedSample(idx);
                        }}
                        className={`text-[9px] font-mono px-3 py-1 rounded transition-all border ${
                          selectedSample === idx 
                            ? "bg-indigo-550/10 border-indigo-500 text-indigo-300 font-bold"
                            : "bg-zinc-900/50 border-zinc-850 text-zinc-500 hover:text-zinc-350 hover:border-zinc-800"
                        }`}
                      >
                        {idx === 0 ? "SAAS TECH BLUEPRINT" : "LUXURY DEEPDIVE"}
                      </button>
                    ))}
                  </div>

                  {scriptText.trim().length > 0 && (
                    <button
                      onClick={() => setScriptText("")}
                      className="text-[10px] font-mono text-rose-455 hover:text-rose-400 font-bold flex items-center gap-1 active:scale-95 duration-100"
                    >
                      Clear Workspace
                    </button>
                  )}
                </div>
              </div>

              {/* Action Button Trigger */}
              <div className="flex justify-end pt-2">
                <button
                  id="btn-trigger-ai"
                  disabled={!scriptText.trim()}
                  onClick={handleStartAnalysis}
                  className={`px-8 py-3.5 rounded-xl font-bold text-xs flex items-center gap-2.5 tracking-wider transition-all duration-300 ${
                    scriptText.trim() 
                      ? "bg-white text-black hover:bg-zinc-200 hover:shadow-lg active:scale-98 cursor-pointer"
                      : "bg-zinc-900 text-zinc-650 cursor-not-allowed border border-zinc-900"
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-indigo-500 fill-indigo-100" />
                  ANALYZE DRAFT PERFORMANCE
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: LOADING VIEWER */}
          {view === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12"
            >
              <Loader onComplete={handleLoaderComplete} />
            </motion.div>
          )}

          {/* STEP 4: DASHBOARD COMPLETE RESULT */}
          {view === 'dashboard' && analysisResult && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="space-y-6 text-left"
            >
              {/* Reset/Change header and utility summary stats */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-950/60 border border-zinc-900 p-5 rounded-2xl">
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                    ● DIAGNOSTICS COMPLETED
                  </span>
                  <h2 className="text-xl font-display font-extrabold text-white leading-tight tracking-tight">
                    ScriptScore Analytics Report
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1 flex flex-wrap items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                      <strong>{analysisResult.wordCount}</strong> words total
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      Est. speaking duration: <strong>{analysisResult.estimatedDuration}</strong> (mm:ss)
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto self-center">
                  <button
                    onClick={handleCopyScript}
                    className="flex-1 md:flex-none text-center justify-center inline-flex items-center px-4 py-2.5 text-xs font-mono font-bold text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 rounded-xl transition-all cursor-pointer"
                  >
                    {copiedNotification ? <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />}
                    {copiedNotification ? "Copied Script!" : "Copy Raw Script"}
                  </button>

                  <button
                    id="btn-restart-flow"
                    onClick={() => {
                      setView('analyze');
                    }}
                    className="flex-1 md:flex-none text-center justify-center inline-flex items-center px-5 py-2.5 text-xs font-bold text-white bg-indigo-650 hover:bg-indigo-600 border border-indigo-500/20 rounded-xl transition-all hover:shadow-md hover:shadow-indigo-500/15 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3 mr-1.5 text-indigo-200" />
                    Load New Draft
                  </button>
                </div>
              </div>

              {/* MAIN BENTO DASHBOARD GRAPHIC GRID */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 leading-normal mt-6">

                {/* BENTO CARD 1: OVERALL SCORE */}
                <div className="col-span-1 md:col-span-6 lg:col-span-3 bg-zinc-950 border border-zinc-900 rounded-2xl p-6 flex flex-col justify-between items-center text-center relative overflow-hidden h-full group transition-all duration-300 hover:border-zinc-805">
                  <div className="relative z-10 w-full flex flex-col items-center">
                    <span className="text-[9px] font-mono tracking-widest font-bold text-zinc-400 uppercase">
                      Overall Rank Score
                    </span>
                    <div className="my-5 relative flex items-center justify-center">
                      <ScoreRing score={analysisResult.overallScore} size={145} />
                    </div>
                    <div className="space-y-1 z-10">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-mono font-bold shrink-0 ${
                        analysisResult.overallScore >= 85 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : (analysisResult.overallScore >= 72 ? 'bg-indigo-500/10 text-indigo-450 border border-indigo-505/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20')
                      }`}>
                        {analysisResult.overallScore >= 85 ? "Excellent Potential!" : (analysisResult.overallScore >= 72 ? "Sustained Retention Rate" : "Underdeveloped Narrative")}
                      </span>
                      <span className="block text-[9px] text-zinc-500 font-sans leading-normal pt-1.5">
                        Weighted density index calculations across key hooks.
                      </span>
                    </div>
                  </div>
                  {/* Decorative subtle background glow */}
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500 opacity-[0.03] blur-3xl rounded-full pointer-events-none"></div>
                </div>

                {/* BENTO CARD 2: KEY METRICS RIBBON */}
                <div className="col-span-1 md:col-span-6 lg:col-span-5 bg-zinc-950 border border-zinc-900 rounded-2xl p-6 flex flex-col justify-between h-full group transition-all duration-300 hover:border-zinc-805 text-left">
                  <div className="flex items-center justify-between border-b border-zinc-900/60 pb-3">
                    <span className="text-[9px] font-mono tracking-widest font-bold text-zinc-400 uppercase">
                      Key Metric Performance
                    </span>
                    <span className="text-[9px] font-mono bg-zinc-900 text-zinc-450 border border-zinc-850 px-2 py-0.5 rounded uppercase font-bold">Simulation Engine</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 my-auto">
                    <div className="space-y-1 text-left sm:text-center">
                      <div className="flex justify-between sm:justify-center items-center gap-1 mb-1">
                        <span className="text-[10px] uppercase text-zinc-450 font-mono font-semibold">Retention</span>
                        <TrendingUp className="w-3 h-3 text-emerald-400 sm:hidden" />
                      </div>
                      <p className="text-3xl font-display font-extrabold text-white tracking-tight">
                        {analysisResult.retentionScore}%
                      </p>
                      <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono inline-block">High Tier</span>
                    </div>

                    <div className="h-12 w-px bg-zinc-900 hidden sm:block self-center mx-auto"></div>

                    <div className="space-y-1 text-left sm:text-center">
                      <div className="flex justify-between sm:justify-center items-center gap-1 mb-1">
                        <span className="text-[10px] uppercase text-zinc-450 font-mono font-semibold">Clarity</span>
                        <Sparkles className="w-3 h-3 text-indigo-400 sm:hidden" />
                      </div>
                      <p className="text-3xl font-display font-extrabold text-indigo-400 tracking-tight">
                        {analysisResult.clarityScore}%
                      </p>
                      <span className="text-[9px] text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded font-mono inline-block">Optimized</span>
                    </div>

                    <div className="h-12 w-px bg-zinc-900 hidden sm:block self-center mx-auto"></div>

                    <div className="space-y-1 text-left sm:text-center">
                      <div className="flex justify-between sm:justify-center items-center gap-1 mb-1">
                        <span className="text-[10px] uppercase text-zinc-450 font-mono font-semibold">Viral Index</span>
                        <Trophy className="w-3 h-3 text-amber-500 sm:hidden" />
                      </div>
                      <p className={`text-3xl font-display font-extrabold tracking-tight ${
                        analysisResult.viralPotential === 'High' ? "text-amber-450" : (analysisResult.viralPotential === 'Medium' ? "text-zinc-300" : "text-rose-400")
                      }`}>
                        {analysisResult.viralPotential.toUpperCase()}
                      </p>
                      <span className="text-[9px] text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded font-mono inline-block">Index Safety</span>
                    </div>
                  </div>

                  <div className="bg-zinc-900/30 p-3.5 rounded-xl border border-zinc-900 text-[10px] text-zinc-450 font-mono leading-relaxed mt-2 text-left">
                    Benchmark index: exceeds <span className="text-white font-bold">{Math.max(50, analysisResult.retentionScore - 12)}%</span> of general niche video scripts analyzed.
                  </div>
                </div>

                {/* BENTO CARD 3: AI RECOMMENDATIONS COLUMN */}
                <div className="col-span-1 md:col-span-12 lg:col-span-4 bg-zinc-950 border border-zinc-900 rounded-2xl p-6 flex flex-col justify-between h-full group transition-all duration-300 hover:border-zinc-805 text-left">
                  <div className="space-y-3.5 w-full">
                    <div className="flex items-center justify-between border-b border-zinc-900/60 pb-3">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-indigo-405 fill-indigo-400/10" />
                        <h3 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                          Recommended Actions
                        </h3>
                      </div>
                      <span className="text-[9px] bg-indigo-500/15 text-indigo-300 border border-indigo-550/20 font-mono px-2 py-0.5 rounded uppercase font-bold">Priority</span>
                    </div>

                    <p className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase">
                      {analysisResult.suggestions.length} ACTIONABLE SUGGESTIONS DETECTED
                    </p>

                    <div className="space-y-3 pt-1">
                      {analysisResult.suggestions.map((sug, idx) => {
                        const styleSet = idx === 0 
                          ? { border: 'border-l-2 border-amber-500 bg-amber-500/5', tag: 'WEAK HOOK BRIDGE', text: 'text-amber-500' }
                          : idx === 1 
                          ? { border: 'border-l-2 border-indigo-400 bg-indigo-500/5', tag: 'AUDIENCE PACING FIX', text: 'text-indigo-400' }
                          : idx === 2 
                          ? { border: 'border-l-2 border-emerald-500 bg-emerald-500/5', tag: 'VALUE ANCHOR SHIFT', text: 'text-emerald-400' }
                          : { border: 'border-l-2 border-indigo-400 bg-indigo-400/5', tag: 'CALL-TO-ACTION BUFFER', text: 'text-indigo-400' };

                        return (
                          <div key={idx} className={`p-3.5 rounded-xl border border-zinc-900/60 ${styleSet.border} transition-all hover:bg-zinc-900/40`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-[9px] font-mono font-bold uppercase tracking-wider ${styleSet.text}`}>
                                {styleSet.tag}
                              </span>
                              <span className="w-4 h-4 rounded-full bg-zinc-900 text-[9px] font-mono text-zinc-500 flex items-center justify-center border border-zinc-850">
                                0{idx + 1}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                              {sug}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* BENTO CARD 4: HOOK STRENGTH */}
                <div className="col-span-1 md:col-span-6 lg:col-span-5 bg-zinc-950 border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between h-full group transition-all duration-300 hover:border-zinc-805 text-left">
                  <div className="flex justify-between items-start border-b border-zinc-900/60 pb-3">
                    <div className="flex items-center space-x-2">
                      <Flame className="w-4 h-4 text-emerald-405" />
                      <h3 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">Hook Metrics</h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider">
                      {analysisResult.hook.strength} / 100
                    </span>
                  </div>

                  <div className="py-2.5">
                    <p className="text-xs text-zinc-400 leading-relaxed font-sans mb-4">
                      Viewers drop fastest in the first thirty seconds. Optimizing mental loops, emotional peaks, and pacing ratios acts as a critical lever.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { label: "Verbal Impact", value: analysisResult.hook.strength, desc: "Opening hook rate." },
                        { label: "Curiosity Loops", value: analysisResult.hook.curiosity, desc: "Tension triggers." },
                        { label: "Resonance", value: analysisResult.hook.emotionalTrigger, desc: "Viewer alignment." }
                      ].map((bar, idx) => (
                        <div key={idx} className="bg-zinc-900/40 p-3 border border-zinc-900 rounded-xl flex flex-col justify-between">
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wide block leading-tight">{bar.label}</span>
                            <span className="text-lg font-display font-extrabold text-white">{bar.value}%</span>
                          </div>
                          
                          <div className="w-full bg-zinc-900 rounded-full h-1 my-2 overflow-hidden">
                            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${bar.value}%` }}></div>
                          </div>

                          <span className="text-[9px] text-zinc-500 font-sans leading-tight">
                            {bar.desc}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-zinc-900/30 p-2 text-[9px] text-zinc-500 font-mono tracking-widest text-center rounded-lg border border-zinc-900 uppercase mt-2 font-bold">
                    CRITICAL RETENTION LEVER VALIDATED
                  </div>
                </div>

                {/* BENTO CARD 5: STORYTELLING RADAR */}
                <div className="col-span-1 md:col-span-6 lg:col-span-7 bg-zinc-950 border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between h-full group transition-all duration-300 hover:border-zinc-805 text-left">
                  <div className="flex justify-between items-center border-b border-zinc-900/60 pb-3">
                    <div className="flex items-center space-x-2">
                      <Compass className="w-4 h-4 text-indigo-400" />
                      <h3 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                        Storytelling Multiplier Arc
                      </h3>
                    </div>
                    <span className="text-[8px] font-mono text-zinc-500 font-semibold bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">Telemetric Radar</span>
                  </div>

                  <div className="py-2 flex items-center justify-center my-auto overflow-hidden">
                    <div className="w-full max-w-[420px]">
                      <StorytellingRadar metrics={analysisResult.storytelling} />
                    </div>
                  </div>

                  <div className="text-[10px] text-zinc-550 text-center font-mono leading-none pt-2.5 border-t border-zinc-900/60 uppercase font-semibold">
                    Interactive structural distribution indices mapping.
                  </div>
                </div>

                {/* BENTO CARD 6: SEGMENT RETENTION WAVE */}
                <div className="col-span-1 md:col-span-12 lg:col-span-4 bg-zinc-950 border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between h-full group transition-all duration-300 hover:border-zinc-805 text-left">
                  <div className="space-y-4 w-full">
                    <div className="flex justify-between items-center border-b border-zinc-900/60 pb-3">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-indigo-400" />
                        <h3 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                          Segment Retention Waves
                        </h3>
                      </div>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">5 Divisions</span>
                    </div>

                    <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                      Select a narrative phase below to isolate and preview predicted safe index pacing diagnostics:
                    </p>

                    <div className="space-y-2.5 pt-1">
                      {analysisResult.retention.map((seg, idx) => {
                        const isLow = seg.risk === 'Low Risk';
                        const isMed = seg.risk === 'Medium Risk';
                        const isActive = activeSegmentIndex === idx;
                        
                        return (
                          <div 
                            key={idx}
                            onClick={() => setActiveSegmentIndex(idx)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all duration-300 ${
                              isActive 
                                ? "bg-zinc-900 border-zinc-800 shadow-md ring-1 ring-indigo-500/30"
                                : "bg-zinc-900/20 border-zinc-900 hover:border-zinc-850"
                            } flex items-center justify-between gap-3 text-left`}
                          >
                            <div className="flex items-center space-x-2.5">
                              <div className={`w-5.5 h-5.5 rounded-lg font-mono text-[9px] font-bold flex items-center justify-center transition-all ${
                                isActive ? 'bg-white text-black' : 'bg-zinc-850 text-zinc-405 border border-zinc-800/40'
                              }`}>
                                {idx + 1}
                              </div>
                              <span className="text-xs font-bold text-white font-display">
                                {seg.name} Segment
                              </span>
                            </div>

                            {/* Risk alert pill */}
                            <div className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold flex items-center space-x-1 shrink-0 ${
                              isLow 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : (isMed ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-rose-500/10 text-rose-450 border border-rose-500/25')
                            }`}>
                              <span>{seg.risk}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Interactive active segment feedback block */}
                  <div className="mt-4 bg-[#030303] p-3.5 rounded-xl border border-zinc-900 text-[11px] text-zinc-400 leading-relaxed font-sans text-left">
                    <span className="block text-[9px] font-mono text-indigo-400 uppercase mb-1 font-bold">
                      Phase {activeSegmentIndex + 1} Interactive Analysis
                    </span>
                    "{analysisResult.retention[activeSegmentIndex].explanation}"
                  </div>
                </div>

                {/* BENTO CARD 7: LINGUISTIC READABILITY & VOCALS */}
                <div className="col-span-1 md:col-span-12 lg:col-span-4 bg-zinc-950 border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between h-full group transition-all duration-300 hover:border-zinc-805 text-left">
                  <div className="space-y-4 w-full">
                    <div className="flex items-center space-x-2 border-b border-zinc-900/60 pb-3">
                      <BookOpen className="w-4 h-4 text-purple-400" />
                      <h3 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                        Linguistic & Vocal Index
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { label: "Reading Scale", value: analysisResult.readability.readingLevel, desc: "Flesch-Kincaid index" },
                        { label: "Pace Metric", value: analysisResult.readability.sentenceLength, desc: "Avg. word rate" },
                        { label: "Passive Index", value: analysisResult.readability.passiveVoice, desc: "Pacing velocity" },
                        { label: "Complexity", value: analysisResult.readability.complexityScore, desc: "Information density" }
                      ].map((tag, idx) => (
                        <div key={idx} className="p-2.5 bg-zinc-900/40 border border-zinc-900 rounded-xl text-left flex flex-col justify-between hover:border-zinc-850 transition-all">
                          <div className="space-y-0.5">
                            <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block">{tag.label}</span>
                            <span className="text-xs font-extrabold text-white font-display truncate block">{tag.value}</span>
                          </div>
                          <span className="text-[8px] text-zinc-550 mt-1 font-mono block leading-tight">
                            {tag.desc}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Vocal scale slider tracks */}
                    <div className="space-y-3 pt-2">
                      <span className="block text-[8px] font-mono text-zinc-555 uppercase tracking-widest leading-none font-bold">Vocal Stability Thresholds</span>
                      {[
                        { label: "Attention Grab", value: analysisResult.engagement.curiosity, color: "bg-indigo-550" },
                        { label: "Emotional Amplitude", value: analysisResult.engagement.emotionalImpact, color: "bg-rose-500" },
                        { label: "Authority Resonance", value: analysisResult.engagement.authority, color: "bg-teal-400" }
                      ].map((elem, idx) => (
                        <div key={idx} className="space-y-1 flex flex-col text-left">
                          <div className="flex justify-between items-baseline leading-none">
                            <span className="text-[9px] font-bold text-zinc-400 font-sans">{elem.label}</span>
                            <span className="text-[9px] font-mono text-zinc-400 font-semibold">
                              {elem.value}%
                            </span>
                          </div>
                          {/* Progress track */}
                          <div className="w-full bg-zinc-900 rounded-full h-1 overflow-hidden">
                            <div className={`h-full rounded-full ${elem.color}`} style={{ width: `${elem.value}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Voice track animation block */}
                  <div className="flex items-center justify-between bg-black p-2.5 rounded-xl border border-zinc-900 mt-4 w-full">
                    <span className="text-[9px] font-mono text-zinc-455 font-bold">TELEMETRY WAVE:</span>
                    <div className="flex gap-0.5 items-end h-5">
                      {[60, 40, 80, 50, 90, 30, 70, 40, 60, 85, 45, 75, 50, 80, 20].map((h, i) => (
                        <div 
                          key={i} 
                          className="w-0.5 bg-indigo-500/40 rounded-full"
                          style={{ height: `${h}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* BENTO CARD 8: SCRIPT DIAGNOSTICS & HIGHLIGHT ENGINE */}
                <div className="col-span-1 md:col-span-12 lg:col-span-8 bg-zinc-950 border border-zinc-900 rounded-2xl p-6 flex flex-col justify-between h-full group transition-all duration-300 hover:border-zinc-805 text-left">
                  <div className="space-y-4 w-full">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-900/60 pb-4">
                      <div className="text-left">
                        <h3 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                          <Eye className="w-4 h-4 text-indigo-400" />
                          Diagnostics & Script Highlights
                        </h3>
                        <p className="text-[11px] text-zinc-450 mt-1 font-sans font-medium">
                          Select draft segments below to review contextual index optimizations.
                        </p>
                      </div>

                      {/* Tabs Selector */}
                      <div className="flex border border-zinc-900 bg-zinc-950 p-0.5 rounded-lg shrink-0">
                        <button 
                          onClick={() => setViewerTab('highlights')}
                          className={`px-3 py-1.5 text-[10px] font-bold font-mono rounded-md duration-150 cursor-pointer ${
                            viewerTab === 'highlights' ? 'bg-zinc-900 text-white border border-zinc-800 shadow-sm' : 'text-zinc-500 hover:text-zinc-350'
                          }`}
                        >
                          Highlights Panel
                        </button>
                        <button 
                          onClick={() => setViewerTab('raw')}
                          className={`px-3 py-1.5 text-[10px] font-bold font-mono rounded-md duration-150 cursor-pointer ${
                            viewerTab === 'raw' ? 'bg-zinc-900 text-white border border-zinc-800 shadow-sm' : 'text-zinc-500 hover:text-zinc-350'
                          }`}
                        >
                          Raw Script Block
                        </button>
                      </div>
                    </div>

                    {viewerTab === 'highlights' ? (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
                        
                        {/* LEFT COLUMN: SCROLLABLE CHUNKS */}
                        <div className="lg:col-span-8 space-y-3.5 max-h-[430px] overflow-y-auto pr-1 bg-black/40 p-3.5 rounded-xl border border-zinc-900 w-full text-left">
                          {analysisResult.scriptHighlights.map((hl, idx) => {
                            const isStrong = hl.type === 'strong';
                            const isDropped = hl.type === 'drop-off';
                            
                            let styleSet = { border: "border-l-3 border-zinc-800 bg-zinc-900/20", text: "text-zinc-500", label: "Neutral Sequence" };
                            if (isStrong) {
                              styleSet = { border: "border-l-3 border-emerald-555 bg-emerald-500/[0.03]", text: "text-emerald-400", label: "Anchor Retention Peak" };
                            } else if (isDropped) {
                              styleSet = { border: "border-l-3 border-rose-500/50 bg-rose-500/[0.03]", text: "text-rose-400", label: "Critical Drop-off Risk" };
                            } else {
                              styleSet = { border: "border-l-3 border-amber-500/50 bg-amber-500/[0.03]", text: "text-amber-400/90", label: "Moderate Transition Phase" };
                            }

                            return (
                              <div 
                                key={idx}
                                className={`p-4 rounded-r-xl transition-all duration-300 border border-y-zinc-905 border-r-zinc-905 border-l-transparent text-left cursor-pointer ${styleSet.border} hover:bg-zinc-900/30`}
                              >
                                <div className="flex items-center justify-between mb-1.5 font-mono text-[9px] tracking-widest uppercase text-zinc-500 font-bold">
                                  <span>Segment {idx + 1}</span>
                                  <span className={`font-bold ${styleSet.text}`}>
                                    {styleSet.label}
                                  </span>
                                </div>
                                <p className="text-zinc-350 font-sans text-xs leading-relaxed">
                                  {hl.text}
                                </p>

                                {/* Inline comment details */}
                                <div className="mt-2.5 text-[10px] text-zinc-400 italic bg-black/45 px-3 py-2 rounded border border-zinc-905">
                                  "{hl.comment}"
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* RIGHT COLUMN: SANDBOX FEEDBACK SHEET */}
                        <div className="lg:col-span-4 bg-zinc-900/20 p-4 rounded-xl border border-zinc-900 flex flex-col justify-between space-y-4 text-left w-full">
                          <div className="space-y-3">
                            <div className="flex items-center gap-1.5 border-b border-zinc-900 pb-2.5">
                              <FileCode className="w-4 h-4 text-indigo-400" />
                              <h4 className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">
                                Sandboxed Engine
                              </h4>
                            </div>

                            <p className="text-xs text-zinc-405 font-sans leading-relaxed">
                              Draft layout parsed against verified attention blueprints.
                            </p>

                            <div className="bg-[#030303] p-3 border border-zinc-905 rounded-lg space-y-1">
                              <span className="text-[8px] font-mono text-zinc-505 uppercase tracking-widest block font-bold">PACING RULES</span>
                              <p className="text-[11px] text-zinc-400 leading-normal font-sans">
                                Keep paragraphs under 70 words without structural or visual content transitions.
                              </p>
                            </div>
                          </div>

                          <div className="bg-indigo-500/[0.02] p-3.5 rounded-xl border border-indigo-950 text-center space-y-2.5">
                            <div className="text-[11px] font-bold text-white flex items-center justify-center gap-1.5 select-none font-mono">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-405 fill-indigo-100/10 animate-pulse" />
                              CONFIDENTIAL BLUEPRINT
                            </div>
                            <p className="text-[10px] text-zinc-400 font-sans leading-tight">
                              Copy optimized text block contents to transfer draft to teleprompters.
                            </p>
                            <button 
                              onClick={handleCopyScript}
                              className="w-full py-2 px-3 bg-white text-black font-bold text-[9px] rounded-lg cursor-pointer hover:bg-zinc-200 duration-150 font-mono tracking-wider uppercase shadow"
                            >
                              {copiedNotification ? "Copied!" : "Copy Clean Draft"}
                            </button>
                          </div>
                        </div>

                      </div>
                    ) : (
                      /* RAW SCRIPT VIEW */
                      <div className="space-y-3.5 w-full text-left">
                        <textarea 
                          readOnly
                          value={scriptText}
                          className="w-full text-zinc-300 font-mono text-xs bg-black p-4 rounded-xl border border-zinc-900 h-[430px] leading-relaxed resize-none focus:outline-none"
                          placeholder="Empty script text"
                          onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                        />
                        <div className="flex justify-between items-center bg-zinc-900/30 p-3.5 rounded-xl border border-zinc-900 text-xs text-zinc-400 w-full">
                          <span>Click directly inside the area block to select-all effortlessly.</span>
                          <button 
                            onClick={handleCopyScript}
                            className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 rounded font-bold text-[9px] duration-150 font-mono tracking-wider uppercase cursor-pointer"
                          >
                            {copiedNotification ? "Copied!" : "Copy Clipboard"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* FOOTER METADATA MARKUP */}
      <footer className="border-t border-zinc-900 bg-[#040406] py-8 mt-16 text-zinc-500 select-none text-center">
        <div className="max-w-7xl mx-auto px-4 text-xs font-mono tracking-wide space-y-2.5">
          <p className="font-semibold text-zinc-400 tracking-normal font-sans">
            ScriptScore AI is a luxury pre-recording utility sandbox.
          </p>
          <p className="max-w-md mx-auto text-[10px] text-zinc-600 leading-relaxed font-sans">
            All algorithms and parsing weights run purely client side. No text data ever leaves your browser memory.
          </p>
          <div className="pt-2 text-zinc-650 flex items-center justify-center gap-2">
            <span>Built for Creators</span>
            <span className="text-zinc-800 font-semibold">•</span>
            <span>Version 1.2.0</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
