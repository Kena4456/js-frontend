import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import styled, { keyframes, css } from 'styled-components';
import { auth } from '../../firebase-config.js';
import { api } from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

/* ── Logo SVG Mark ── */
const LogoMark = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect x="2" y="4" width="18" height="18" rx="5" fill="var(--accent)" opacity="0.35" />
    <rect x="8" y="6" width="18" height="18" rx="5" fill="var(--accent)" />
  </svg>
);

/* ── Layout ── */
const Page = styled.div`
  min-height: 100vh;
  background: var(--bg-page);
  font-family: var(--font);
`;

const Nav = styled.nav`
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
  box-shadow: 0 1px 0 var(--border);
  padding: 0 32px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const NavBrandWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const NavBrandText = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: var(--accent);
  font-family: var(--font);
`;

const NavBack = styled.button`
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  background: none;
  border: none;
  padding: 6px 0;
  cursor: pointer;
  transition: color 150ms ease;
  font-family: var(--font);
  &:hover { color: var(--text-primary); }
`;

const Main = styled.main`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 24px;
`;

const ProblemCard = styled.div`
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  padding: 28px;
  margin-bottom: 28px;
  box-shadow: var(--shadow-sm);
`;

const ProblemTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  font-family: var(--font);
`;

const ProblemQ = styled.p`
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.7;
  white-space: pre-wrap;
`;

/* ── Stage indicator (pill-style tabs) ── */
const Stages = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 28px;
`;

const StageItem = styled.div`
  flex: 1;
  padding: 14px 20px;
  background: ${p => p.$active ? 'var(--accent)' : p.$done ? 'var(--accent)' : 'var(--bg-subtle)'};
  color: ${p => (p.$active || p.$done) ? '#fff' : 'var(--text-tertiary)'};
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  font-family: var(--font);
  transition: all 200ms ease;
`;

const StageNum = styled.div`
  font-size: 11px;
  opacity: 0.85;
  margin-bottom: 2px;
  letter-spacing: 0.04em;
`;

/* ── Active section card ── */
const SectionCard = styled.div`
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  border-left: 3px solid var(--accent);
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-sm);
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
  font-family: var(--font);
`;

/* ── Conversation ── */
const ConvWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
`;

const Bubble = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${p => p.$student ? 'flex-end' : 'flex-start'};
`;

const BubbleLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${p => p.$ai ? 'var(--accent)' : 'var(--text-tertiary)'};
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const BubbleText = styled.div`
  max-width: 85%;
  padding: ${p => p.$student ? '12px 16px' : '16px 20px'};
  border-radius: ${p => p.$student ? '16px 16px 4px 16px' : 'var(--radius-md)'};
  background: ${p => p.$student ? 'var(--accent)' : 'var(--bg-subtle)'};
  color: ${p => p.$student ? '#fff' : 'var(--text-primary)'};
  border-left: ${p => p.$student ? 'none' : '3px solid var(--accent)'};
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  font-family: var(--font);
`;

/* ── Counter ── */
const Counter = styled.p`
  font-size: 13px;
  color: ${p => p.$low ? '#B45309' : 'var(--text-tertiary)'};
  font-weight: ${p => p.$low ? '600' : '400'};
  margin-bottom: 16px;
  text-align: right;
  font-family: var(--font);
`;

/* ── Input area ── */
const TextArea = styled.textarea`
  width: 100%;
  padding: 14px;
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: 15px;
  color: var(--text-primary);
  resize: vertical;
  min-height: 120px;
  outline: none;
  transition: all 150ms ease;
  line-height: 1.6;
  font-family: var(--font);
  &:focus {
    background: var(--bg-surface);
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(91, 91, 214, 0.12);
  }
  &:disabled { background: var(--bg-subtle); cursor: not-allowed; opacity: 0.6; }
`;

const SubmitBtn = styled.button`
  width: 100%;
  height: 44px;
  margin-top: 12px;
  background: ${p => p.$secondary ? 'var(--bg-surface)' : 'var(--accent)'};
  color: ${p => p.$secondary ? 'var(--accent)' : '#fff'};
  border: ${p => p.$secondary ? '1.5px solid var(--accent)' : 'none'};
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 150ms ease;
  font-family: var(--font);
  &:hover { background: ${p => p.$secondary ? 'var(--accent-light)' : 'var(--accent-hover)'}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const LockedMsg = styled.div`
  text-align: center;
  padding: 32px;
  color: var(--text-tertiary);
  font-size: 15px;
  border: 2px dashed var(--border);
  border-radius: var(--radius-md);
  font-family: var(--font);
`;

const SuccessBanner = styled.div`
  background: #DCFCE7;
  border: 1px solid #BBF7D0;
  border-radius: var(--radius-md);
  padding: 16px 20px;
  color: #15803D;
  font-weight: 500;
  margin-bottom: 20px;
  font-family: var(--font);
`;

const ErrMsg = styled.p`
  color: #EF4444;
  font-size: 13px;
  margin-top: 8px;
`;

/* ── Pulsing dot for loading states ── */
const pulseAnim = keyframes`
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
`;
const PulsingDot = styled.span`
  width: 6px;
  height: 6px;
  background: var(--accent);
  border-radius: 50%;
  display: inline-block;
  animation: ${pulseAnim} 1.2s ease-in-out infinite;
`;

/* ── Post-Submission Feedback ── */
const FeedbackWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FeedbackSuccessBanner = styled.div`
  background: #DCFCE7;
  border: 1px solid #BBF7D0;
  border-radius: var(--radius-md);
  padding: 18px 24px;
  color: #15803D;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font);
`;

const DiagnosisCard = styled.div`
  background: var(--bg-surface);
  border-left: 3px solid var(--accent);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  padding: 22px 24px;
  box-shadow: var(--shadow-sm);
`;

const DiagnosisLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const DiagnosisText = styled.p`
  font-size: 15px;
  color: var(--text-primary);
  line-height: 1.7;
  font-family: var(--font);
`;

const ReflectionCard = styled.div`
  background: var(--bg-subtle);
  border-radius: var(--radius-md);
  padding: 22px 24px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
`;

const ReflectionIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--accent-light);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  flex-shrink: 0;
`;

const ReflectionContent = styled.div`flex: 1;`;

const ReflectionLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-tertiary);
  margin-bottom: 8px;
`;

const ReflectionQuestion = styled.p`
  font-size: 15px;
  font-style: italic;
  color: var(--text-primary);
  line-height: 1.7;
  font-family: var(--font);
`;

const ResourceCard = styled.a`
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 18px 22px;
  text-decoration: none;
  transition: all 150ms ease;
  box-shadow: var(--shadow-sm);
  &:hover {
    border-color: var(--accent);
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }
`;

const ResourceIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: var(--accent-light);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ResourceInfo = styled.div`flex: 1;`;

const ResourceLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-tertiary);
  margin-bottom: 4px;
`;

const ResourceTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: var(--accent);
  font-family: var(--font);
`;

const ResourceArrow = styled.div`
  color: var(--text-tertiary);
  font-size: 20px;
  transition: transform 150ms ease;
  ${ResourceCard}:hover & { transform: translateX(3px); color: var(--accent); }
`;

const CelebrationCard = styled.div`
  background: linear-gradient(135deg, #ECFDF5, #DCFCE7);
  border: 1px solid #BBF7D0;
  border-radius: var(--radius-md);
  padding: 28px 24px;
  text-align: center;
`;

const CelebrationIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #BBF7D0;
  color: #15803D;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
`;

const CelebrationText = styled.p`
  font-size: 16px;
  color: #065F46;
  line-height: 1.7;
  font-weight: 500;
  font-family: var(--font);
`;

const FeedbackLoading = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 40px;
  color: var(--text-tertiary);
  font-size: 14px;
  font-family: var(--font);
`;

const LoadMsg = styled.div`
  text-align: center;
  padding: 80px;
  color: var(--text-tertiary);
  font-family: var(--font);
`;

/* ── Voice Dictation ── */
const micPulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.45); }
  50% { box-shadow: 0 0 0 12px rgba(239,68,68,0); }
`;
const dotBounce = keyframes`
  0%, 80%, 100% { opacity: 0.3; }
  40% { opacity: 1; }
`;

const VoiceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 14px;
`;

const MicBtn = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${p => p.$listening ? '#EF4444' : 'var(--bg-subtle)'};
  color: ${p => p.$listening ? '#fff' : 'var(--accent)'};
  transition: background 150ms ease, color 150ms ease, transform 100ms ease;
  flex-shrink: 0;
  cursor: pointer;
  ${p => p.$listening && css`animation: ${micPulse} 1.5s ease-in-out infinite;`}
  &:hover {
    background: ${p => p.$listening ? '#DC2626' : 'var(--border)'};
    transform: scale(1.06);
  }
  &:active { transform: scale(0.95); }
  &:disabled { opacity: 0.4; cursor: not-allowed; pointer-events: none; }
`;

const MicSvg = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0" />
    <line x1="12" y1="19" x2="12" y2="22" />
    <line x1="8" y1="22" x2="16" y2="22" />
  </svg>
);

const VoiceLabel = styled.span`
  font-size: 13px;
  font-weight: 400;
  color: ${p => p.$listening ? '#EF4444' : 'var(--text-tertiary)'};
  transition: color 200ms ease;
  font-family: var(--font);
`;

const ListeningDots = styled.span`
  display: inline-flex;
  gap: 3px;
  margin-left: 4px;
  vertical-align: middle;
  & span {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #EF4444;
    display: inline-block;
    animation: ${dotBounce} 1.2s ease-in-out infinite;
    &:nth-child(2) { animation-delay: 0.15s; }
    &:nth-child(3) { animation-delay: 0.3s; }
  }
`;

/* ── Check browser support once ── */
const hasSpeechRecognition = typeof window !== 'undefined' &&
  !!(window.SpeechRecognition || window.webkitSpeechRecognition);

export default function Workspace() {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [problem, setProblem] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Stage 1
  const [explanation, setExplanation] = useState('');
  const [interactions, setInteractions] = useState([]);
  const [goalsHit, setGoalsHit] = useState([]);
  const [stage1Done, setStage1Done] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Stage 2
  const [finalAnswer, setFinalAnswer] = useState('');
  const [submittingFinal, setSubmittingFinal] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Post-submission diagnosis
  const [diagnosis, setDiagnosis] = useState(null);
  const [diagnosisLoading, setDiagnosisLoading] = useState(false);

  // Voice — dead simple, no Web Audio API
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const textBeforeVoice = useRef('');
  const explanationRef = useRef('');

  // Keep ref in sync with state so callbacks always read latest
  useEffect(() => { explanationRef.current = explanation; }, [explanation]);

  const convEnd = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
        recognitionRef.current = null;
      }
    };
  }, []);

  const toggleListening = () => {
    console.log('[Voice] toggleListening, isListening:', isListening);

    // ── STOP ──
    if (isListening) {
      console.log('[Voice] Stopping...');
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      setIsListening(false);
      return;
    }

    // ── START ──
    const SpeechRecAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecAPI) {
      console.error('[Voice] SpeechRecognition not supported');
      return;
    }

    // Create fresh instance every time
    const recognition = new SpeechRecAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    // Snapshot current textarea content
    textBeforeVoice.current = explanationRef.current;
    console.log('[Voice] Starting recognition, prefix:', JSON.stringify(textBeforeVoice.current));

    recognition.onstart = () => {
      console.log('[Voice] ✅ onstart — listening!');
    };

    recognition.onaudiostart = () => {
      console.log('[Voice] ✅ onaudiostart — mic is capturing');
    };

    recognition.onspeechstart = () => {
      console.log('[Voice] ✅ onspeechstart — speech detected');
    };

    recognition.onresult = (event) => {
      let interim = '';
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += t;
        } else {
          interim += t;
        }
      }

      const prefix = textBeforeVoice.current;
      const sep = prefix && !prefix.endsWith(' ') && !prefix.endsWith('\n') ? ' ' : '';

      if (finalText) {
        console.log('[Voice] ✅ Final:', JSON.stringify(finalText));
        const newText = prefix + sep + finalText;
        setExplanation(newText);
        textBeforeVoice.current = newText;
      } else if (interim) {
        console.log('[Voice] interim:', JSON.stringify(interim));
        setExplanation(prefix + sep + interim);
      }
    };

    recognition.onerror = (event) => {
      console.error('[Voice] ❌ onerror:', event.error);
      // no-speech is harmless — Chrome fires this after silence, but with continuous=true it keeps going
      if (event.error === 'no-speech') return;
      if (event.error === 'not-allowed') {
        alert('Microphone access is blocked. Click the lock/camera icon in the address bar and allow microphone access, then try again.');
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log('[Voice] onend — session ended');
      setIsListening(false);
      recognitionRef.current = null;
    };

    // Store and start
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsListening(true);
      console.log('[Voice] ✅ start() called');
    } catch (err) {
      console.error('[Voice] ❌ start() threw:', err);
      setIsListening(false);
    }
  };

  const fetchDiagnosis = async (prob, att) => {
    if (diagnosisLoading || diagnosis) return;
    setDiagnosisLoading(true);
    try {
      const goals = prob.goals || [];
      const gHit = att.goals_hit || [];
      const gMissed = goals.filter(g => !gHit.includes(g));
      const result = await api.post('/api/socratic/diagnose', {
        interactions: att.interactions || [],
        goalsHit: gHit,
        goalsMissed: gMissed,
        finalAnswer: att.final_answer || null,
        referenceConcept: prob.question || '',
      });
      setDiagnosis(result);
    } catch (err) {
      console.error('Diagnosis fetch error:', err);
      setDiagnosis({ diagnosis: 'Unable to generate feedback at this time.', reflectionQuestion: null, resource: null, allGoalsHit: false });
    } finally {
      setDiagnosisLoading(false);
    }
  };

  useEffect(() => {
    async function load() {
      try {
        const [prob, att] = await Promise.all([
          api.get(`/api/problems/${problemId}`),
          api.get(`/api/attempts/${problemId}`).catch(() => null),
        ]);
        setProblem(prob);

        if (att) {
          setAttempt(att);
          setInteractions(att.interactions || []);
          setGoalsHit(att.goals_hit || []);
          if (att.interactions?.length > 0) {
            const lastInteraction = att.interactions[att.interactions.length - 1];
            if (lastInteraction?.allGoalsHit || att.status === 'completed' || att.interactions.length >= prob.max_interactions) {
              setStage1Done(true);
            }
          }
          if (att.final_answer) {
            setFinalAnswer(att.final_answer);
            setSubmitted(true);
            setStage1Done(true);
            // Auto-fetch diagnosis for already-submitted attempts
            fetchDiagnosis(prob, att);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [problemId]);

  useEffect(() => {
    convEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [interactions]);

  const interactionsUsed = interactions.length;
  const maxInt = problem?.max_interactions || 5;
  const remaining = Math.max(0, maxInt - interactionsUsed);
  const exhausted = remaining === 0;

  const handleSubmitExplanation = async () => {
    if (!explanation.trim()) return;
    // Stop voice if it's running
    if (isListening && recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      setIsListening(false);
    }
    setSubmitting(true);
    setError('');
    try {
      const result = await api.post('/api/socratic/validate', {
        studentExplanation: explanation,
        problemId: problemId,
        guidanceIntensity: problem.guidance_intensity || 'guided',
        interactionsRemaining: remaining,
        previousInteractions: interactions,
      });

      const newGoalsHit = result.goalsHit || [];
      const mergedGoalsHit = [...new Set([...goalsHit, ...newGoalsHit])];

      const newInteraction = {
        studentText: explanation,
        aiResponse: result.hint || result.message || '',
        goalsHit: newGoalsHit,
        allGoalsHit: result.allGoalsHit || false,
        timestamp: new Date().toISOString(),
      };

      const newInteractions = [...interactions, newInteraction];
      setInteractions(newInteractions);
      setGoalsHit(mergedGoalsHit);
      setExplanation('');

      const done = result.allGoalsHit || newInteractions.length >= maxInt;
      if (done) setStage1Done(true);

      // Save to DB
      await api.post(`/api/attempts/${problemId}`, {
        interactions: newInteractions,
        goals_hit: mergedGoalsHit,
        status: done ? (attempt?.final_answer ? 'completed' : 'in_progress') : 'in_progress',
      });

    } catch (err) {
      setError(err.message || 'Failed to submit explanation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitFinal = async () => {
    if (!finalAnswer.trim()) return;
    setSubmittingFinal(true);
    setError('');
    try {
      await api.post(`/api/attempts/${problemId}`, {
        interactions,
        goals_hit: goalsHit,
        final_answer: finalAnswer,
        status: 'completed',
      });
      setSubmitted(true);
      // Fetch AI diagnosis for post-submission feedback
      if (problem) {
        fetchDiagnosis(problem, { interactions, goals_hit: goalsHit, final_answer: finalAnswer });
      }
    } catch (err) {
      setError(err.message || 'Failed to submit final answer.');
    } finally {
      setSubmittingFinal(false);
    }
  };

  if (loading) return <LoadMsg>Loading workspace...</LoadMsg>;
  if (!problem) return <LoadMsg>Problem not found.</LoadMsg>;

  return (
    <Page>
      <Nav>
        <NavBrandWrap>
          <LogoMark />
          <NavBrandText>ThinkTrace</NavBrandText>
        </NavBrandWrap>
        <NavBack onClick={() => navigate('/dashboard')}>&#8592; Back to Dashboard</NavBack>
      </Nav>
      <Main>
        {/* Problem */}
        <ProblemCard>
          <ProblemTitle>{problem.title}</ProblemTitle>
          <ProblemQ>{problem.question}</ProblemQ>
        </ProblemCard>

        {/* Stage indicators */}
        <Stages>
          <StageItem $active={!stage1Done} $done={stage1Done}>
            <StageNum>STAGE 1</StageNum>
            Prove Your Understanding
          </StageItem>
          <StageItem $active={stage1Done && !submitted} $done={submitted}>
            <StageNum>STAGE 2</StageNum>
            Final Answer
          </StageItem>
        </Stages>

        {/* Stage 1 */}
        <SectionCard>
          <SectionTitle>Stage 1 — Prove Your Understanding</SectionTitle>

          {/* Conversation history */}
          {interactions.length > 0 && (
            <ConvWrap>
              {interactions.map((it, i) => (
                <div key={i}>
                  <Bubble $student>
                    <BubbleLabel>You</BubbleLabel>
                    <BubbleText $student>{it.studentText}</BubbleText>
                  </Bubble>
                  {it.aiResponse && (
                    <Bubble style={{ marginTop: 12 }}>
                      <BubbleLabel $ai>THINKTRACE AI</BubbleLabel>
                      <BubbleText>{it.aiResponse}</BubbleText>
                    </Bubble>
                  )}
                </div>
              ))}
              <div ref={convEnd} />
            </ConvWrap>
          )}

          {stage1Done ? (
            <SuccessBanner>
              {exhausted && !interactions[interactions.length - 1]?.allGoalsHit
                ? `You've used all ${maxInt} interactions. Stage 2 is now unlocked.`
                : 'Great work! You\'ve demonstrated understanding. Stage 2 is now unlocked.'}
            </SuccessBanner>
          ) : (
            <>
              <Counter $low={remaining <= 2}>{remaining} of {maxInt} attempts remaining</Counter>
              <TextArea
                value={explanation}
                onChange={e => setExplanation(e.target.value)}
                placeholder="Explain the concept in your own words. Be specific — what does it mean, how does it work, and why does it matter?"
                disabled={submitting || exhausted}
              />
              {hasSpeechRecognition && (
                <VoiceRow>
                  <MicBtn
                    $listening={isListening}
                    onClick={toggleListening}
                    disabled={submitting || exhausted}
                    type="button"
                    title={isListening ? 'Click to stop' : 'Speak your explanation'}
                  >
                    <MicSvg />
                  </MicBtn>
                  <VoiceLabel $listening={isListening}>
                    {isListening
                      ? <>Listening<ListeningDots><span /><span /><span /></ListeningDots></>
                      : 'Or speak your explanation'
                    }
                  </VoiceLabel>
                </VoiceRow>
              )}
              {error && <ErrMsg>{error}</ErrMsg>}
              <SubmitBtn onClick={handleSubmitExplanation} disabled={submitting || !explanation.trim() || exhausted}>
                {submitting ? 'Evaluating...' : 'Submit Explanation'}
              </SubmitBtn>
            </>
          )}
        </SectionCard>

        {/* Stage 2 */}
        <SectionCard>
          <SectionTitle>Stage 2 — Final Answer</SectionTitle>
          {!stage1Done ? (
            <LockedMsg>Complete Stage 1 first to unlock your final answer submission.</LockedMsg>
          ) : submitted ? (
            <FeedbackWrap>
              <FeedbackSuccessBanner>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                Answer Submitted
              </FeedbackSuccessBanner>

              {diagnosisLoading ? (
                <FeedbackLoading>
                  <span style={{ display: 'inline-flex', gap: 4 }}>
                    <PulsingDot /><PulsingDot style={{ animationDelay: '0.2s' }} /><PulsingDot style={{ animationDelay: '0.4s' }} />
                  </span>
                  Generating your personalized feedback…
                </FeedbackLoading>
              ) : diagnosis?.allGoalsHit ? (
                <CelebrationCard>
                  <CelebrationIcon>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                  </CelebrationIcon>
                  <CelebrationText>{diagnosis.diagnosis}</CelebrationText>
                </CelebrationCard>
              ) : diagnosis ? (
                <>
                  {/* Diagnosis */}
                  <DiagnosisCard>
                    <DiagnosisLabel>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--accent)" stroke="none"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z"/></svg>
                      How did you do?
                    </DiagnosisLabel>
                    <DiagnosisText>{diagnosis.diagnosis}</DiagnosisText>
                  </DiagnosisCard>

                  {/* Reflection Question */}
                  {diagnosis.reflectionQuestion && (
                    <ReflectionCard>
                      <ReflectionIcon>?</ReflectionIcon>
                      <ReflectionContent>
                        <ReflectionLabel>Think About This</ReflectionLabel>
                        <ReflectionQuestion>{diagnosis.reflectionQuestion}</ReflectionQuestion>
                      </ReflectionContent>
                    </ReflectionCard>
                  )}

                  {/* Resource */}
                  {diagnosis.resource && diagnosis.resource.url && (
                    <ResourceCard href={diagnosis.resource.url} target="_blank" rel="noopener noreferrer">
                      <ResourceIcon>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                        </svg>
                      </ResourceIcon>
                      <ResourceInfo>
                        <ResourceLabel>Explore This</ResourceLabel>
                        <ResourceTitle>{diagnosis.resource.title}</ResourceTitle>
                      </ResourceInfo>
                      <ResourceArrow>→</ResourceArrow>
                    </ResourceCard>
                  )}
                </>
              ) : null}
            </FeedbackWrap>
          ) : (
            <>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16, lineHeight: 1.6, fontFamily: 'var(--font)' }}>
                Write your complete, polished final answer. Take your time — you can only submit once.
              </p>
              <TextArea
                value={finalAnswer}
                onChange={e => setFinalAnswer(e.target.value)}
                placeholder="Write your comprehensive final answer here..."
                style={{ minHeight: 180 }}
                disabled={submittingFinal}
              />
              {error && <ErrMsg>{error}</ErrMsg>}
              <SubmitBtn onClick={handleSubmitFinal} disabled={submittingFinal || !finalAnswer.trim()}>
                {submittingFinal ? 'Submitting...' : 'Submit Final Answer'}
              </SubmitBtn>
            </>
          )}
        </SectionCard>
      </Main>
    </Page>
  );
}
