import { useContext, useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { UserContext } from '@/common/contexts/UserContext';

const buildUrl = (endpoint) =>
  `${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '')}${endpoint}`;

/* ── Layout ─────────────────────────────────────────────────────── */

const Page = styled.div`
  max-width: 780px;
  margin: 2rem auto;
  padding: 0 1.5rem 6rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
`;

/* ── Cards ───────────────────────────────────────────────────────── */

const Card = styled.section`
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ProblemCard = styled(Card)`
  background: #f8fafc;
`;

const StepCard = styled(Card)`
  opacity: ${({ $locked }) => ($locked ? 0.45 : 1)};
  pointer-events: ${({ $locked }) => ($locked ? 'none' : 'auto')};
  transition: opacity 0.3s ease;
`;

/* ── Typography ─────────────────────────────────────────────────── */

const SectionLabel = styled.h2`
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
  margin: 0;
`;

const CardTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
`;

const SubText = styled.p`
  font-size: 0.9rem;
  color: #475569;
  margin: 0;
  line-height: 1.6;
`;

const ProblemText = styled.p`
  font-size: 1rem;
  line-height: 1.65;
  color: #1e293b;
  margin: 0;
`;

/* ── Conversation thread ─────────────────────────────────────────── */

const Thread = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const Exchange = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const AttemptRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const AttemptBubble = styled.div`
  background: #6366f1;
  color: #fff;
  border-radius: 12px 12px 2px 12px;
  padding: 0.75rem 1rem;
  font-size: 0.92rem;
  line-height: 1.55;
  max-width: 88%;
  white-space: pre-wrap;
`;

const AttemptLabel = styled.span`
  font-size: 0.7rem;
  color: #94a3b8;
  text-align: right;
  display: block;
  margin-bottom: 0.2rem;
`;

const TutorBox = styled.div`
  border-left: 4px solid #6366f1;
  background: #eef2ff;
  border-radius: 0 8px 8px 0;
  padding: 0.9rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const TutorLabel = styled.span`
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #4338ca;
`;

const TutorMessage = styled.p`
  margin: 0;
  font-size: 0.92rem;
  color: #1e1b4b;
  line-height: 1.6;
`;

const SuccessBox = styled.div`
  border-left: 4px solid #16a34a;
  background: #f0fdf4;
  border-radius: 0 8px 8px 0;
  padding: 0.9rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const SuccessLabel = styled.span`
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #15803d;
`;

const SuccessMessage = styled.p`
  margin: 0;
  font-size: 0.92rem;
  color: #14532d;
  line-height: 1.6;
`;

/* ── Input area ──────────────────────────────────────────────────── */

const InputArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 110px;
  padding: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  line-height: 1.5;
  resize: vertical;
  box-sizing: border-box;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  }

  &:disabled {
    background: #f1f5f9;
    cursor: not-allowed;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.6rem 1.4rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, opacity 0.15s ease;
  background: ${({ $variant }) => ($variant === 'success' ? '#16a34a' : '#6366f1')};
  color: #fff;

  &:hover:not(:disabled) {
    opacity: 0.88;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AttemptCount = styled.span`
  font-size: 0.8rem;
  color: #94a3b8;
`;

const ErrorText = styled.p`
  font-size: 0.85rem;
  color: #dc2626;
  margin: 0;
`;

const LockedNotice = styled.p`
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0;
  font-style: italic;
`;

/* ── Component ───────────────────────────────────────────────────── */

export default function LearningWorkspace() {
  const { user } = useContext(UserContext);
  const { problemId } = useParams();
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [loadingProblem, setLoadingProblem] = useState(!!problemId);

  // Each entry: { explanation: string, feedback: { validated, hint?, message?, gapAnalysis? } }
  const [history, setHistory] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [apiError, setApiError] = useState('');

  // Load problem from DB if problemId is in URL
  useEffect(() => {
    if (!problemId || !user) return;
    const load = async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '')}/api/problems/${problemId}`,
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
        if (res.ok) setProblem(await res.json());
        else navigate('/workspace');
      } catch (err) {
        console.error(err);
        navigate('/workspace');
      } finally {
        setLoadingProblem(false);
      }
    };
    load();
  }, [problemId, user]);

  const [finalAnswer, setFinalAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const bottomRef = useRef(null);

  useEffect(() => {
    if (history.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  const handleCheckUnderstanding = async () => {
    if (!currentInput.trim()) return;

    setIsChecking(true);
    setApiError('');

    try {
      const idToken = user ? await user.getIdToken() : null;
      const response = await fetch(buildUrl('/api/socratic/validate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
        },
        body: JSON.stringify({
          studentExplanation: currentInput,
          referenceConcept: problem?.question || 'Explain how a binary search algorithm works and describe its time complexity.',
          problemId: problemId || null,
          history: history.map((h) => ({
            explanation: h.explanation,
            hint: h.feedback.hint || null,
            message: h.feedback.message || null,
          })),
        }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const feedback = await response.json();

      setHistory((prev) => [...prev, { explanation: currentInput, feedback }]);
      setCurrentInput('');

      if (feedback.validated) {
        setIsValidated(true);
      }
    } catch (err) {
      setApiError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setIsChecking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleCheckUnderstanding();
    }
  };

  if (loadingProblem) return <Page><p style={{ color: '#94a3b8', marginTop: '2rem' }}>Loading problem…</p></Page>;

  const problemQuestion = problem?.question || 'Explain how a binary search algorithm works and describe its time complexity.';
  const problemTitle = problem?.title || 'Learning Workspace';

  return (
    <Page>
      <PageTitle>{problemTitle}</PageTitle>

      {/* Problem */}
      <ProblemCard>
        <SectionLabel>Problem</SectionLabel>
        <ProblemText>{problemQuestion}</ProblemText>
      </ProblemCard>

      {/* Step 1: Understanding */}
      <StepCard>
        <CardTitle>Step 1: Understanding</CardTitle>
        <SubText>
          In your own words, explain the concept above. The tutor will guide you
          with questions until your understanding is solid.
        </SubText>

        {/* Conversation thread */}
        {history.length > 0 && (
          <Thread>
            {history.map((entry, i) => (
              <Exchange key={i}>
                <AttemptRow>
                  <div style={{ maxWidth: '88%' }}>
                    <AttemptLabel>Attempt {i + 1}</AttemptLabel>
                    <AttemptBubble>{entry.explanation}</AttemptBubble>
                  </div>
                </AttemptRow>

                {entry.feedback.validated ? (
                  <SuccessBox>
                    <SuccessLabel>Understanding confirmed</SuccessLabel>
                    <SuccessMessage>{entry.feedback.message}</SuccessMessage>
                  </SuccessBox>
                ) : (
                  <TutorBox>
                    <TutorLabel>Tutor</TutorLabel>
                    <TutorMessage>{entry.feedback.hint}</TutorMessage>
                  </TutorBox>
                )}
              </Exchange>
            ))}
          </Thread>
        )}

        {/* Input — hidden once validated */}
        {!isValidated && (
          <InputArea>
            <TextArea
              placeholder={
                history.length === 0
                  ? 'Type your explanation here…'
                  : 'Revise your explanation based on the hint above…'
              }
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isChecking}
            />
            <ButtonRow>
              <Button
                onClick={handleCheckUnderstanding}
                disabled={isChecking || !currentInput.trim()}
              >
                {isChecking ? 'Checking…' : 'Check Understanding'}
              </Button>
              {history.length > 0 && (
                <AttemptCount>{history.length} attempt{history.length !== 1 ? 's' : ''} so far</AttemptCount>
              )}
            </ButtonRow>
            {apiError && <ErrorText>{apiError}</ErrorText>}
            <SubText style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Tip: ⌘ + Enter to submit
            </SubText>
          </InputArea>
        )}

        <div ref={bottomRef} />
      </StepCard>

      {/* Step 2: Final Answer */}
      <StepCard $locked={!isValidated}>
        <CardTitle>Step 2: Final Answer</CardTitle>

        {!isValidated && (
          <LockedNotice>Complete Step 1 to unlock this section.</LockedNotice>
        )}

        {isValidated && !isSubmitted && (
          <>
            <SubText>
              Now write your complete, polished answer to the problem.
            </SubText>
            <TextArea
              placeholder='Write your final answer here…'
              value={finalAnswer}
              onChange={(e) => setFinalAnswer(e.target.value)}
            />
            <Button
              $variant='success'
              onClick={() => finalAnswer.trim() && setIsSubmitted(true)}
              disabled={!finalAnswer.trim()}
            >
              Submit
            </Button>
          </>
        )}

        {isSubmitted && (
          <SuccessBox>
            <SuccessLabel>Submitted</SuccessLabel>
            <SuccessMessage>
              Your answer has been submitted. Great job working through that!
            </SuccessMessage>
          </SuccessBox>
        )}
      </StepCard>
    </Page>
  );
}
