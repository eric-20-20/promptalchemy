import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, Copy, Terminal, Bot, Zap, Code2, BrainCircuit, Check, 
  Clock, Trash2, RotateCcw, MessageSquare,
  LayoutTemplate, Rocket, Wind, Aperture, Plus, Save, Edit2, 
  Download, Upload, ChevronRight, Settings2, Play, Mail, Camera,
  BookTemplate, FileText, X, AlertCircle, Loader2, FileJson, 
  ArrowLeftRight, List, FileDown, Shield, Coins, Scale, AlertTriangle, History,
  Info
} from 'lucide-react';

// --- 1. DATA: MODELS ---
const MODELS = [
  {
    id: 'claude',
    name: 'Claude',
    icon: <Bot className="w-5 h-5 text-orange-600" />,
    shortRule: 'XML tags + prefill style',
    description: 'XML-native. Complex reasoning.',
    bestFor: 'Complex reasoning + structure',
    badge: 'Reasoning',
    color: 'bg-orange-50 border-orange-200 text-orange-900',
    metaRules: `1. Structure request with XML tags (<instruction>, <context>).
2. Ask for "step-by-step" thinking inside <thinking> tags.
3. Pre-fill the Assistant's response (e.g., "Assistant:").`
  },
  {
    id: 'o1',
    name: 'OpenAI o1-preview',
    icon: <BrainCircuit className="w-5 h-5 text-pink-600" />,
    shortRule: 'No CoT + constraints only',
    description: 'Reasoning specialist. No CoT prompts.',
    bestFor: 'Tight constraints + edge cases',
    badge: 'Planner',
    color: 'bg-pink-50 border-pink-200 text-pink-900',
    metaRules: `1. DO NOT ask for "Chain of Thought" or "step-by-step" (model does this natively).
2. Focus purely on the end constraint and edge cases.
3. Be extremely specific about output format constraints.`
  },
  {
    id: 'gpt4',
    name: 'ChatGPT',
    icon: <Zap className="w-5 h-5 text-green-600" />,
    shortRule: 'Markdown + Persona',
    description: 'Markdown master. Generalist.',
    bestFor: 'General purpose + formatting',
    badge: 'Generalist',
    color: 'bg-green-50 border-green-200 text-green-900',
    metaRules: `1. Assign a specific high-level Expert Persona.
2. Use Markdown headers (###) for structure.
3. Explicitly state negative constraints (what NOT to do).`
  },
  {
    id: 'gemini',
    name: 'Gemini',
    icon: <Sparkles className="w-5 h-5 text-blue-600" />,
    shortRule: 'Direct + numbered lists',
    description: 'Massive context window.',
    bestFor: 'Long context + citations',
    badge: 'Long context',
    color: 'bg-blue-50 border-blue-200 text-blue-900',
    metaRules: `1. Be extremely direct and concise.
2. If task is complex, break into numbered sub-tasks.
3. Emphasize citation and source handling.`
  },
  {
    id: 'llama',
    name: 'Llama',
    icon: <Code2 className="w-5 h-5 text-purple-600" />,
    shortRule: 'Strict Instruction/Response',
    description: 'Strict instruction follower.',
    bestFor: 'Strict instruction following',
    badge: 'Strict',
    color: 'bg-purple-50 border-purple-200 text-purple-900',
    metaRules: `1. Use strict [Instruction]...[Response] structure.
2. Be highly imperative ("Return ONLY code").
3. Avoid ambiguity.`
  },
  {
    id: 'mistral',
    name: 'Mistral',
    icon: <Wind className="w-5 h-5 text-sky-600" />,
    shortRule: 'No conversational filler',
    description: 'Concise & efficient.',
    bestFor: 'Fast + concise outputs',
    badge: 'Concise',
    color: 'bg-sky-50 border-sky-200 text-sky-900',
    metaRules: `1. Remove all conversational filler ("Sure, I can help").
2. Focus on density of information.
3. Prefer JSON/Structured output.`
  },
  {
    id: 'grok',
    name: 'Grok',
    icon: <Rocket className="w-5 h-5 text-slate-800" />,
    shortRule: 'Casual tone allowed',
    description: 'Witty & uninhibited.',
    bestFor: 'Casual + witty tone',
    badge: 'Witty',
    color: 'bg-slate-100 border-slate-300 text-slate-900',
    metaRules: `1. Allow for more casual/witty tone if requested.
2. Relax standard safety/tone filters slightly.
3. Focus on real-time data access capability.`
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    icon: <Aperture className="w-5 h-5 text-indigo-600" />,
    shortRule: 'Parameters + keyword list',
    description: 'Image generation parameters.',
    bestFor: 'Image prompt parameters',
    badge: 'Image',
    color: 'bg-indigo-50 border-indigo-200 text-indigo-900',
    metaRules: `1. Output MUST be a single prompt string.
2. Use comma-separated keywords, not sentences.
3. Include parameters like --ar, --stylize, --v 6.
4. Focus on lighting, camera, and texture descriptors.`
  }
];

// --- 2. DATA: FLAVORS ---
const FLAVORS = [
  { id: 'neutral', name: 'Neutral', emoji: '🧊', desc: 'Balanced, no bias', rule: '' },
  { id: 'professional', name: 'Professional', emoji: '💼', desc: 'Clear, structured, business tone', rule: 'Adopt a professional, corporate tone. Use industry-standard terminology. Be diplomatic and structured.' },
  { id: 'socratic', name: 'Teacher', emoji: '🧠', desc: 'Guided, step-by-step thinking', rule: 'Adopt a Socratic teaching style. Ask guiding questions. Break down complex concepts into fundamental principles. Be encouraging but rigorous.' },
  { id: 'eli5', name: 'Simple', emoji: '🍼', desc: 'Plain language + analogies', rule: 'Explain Like I\'m 5. Use simple analogies, avoid jargon, and keep sentences short and clear.' },
  { id: 'hacker', name: 'Coder', emoji: '⚡', desc: 'Terse, technical, efficient', rule: 'Adopt a terse, technical, and slightly witty tone. Focus on efficiency and clever solutions. Use tech slang appropriately.' },
  { id: 'storyteller', name: 'Creative', emoji: '🎨', desc: 'Narrative flow + sensory detail', rule: 'Focus on narrative flow, sensory details, and "showing not telling".' }
];

// --- 3. DATA: DEFAULT BLUEPRINTS ---
const DEFAULT_BLUEPRINTS = [
  {
    id: 'sys-1',
    name: 'The Super Coder',
    icon: <Code2 className="w-4 h-4" />,
    content: "Write a robust {{language}} script to {{task}}.\n\nConstraints:\n- {{constraints}}\n- Handle edge cases.\n- Add comments for complex logic.",
    isSystem: true
  },
  {
    id: 'sys-2',
    name: 'Blog Generator',
    icon: <LayoutTemplate className="w-4 h-4" />,
    content: "Write a {{tone:select=Professional|Casual|Funny}} blog post about {{topic}}.\n\nTarget Audience: {{audience}}\nKey Takeaways:\n- {{keyPoint1}}\n- {{keyPoint2}}",
    isSystem: true
  },
  {
    id: 'sys-3',
    name: 'Email Architect',
    icon: <Mail className="w-4 h-4" />,
    content: "Write a {{tone:select=Persuasive|Urgent|Apologetic|Cold Outreach}} email to {{recipient}} regarding {{subject}}.\n\nKey Points:\n- {{point1}}\n- {{point2}}\n\nCall to Action: {{cta}}",
    isSystem: true
  },
  {
    id: 'sys-4',
    name: 'Image Prompter',
    icon: <Camera className="w-4 h-4" />,
    content: "Describe a {{style}} image of {{subject}}.\n\nLighting: {{lighting}}\nCamera Angle: {{angle}}\nMood: {{mood}}\nAspect Ratio: {{ratio:select=16:9|1:1|9:16|4:3}}",
    isSystem: true
  }
];

// --- PRO MODE (Option A: Whop Pro link via ?pro=true) ---
const isProUserFromUrl = () => {
  try {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('pro') === 'true';
  } catch {
    return false;
  }
};

// Free plan limits (simple MVP gating)
const FREE_RUN_LIMIT = 5;
const FREE_BLUEPRINT_LIMIT = 3;

// Replace this with your Whop product URL
const WHOP_UPGRADE_URL = 'https://whop.com/checkout/plan_VLoz93g8o1wEf';

const QUICK_START = {
  claude: [
    'Design a robust API error-handling strategy for a React app.',
    'Rewrite this prompt into a structured XML request for Claude.'
  ],
  o1: [
    'Given these constraints, propose the safest approach and edge cases.',
    'Turn this vague request into a precise specification and acceptance tests.'
  ],
  gpt4: [
    'Write a polished LinkedIn post announcing a new product feature.',
    'Generate a structured technical plan with headings and bullet points.'
  ],
  gemini: [
    'Summarize these notes and list action items with citations.',
    'Draft a research plan and specify sources to consult.'
  ],
  llama: [
    'Return ONLY code: write a Python script to parse a CSV and validate fields.',
    'Convert this into a strict Instruction/Response format.'
  ],
  mistral: [
    'Condense this into a dense checklist with zero filler.',
    'Return JSON: extract entities and key decisions from this text.'
  ],
  grok: [
    'Write a witty, concise product launch announcement.',
    'Give a casual breakdown of pros/cons with a punchy tone.'
  ],
  midjourney: [
    'Futuristic abstract unicorn, neon rainbow sky, halftone ink, --ar 16:9 --v 6',
    'Cinematic street portrait, shallow DOF, film grain, rim light, --ar 2:3 --stylize 300'
  ]
};

// --- 4. HELPERS ---
const parseTemplateVariables = (text) => {
  if (!text || typeof text !== 'string') return [];
  const regex = /\{\{\s*(.*?)\s*\}\}/g;
  const vars = new Map();
  let match;

  while ((match = regex.exec(text)) !== null) {
    const rawContent = match[1];
    const [namePart, configPart] = rawContent.split(':');
    const name = namePart.trim();
    const id = name.toLowerCase().replace(/\s+/g, '_');

    if (!vars.has(id)) {
      let type = 'text';
      let options = [];
      let defaultValue = '';

      if (configPart) {
        if (configPart.startsWith('select=')) {
          type = 'select';
          options = configPart.replace('select=', '').split('|');
          defaultValue = options[0];
        } else if (configPart.startsWith('number=')) {
          type = 'number';
          defaultValue = configPart.replace('number=', '');
        } else if (configPart.startsWith('text=')) {
          type = 'text';
          defaultValue = configPart.replace('text=', '');
        }
      }
      vars.set(id, { id, name, type, options, defaultValue, rawToken: match[0] });
    }
  }
  return Array.from(vars.values());
};


const compileTemplate = (text, values) => {
  let compiled = text || '';
  const variables = parseTemplateVariables(text);
  variables.forEach(v => {
    const val = values[v.id] || v.defaultValue || `[${v.name}]`;
    const safeToken = v.rawToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    compiled = compiled.split(v.rawToken).join(val);
  });
  return compiled;
};

// Safely format timestamps stored in history (supports Date.now(), ISO strings, or preformatted strings)
const formatTime = (ts) => {
  if (!ts) return '';
  if (typeof ts === 'string') {
    const parsed = Date.parse(ts);
    if (Number.isNaN(parsed)) return ts;
    try {
      return new Date(parsed).toLocaleString();
    } catch {
      return ts;
    }
  }
  if (typeof ts === 'number') {
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return String(ts);
    }
  }
  return String(ts);
};


const PRICE_PER_1M_INPUT = 5.00;
const PRICE_PER_1M_OUTPUT = 15.00;

// --- Storage helpers (per-user namespace) ---
const getOrCreateUserNamespace = () => {
  try {
    const key = 'pa_user_namespace_v1';
    let ns = localStorage.getItem(key);
    if (!ns) {
      ns = (globalThis.crypto?.randomUUID?.() || `ns-${Date.now()}-${Math.random().toString(16).slice(2)}`);
      localStorage.setItem(key, ns);
    }
    return ns;
  } catch {
    // If storage is blocked, fall back to a non-persistent namespace
    return `ns-${Date.now()}`;
  }
};

const storageKey = (baseKey) => {
  const ns = getOrCreateUserNamespace();
  return `${baseKey}__${ns}`;
};

const VariableInput = ({ variable, value, onChange }) => {
  const commonClass = "w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all";
  if (variable.type === 'select') {
    return (
      <select value={value || variable.defaultValue} onChange={(e) => onChange(variable.id, e.target.value)} className={`${commonClass} bg-white`}>
        {variable.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    );
  }
  return (
    <input
      type={variable.type === 'number' ? 'number' : 'text'}
      value={value || ''}
      placeholder={variable.defaultValue ? `Default: ${variable.defaultValue}` : `Enter ${variable.name}...`}
      onChange={(e) => onChange(variable.id, e.target.value)}
      className={commonClass}
    />
  );
};

// --- COMPONENT ---
export default function PromptOptimizer() {
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [selectedFlavor, setSelectedFlavor] = useState(FLAVORS[0]);
  
  // View State: 'run' is the main generator view. 'edit' is the blueprint editor.
  const [activeView, setActiveView] = useState('run'); 
  
  // Right Panel State: 'output' | 'history' | 'templates'
  const [rightPanelTab, setRightPanelTab] = useState('history'); 

  const [blueprints, setBlueprints] = useState([...DEFAULT_BLUEPRINTS]);
  const [activeBlueprintId, setActiveBlueprintId] = useState(DEFAULT_BLUEPRINTS[0].id);
  
  const [formValues, setFormValues] = useState({});
  const [freeInput, setFreeInput] = useState('');
  
  const [verbosity, setVerbosity] = useState('normal'); 
  const [piiProtection, setPiiProtection] = useState(false);
  
  const [editorContent, setEditorContent] = useState('');
  const [editorName, setEditorName] = useState('');
  const [editorId, setEditorId] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [showMetaPrompt, setShowMetaPrompt] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  const [resultData, setResultData] = useState(null);
  const [resultTab, setResultTab] = useState('optimized');
  const [lastInputUsed, setLastInputUsed] = useState('');
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [isPro, setIsPro] = useState(false);
  // --- Feature toggles ---
  const [enableClarify, setEnableClarify] = useState(true);
  const [enableSelfCheck, setEnableSelfCheck] = useState(true);

  // --- Effects ---
  useEffect(() => {
    setIsPro(isProUserFromUrl());
    // Load feature toggles from localStorage
    try {
      const savedSettings = localStorage.getItem(storageKey('pa_settings'));
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (typeof parsed?.enableClarify === 'boolean') setEnableClarify(parsed.enableClarify);
        if (typeof parsed?.enableSelfCheck === 'boolean') setEnableSelfCheck(parsed.enableSelfCheck);
      }
    } catch (e) {
      // ignore
    }
    try {
      const saved = localStorage.getItem(storageKey('myBlueprints'));
      if (saved) {
        const custom = JSON.parse(saved);
        if (Array.isArray(custom)) {
          const validCustom = custom.filter(b => b && b.id && b.name && b.content);
          setBlueprints([...DEFAULT_BLUEPRINTS, ...validCustom]);
        }
      }
    } catch (e) { localStorage.removeItem(storageKey('myBlueprints')); }

    try {
      const savedHist = localStorage.getItem(storageKey('promptHistory'));
      if (savedHist) {
        const parsedHist = JSON.parse(savedHist);
        if (Array.isArray(parsedHist)) setHistory(parsedHist);
      }
    } catch (e) { localStorage.removeItem(storageKey('promptHistory')); }
  }, []);

  // Persist feature toggles whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(
        storageKey('pa_settings'),
        JSON.stringify({ enableClarify, enableSelfCheck })
      );
    } catch {
      // ignore
    }
  }, [enableClarify, enableSelfCheck]);

  // --- Cost Estimation ---
  const costEstimate = useMemo(() => {
    let inputText = "";
    if (activeBlueprintId === 'free') {
      inputText = freeInput;
    } else {
      const bp = blueprints.find(b => b.id === activeBlueprintId);
      inputText = bp ? compileTemplate(bp.content, formValues) : "";
    }
    const inputTokens = Math.ceil(inputText.length / 4);
    const outputTokens = verbosity === 'short' ? 200 : verbosity === 'verbose' ? 1000 : 500;
    const cost = ((inputTokens * PRICE_PER_1M_INPUT) + (outputTokens * PRICE_PER_1M_OUTPUT)) / 1000000;
    return { tokens: inputTokens, cost: cost < 0.01 ? "< $0.01" : `$${cost.toFixed(4)}` };
  }, [freeInput, formValues, activeBlueprintId, blueprints, verbosity]);

  // --- Validation ---
  useEffect(() => {
    if (activeView === 'edit') {
      if (editorContent.includes('{{') && !editorContent.includes('}}')) {
        setValidationError("Unclosed variable bracket detected. Missing '}}'.");
      } else if (/\{\{\s*\}\}/.test(editorContent)) {
        setValidationError("Empty variable detected. Give it a name like {{topic}}.");
      } else {
        setValidationError(null);
      }
    }
  }, [editorContent, activeView]);

  // --- Import / Export Blueprints ---
  const exportBlueprints = () => {
    try {
      const custom = blueprints.filter(b => b && !b.isSystem);
      const payload = JSON.stringify(custom, null, 2);
      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'promptalchemy_blueprints.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Failed to export blueprints.');
      console.error(e);
    }
  };

  const importBlueprints = async (event) => {
    try {
      const file = event?.target?.files?.[0];
      if (!file) return;

      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        alert('Invalid file: expected an array of blueprints.');
        return;
      }

      // Validate and sanitize incoming blueprints
      const imported = parsed
        .filter(b => b && typeof b === 'object' && b.name && b.content)
        .map(b => ({
          id: b.id && typeof b.id === 'string' ? b.id : `imported-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          name: String(b.name).slice(0, 80),
          content: String(b.content),
          isSystem: false,
          lastModified: Date.now(),
          versions: Array.isArray(b.versions) ? b.versions.slice(0, 5) : []
        }));

      if (imported.length === 0) {
        alert('No valid blueprints found in that file.');
        return;
      }

      // Merge with existing custom blueprints by id (import wins)
      const existingCustom = blueprints.filter(b => b && !b.isSystem);
      const map = new Map(existingCustom.map(b => [b.id, b]));
      imported.forEach(b => map.set(b.id, b));
      const mergedCustom = Array.from(map.values());

      localStorage.setItem(storageKey('myBlueprints'), JSON.stringify(mergedCustom));
      setBlueprints([...DEFAULT_BLUEPRINTS, ...mergedCustom]);
      setRightPanelTab('templates');
      alert(`Imported ${imported.length} blueprint${imported.length === 1 ? '' : 's'}.`);
    } catch (e) {
      alert('Failed to import blueprints. Make sure this is a valid JSON export.');
      console.error(e);
    } finally {
      // Allow importing the same file again
      if (event?.target) event.target.value = '';
    }
  };

  // --- Actions ---
  const saveBlueprint = () => {
    if (!editorName.trim() || !editorContent.trim()) return alert("Name and Content required");
    // --- Free/Pro gating for custom blueprints ---
    if (!isPro) {
      const customCount = blueprints.filter(b => b && !b.isSystem).length;
      if (customCount >= FREE_BLUEPRINT_LIMIT) {
        return alert(`Free plan allows up to ${FREE_BLUEPRINT_LIMIT} custom blueprints. Upgrade to Pro for unlimited.`);
      }
    }
    let previousVersions = [];
    if (editorId) {
      const existing = blueprints.find(b => b.id === editorId);
      if (existing) {
        previousVersions = [{ content: existing.content, timestamp: existing.lastModified || Date.now() }, ...(existing.versions || [])].slice(0, 5);
      }
    }
    const newBlueprint = { id: editorId || `custom-${Date.now()}`, name: editorName, content: editorContent, isSystem: false, lastModified: Date.now(), versions: previousVersions };
    const customBlueprints = blueprints.filter(b => !b.isSystem && b.id !== newBlueprint.id);
    const updatedCustom = [...customBlueprints, newBlueprint];
    localStorage.setItem(storageKey('myBlueprints'), JSON.stringify(updatedCustom));
    setBlueprints([...DEFAULT_BLUEPRINTS, ...updatedCustom]);
    setActiveBlueprintId(newBlueprint.id);
    setActiveView('run');
    setRightPanelTab('templates'); 
  };

  const restoreVersion = (versionContent) => {
    if (confirm("Restore this version? Current edits will be overwritten.")) {
      setEditorContent(versionContent);
      setShowVersionHistory(false);
    }
  };

  const deleteBlueprint = (id, e) => {
    if (e) e.stopPropagation(); 
    if (confirm("Delete this blueprint? This cannot be undone.")) {
      const customBlueprints = blueprints.filter(b => !b.isSystem && b.id !== id);
      localStorage.setItem(storageKey('myBlueprints'), JSON.stringify(customBlueprints));
      setBlueprints([...DEFAULT_BLUEPRINTS, ...customBlueprints]);
      if (activeBlueprintId === id) setActiveBlueprintId(DEFAULT_BLUEPRINTS[0].id);
    }
  };

  const duplicateBlueprint = (bp, e) => {
    if (e) e.stopPropagation();
    const newId = `custom-${Date.now()}`;
    const newName = `${bp.name} (Copy)`;
    const newBp = { ...bp, id: newId, name: newName, isSystem: false, lastModified: Date.now(), versions: [] };
    const customBlueprints = blueprints.filter(b => !b.isSystem);
    const updatedCustom = [...customBlueprints, newBp];
    localStorage.setItem(storageKey('myBlueprints'), JSON.stringify(updatedCustom));
    setBlueprints([...DEFAULT_BLUEPRINTS, ...updatedCustom]);
    setEditorId(newId);
    setEditorName(newName);
    setEditorContent(bp.content);
    setActiveView('edit');
  };

  const loadExample = () => {
    setFreeInput("Write a comprehensive guide on how to build a React application with Vite, including component structure and state management tips.");
    setActiveBlueprintId('free');
    setSelectedModel(MODELS.find(m => m.id === 'gpt4') || MODELS[0]);
  };

  // --- Helper: Parse JSON loosely (strips markdown, tolerant to minor errors) ---
  const parseJsonLoose = (raw) => {
    if (!raw || typeof raw !== 'string') return null;
    try {
      const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(clean);
    } catch {
      return null;
    }
  };

  // --- Helper: Call optimizer API ---
  const callOptimizerApi = async ({ systemInstruction, userPrompt, stage = 'optimize', model = 'gpt-4o' }) => {
    const response = await fetch('/api/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stage,
        model,
        systemInstruction,
        userPrompt
      })
    });

    const data = await response.json();
    if (data?.error) throw new Error(data.error || 'API Error');

    const rawContent = data?.choices?.[0]?.message?.content || '';
    return { data, rawContent };
  };

  const handleGenerate = async () => {
    setError(null);
    setIsGenerating(true);
    setResultData(null);
    // Switch right panel to output immediately to show loading state
    setRightPanelTab('output'); 

    let finalUserPrompt = "";
    const activeBP = blueprints.find(b => b.id === activeBlueprintId);
    if (activeBlueprintId === 'free') {
      finalUserPrompt = freeInput;
    } else if (activeBP) {
      finalUserPrompt = compileTemplate(activeBP.content, formValues);
    }

    if (!finalUserPrompt.trim()) {
      setIsGenerating(false);
      return;
    }
    // --- Free/Pro gating (MVP) ---
    if (!isPro) {
      // Limit free generations using local history count
      if ((history?.length || 0) >= FREE_RUN_LIMIT) {
        setIsGenerating(false);
        alert(`Free plan limit reached (${FREE_RUN_LIMIT} generations). Upgrade to Pro for more generations.`);
        return;
      }
    }
    let workingPrompt = finalUserPrompt;

    // (1) Optional: Clarify intent (silent) to reduce vague prompts
    if (enableClarify) {
      const clarifyInstruction = `You are a prompt clarifier. Your job is to rewrite the user's request to be maximally explicit about goal, audience, constraints, and output format.

RULES:
- Do NOT add new requirements that aren't implied.
- Do NOT answer the user's request.
- If details are missing, make conservative assumptions and keep them generic.

RESPONSE FORMAT:
Return a valid JSON object with:
1) "clarified_prompt": string
2) "assumptions": array of 0-3 short strings

IMPORTANT: Return raw JSON only. No markdown.`;

      try {
        const { rawContent } = await callOptimizerApi({ systemInstruction: clarifyInstruction, userPrompt: workingPrompt, stage: 'clarify' });
        const parsed = parseJsonLoose(rawContent);
        if (parsed?.clarified_prompt && typeof parsed.clarified_prompt === 'string') {
          workingPrompt = parsed.clarified_prompt.trim();
        }
      } catch (e) {
        // If clarify fails, just continue with original prompt
        console.warn('Clarify step failed:', e);
      }
    }

    setLastInputUsed(workingPrompt);

    const flavorRule = selectedFlavor.id !== 'neutral' ? `\nSTYLE/TONE OVERRIDE:\n${selectedFlavor.rule}` : "";
    let guardrails = "";
    if (piiProtection) guardrails += "\nSAFETY CRITICAL: Remove PII (names, emails) and replace with placeholders.";
    if (verbosity === 'short') guardrails += "\nLENGTH: Concise and brief.";
    else if (verbosity === 'verbose') guardrails += "\nLENGTH: Detailed and comprehensive.";
    else guardrails += "\nLENGTH: Balanced.";

    const systemInstruction = `You are an expert Prompt Engineer specializing in ${selectedModel.name}.
OBJECTIVE: Rewrite the user's request into the PERFECT prompt for ${selectedModel.name}.

DETOX RULES:
- Remove conflicting or redundant instructions.
- Ensure output format is unambiguous.
- Keep constraints consistent and enforceable.

STRICT MODEL ARCHITECTURE RULES:\n${selectedModel.metaRules}\n${flavorRule}\n${guardrails}

OUTPUT CONTRACT (always include in the final prompt):
- Specify the required output format (bullets/JSON/sections/etc.)
- Specify desired length
- Specify how to handle missing info (ask up to 2 clarifying questions only if required)

RESPONSE FORMAT:
Return a valid JSON object with:
1) "optimized_prompt": The final prompt string.
2) "analysis_notes": An array of 1-3 short bullet point strings explaining changes.

IMPORTANT: Do not return markdown code blocks. Just the raw JSON.`;

    try {
      // (2) Optimize
      const { rawContent } = await callOptimizerApi({ systemInstruction, userPrompt: workingPrompt, stage: 'optimize' });

      let parsedResult = parseJsonLoose(rawContent);
      if (!parsedResult) {
        parsedResult = { optimized_prompt: rawContent, analysis_notes: ['Optimization completed.'] };
      }

      let finalOptimizedPrompt = parsedResult.optimized_prompt;
      let finalNotes = Array.isArray(parsedResult.analysis_notes) ? parsedResult.analysis_notes : [];

      // (3) Optional: Self-check + refine
      if (enableSelfCheck && typeof finalOptimizedPrompt === 'string' && finalOptimizedPrompt.trim()) {
        const judgeInstruction = `You are a strict prompt quality reviewer.

TASK:
- Evaluate the candidate prompt for clarity, specificity, constraint consistency, and alignment to the target model.
- If score < 8, rewrite the prompt to improve it.

TARGET MODEL: ${selectedModel.name}
MODEL RULES:\n${selectedModel.metaRules}

RESPONSE FORMAT:
Return raw JSON only:
1) "score" (number 1-10)
2) "final_prompt" (string)
3) "fixes" (array of 0-3 short strings)

IMPORTANT: No markdown.`;

        try {
          const { rawContent: judgeRaw } = await callOptimizerApi({ systemInstruction: judgeInstruction, userPrompt: finalOptimizedPrompt, stage: 'judge' });
          const judged = parseJsonLoose(judgeRaw);
          if (judged?.final_prompt && typeof judged.final_prompt === 'string') {
            finalOptimizedPrompt = judged.final_prompt;
          }
          if (Array.isArray(judged?.fixes) && judged.fixes.length) {
            finalNotes = [...finalNotes, ...judged.fixes].slice(0, 5);
          }
        } catch (e) {
          console.warn('Self-check step failed:', e);
        }
      }

      setResultData({
        prompt: finalOptimizedPrompt,
        notes: finalNotes
      });
      setResultTab('optimized');

      const newItem = {
        id: Date.now(),
        modelId: selectedModel.id,
        type: activeBlueprintId === 'free' ? 'Free Input' : activeBP?.name || 'Blueprint',
        input: workingPrompt,
        output: finalOptimizedPrompt,
        timestamp: Date.now()
      };

      setHistory(prev => {
        const updated = [newItem, ...prev].slice(0, 10);
        localStorage.setItem(storageKey('promptHistory'), JSON.stringify(updated));
        return updated;
      });

    } catch (error) {
      setError(error.message || 'An unexpected error occurred.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveResultAsBlueprint = () => {
    if (!resultData) return;
    setEditorId(null);
    setEditorName(`Optimized for ${selectedModel.name}`);
    setEditorContent(resultData.prompt);
    setActiveView('edit');
  };

  const activeBlueprint = blueprints.find(b => b.id === activeBlueprintId);
  const activeVariables = useMemo(() => activeBlueprint ? parseTemplateVariables(activeBlueprint.content) : [], [activeBlueprint]);
  const editorVariables = useMemo(() => parseTemplateVariables(editorContent), [editorContent]);
  const currentEditingBlueprint = blueprints.find(b => b.id === editorId);

  const getModelColor = (id) => {
    const m = MODELS.find(mod => mod.id === id);
    return m ? m.color : 'bg-gray-100 border-gray-200 text-gray-500';
  };

  // --- UI helpers (polish pass) ---
  const SectionLabel = ({ children, right }) => (
    <div className="flex items-center justify-between mb-2">
      <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
        {children}
      </div>
      {right}
    </div>
  );

  const Card = ({ className = '', children }) => (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${className}`}>{children}</div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 font-sans flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-20 shadow-sm flex-shrink-0">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-200">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 leading-tight">PromptAlchemy</h1>
                {isPro && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    PRO
                  </span>
                )}
              </div>
              <div className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">IDE v5.0</div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
             <button onClick={() => setActiveView('run')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeView === 'run' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
               <Play className="w-3 h-3 inline mr-1" /> Run
             </button>
             <button onClick={() => setActiveView('edit')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeView === 'edit' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
               <Edit2 className="w-3 h-3 inline mr-1" /> Editor
             </button>
          </div>
        </div>
      </header>

      {/* Main Layout - Split Screen */}
      <main className="flex-1 max-w-screen-2xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden h-full">
        
        {/* LEFT PANEL: CONFIG & INPUT */}
        <div className="flex flex-col h-full border-r border-gray-200 bg-gray-50/50 overflow-y-auto p-5 lg:p-7 gap-6">
          
          {/* 1. Model & Flavor Configuration */}
          <Card className="p-5 space-y-4">
            <div className="flex flex-col xl:flex-row gap-4">
              <div className="flex-1">
                <SectionLabel>Target model</SectionLabel>
                <div className="grid grid-cols-2 gap-2">
                  {MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModel(model)}
                      className={`relative text-left p-3 rounded-xl border transition-all text-xs flex flex-col justify-between h-24 overflow-hidden ${selectedModel.id === model.id ? `${model.color} border-current ring-2 ring-indigo-400 shadow-lg shadow-indigo-100 scale-[1.01]` : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300 hover:shadow-sm'}`}
                    >
                      <div className="flex justify-between w-full items-start">
                        <div className="flex items-center gap-2">
                          {model.icon}
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/70 border border-white/40 text-gray-700">
                            {model.badge}
                          </span>
                        </div>
                        {selectedModel.id === model.id && <Check className="w-4 h-4 opacity-70" />}
                      </div>
                      <div className="space-y-1">
                        <span className="font-semibold block text-sm leading-tight">{model.name}</span>
                        <span className="text-[10px] opacity-80 leading-tight line-clamp-1">{model.bestFor}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="xl:w-1/3">
                <SectionLabel right={<div className="flex items-center gap-1 text-[11px] font-semibold text-gray-500"><Sparkles className="w-3 h-3 text-yellow-500" />Vibe</div>}>
                  Style
                </SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {FLAVORS.map(flavor => (
                    <button
                      key={flavor.id}
                      onClick={() => setSelectedFlavor(flavor)}
                      className={`px-3 py-2 rounded-full text-xs font-semibold border transition-all flex items-center gap-2 ${selectedFlavor.id === flavor.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'}`}
                      title={flavor.desc}
                    >
                      <span className="text-sm leading-none">{flavor.emoji}</span>
                      <span>{flavor.name}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-3 text-[11px] text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <span className="font-semibold text-gray-700">{selectedFlavor.emoji} {selectedFlavor.name}:</span>{' '}
                  <span>{selectedFlavor.desc}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* 2. Active Context Bar */}
          <div className="flex items-center gap-2 text-[12px] px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700">
            <Info className="w-3.5 h-3.5" />
            <span className="font-semibold">Optimizing for {selectedModel.name}:</span>
            <span className="opacity-80">{selectedModel.shortRule}</span>
          </div>

          {/* 3. Input Workspace */}
          <Card className="flex flex-col flex-1 min-h-[420px]">
            {activeView === 'edit' ? (
              // BLUEPRINT EDITOR VIEW
              <div className="flex-1 p-6 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    {editorId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {editorId ? 'Edit Blueprint' : 'New Blueprint'}
                  </h3>
                  <div className="flex gap-2">
                    {editorId && (
                      <button onClick={(e) => {deleteBlueprint(editorId, e); setActiveView('run');}} className="px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-1 transition-colors"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                    )}
                    <button onClick={saveBlueprint} className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all"><Save className="w-3.5 h-3.5" /> Save</button>
                  </div>
                </div>
                <div className="space-y-4 flex-1 flex flex-col">
                  <input value={editorName} onChange={e => setEditorName(e.target.value)} placeholder="Blueprint Name..." className="w-full p-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-200 outline-none font-bold" />
                  <div className="flex-1 flex flex-col relative">
                    {validationError && <div className="absolute top-2 right-2 text-xs text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {validationError}</div>}
                    <textarea value={editorContent} onChange={e => setEditorContent(e.target.value)} placeholder="Type your template here using {{variables}}..." className="w-full flex-1 p-4 rounded-lg border border-gray-300 font-mono text-sm leading-relaxed focus:ring-2 focus:ring-indigo-200 outline-none resize-none" />
                  </div>
                  {editorVariables.length > 0 && (
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 grid grid-cols-2 gap-2">
                      {editorVariables.map(v => (
                        <div key={v.id} className="bg-white p-2 rounded border border-gray-200 text-xs flex justify-between items-center">
                           <span className="font-semibold text-gray-700">{v.name}</span>
                           <span className="text-[10px] bg-gray-100 px-1 rounded text-gray-500 uppercase">{v.type}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // GENERATOR INPUT VIEW
              <>
                <div className="px-6 pt-5 pb-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-700">
                      <span className="px-2 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700">1</span>
                      <span>Choose model</span>
                      <ChevronRight className="w-3 h-3 text-gray-300" />
                      <span className="px-2 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700">2</span>
                      <span>Describe task</span>
                      <ChevronRight className="w-3 h-3 text-gray-300" />
                      <span className="px-2 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700">3</span>
                      <span>Generate</span>
                    </div>
                    <button
                      onClick={loadExample}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
                    >
                      Load example
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(QUICK_START[selectedModel.id] || []).map((ex, idx) => (
                      <button
                        key={`${selectedModel.id}-ex-${idx}`}
                        onClick={() => {
                          setActiveBlueprintId('free');
                          setFreeInput(ex);
                        }}
                        className="px-3 py-2 rounded-lg text-[11px] bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-sm text-gray-700 transition-all"
                        title={ex}
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="px-6 pb-3">
                  <div className="bg-gray-100 border border-gray-200 rounded-2xl p-1 flex items-center gap-1 overflow-x-auto scrollbar-hide">
                    <button
                      onClick={() => setActiveBlueprintId('free')}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
                        activeBlueprintId === 'free'
                          ? 'bg-white text-indigo-700 shadow-sm border border-gray-200'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-white/60'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Free Input
                    </button>

                    {blueprints.map((bp) => (
                      <button
                        key={bp.id}
                        onClick={() => setActiveBlueprintId(bp.id)}
                        className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
                          activeBlueprintId === bp.id
                            ? 'bg-white text-indigo-700 shadow-sm border border-gray-200'
                            : 'text-gray-600 hover:text-gray-800 hover:bg-white/60'
                        }`}
                        title={bp.isSystem ? 'System template' : 'Custom template'}
                      >
                        {bp.isSystem ? (bp.icon || <LayoutTemplate className="w-3.5 h-3.5" />) : <Settings2 className="w-3.5 h-3.5" />}
                        <span className="truncate max-w-[180px]">{bp.name}</span>
                        {bp.isSystem ? (
                          <span className="ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200 text-gray-600">
                            SYS
                          </span>
                        ) : (
                          <span className="ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700">
                            YOU
                          </span>
                        )}
                      </button>
                    ))}

                    <div className="flex-1" />

                    <button
                      onClick={() => {
                        setEditorId(null);
                        setEditorName('');
                        setEditorContent('My Template:\n\n{{input1}}');
                        setActiveView('edit');
                      }}
                      className="px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                      title="Create a new template"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      New
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto">
                  {activeBlueprintId === 'free' ? (
                     <textarea value={freeInput} onChange={e => setFreeInput(e.target.value)} placeholder={`Describe your task for ${selectedModel.name}...`} className="w-full flex-1 p-4 bg-white rounded-xl border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-100 text-sm text-gray-800 placeholder-gray-400 shadow-inner min-h-[200px]" />
                  ) : (
                    <div className="flex-1 flex flex-col gap-6">
                       {activeVariables.length > 0 ? (
                         <div className="grid md:grid-cols-2 gap-4">{activeVariables.map(v => (<div key={v.id}><label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">{v.name}</label><VariableInput variable={v} value={formValues[v.id]} onChange={(id, val) => setFormValues(prev => ({...prev, [id]: val}))} /></div>))}</div>
                       ) : <div className="text-center text-gray-400 py-10">This blueprint has no variables.</div>}
                       {activeBlueprint && !activeBlueprint.isSystem && (
                          <div className="flex justify-end">
                            <button onClick={() => {setEditorId(activeBlueprint.id); setEditorName(activeBlueprint.name); setEditorContent(activeBlueprint.content); setActiveView('edit')}} className="text-indigo-600 text-xs flex items-center gap-1 hover:underline"><Edit2 className="w-3 h-3" /> Edit Template</button>
                          </div>
                       )}
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50/30">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex bg-white border border-gray-200 rounded-lg p-0.5 shadow-sm">
                        <button onClick={() => setVerbosity('short')} className={`px-2 py-1 text-[10px] font-medium rounded transition-all ${verbosity === 'short' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>Short</button>
                        <button onClick={() => setVerbosity('normal')} className={`px-2 py-1 text-[10px] font-medium rounded transition-all ${verbosity === 'normal' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>Normal</button>
                        <button onClick={() => setVerbosity('verbose')} className={`px-2 py-1 text-[10px] font-medium rounded transition-all ${verbosity === 'verbose' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>Verbose</button>
                      </div>
                      <button onClick={() => setPiiProtection(!piiProtection)} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-medium border transition-all ${piiProtection ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                        <Shield className="w-3 h-3" /> {piiProtection ? 'PII Safe' : 'PII Off'}
                      </button>
                      <button
                        onClick={() => setEnableClarify(!enableClarify)}
                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-medium border transition-all ${enableClarify ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                        title="Silently clarifies vague prompts before optimizing"
                      >
                        <ArrowLeftRight className="w-3 h-3" /> {enableClarify ? 'Clarify On' : 'Clarify Off'}
                      </button>
                      <button
                        onClick={() => setEnableSelfCheck(!enableSelfCheck)}
                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-medium border transition-all ${enableSelfCheck ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                        title="Runs a quick prompt quality review and improves if needed"
                      >
                        <Scale className="w-3 h-3" /> {enableSelfCheck ? 'QC On' : 'QC Off'}
                      </button>
                      <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-yellow-50 border border-yellow-100 text-[10px] font-medium text-yellow-700"><Coins className="w-3 h-3" /> {costEstimate.cost}</div>
                    </div>
                    
                    <button onClick={handleGenerate} disabled={isGenerating} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white transition-all shadow-md hover:shadow-xl ${isGenerating ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-[1.02] active:scale-95'}`}>
                      {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /><span className="truncate">Optimizing...</span></> : <><span>Generate Prompt</span><Sparkles className="w-4 h-4" /></>}
                    </button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>

        {/* RIGHT PANEL: OUTPUT & HISTORY */}
        <div className="flex flex-col h-full bg-white overflow-hidden border-l border-gray-200">
          
          {/* Right Panel Tabs */}
          <div className="px-5 lg:px-6 pt-5 pb-3 bg-white border-b border-gray-100">
            <div className="bg-gray-100 border border-gray-200 rounded-2xl p-1 flex items-center gap-1">
              <button
                onClick={() => setRightPanelTab('output')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  rightPanelTab === 'output'
                    ? 'bg-white text-indigo-700 shadow-sm border border-gray-200'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/60'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> Result
              </button>
              <button
                onClick={() => setRightPanelTab('history')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  rightPanelTab === 'history'
                    ? 'bg-white text-indigo-700 shadow-sm border border-gray-200'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/60'
                }`}
              >
                <Clock className="w-3.5 h-3.5" /> History
              </button>
              <button
                onClick={() => setRightPanelTab('templates')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  rightPanelTab === 'templates'
                    ? 'bg-white text-indigo-700 shadow-sm border border-gray-200'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/60'
                }`}
              >
                <BookTemplate className="w-3.5 h-3.5" /> Library
              </button>
            </div>
          </div>

        <div className="flex-1 overflow-y-auto bg-gray-50/30 px-5 lg:px-6 pb-6">
            
            {/* TAB: OUTPUT */}
            {rightPanelTab === 'output' && (
              <div className="h-full flex flex-col">
                {!resultData && !isGenerating ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 px-6">
                    <Terminal className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-sm font-medium text-gray-600">Ready to optimize</p>
                    <p className="text-xs opacity-80 mt-1 text-center">
                      Pick a model, paste a raw prompt, then click <span className="font-semibold text-gray-600">Generate Prompt</span>.
                    </p>
                    <div className="mt-5 w-full max-w-xl">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Quick start</div>
                      <div className="flex flex-wrap gap-2">
                        {(QUICK_START[selectedModel.id] || QUICK_START.gpt4).map((ex, idx) => (
                          <button
                            key={`rhs-ex-${idx}`}
                            onClick={() => {
                              setActiveBlueprintId('free');
                              setFreeInput(ex);
                            }}
                            className="px-3 py-2 rounded-lg text-[11px] bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-sm text-gray-700 transition-all"
                          >
                            {ex}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col flex-1 ${isGenerating && !resultData ? 'animate-pulse' : ''}`}>
                    {/* Output Toolbar */}
                    <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-white">
                      <span className="text-xs font-bold text-gray-700 flex items-center gap-2">
                        {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3 text-green-500" />}
                        {isGenerating ? 'Processing...' : `Optimized Prompt • ${selectedModel.name}`}
                      </span>
                      {!isGenerating && resultData && (
                        <div className="flex gap-1">
                          <button onClick={() => copyToClipboard(resultData.prompt)} className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-indigo-600 transition-colors" title="Copy"><Copy className="w-4 h-4" /></button>
                          <button onClick={saveResultAsBlueprint} className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-indigo-600 transition-colors" title="Save as Blueprint"><Save className="w-4 h-4" /></button>
                          <button onClick={() => copyToClipboard(JSON.stringify(resultData, null, 2))} className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-indigo-600 transition-colors" title="Copy JSON"><FileJson className="w-4 h-4" /></button>
                        </div>
                      )}
                    </div>
                    
                    {/* Output Content */}
                    <div className="flex-1 overflow-y-auto p-4 bg-white relative">
                      {isGenerating && !resultData ? (
                        <div className="space-y-3 p-2">
                          <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                          <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                        </div>
                      ) : (
                        <pre className="whitespace-pre-wrap font-mono text-[13px] text-slate-800 leading-relaxed">{resultData.prompt}</pre>
                      )}
                      {copied && <div className="absolute top-4 right-4 bg-black/75 text-white text-[10px] px-2 py-1 rounded fade-in">Copied!</div>}
                    </div>

                    {/* Output Notes Footer */}
                    {!isGenerating && resultData && resultData.notes && (
                    <div className="bg-indigo-50/50 border-t border-indigo-100 p-5">
                        <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-2">Why this works</h4>
                        <div className="space-y-1.5">
                          {resultData.notes.map((note, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-indigo-900">
                              <span className="mt-1 w-1 h-1 rounded-full bg-indigo-400 flex-shrink-0" />
                              <span className="opacity-90">{note}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB: HISTORY */}
            {rightPanelTab === 'history' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-400 uppercase">Recent Generations</span>
                  {history.length > 0 && <button onClick={() => {setHistory([]); localStorage.removeItem(storageKey('promptHistory'));}} className="text-[10px] text-red-500 hover:underline">Clear All</button>}
                </div>
                {history.length === 0 ? (
                  <div className="text-center py-12 text-gray-300">
                    <History className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-xs">No history yet.</p>
                  </div>
                ) : history.filter(item => item && typeof item === 'object').map((item) => (
                  <div key={item.id} onClick={() => {
                    setResultData({ prompt: item.output || '', notes: [] });
                    setRightPanelTab('output');
                    setSelectedModel(MODELS.find(m => m.id === item.modelId) || MODELS[0]);
                  }} className="bg-white p-3 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md cursor-pointer transition-all">
                     <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getModelColor(item.modelId).split(' ')[0]}`}>{MODELS.find(m => m.id === item.modelId)?.name.split(' ')[0]}</span>
                        <span className="text-[10px] text-gray-400">{formatTime(item.timestamp || item.time || item.createdAt)}</span>
                     </div>
                     <div className="text-[10px] text-gray-400 line-clamp-2 italic">"{item.input ? item.input.substring(0, 60) : ''}..."</div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: LIBRARY (Blueprints List) */}
            {rightPanelTab === 'templates' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-400 uppercase">My Blueprints</span>
                  <div className="flex gap-2">
                    <button onClick={exportBlueprints} className="text-[10px] text-indigo-600 hover:underline flex items-center gap-1"><Download className="w-3 h-3"/> Export</button>
                    <label className="cursor-pointer text-[10px] text-indigo-600 hover:underline flex items-center gap-1"><Upload className="w-3 h-3"/> Import <input type="file" accept=".json" onChange={importBlueprints} className="hidden" /></label>
                  </div>
                </div>
                {blueprints.filter(b => !b.isSystem).length === 0 ? (
                  <div className="text-center py-12 text-gray-300">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-xs">No custom templates.</p>
                    <button onClick={() => { setEditorId(null); setEditorName(''); setEditorContent('Write a {{variable}} prompt...'); setActiveView('edit'); }} className="mt-2 text-xs text-indigo-600 font-bold hover:underline">Create One +</button>
                  </div>
                ) : blueprints.filter(b => !b.isSystem).map(bp => (
                  <div key={bp.id} className="group bg-white p-3 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all relative">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-semibold text-gray-800">{bp.name}</h4>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditorId(bp.id); setEditorName(bp.name); setEditorContent(bp.content); setActiveView('edit'); }} className="p-1 text-gray-400 hover:text-indigo-600"><Edit2 className="w-3 h-3" /></button>
                        <button onClick={(e) => deleteBlueprint(bp.id, e)} className="p-1 text-gray-400 hover:text-red-600"><X className="w-3 h-3" /></button>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-500 line-clamp-2 bg-gray-50 p-1.5 rounded mb-2 font-mono">{bp.content}</p>
                    <button onClick={() => { setActiveBlueprintId(bp.id); setActiveView('run'); }} className="w-full py-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded text-center">Use Template</button>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-2 px-6 text-center text-[10px] text-gray-400 flex-shrink-0">
        <div className="flex items-center justify-center gap-4">
          {!isPro && (
            <a
              href={WHOP_UPGRADE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-600 hover:underline transition-colors"
            >
              Upgrade to Pro
            </a>
          )}
          <button onClick={() => setShowPrivacy(true)} className="hover:text-indigo-600 hover:underline transition-colors">
            Terms & Privacy
          </button>
        </div>
      </footer>

      {/* Privacy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-800 text-sm">Terms & Privacy</h3>
              <button onClick={() => setShowPrivacy(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 text-xs text-gray-600 space-y-4 leading-relaxed">
              <div>
                <strong className="block text-gray-900 mb-1">1. Data Storage</strong>
                <p>Your history and custom blueprints are stored locally in your browser's <code>localStorage</code>. Clearing your browser cache will delete this data.</p>
              </div>
              <div>
                <strong className="block text-gray-900 mb-1">2. Server Processing</strong>
                <p>Prompts are sent to our server solely for processing by OpenAI. We do not permanently store or train on your inputs. Processing is transient.</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg text-amber-800">
                <strong className="block mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Security Warning</strong>
                Please do not paste API keys, passwords, or sensitive personal data (PII) into the prompt field. AI models should be treated as public processors.
              </div>
            </div>
            <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
              <button onClick={() => setShowPrivacy(false)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all">Got it</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}