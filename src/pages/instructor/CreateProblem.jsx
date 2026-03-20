import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useUser } from '@/common/contexts/UserContext';

const buildUrl = (e) => `${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '')}${e}`;

const Page = styled.div`
  max-width: 700px;
  margin: 2rem auto;
  padding: 0 1.5rem 4rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BackBtn = styled.button`
  background: none;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.4rem 0.9rem;
  font-size: 0.85rem;
  color: #64748b;
  cursor: pointer;
  &:hover { background: #f8fafc; }
`;

const Title = styled.h1`
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0;
`;

const Card = styled.div`
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Label = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const Input = styled.input`
  padding: 0.65rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  &:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
`;

const TextArea = styled.textarea`
  padding: 0.65rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  min-height: 100px;
  resize: vertical;
  &:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
`;

const SectionTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0;
  color: #1e293b;
`;

const GoalRow = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const GoalInput = styled(Input)`
  flex: 1;
`;

const IconBtn = styled.button`
  background: none;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  font-size: 1.1rem;
  cursor: pointer;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  &:hover { background: #f8fafc; }
`;

const AddGoalBtn = styled.button`
  align-self: flex-start;
  background: none;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  color: #6366f1;
  cursor: pointer;
  font-weight: 600;
  &:hover { background: #eef2ff; border-color: #6366f1; }
`;

const Row = styled.div`
  display: flex;
  gap: 1rem;
`;

const Select = styled.select`
  padding: 0.65rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  flex: 1;
  &:focus { outline: none; border-color: #6366f1; }
`;

const SubmitBtn = styled.button`
  padding: 0.75rem 2rem;
  background: #6366f1;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  align-self: flex-start;
  &:hover:not(:disabled) { opacity: 0.88; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const ErrorText = styled.p`
  color: #dc2626;
  font-size: 0.85rem;
  margin: 0;
`;

export default function CreateProblem() {
  const navigate = useNavigate();
  const { user } = useUser();

  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [goals, setGoals] = useState(['', '']);
  const [socraticMode, setSocraticMode] = useState('gentle');
  const [maxHints, setMaxHints] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const updateGoal = (i, val) => setGoals((g) => g.map((v, idx) => (idx === i ? val : v)));
  const addGoal = () => setGoals((g) => [...g, '']);
  const removeGoal = (i) => setGoals((g) => g.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const filledGoals = goals.filter((g) => g.trim());
    if (!title.trim() || !question.trim() || filledGoals.length === 0) {
      return setError('Title, question, and at least one learning goal are required.');
    }

    setIsSubmitting(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(buildUrl('/api/problems'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ title, question, goals: filledGoals, socraticMode, maxHints }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create problem');

      navigate('/instructor');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Page>
      <Header>
        <BackBtn onClick={() => navigate('/instructor')}>← Back</BackBtn>
        <Title>Create Problem</Title>
      </Header>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Card>
          <SectionTitle>Problem</SectionTitle>
          <Label>
            Title
            <Input
              placeholder='e.g. Binary Search Fundamentals'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Label>
          <Label>
            Question prompt
            <TextArea
              placeholder='e.g. Explain how binary search works and describe its time complexity.'
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </Label>
        </Card>

        <Card>
          <SectionTitle>Learning Goals</SectionTitle>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
            The student must demonstrate ALL of these before being validated. They will never see this list.
          </p>
          {goals.map((goal, i) => (
            <GoalRow key={i}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', width: '20px' }}>{i + 1}.</span>
              <GoalInput
                placeholder={`e.g. Must state that the list must be sorted first`}
                value={goal}
                onChange={(e) => updateGoal(i, e.target.value)}
              />
              {goals.length > 1 && (
                <IconBtn type='button' onClick={() => removeGoal(i)}>×</IconBtn>
              )}
            </GoalRow>
          ))}
          <AddGoalBtn type='button' onClick={addGoal}>+ Add goal</AddGoalBtn>
        </Card>

        <Card>
          <SectionTitle>Settings</SectionTitle>
          <Row>
            <Label style={{ flex: 1 }}>
              Socratic mode
              <Select value={socraticMode} onChange={(e) => setSocraticMode(e.target.value)}>
                <option value='gentle'>Gentle — broad nudges</option>
                <option value='moderate'>Moderate — focused questions</option>
                <option value='strict'>Strict — minimal guidance</option>
              </Select>
            </Label>
            <Label style={{ width: '120px' }}>
              Max hints
              <Input
                type='number'
                min={1}
                max={20}
                value={maxHints}
                onChange={(e) => setMaxHints(Number(e.target.value))}
              />
            </Label>
          </Row>
        </Card>

        {error && <ErrorText>{error}</ErrorText>}
        <SubmitBtn type='submit' disabled={isSubmitting}>
          {isSubmitting ? 'Publishing…' : 'Publish Problem'}
        </SubmitBtn>
      </form>
    </Page>
  );
}
