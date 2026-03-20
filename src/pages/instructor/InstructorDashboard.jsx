import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useUser } from '@/common/contexts/UserContext';

const buildUrl = (e) => `${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '')}${e}`;

/* ── helpers ─────────────────────────────────────────────────────── */
function understandingScore(row) {
  if (!row.validated) return null;
  const n = row.attempt_count || 1;
  return Math.max(35, 100 - (n - 1) * 18);
}
function scoreStyle(score) {
  if (score >= 80) return { bg: '#f0fdf4', text: '#15803d' };
  if (score >= 60) return { bg: '#fffbeb', text: '#b45309' };
  return { bg: '#fef2f2', text: '#b91c1c' };
}

/* ── Layout ─────────────────────────────────────────────────────── */
const Page = styled.div`
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1.5rem 4rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;
const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
const PageTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
`;
const PrimaryBtn = styled.button`
  padding: 0.65rem 1.4rem;
  background: #6366f1;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  &:hover { opacity: 0.88; }
`;
const SectionLabel = styled.h2`
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
  margin: 0 0 0.75rem;
`;
const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  color: #94a3b8;
`;

/* ── Stat cards ──────────────────────────────────────────────────── */
const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  @media (max-width: 640px) { grid-template-columns: repeat(2, 1fr); }
`;
const StatCard = styled.div`
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
`;
const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: #1e293b;
  line-height: 1;
`;
const StatLabel = styled.div`
  font-size: 0.78rem;
  color: #64748b;
  margin-top: 0.35rem;
  font-weight: 500;
`;
const StatSub = styled.div`
  font-size: 0.72rem;
  color: #94a3b8;
  margin-top: 0.2rem;
`;

/* ── Problem + submissions block ─────────────────────────────────── */
const ProblemBlock = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #fff;
  overflow: hidden;
`;
const ProblemHeader = styled.div`
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: ${({ $hasSubmissions }) => ($hasSubmissions ? '1px solid #f1f5f9' : 'none')};
`;
const ProblemInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1;
`;
const ProblemTitle = styled.h3`
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0;
  color: #1e293b;
`;
const ProblemQuestion = styled.p`
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;
const MetaRow = styled.div`
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-top: 0.15rem;
`;
const Badge = styled.span`
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.18rem 0.55rem;
  border-radius: 99px;
  background: ${({ $color }) => $color || '#f1f5f9'};
  color: ${({ $text }) => $text || '#475569'};
`;
const SubmissionCount = styled.div`
  font-size: 0.8rem;
  font-weight: 700;
  color: #6366f1;
  white-space: nowrap;
  padding-top: 0.2rem;
`;

/* ── Student submission rows ─────────────────────────────────────── */
const SubmissionList = styled.div`
  display: flex;
  flex-direction: column;
`;
const SubmissionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.5rem;
  border-bottom: 1px solid #f8fafc;
  cursor: pointer;
  transition: background 0.1s;
  gap: 1rem;
  &:last-child { border-bottom: none; }
  &:hover { background: #f8fafc; }
`;
const StudentInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 140px;
`;
const StudentName = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
`;
const StudentHandle = styled.div`
  font-size: 0.75rem;
  color: #94a3b8;
`;
const SubmissionMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;
const StatusPill = styled.span`
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 99px;
  background: ${({ $validated }) => ($validated ? '#f0fdf4' : '#fffbeb')};
  color: ${({ $validated }) => ($validated ? '#15803d' : '#b45309')};
`;
const ScorePill = styled.span`
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 99px;
  background: ${({ $bg }) => $bg};
  color: ${({ $text }) => $text};
`;
const AttemptCount = styled.div`
  font-size: 0.8rem;
  color: #64748b;
`;
const LastActive = styled.div`
  font-size: 0.78rem;
  color: #94a3b8;
  min-width: 80px;
  text-align: right;
`;
const ViewBtn = styled.button`
  padding: 0.35rem 0.8rem;
  background: #eef2ff;
  color: #4338ca;
  border: none;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  &:hover { background: #e0e7ff; }
`;
const NoSubmissions = styled.div`
  padding: 1rem 1.5rem;
  font-size: 0.85rem;
  color: #94a3b8;
`;

/* ── Modal ───────────────────────────────────────────────────────── */
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 100;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 2rem 1rem 4rem;
  overflow-y: auto;
`;
const Modal = styled.div`
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 720px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  position: relative;
`;
const ModalTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  color: #1e293b;
`;
const ModalMeta = styled.div`font-size: 0.82rem; color: #64748b;`;
const CloseBtn = styled.button`
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  padding: 0.35rem 0.7rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  color: #475569;
  &:hover { background: #e2e8f0; }
`;
const ModalTabs = styled.div`
  display: flex;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  width: fit-content;
`;
const ModalTab = styled.button`
  padding: 0.5rem 1.1rem;
  border: none;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  background: ${({ $active }) => ($active ? '#6366f1' : '#fff')};
  color: ${({ $active }) => ($active ? '#fff' : '#64748b')};
  &:hover { background: ${({ $active }) => ($active ? '#6366f1' : '#f1f5f9')}; }
`;
const Turn = styled.div`
  border-left: 3px solid ${({ $validated }) => ($validated ? '#16a34a' : '#6366f1')};
  padding-left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;
const TurnLabel = styled.div`
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #94a3b8;
`;
const TurnText = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #374151;
  line-height: 1.6;
`;
const GapBox = styled.div`
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 8px;
  padding: 0.65rem 0.9rem;
  font-size: 0.82rem;
  color: #92400e;
  line-height: 1.5;
`;
const Divider = styled.hr`border: none; border-top: 1px solid #f1f5f9; margin: 0;`;
const GenerateBtn = styled.button`
  align-self: flex-start;
  padding: 0.65rem 1.3rem;
  background: #6366f1;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  &:hover { opacity: 0.88; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

/* ── AI Report styles ────────────────────────────────────────────── */
const ReportCard = styled.div`
  background: #fafafa;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;
const ScoreRing = styled.div`display: flex; align-items: center; gap: 1.5rem;`;
const BigScore = styled.div`
  width: 80px; height: 80px;
  border-radius: 50%;
  border: 5px solid ${({ $s }) => $s >= 75 ? '#16a34a' : $s >= 50 ? '#f59e0b' : '#dc2626'};
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; flex-shrink: 0;
`;
const BigScoreNum = styled.div`
  font-size: 1.5rem; font-weight: 800; line-height: 1;
  color: ${({ $s }) => $s >= 75 ? '#16a34a' : $s >= 50 ? '#f59e0b' : '#dc2626'};
`;
const BigScoreLabel = styled.div`font-size: 0.6rem; font-weight: 600; color: #94a3b8; text-transform: uppercase;`;
const ScoreRationale = styled.p`margin: 0; font-size: 0.88rem; color: #374151; line-height: 1.65;`;
const ReportSection = styled.div`display: flex; flex-direction: column; gap: 0.5rem;`;
const ReportSectionTitle = styled.div`
  font-size: 0.72rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.07em; color: #64748b;
`;
const ConceptRow = styled.div`
  display: flex; align-items: flex-start; gap: 0.75rem;
  padding: 0.5rem 0; border-bottom: 1px solid #f1f5f9;
  &:last-child { border-bottom: none; }
`;
const ConceptStatus = styled.span`
  font-size: 0.72rem; font-weight: 700;
  padding: 0.15rem 0.5rem; border-radius: 99px; flex-shrink: 0; margin-top: 2px;
  background: ${({ $s }) => $s === 'strong' ? '#f0fdf4' : $s === 'partial' ? '#fffbeb' : '#fef2f2'};
  color: ${({ $s }) => $s === 'strong' ? '#15803d' : $s === 'partial' ? '#b45309' : '#b91c1c'};
`;
const ConceptName = styled.div`font-size: 0.88rem; font-weight: 600; color: #1e293b;`;
const ConceptEvidence = styled.div`font-size: 0.8rem; color: #64748b; font-style: italic;`;
const NarrativeText = styled.p`margin: 0; font-size: 0.88rem; color: #374151; line-height: 1.7;`;
const AuthBadge = styled.div`
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.4rem 0.9rem; border-radius: 8px;
  font-size: 0.85rem; font-weight: 700;
  background: ${({ $r }) => $r === 'likely genuine' ? '#f0fdf4' : $r === 'mixed signals' ? '#fffbeb' : '#fef2f2'};
  color: ${({ $r }) => $r === 'likely genuine' ? '#15803d' : $r === 'mixed signals' ? '#b45309' : '#b91c1c'};
`;
const BulletList = styled.ul`margin: 0; padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.3rem;`;
const BulletItem = styled.li`font-size: 0.88rem; color: #374151; line-height: 1.5;`;
const RecommendationBox = styled.div`
  background: #eef2ff; border: 1px solid #c7d2fe;
  border-radius: 10px; padding: 1rem 1.1rem;
  font-size: 0.88rem; color: #3730a3; line-height: 1.65;
`;

/* ═══════════════════════════════════════════════════════════════════ */

export default function InstructorDashboard() {
  const navigate = useNavigate();
  const { user } = useUser();

  const [problems, setProblems] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('trace');
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const idToken = await user.getIdToken();
        const headers = { Authorization: `Bearer ${idToken}` };
        const [pRes, prRes] = await Promise.all([
          fetch(buildUrl('/api/problems/my'), { headers }),
          fetch(buildUrl('/api/problems/progress'), { headers }),
        ]);
        if (pRes.ok) setProblems(await pRes.json());
        if (prRes.ok) setProgress(await prRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  /* ── Stats ─────────────────────────────────────────────────────── */
  const uniqueStudents = new Set(progress.map((r) => r.student_uid)).size;
  const validated = progress.filter((r) => r.validated);
  const validationRate = progress.length > 0 ? Math.round((validated.length / progress.length) * 100) : 0;
  const avgAttempts = validated.length > 0
    ? (validated.reduce((s, r) => s + (r.attempt_count || 0), 0) / validated.length).toFixed(1)
    : '—';

  /* ── Group submissions by problem ──────────────────────────────── */
  const progressByProblem = {};
  for (const row of progress) {
    if (!progressByProblem[row.problem_id]) progressByProblem[row.problem_id] = [];
    progressByProblem[row.problem_id].push(row);
  }

  /* ── Open trace modal ──────────────────────────────────────────── */
  async function openTrace(row) {
    setModalLoading(true);
    setActiveTab('trace');
    setReport(null);
    setModal({
      studentName: `${row.firstname} ${row.lastname}`,
      problemTitle: row.problem_title,
      problemId: row.problem_id,
      studentUid: row.student_uid,
      trace: null,
    });
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(buildUrl(`/api/problems/${row.problem_id}/traces`), {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const traces = await res.json();
      const trace = traces.find((t) => t.student_uid === row.student_uid) || null;
      setModal((m) => ({ ...m, trace }));
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  }

  /* ── Generate AI report ────────────────────────────────────────── */
  async function generateReport() {
    if (!modal) return;
    setReportLoading(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(
        buildUrl(`/api/problems/${modal.problemId}/analyze/${modal.studentUid}`),
        { method: 'POST', headers: { Authorization: `Bearer ${idToken}` } }
      );
      if (!res.ok) throw new Error();
      setReport(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setReportLoading(false);
    }
  }

  function closeModal() { setModal(null); setReport(null); setActiveTab('trace'); }

  if (loading) return <Page><p style={{ color: '#94a3b8' }}>Loading…</p></Page>;

  return (
    <Page>
      <TopBar>
        <PageTitle>Instructor Dashboard</PageTitle>
        <PrimaryBtn onClick={() => navigate('/instructor/create')}>+ New Problem</PrimaryBtn>
      </TopBar>

      {/* ── Class stats ── */}
      {progress.length > 0 && (
        <div>
          <SectionLabel>Class Overview</SectionLabel>
          <StatsRow>
            <StatCard>
              <StatValue>{uniqueStudents}</StatValue>
              <StatLabel>Students submitted</StatLabel>
              <StatSub>across all your problems</StatSub>
            </StatCard>
            <StatCard>
              <StatValue>{progress.length}</StatValue>
              <StatLabel>Total submissions</StatLabel>
              <StatSub>{validated.length} fully validated</StatSub>
            </StatCard>
            <StatCard>
              <StatValue>{validationRate}%</StatValue>
              <StatLabel>Validation rate</StatLabel>
              <StatSub>students who demonstrated understanding</StatSub>
            </StatCard>
            <StatCard>
              <StatValue>{avgAttempts}</StatValue>
              <StatLabel>Avg attempts</StatLabel>
              <StatSub>lower = stronger initial grasp</StatSub>
            </StatCard>
          </StatsRow>
        </div>
      )}

      {/* ── Problems with submissions inline ── */}
      <div>
        <SectionLabel>Your Problems</SectionLabel>
        {problems.length === 0 ? (
          <EmptyState>
            <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>No problems yet</p>
            <p style={{ fontSize: '0.85rem' }}>Create your first problem to get started.</p>
          </EmptyState>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {problems.map((p) => {
              const submissions = progressByProblem[p.id] || [];
              return (
                <ProblemBlock key={p.id}>
                  <ProblemHeader $hasSubmissions={submissions.length > 0}>
                    <ProblemInfo>
                      <ProblemTitle>{p.title}</ProblemTitle>
                      <ProblemQuestion>{p.question}</ProblemQuestion>
                      <MetaRow>
                        <Badge $color='#eef2ff' $text='#4338ca'>{p.goals?.length || 0} goals</Badge>
                        <Badge $color='#f0fdf4' $text='#15803d'>{p.socratic_mode}</Badge>
                        <Badge>max {p.max_hints} hints</Badge>
                      </MetaRow>
                    </ProblemInfo>
                    <SubmissionCount>
                      {submissions.length === 0
                        ? 'No submissions yet'
                        : `${submissions.length} student${submissions.length !== 1 ? 's' : ''}`}
                    </SubmissionCount>
                  </ProblemHeader>

                  {submissions.length === 0 ? (
                    <NoSubmissions>No students have worked on this problem yet.</NoSubmissions>
                  ) : (
                    <SubmissionList>
                      {submissions.map((row, i) => {
                        const score = understandingScore(row);
                        const style = score != null ? scoreStyle(score) : null;
                        return (
                          <SubmissionRow key={i} onClick={() => openTrace(row)}>
                            <StudentInfo>
                              <StudentName>{row.firstname} {row.lastname}</StudentName>
                              <StudentHandle>@{row.username}</StudentHandle>
                            </StudentInfo>
                            <SubmissionMeta>
                              <StatusPill $validated={row.validated}>
                                {row.validated ? 'Validated' : 'In progress'}
                              </StatusPill>
                              {score != null && (
                                <ScorePill $bg={style.bg} $text={style.text}>
                                  {score}% understanding
                                </ScorePill>
                              )}
                              <AttemptCount>{row.attempt_count || 0} attempt{row.attempt_count !== 1 ? 's' : ''}</AttemptCount>
                              <LastActive>
                                {row.updated_at ? new Date(row.updated_at).toLocaleDateString() : '—'}
                              </LastActive>
                            </SubmissionMeta>
                            <ViewBtn>View Trace + AI Report →</ViewBtn>
                          </SubmissionRow>
                        );
                      })}
                    </SubmissionList>
                  )}
                </ProblemBlock>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {modal && (
        <Overlay onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <Modal>
            <CloseBtn onClick={closeModal}>✕ Close</CloseBtn>
            <div>
              <ModalTitle>{modal.studentName}</ModalTitle>
              <ModalMeta>{modal.problemTitle}</ModalMeta>
            </div>

            {!modalLoading && modal.trace && (
              <ModalTabs>
                <ModalTab $active={activeTab === 'trace'} onClick={() => setActiveTab('trace')}>
                  Thinking Trace
                </ModalTab>
                <ModalTab $active={activeTab === 'report'} onClick={() => { setActiveTab('report'); if (!report) generateReport(); }}>
                  AI Report
                </ModalTab>
              </ModalTabs>
            )}

            {modalLoading && <p style={{ color: '#94a3b8', margin: 0 }}>Loading…</p>}
            {!modalLoading && !modal.trace && (
              <p style={{ color: '#94a3b8', margin: 0 }}>No trace found for this student.</p>
            )}

            {/* Trace tab */}
            {!modalLoading && modal.trace && activeTab === 'trace' && (() => {
              const conv = modal.trace.conversation || [];
              const score = understandingScore(modal.trace);
              const style = score != null ? scoreStyle(score) : null;
              return (
                <>
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <Badge $color='#eef2ff' $text='#4338ca'>{conv.length} attempt{conv.length !== 1 ? 's' : ''}</Badge>
                    {modal.trace.validated
                      ? <Badge $color='#f0fdf4' $text='#15803d'>Validated</Badge>
                      : <Badge $color='#fffbeb' $text='#b45309'>Not yet validated</Badge>}
                    {score != null && <Badge $color={style.bg} $text={style.text}>Understanding {score}%</Badge>}
                  </div>
                  {conv.map((turn, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {idx > 0 && <Divider />}
                      <Turn $validated={turn.feedback?.validated}>
                        <TurnLabel>Attempt {idx + 1} — Student</TurnLabel>
                        <TurnText>{turn.explanation}</TurnText>
                      </Turn>
                      {turn.feedback && (
                        <Turn $validated={turn.feedback.validated}>
                          <TurnLabel>AI Response</TurnLabel>
                          <TurnText>{turn.feedback.validated ? turn.feedback.message : turn.feedback.hint}</TurnText>
                          {!turn.feedback.validated && turn.feedback.gapAnalysis && (
                            <GapBox><strong>Gap analysis: </strong>{turn.feedback.gapAnalysis}</GapBox>
                          )}
                        </Turn>
                      )}
                    </div>
                  ))}
                  <GenerateBtn onClick={() => { setActiveTab('report'); if (!report) generateReport(); }}>
                    Generate AI Understanding Report →
                  </GenerateBtn>
                </>
              );
            })()}

            {/* Report tab */}
            {!modalLoading && modal.trace && activeTab === 'report' && (
              <>
                {reportLoading && <p style={{ color: '#94a3b8', margin: 0 }}>Analyzing thinking trace… give it a few seconds.</p>}
                {!reportLoading && !report && <GenerateBtn onClick={generateReport}>Generate Understanding Report</GenerateBtn>}
                {!reportLoading && report && (
                  <ReportCard>
                    <ScoreRing>
                      <BigScore $s={report.genuineUnderstandingScore}>
                        <BigScoreNum $s={report.genuineUnderstandingScore}>{report.genuineUnderstandingScore}</BigScoreNum>
                        <BigScoreLabel>/100</BigScoreLabel>
                      </BigScore>
                      <ScoreRationale>{report.scoreRationale}</ScoreRationale>
                    </ScoreRing>
                    <Divider />
                    <ReportSection>
                      <ReportSectionTitle>Authenticity</ReportSectionTitle>
                      <AuthBadge $r={report.authenticityAssessment?.rating}>
                        {report.authenticityAssessment?.rating === 'likely genuine' ? 'Pass' : report.authenticityAssessment?.rating === 'mixed signals' ? 'Mixed' : 'Flag'}{' '}
                        {report.authenticityAssessment?.rating}
                      </AuthBadge>
                      <NarrativeText>{report.authenticityAssessment?.rationale}</NarrativeText>
                    </ReportSection>
                    {report.conceptCoverage?.length > 0 && (
                      <>
                        <Divider />
                        <ReportSection>
                          <ReportSectionTitle>Concept Coverage</ReportSectionTitle>
                          {report.conceptCoverage.map((c, i) => (
                            <ConceptRow key={i}>
                              <ConceptStatus $s={c.status}>{c.status}</ConceptStatus>
                              <div>
                                <ConceptName>{c.concept}</ConceptName>
                                {c.evidence && <ConceptEvidence>"{c.evidence}"</ConceptEvidence>}
                              </div>
                            </ConceptRow>
                          ))}
                        </ReportSection>
                      </>
                    )}
                    <Divider />
                    <ReportSection>
                      <ReportSectionTitle>How Their Thinking Evolved</ReportSectionTitle>
                      <NarrativeText>{report.thinkingEvolution}</NarrativeText>
                    </ReportSection>
                    {report.strengths?.length > 0 && (
                      <>
                        <Divider />
                        <ReportSection>
                          <ReportSectionTitle>Strengths</ReportSectionTitle>
                          <BulletList>{report.strengths.map((s, i) => <BulletItem key={i}>{s}</BulletItem>)}</BulletList>
                        </ReportSection>
                      </>
                    )}
                    {report.keyMisconceptions?.length > 0 && (
                      <>
                        <Divider />
                        <ReportSection>
                          <ReportSectionTitle>Key Misconceptions</ReportSectionTitle>
                          <BulletList>{report.keyMisconceptions.map((m, i) => <BulletItem key={i}>{m}</BulletItem>)}</BulletList>
                        </ReportSection>
                      </>
                    )}
                    <Divider />
                    <ReportSection>
                      <ReportSectionTitle>Instructor Recommendation</ReportSectionTitle>
                      <RecommendationBox>{report.instructorRecommendation}</RecommendationBox>
                    </ReportSection>
                  </ReportCard>
                )}
              </>
            )}
          </Modal>
        </Overlay>
      )}
    </Page>
  );
}
