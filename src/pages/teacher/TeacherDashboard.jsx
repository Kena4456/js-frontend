import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import styled from 'styled-components';
import { auth } from '../../firebase-config.js';
import { api } from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import ProblemForm from './ProblemForm.jsx';

/* ── Logo SVG Mark ── */
const LogoMark = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect x="2" y="5" width="16" height="16" rx="4" fill="var(--accent)" opacity="0.35"/>
    <rect x="10" y="7" width="16" height="16" rx="4" fill="var(--accent)"/>
  </svg>
);

/* ── Layout ── */
const Page = styled.div`min-height: 100vh; background: var(--bg-page); font-family: var(--font);`;

const Nav = styled.nav`
  background: var(--bg-surface); border-bottom: 1px solid var(--border);
  padding: 0 32px; height: 60px; display: flex; align-items: center; justify-content: space-between;
  box-shadow: 0 1px 0 var(--border);
`;
const NavBrandWrap = styled.div`display: flex; align-items: center; gap: 10px;`;
const NavBrandText = styled.span`font-size: 20px; font-weight: 700; color: var(--accent); letter-spacing: -0.5px;`;
const NavRight = styled.div`display: flex; align-items: center; gap: 16px;`;
const UserName = styled.span`font-size: 14px; color: var(--text-secondary);`;
const LogoutBtn = styled.button`
  font-size: 14px; color: var(--text-secondary); background: none; border: 1px solid var(--border);
  border-radius: var(--radius-sm); padding: 6px 14px; transition: all 150ms ease;
  &:hover { border-color: var(--accent); color: var(--accent); }
`;

const Main = styled.main`max-width: 1100px; margin: 0 auto; padding: 40px 32px;`;

/* ── Tabs ── */
const Tabs = styled.div`display: flex; gap: 4px; border-bottom: 2px solid var(--border); margin-bottom: 32px;`;
const Tab = styled.button`
  padding: 10px 20px; font-size: 15px; font-weight: 500; border: none;
  background: none; color: ${p => p.$active ? 'var(--accent)' : 'var(--text-secondary)'};
  border-bottom: 2px solid ${p => p.$active ? 'var(--accent)' : 'transparent'};
  margin-bottom: -2px; transition: all 150ms ease;
  &:hover { color: var(--accent); }
`;

/* ── Problem list ── */
const SectionHeader = styled.div`display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;`;
const SectionTitle = styled.h2`font-size: 20px; font-weight: 600; color: var(--text-primary);`;
const PrimaryBtn = styled.button`
  padding: 9px 18px; background: var(--accent); color: #fff; border: none;
  border-radius: var(--radius-sm); font-size: 14px; font-weight: 600;
  transition: all 150ms ease;
  &:hover { background: var(--accent-hover); transform: translateY(-1px); box-shadow: var(--shadow-md); }
  &:active { transform: translateY(0); }
`;
const SecondaryBtn = styled.button`
  padding: 7px 14px; font-size: 13px; font-weight: 500; border-radius: var(--radius-sm);
  border: 1px solid ${p => p.$danger ? '#FECACA' : 'var(--border)'};
  color: ${p => p.$danger ? '#EF4444' : 'var(--text-secondary)'};
  background: none; transition: all 150ms ease;
  &:hover { border-color: ${p => p.$danger ? '#EF4444' : 'var(--accent)'}; color: ${p => p.$danger ? '#DC2626' : 'var(--accent)'}; }
`;

const ProblemList = styled.div`display: flex; flex-direction: column; gap: 12px;`;

const ProblemRow = styled.div`
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md);
  padding: 20px 24px; display: flex; align-items: center; gap: 16px;
  box-shadow: var(--shadow-sm); transition: box-shadow 150ms ease;
  &:hover { box-shadow: var(--shadow-md); }
`;
const ProblemInfo = styled.div`flex: 1;`;
const ProblemTitle = styled.h3`font-size: 15px; font-weight: 600; color: var(--text-primary);`;
const ProblemMeta = styled.p`font-size: 13px; color: var(--text-secondary); margin-top: 2px;`;
const ProblemActions = styled.div`display: flex; gap: 8px;`;

const StatusBadge = styled.span`
  font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px;
  background: ${p => p.$status === 'published' ? 'var(--accent-light)' : 'var(--bg-subtle)'};
  color: ${p => p.$status === 'published' ? 'var(--accent)' : 'var(--text-tertiary)'};
`;

/* ── Students table ── */
const Table = styled.table`
  width: 100%; border-collapse: collapse; background: var(--bg-surface);
  border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
`;
const Th = styled.th`
  padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-tertiary);
  background: var(--bg-subtle); border-bottom: 1px solid var(--border);
`;
const Td = styled.td`padding: 14px 16px; font-size: 14px; color: var(--text-primary); border-bottom: 1px solid var(--bg-subtle);`;
const Tr = styled.tr`cursor: pointer; transition: background 100ms ease; &:hover { background: var(--bg-subtle); } &:last-child td { border-bottom: none; }`;

/* ── Student detail modal ── */
const Modal = styled.div`
  position: fixed; inset: 0; background: rgba(28,27,26,0.35); z-index: 50;
  display: flex; align-items: flex-start; justify-content: center;
  padding: 32px 20px; overflow-y: auto;
  backdrop-filter: blur(4px);
`;
const ModalCard = styled.div`
  background: var(--bg-surface); border-radius: var(--radius-xl); width: 100%; max-width: 780px;
  box-shadow: 0 25px 80px rgba(28,27,26,0.16); overflow: hidden;
`;
const ModalHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 28px 32px 20px; border-bottom: 1px solid var(--border);
`;
const ModalTitle = styled.h2`font-size: 20px; font-weight: 700; color: var(--text-primary);`;
const ModalSubtitle = styled.p`font-size: 13px; color: var(--text-secondary); margin-top: 2px;`;
const CloseBtn = styled.button`
  width: 36px; height: 36px; border-radius: var(--radius-sm); border: 1px solid var(--border);
  background: var(--bg-subtle); display: flex; align-items: center; justify-content: center;
  font-size: 18px; color: var(--text-secondary); transition: all 150ms ease;
  &:hover { background: var(--accent-light); color: var(--accent); border-color: var(--accent); }
`;
const ModalBody = styled.div`
  padding: 0 32px 32px; max-height: calc(100vh - 140px); overflow-y: auto;
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 3px; }
`;

const AttemptSection = styled.div`border: 1px solid var(--border); border-radius: var(--radius-md); margin-bottom: 20px; overflow: hidden;`;
const AttemptHeader = styled.div`
  padding: 16px 20px; background: var(--bg-subtle); border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
  cursor: pointer; transition: background 150ms ease;
  &:hover { background: var(--border); }
`;
const AttemptHeaderLeft = styled.div``;
const AttemptHeaderTitle = styled.h3`font-size: 15px; font-weight: 600; color: var(--text-primary);`;
const AttemptHeaderMeta = styled.div`font-size: 12px; color: var(--text-secondary); margin-top: 3px; display: flex; gap: 12px; align-items: center;`;
const AttemptStatusDot = styled.span`
  width: 8px; height: 8px; border-radius: 50%; display: inline-block;
  background: ${p => p.$status === 'completed' ? '#10B981' : p.$status === 'in_progress' ? '#F59E0B' : 'var(--text-tertiary)'};
`;
const ChevronIcon = styled.span`
  color: var(--text-tertiary); font-size: 14px; transition: transform 200ms ease;
  transform: ${p => p.$open ? 'rotate(180deg)' : 'rotate(0deg)'};
`;
const AttemptBody = styled.div`padding: 24px;`;

/* ── AI Summary Box ── */
const SummaryBox = styled.div`
  background: var(--accent-light); border-left: 3px solid var(--accent); border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  padding: 18px 20px; margin-bottom: 24px;
`;
const SummaryLabel = styled.div`
  font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--accent); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;
`;
const SummaryText = styled.p`font-size: 14px; color: var(--text-primary); line-height: 1.7;`;
const SummaryLoading = styled.div`
  display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-tertiary);
`;
const PulsingDot = styled.span`
  width: 6px; height: 6px; background: var(--accent); border-radius: 50%;
  animation: pulse 1.2s ease-in-out infinite;
  @keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
`;

/* ── Goals ── */
const GoalsSection = styled.div`margin-bottom: 24px;`;
const SectionLabel = styled.div`
  font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--text-tertiary); margin-bottom: 10px;
`;
const GoalPills = styled.div`display: flex; flex-wrap: wrap; gap: 8px;`;
const GoalPill = styled.span`
  font-size: 13px; padding: 6px 12px; border-radius: 20px;
  display: inline-flex; align-items: center; gap: 6px; font-weight: 500;
  max-width: 100%; overflow: hidden; text-overflow: ellipsis;
  background: ${p => p.$hit ? '#ECFDF5' : '#FEF3C7'};
  color: ${p => p.$hit ? '#065F46' : '#92400E'};
  border: 1px solid ${p => p.$hit ? '#A7F3D0' : '#FDE68A'};
`;
const GoalIcon = styled.span`
  width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center;
  justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0;
  background: ${p => p.$hit ? '#10B981' : '#F59E0B'}; color: #fff;
`;

/* ── Conversation ── */
const ConvSection = styled.div`margin-bottom: 24px;`;
const ConvTimeline = styled.div`display: flex; flex-direction: column; gap: 16px;`;
const ConvTurn = styled.div`display: flex; flex-direction: column; gap: 8px;`;
const TurnNumber = styled.div`
  font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;
  color: var(--text-tertiary); text-align: center; margin: 4px 0;
`;

const StudentBubble = styled.div`
  align-self: flex-end; max-width: 85%; background: var(--accent); color: #fff;
  padding: 14px 18px; border-radius: 16px 16px 4px 16px;
  font-size: 14px; line-height: 1.6; word-wrap: break-word;
  box-shadow: 0 2px 8px rgba(91,91,214,0.2);
`;
const AiBubbleWrap = styled.div`
  align-self: flex-start; max-width: 85%; display: flex; gap: 10px;
`;
const AiAvatar = styled.div`
  width: 32px; height: 32px; border-radius: var(--radius-sm); background: var(--bg-subtle);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  font-size: 14px; border: 1px solid var(--border);
`;
const AiBubble = styled.div`
  background: var(--bg-subtle); border: 1px solid var(--border); color: var(--text-primary);
  padding: 14px 18px; border-radius: 4px 16px 16px 16px;
  font-size: 14px; line-height: 1.6; word-wrap: break-word;
`;
const AiBubbleLabel = styled.div`
  font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--text-tertiary); margin-bottom: 6px;
`;

/* ── Final Answer ── */
const FinalAnswerBox = styled.div`
  background: var(--accent-light); border-left: 3px solid var(--accent); border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  padding: 18px 20px; margin-bottom: 24px;
`;
const FinalAnswerLabel = styled.div`
  font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--accent); margin-bottom: 8px;
`;
const FinalAnswerText = styled.p`font-size: 14px; color: var(--text-primary); line-height: 1.7;`;

/* ── Grade Section ── */
const GradeSection = styled.div`
  border-top: 1px solid var(--border); padding-top: 24px;
`;
const AiGradeBox = styled.div`
  display: flex; align-items: center; gap: 16px; margin-bottom: 20px;
  background: var(--bg-subtle); padding: 16px 20px; border-radius: var(--radius-md); border: 1px solid var(--border);
`;
const AiGradeCircle = styled.div`
  width: 52px; height: 52px; border-radius: 50%; display: flex; align-items: center;
  justify-content: center; font-size: 18px; font-weight: 700; flex-shrink: 0;
  background: ${p => {
    const g = p.$grade;
    if (g >= 80) return '#ECFDF5';
    if (g >= 60) return '#FEF3C7';
    return '#FEF3C7';
  }};
  color: ${p => {
    const g = p.$grade;
    if (g >= 80) return '#065F46';
    if (g >= 60) return '#92400E';
    return '#92400E';
  }};
  border: 2px solid ${p => {
    const g = p.$grade;
    if (g >= 80) return '#A7F3D0';
    if (g >= 60) return '#FDE68A';
    return '#FDE68A';
  }};
`;
const AiGradeInfo = styled.div`flex: 1;`;
const AiGradeLabel = styled.div`font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;`;
const AiGradeReason = styled.p`font-size: 13px; color: var(--text-primary); margin-top: 3px; line-height: 1.5;`;

const TeacherGradeRow = styled.div`display: flex; gap: 12px; align-items: flex-start;`;
const GradeFieldWrap = styled.div``;
const GradeFieldLabel = styled.label`
  font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
  color: var(--text-tertiary); display: block; margin-bottom: 6px;
`;
const GradeInput = styled.input`
  width: 80px; padding: 10px 12px; border: 1.5px solid var(--border); border-radius: var(--radius-sm);
  font-size: 16px; font-weight: 600; outline: none; text-align: center;
  background: var(--bg-subtle); color: var(--text-primary);
  transition: all 150ms ease;
  &:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(91,91,214,0.12); background: var(--bg-surface); }
`;
const CommentInput = styled.textarea`
  flex: 1; padding: 10px 14px; border: 1.5px solid var(--border); border-radius: var(--radius-sm);
  font-size: 14px; resize: none; height: 68px; outline: none; font-family: inherit;
  background: var(--bg-subtle); color: var(--text-primary);
  transition: all 150ms ease;
  &:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(91,91,214,0.12); background: var(--bg-surface); }
  &::placeholder { color: var(--text-tertiary); }
`;
const SaveBtn = styled.button`
  padding: 10px 20px; background: var(--accent); color: #fff; border: none;
  border-radius: var(--radius-sm); font-size: 14px; font-weight: 600; align-self: flex-end;
  transition: all 150ms ease; margin-top: 22px;
  &:hover { background: var(--accent-hover); transform: translateY(-1px); box-shadow: var(--shadow-md); }
  &:active { transform: translateY(0); }
`;

const Empty = styled.div`text-align: center; padding: 60px 20px; color: var(--text-tertiary); font-size: 14px;`;

/* ── Grading tab ── */
const Select = styled.select`
  padding: 9px 14px; border: 1.5px solid var(--border); border-radius: var(--radius-sm);
  font-size: 15px; color: var(--text-primary); outline: none; background: var(--bg-surface); min-width: 280px;
  font-family: var(--font);
  &:focus { border-color: var(--accent); }
`;

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('problems');

  // Problems
  const [problems, setProblems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editProblem, setEditProblem] = useState(null);

  // Students
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentAttempts, setStudentAttempts] = useState([]);
  const [expandedAttempt, setExpandedAttempt] = useState(null);

  // Grading
  const [gradingProblemId, setGradingProblemId] = useState('');
  const [gradingRows, setGradingRows] = useState([]);
  const [grades, setGrades] = useState({});

  // AI summaries cache: { [attemptId]: { summary, suggestedGrade, gradeReasoning } }
  const [summaries, setSummaries] = useState({});
  const [loadingSummary, setLoadingSummary] = useState({});

  const [loading, setLoading] = useState(false);

  const fetchAiSummary = async (att) => {
    if (summaries[att.id] || loadingSummary[att.id]) return;
    setLoadingSummary(s => ({ ...s, [att.id]: true }));
    try {
      const goals = att.problem_goals || [];
      const goalsHit = att.goals_hit || [];
      const goalsMissed = goals.filter(g => !goalsHit.includes(g));
      const result = await api.post('/api/socratic/summarize', {
        interactions: att.interactions || [],
        goalsHit,
        goalsMissed,
        maxInteractions: att.max_interactions || 5,
        finalAnswer: att.final_answer || null,
      });
      setSummaries(s => ({ ...s, [att.id]: result }));
    } catch (err) {
      console.error('AI summary error:', err);
      setSummaries(s => ({ ...s, [att.id]: { summary: 'Unable to generate summary.', suggestedGrade: null, gradeReasoning: '' } }));
    } finally {
      setLoadingSummary(s => ({ ...s, [att.id]: false }));
    }
  };

  const loadProblems = async () => {
    try {
      const data = await api.get('/api/problems/teacher');
      setProblems(data);
    } catch (err) { console.error(err); }
  };

  const loadStudents = async () => {
    try {
      const data = await api.get('/api/students');
      setStudents(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadProblems(); }, []);

  useEffect(() => {
    if (tab === 'students') loadStudents();
    if (tab === 'grading') { loadProblems(); loadStudents(); }
  }, [tab]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const handlePublishToggle = async (id) => {
    try {
      await api.patch(`/api/problems/${id}/publish`, {});
      loadProblems();
    } catch (err) { alert(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this problem? This cannot be undone.')) return;
    try {
      await api.delete(`/api/problems/${id}`);
      loadProblems();
    } catch (err) { alert(err.message); }
  };

  const openStudentDetail = async (student) => {
    setSelectedStudent(student);
    try {
      const data = await api.get(`/api/students/${student.id}/attempts`);
      setStudentAttempts(data);
      const firstId = data[0]?.id || null;
      setExpandedAttempt(firstId);
      // Fetch AI summary for the first expanded attempt
      if (data[0] && (data[0].interactions || []).length > 0) {
        fetchAiSummary(data[0]);
      }
    } catch {}
  };

  const handleExpandAttempt = (att) => {
    const newId = expandedAttempt === att.id ? null : att.id;
    setExpandedAttempt(newId);
    if (newId && (att.interactions || []).length > 0) {
      fetchAiSummary(att);
    }
  };

  const saveGrade = async (attemptId) => {
    const g = grades[attemptId];
    if (!g) return;
    try {
      await api.patch(`/api/attempts/${attemptId}/grade`, {
        teacher_grade: parseInt(g.grade) || null,
        teacher_comment: g.comment || null,
      });
      alert('Grade saved!');
      if (selectedStudent) openStudentDetail(selectedStudent);
      loadGradingRows(gradingProblemId);
    } catch (err) { alert(err.message); }
  };

  const loadGradingRows = async (probId) => {
    if (!probId) { setGradingRows([]); return; }
    try {
      const allStudents = await api.get('/api/students');
      const rows = [];
      for (const s of allStudents) {
        try {
          const attempts = await api.get(`/api/students/${s.id}/attempts`);
          const att = attempts.find(a => String(a.problem_id) === String(probId));
          if (att) rows.push({ student: s, attempt: att });
        } catch {}
      }
      setGradingRows(rows);
    } catch {}
  };

  useEffect(() => {
    if (gradingProblemId) loadGradingRows(gradingProblemId);
  }, [gradingProblemId]);

  if (showForm || editProblem) {
    return (
      <ProblemForm
        existing={editProblem}
        onSave={() => { setShowForm(false); setEditProblem(null); loadProblems(); }}
        onCancel={() => { setShowForm(false); setEditProblem(null); }}
      />
    );
  }

  return (
    <Page>
      <Nav>
        <NavBrandWrap>
          <LogoMark />
          <NavBrandText>ThinkTrace</NavBrandText>
        </NavBrandWrap>
        <NavRight>
          <UserName>{user?.firstname ? `${user.firstname} ${user.lastname}` : user?.username} · Teacher</UserName>
          <LogoutBtn onClick={handleLogout}>Sign out</LogoutBtn>
        </NavRight>
      </Nav>
      <Main>
        <Tabs>
          <Tab $active={tab === 'problems'} onClick={() => setTab('problems')}>Problems</Tab>
          <Tab $active={tab === 'students'} onClick={() => setTab('students')}>Students</Tab>
          <Tab $active={tab === 'grading'} onClick={() => setTab('grading')}>Grading</Tab>
        </Tabs>

        {/* ── PROBLEMS TAB ── */}
        {tab === 'problems' && (
          <>
            <SectionHeader>
              <SectionTitle>Your Problems</SectionTitle>
              <PrimaryBtn onClick={() => setShowForm(true)}>+ New Problem</PrimaryBtn>
            </SectionHeader>
            <ProblemList>
              {problems.length === 0 && <Empty>No problems yet. Create your first one!</Empty>}
              {problems.map(p => (
                <ProblemRow key={p.id}>
                  <ProblemInfo>
                    <ProblemTitle>{p.title}</ProblemTitle>
                    <ProblemMeta>
                      {p.guidance_intensity} · {p.max_interactions} max interactions · {p.attempt_count || 0} attempts
                    </ProblemMeta>
                  </ProblemInfo>
                  <StatusBadge $status={p.status}>{p.status}</StatusBadge>
                  <ProblemActions>
                    <SecondaryBtn onClick={() => setEditProblem(p)}>Edit</SecondaryBtn>
                    <SecondaryBtn onClick={() => handlePublishToggle(p.id)}>
                      {p.status === 'published' ? 'Unpublish' : 'Publish'}
                    </SecondaryBtn>
                    <SecondaryBtn $danger onClick={() => handleDelete(p.id)}>Delete</SecondaryBtn>
                  </ProblemActions>
                </ProblemRow>
              ))}
            </ProblemList>
          </>
        )}

        {/* ── STUDENTS TAB ── */}
        {tab === 'students' && (
          <>
            <SectionHeader>
              <SectionTitle>Students</SectionTitle>
            </SectionHeader>
            <Table>
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Attempted</Th>
                  <Th>Completed</Th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 && (
                  <tr><Td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>No students yet.</Td></tr>
                )}
                {students.map(s => (
                  <Tr key={s.id} onClick={() => openStudentDetail(s)}>
                    <Td>{s.firstname ? `${s.firstname} ${s.lastname}` : s.username}</Td>
                    <Td>{s.email}</Td>
                    <Td>{s.problems_attempted || 0}</Td>
                    <Td>{s.problems_completed || 0}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </>
        )}

        {/* ── GRADING TAB ── */}
        {tab === 'grading' && (
          <>
            <SectionHeader>
              <SectionTitle>Grading</SectionTitle>
              <Select value={gradingProblemId} onChange={e => setGradingProblemId(e.target.value)}>
                <option value="">Select a problem…</option>
                {problems.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </Select>
            </SectionHeader>
            {gradingProblemId && (
              <Table>
                <thead>
                  <tr>
                    <Th>Student</Th>
                    <Th>Goals Hit</Th>
                    <Th>Interactions</Th>
                    <Th>AI Grade</Th>
                    <Th>Teacher Grade</Th>
                  </tr>
                </thead>
                <tbody>
                  {gradingRows.length === 0 && (
                    <tr><Td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>No attempts yet for this problem.</Td></tr>
                  )}
                  {gradingRows.map(({ student: s, attempt: a }) => (
                    <Tr key={a.id} onClick={() => { openStudentDetail(s); setTab('students'); }}>
                      <Td>{s.firstname ? `${s.firstname} ${s.lastname}` : s.username}</Td>
                      <Td>{(a.goals_hit || []).length} / {(a.problem_goals || []).length}</Td>
                      <Td>{(a.interactions || []).length} / {a.max_interactions}</Td>
                      <Td>{a.ai_grade ?? '—'}</Td>
                      <Td>{a.teacher_grade ?? '—'}</Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            )}
          </>
        )}
      </Main>

      {/* Student detail modal — redesigned ThinkTrace view */}
      {selectedStudent && (
        <Modal onClick={e => { if (e.target === e.currentTarget) setSelectedStudent(null); }}>
          <ModalCard>
            <ModalHeader>
              <div>
                <ModalTitle>
                  {selectedStudent.firstname ? `${selectedStudent.firstname} ${selectedStudent.lastname}` : selectedStudent.username}'s ThinkTrace
                </ModalTitle>
                <ModalSubtitle>{selectedStudent.email} · {studentAttempts.length} problem{studentAttempts.length !== 1 ? 's' : ''} attempted</ModalSubtitle>
              </div>
              <CloseBtn onClick={() => setSelectedStudent(null)}>×</CloseBtn>
            </ModalHeader>

            <ModalBody>
              {studentAttempts.length === 0 && <Empty>This student hasn't attempted any problems yet.</Empty>}

              {studentAttempts.map(att => {
                const goals = att.problem_goals || [];
                const goalsHit = att.goals_hit || [];
                const goalsMissed = goals.filter(g => !goalsHit.includes(g));
                const interactions = att.interactions || [];
                const summary = summaries[att.id];
                const isLoadingSummary = loadingSummary[att.id];
                const aiGrade = summary?.suggestedGrade ?? att.ai_grade;

                return (
                  <AttemptSection key={att.id}>
                    <AttemptHeader onClick={() => handleExpandAttempt(att)}>
                      <AttemptHeaderLeft>
                        <AttemptHeaderTitle>{att.problem_title || 'Untitled Problem'}</AttemptHeaderTitle>
                        <AttemptHeaderMeta>
                          <span><AttemptStatusDot $status={att.status} /> {att.status === 'completed' ? 'Completed' : att.status === 'in_progress' ? 'In Progress' : 'Not Started'}</span>
                          <span>{interactions.length} of {att.max_interactions} interactions</span>
                          <span>{goalsHit.length} of {goals.length} goals hit</span>
                        </AttemptHeaderMeta>
                      </AttemptHeaderLeft>
                      <ChevronIcon $open={expandedAttempt === att.id}>▼</ChevronIcon>
                    </AttemptHeader>

                    {expandedAttempt === att.id && (
                      <AttemptBody>
                        {/* 1. AI SUMMARY */}
                        <SummaryBox>
                          <SummaryLabel>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--accent)" stroke="none"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z"/></svg> AI Summary
                          </SummaryLabel>
                          {isLoadingSummary ? (
                            <SummaryLoading>
                              <PulsingDot /><PulsingDot style={{ animationDelay: '0.2s' }} /><PulsingDot style={{ animationDelay: '0.4s' }} />
                              <span style={{ marginLeft: 4 }}>Analyzing student performance…</span>
                            </SummaryLoading>
                          ) : summary ? (
                            <SummaryText>{summary.summary}</SummaryText>
                          ) : interactions.length === 0 ? (
                            <SummaryText style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No interactions recorded yet.</SummaryText>
                          ) : (
                            <SummaryText style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Summary unavailable.</SummaryText>
                          )}
                        </SummaryBox>

                        {/* 2. GOALS TRACKER */}
                        <GoalsSection>
                          <SectionLabel>Learning Goals</SectionLabel>
                          <GoalPills>
                            {goals.map((g, i) => {
                              const hit = goalsHit.includes(g);
                              return (
                                <GoalPill key={i} $hit={hit}>
                                  <GoalIcon $hit={hit}>{hit ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg> : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>}</GoalIcon>
                                  {g}
                                </GoalPill>
                              );
                            })}
                            {goals.length === 0 && <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>No goals set for this problem</span>}
                          </GoalPills>
                        </GoalsSection>

                        {/* 3. FULL CONVERSATION */}
                        <ConvSection>
                          <SectionLabel>Conversation</SectionLabel>
                          {interactions.length === 0 && (
                            <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>No interactions recorded.</p>
                          )}
                          <ConvTimeline>
                            {interactions.map((int, i) => (
                              <ConvTurn key={i}>
                                <TurnNumber>Turn {i + 1} of {att.max_interactions}</TurnNumber>
                                <StudentBubble>{int.studentText || int.explanation || 'No text recorded'}</StudentBubble>
                                <AiBubbleWrap>
                                  <AiAvatar><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z"/></svg></AiAvatar>
                                  <AiBubble>
                                    <AiBubbleLabel>ThinkTrace AI</AiBubbleLabel>
                                    {int.aiResponse || int.hint || int.feedback?.hint || 'No response recorded'}
                                  </AiBubble>
                                </AiBubbleWrap>
                              </ConvTurn>
                            ))}
                          </ConvTimeline>
                        </ConvSection>

                        {/* Final Answer (between conversation and grade) */}
                        {att.final_answer && (
                          <FinalAnswerBox>
                            <FinalAnswerLabel>Final Answer</FinalAnswerLabel>
                            <FinalAnswerText>{att.final_answer}</FinalAnswerText>
                          </FinalAnswerBox>
                        )}

                        {/* 4. GRADE SECTION */}
                        <GradeSection>
                          {/* AI Grade */}
                          <AiGradeBox>
                            <AiGradeCircle $grade={aiGrade || 0}>
                              {aiGrade != null ? aiGrade : '—'}
                            </AiGradeCircle>
                            <AiGradeInfo>
                              <AiGradeLabel>AI Suggested Grade</AiGradeLabel>
                              <AiGradeReason>
                                {summary?.gradeReasoning || (att.ai_grade != null ? `Based on ${goalsHit.length}/${goals.length} goals hit and ${interactions.length} interactions used.` : 'Grade will be calculated when the AI summary loads.')}
                              </AiGradeReason>
                            </AiGradeInfo>
                          </AiGradeBox>

                          {/* Teacher Override */}
                          <TeacherGradeRow>
                            <GradeFieldWrap>
                              <GradeFieldLabel>Teacher Grade (0–100)</GradeFieldLabel>
                              <GradeInput
                                type="number" min="0" max="100"
                                value={grades[att.id]?.grade ?? att.teacher_grade ?? ''}
                                onChange={e => setGrades(g => ({ ...g, [att.id]: { ...g[att.id], grade: e.target.value } }))}
                              />
                            </GradeFieldWrap>
                            <div style={{ flex: 1 }}>
                              <GradeFieldLabel>Comment</GradeFieldLabel>
                              <CommentInput
                                value={grades[att.id]?.comment ?? att.teacher_comment ?? ''}
                                onChange={e => setGrades(g => ({ ...g, [att.id]: { ...g[att.id], comment: e.target.value } }))}
                                placeholder="Add feedback for the student…"
                              />
                            </div>
                          </TeacherGradeRow>
                          <SaveBtn onClick={() => saveGrade(att.id)}>Save Grade</SaveBtn>
                        </GradeSection>
                      </AttemptBody>
                    )}
                  </AttemptSection>
                );
              })}
            </ModalBody>
          </ModalCard>
        </Modal>
      )}
    </Page>
  );
}
