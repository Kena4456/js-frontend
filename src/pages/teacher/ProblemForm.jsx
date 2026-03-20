import { useState } from 'react';
import styled from 'styled-components';
import { api } from '../../utils/api.js';

const Page = styled.div`min-height: 100vh; background: var(--bg-page);`;

const Nav = styled.nav`
  background: var(--bg-surface); border-bottom: 1px solid var(--border);
  box-shadow: 0 1px 0 var(--border); padding: 0 32px;
  height: 60px; display: flex; align-items: center; justify-content: space-between;
`;
const NavLeft = styled.div`display: flex; align-items: center; gap: 10px;`;
const LogoMark = () => (
  <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
    <rect x="2" y="5" width="16" height="16" rx="4" fill="var(--accent)" opacity="0.35"/>
    <rect x="10" y="7" width="16" height="16" rx="4" fill="var(--accent)"/>
  </svg>
);
const NavBrand = styled.span`font-size: 20px; font-weight: 700; color: var(--accent); letter-spacing: -0.5px;`;
const NavBack = styled.button`
  font-size: 14px; color: var(--text-secondary); background: none; border: none;
  font-weight: 500; transition: color 150ms ease;
  &:hover { color: var(--text-primary); }
`;

const Main = styled.main`max-width: 720px; margin: 0 auto; padding: 40px 24px;`;
const PageTitle = styled.h2`font-size: 20px; font-weight: 600; color: var(--text-primary); letter-spacing: -0.3px; margin-bottom: 8px;`;
const PageSub = styled.p`color: var(--text-secondary); font-size: 14px; margin-bottom: 36px;`;

/* Step indicator — circles connected by lines */
const StepsWrap = styled.div`display: flex; align-items: center; justify-content: center; margin-bottom: 40px;`;
const StepCircle = styled.div`
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; flex-shrink: 0;
  transition: all 200ms ease;
  background: ${p => p.$done ? 'var(--accent)' : p.$active ? 'var(--accent)' : 'var(--bg-surface)'};
  color: ${p => (p.$done || p.$active) ? '#fff' : 'var(--text-tertiary)'};
  border: 2px solid ${p => (p.$done || p.$active) ? 'var(--accent)' : 'var(--border)'};
  box-shadow: ${p => p.$active ? '0 0 0 4px rgba(91,91,214,0.15)' : 'none'};
`;
const StepLine = styled.div`
  flex: 1; height: 2px; max-width: 60px;
  background: ${p => p.$done ? 'var(--accent)' : 'var(--border)'};
  transition: background 200ms ease;
`;
const StepLabel = styled.div`
  font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em;
  color: ${p => p.$active ? 'var(--accent)' : 'var(--text-tertiary)'};
  text-align: center; margin-top: 6px;
`;
const StepGroup = styled.div`display: flex; flex-direction: column; align-items: center;`;

const Card = styled.div`
  background: var(--bg-surface); border-radius: var(--radius-xl);
  border: 1px solid var(--border); padding: 32px;
  box-shadow: var(--shadow-md);
`;

const CardTitle = styled.h3`
  font-size: 16px; font-weight: 600; color: var(--text-primary);
  letter-spacing: -0.2px; margin-bottom: 6px;
`;
const CardDesc = styled.p`color: var(--text-secondary); font-size: 14px; margin-bottom: 24px; line-height: 1.6;`;

const Label = styled.label`
  display: block; font-size: 11px; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.08em; color: var(--text-tertiary); margin-bottom: 6px;
`;
const Input = styled.input`
  width: 100%; padding: 11px 14px; border: 1px solid var(--border); border-radius: var(--radius-md);
  font-size: 14px; color: var(--text-primary); background: var(--bg-subtle);
  transition: all 150ms ease; outline: none;
  &:focus { background: var(--bg-surface); border-color: var(--accent); box-shadow: 0 0 0 3px rgba(91,91,214,0.12); }
  &::placeholder { color: var(--text-tertiary); }
`;
const TextArea = styled.textarea`
  width: 100%; padding: 14px; border: 1px solid var(--border); border-radius: var(--radius-md);
  font-size: 14px; color: var(--text-primary); background: var(--bg-subtle);
  resize: vertical; min-height: ${p => p.$tall ? '160px' : '100px'};
  transition: all 150ms ease; outline: none; line-height: 1.7;
  &:focus { background: var(--bg-surface); border-color: var(--accent); box-shadow: 0 0 0 3px rgba(91,91,214,0.12); }
  &::placeholder { color: var(--text-tertiary); }
`;
const Field = styled.div`margin-bottom: 22px;`;

const BtnRow = styled.div`display: flex; gap: 10px; justify-content: flex-end; margin-top: 12px;`;
const Btn = styled.button`
  padding: 10px 22px; border-radius: var(--radius-md); font-size: 14px; font-weight: 600;
  border: none; transition: all 150ms ease; letter-spacing: 0.01em;
  background: ${p => p.$secondary ? 'var(--bg-subtle)' : p.$success ? '#15803D' : 'var(--accent)'};
  color: ${p => p.$secondary ? 'var(--text-secondary)' : '#fff'};
  &:hover {
    background: ${p => p.$secondary ? 'var(--border)' : p.$success ? '#166534' : 'var(--accent-hover)'};
    transform: translateY(-1px); box-shadow: var(--shadow-sm);
  }
  &:active { transform: translateY(0); }
  &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
`;

/* Goals */
const GoalsWrap = styled.div`display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;`;
const GoalChip = styled.div`
  display: flex; align-items: flex-start; gap: 10px;
  background: var(--accent-light); border: 1px solid rgba(91,91,214,0.15); border-radius: var(--radius-sm);
  padding: 12px 14px; font-size: 14px; color: var(--accent);
`;
const GoalTextArea = styled.textarea`
  border: none; background: transparent; font-size: 14px; color: #3B3B99;
  outline: none; width: 100%; resize: none; line-height: 1.5;
  font-family: inherit; overflow: hidden;
  &::placeholder { color: rgba(91,91,214,0.5); }
`;
const RemoveBtn = styled.button`
  background: none; border: none; color: var(--text-tertiary); font-size: 18px; padding: 0;
  flex-shrink: 0; cursor: pointer; line-height: 1; transition: color 150ms ease;
  &:hover { color: #DC2626; }
`;
const AddGoalBtn = styled.button`
  font-size: 13px; font-weight: 500; color: var(--accent); background: none;
  border: 1.5px dashed rgba(91,91,214,0.3); border-radius: var(--radius-sm);
  padding: 12px 14px; transition: all 150ms ease;
  &:hover { border-color: var(--accent); background: var(--accent-light); }
`;
const AIBtn = styled.button`
  font-size: 13px; font-weight: 600; color: var(--accent); background: var(--accent-light);
  border: 1px solid rgba(91,91,214,0.15); border-radius: var(--radius-sm);
  padding: 10px 16px; margin-bottom: 20px; transition: all 150ms ease;
  &:hover { background: rgba(91,91,214,0.12); transform: translateY(-1px); }
  &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
`;

/* Guidance intensity */
const RadioGroup = styled.div`display: flex; flex-direction: column; gap: 10px;`;
const RadioCard = styled.label`
  display: flex; align-items: flex-start; gap: 14px; cursor: pointer;
  padding: 16px 18px; border-radius: var(--radius-md);
  border: 1.5px solid ${p => p.$active ? 'var(--accent)' : 'var(--border)'};
  border-left: ${p => p.$active ? '4px solid var(--accent)' : '1.5px solid var(--border)'};
  background: ${p => p.$active ? 'var(--accent-light)' : 'var(--bg-surface)'};
  transition: all 150ms ease;
  &:hover { border-color: ${p => p.$active ? 'var(--accent)' : 'var(--border-strong)'}; }
`;
const RadioDot = styled.div`
  width: 18px; height: 18px; border-radius: 50%;
  border: 2px solid ${p => p.$active ? 'var(--accent)' : 'var(--border-strong)'};
  display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px;
  transition: border-color 150ms ease;
`;
const RadioInner = styled.div`
  width: 8px; height: 8px; border-radius: 50%; background: var(--accent);
  opacity: ${p => p.$active ? 1 : 0}; transition: opacity 150ms ease;
`;
const RadioTitle = styled.div`font-weight: 600; font-size: 14px; color: var(--text-primary);`;
const RadioDesc = styled.div`font-size: 13px; color: var(--text-secondary); margin-top: 2px; line-height: 1.5;`;

/* PDF suggestion */
const SuggCard = styled.div`
  border: 1.5px solid var(--border); border-radius: var(--radius-md); padding: 16px 18px;
  cursor: pointer; margin-bottom: 10px; transition: all 200ms ease;
  &:hover { border-color: var(--accent); background: var(--accent-light); transform: translateY(-1px); box-shadow: var(--shadow-sm); }
`;
const SuggTitle = styled.p`font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px;`;
const SuggQ = styled.p`font-size: 13px; color: var(--text-secondary); line-height: 1.5;`;

const ErrMsg = styled.p`color: #DC2626; font-size: 13px; margin-top: 8px; font-weight: 500;`;

const GUIDANCE_OPTIONS = [
  { value: 'independent', label: 'Independent', desc: 'Minimal, sharp. No warmth. Pure challenge. Forces deep thinking with no scaffolding.' },
  { value: 'guided', label: 'Guided', desc: 'Targeted nudging. Acknowledges partial understanding and points toward the gap.' },
  { value: 'supported', label: 'Supported', desc: 'Warm and encouraging. Clearly acknowledges what is correct, then gently guides toward gaps.' },
];

const STEP_LABELS = ['Question', 'Content', 'Goals', 'Configure'];

export default function ProblemForm({ existing, onSave, onCancel }) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState(existing?.title || '');
  const [question, setQuestion] = useState(existing?.question || '');
  const [goals, setGoals] = useState(existing?.goals || []);
  const [guidanceIntensity, setGuidanceIntensity] = useState(existing?.guidance_intensity || 'guided');
  const [maxInteractions, setMaxInteractions] = useState(existing?.max_interactions || 5);
  const [pdfText, setPdfText] = useState(existing?.pdf_text || '');
  const [suggestedProblems, setSuggestedProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('pdf', file);
      const res = await api.postForm('/api/socratic/upload-pdf', fd);
      setPdfText(res.pdfText || '');
      setSuggestedProblems(res.suggestedProblems || []);
    } catch (err) {
      setError('PDF processing failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestGoals = async () => {
    if (!question) return;
    setLoading(true); setError('');
    try {
      const res = await api.post('/api/socratic/suggest-goals', { question, pdfText });
      setGoals(res.goals || []);
    } catch (err) {
      setError('Failed to suggest goals: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateGoal = (i, val) => setGoals(g => g.map((x, j) => j === i ? val : x));
  const removeGoal = (i) => setGoals(g => g.filter((_, j) => j !== i));
  const addGoal = () => setGoals(g => [...g, '']);

  const handleSave = async (status) => {
    if (!title || !question) { setError('Title and question are required.'); return; }
    setLoading(true); setError('');
    try {
      const payload = { title, question, goals, guidance_intensity: guidanceIntensity, max_interactions: maxInteractions, pdf_text: pdfText };
      if (existing) {
        await api.put(`/api/problems/${existing.id}`, payload);
        if (status === 'published') await api.patch(`/api/problems/${existing.id}/publish`, {});
      } else {
        const created = await api.post('/api/problems', payload);
        if (status === 'published') await api.patch(`/api/problems/${created.id}/publish`, {});
      }
      onSave();
    } catch (err) {
      setError(err.message || 'Save failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <Nav>
        <NavLeft><LogoMark /><NavBrand>ThinkTrace</NavBrand></NavLeft>
        <NavBack onClick={onCancel}>← Back</NavBack>
      </Nav>
      <Main>
        <PageTitle>{existing ? 'Edit Problem' : 'Create New Problem'}</PageTitle>
        <PageSub>Build your Socratic problem step by step.</PageSub>

        <StepsWrap>
          {[1,2,3,4].map((s, i) => (
            <span key={s} style={{ display: 'contents' }}>
              <StepGroup>
                <StepCircle $active={step === s} $done={step > s}>
                  {step > s ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg> : s}
                </StepCircle>
                <StepLabel $active={step === s}>{STEP_LABELS[i]}</StepLabel>
              </StepGroup>
              {i < 3 && <StepLine $done={step > s} />}
            </span>
          ))}
        </StepsWrap>

        {step === 1 && (
          <Card>
            <CardTitle>Write the Question</CardTitle>
            <CardDesc>Give your problem a clear title and write the full question students will answer.</CardDesc>
            <Field>
              <Label>Problem Title</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Newton's Third Law" />
            </Field>
            <Field>
              <Label>Question</Label>
              <TextArea $tall value={question} onChange={e => setQuestion(e.target.value)}
                placeholder="Write the full question here. Be specific about what you want students to explain..." />
            </Field>
            {error && <ErrMsg>{error}</ErrMsg>}
            <BtnRow>
              <Btn $secondary onClick={onCancel}>Cancel</Btn>
              <Btn onClick={() => { if (!title || !question) { setError('Both fields required.'); return; } setError(''); setStep(2); }}>
                Next →
              </Btn>
            </BtnRow>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardTitle>Upload Class Content</CardTitle>
            <CardDesc>Optional — upload a PDF (lecture notes, textbook) and AI will suggest problems based on the content.</CardDesc>
            <Field>
              <Label>Upload PDF</Label>
              <Input type="file" accept=".pdf" onChange={handlePdfUpload} disabled={loading} />
            </Field>
            {loading && <p style={{ color: 'var(--accent)', fontSize: 14, fontWeight: 500 }}>Processing PDF...</p>}
            {suggestedProblems.length > 0 && (
              <div>
                <Label style={{ marginBottom: 12 }}>AI-Suggested Problems (click to use)</Label>
                {suggestedProblems.map((p, i) => (
                  <SuggCard key={i} onClick={() => { setTitle(p.title); setQuestion(p.question); }}>
                    <SuggTitle>{p.title}</SuggTitle>
                    <SuggQ>{p.question}</SuggQ>
                  </SuggCard>
                ))}
              </div>
            )}
            {error && <ErrMsg>{error}</ErrMsg>}
            <BtnRow>
              <Btn $secondary onClick={() => setStep(1)}>← Back</Btn>
              <Btn onClick={() => setStep(3)}>Next →</Btn>
            </BtnRow>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardTitle>Set Learning Goals</CardTitle>
            <CardDesc>Goals are what the AI evaluates students against. Students never see them.</CardDesc>
            <AIBtn onClick={handleSuggestGoals} disabled={loading}>
              {loading ? 'Generating...' : <><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{marginRight: 6}}><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z"/></svg>AI Generate Goals</>}
            </AIBtn>
            <GoalsWrap>
              {goals.map((g, i) => (
                <GoalChip key={i}>
                  <GoalTextArea
                    value={g}
                    onChange={e => updateGoal(i, e.target.value)}
                    placeholder="Describe a learning goal..."
                    rows={1}
                    onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                    ref={el => { if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; } }}
                  />
                  <RemoveBtn onClick={() => removeGoal(i)} title="Delete goal">×</RemoveBtn>
                </GoalChip>
              ))}
              <AddGoalBtn onClick={addGoal}>+ Add Goal</AddGoalBtn>
            </GoalsWrap>
            {error && <ErrMsg>{error}</ErrMsg>}
            <BtnRow>
              <Btn $secondary onClick={() => setStep(2)}>← Back</Btn>
              <Btn onClick={() => setStep(4)}>Next →</Btn>
            </BtnRow>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <CardTitle>Configure</CardTitle>
            <CardDesc>Set the guidance level and interaction limits for this problem.</CardDesc>
            <Field>
              <Label>Guidance Intensity</Label>
              <RadioGroup>
                {GUIDANCE_OPTIONS.map(opt => (
                  <RadioCard key={opt.value} $active={guidanceIntensity === opt.value} onClick={() => setGuidanceIntensity(opt.value)}>
                    <RadioDot $active={guidanceIntensity === opt.value}>
                      <RadioInner $active={guidanceIntensity === opt.value} />
                    </RadioDot>
                    <div>
                      <RadioTitle>{opt.label}</RadioTitle>
                      <RadioDesc>{opt.desc}</RadioDesc>
                    </div>
                  </RadioCard>
                ))}
              </RadioGroup>
            </Field>
            <Field>
              <Label>Max AI Interactions</Label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Input
                  type="number" min="1" max="20" value={maxInteractions}
                  onChange={e => setMaxInteractions(parseInt(e.target.value) || 5)}
                  style={{ width: 100 }}
                />
                <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>interactions per student (1-20)</span>
              </div>
            </Field>
            {error && <ErrMsg>{error}</ErrMsg>}
            <BtnRow>
              <Btn $secondary onClick={() => setStep(3)}>← Back</Btn>
              <Btn $secondary onClick={() => handleSave('draft')} disabled={loading}>
                {loading ? 'Saving...' : 'Save as Draft'}
              </Btn>
              <Btn $success onClick={() => handleSave('published')} disabled={loading}>
                {loading ? 'Publishing...' : 'Publish'}
              </Btn>
            </BtnRow>
          </Card>
        )}
      </Main>
    </Page>
  );
}
