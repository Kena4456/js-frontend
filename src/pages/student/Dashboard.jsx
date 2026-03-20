import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import styled from 'styled-components';
import { auth } from '../../firebase-config.js';
import { api } from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

const Page = styled.div`
  min-height: 100vh;
  background: var(--bg-page, #F7F5F2);
  font-family: var(--font, 'Plus Jakarta Sans', sans-serif);
`;

const Nav = styled.nav`
  background: var(--bg-surface, #FFFFFF);
  border-bottom: 1px solid var(--border, #E8E4DE);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  padding: 0 32px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const NavBrand = styled.a`
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  cursor: pointer;
`;

const NavBrandText = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: var(--accent, #5B5BD6);
`;

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const UserName = styled.span`
  font-size: 14px;
  color: var(--text-secondary, #6B6760);
`;

const LogoutBtn = styled.button`
  font-size: 14px;
  color: var(--text-secondary, #6B6760);
  background: none;
  border: none;
  padding: 6px 12px;
  cursor: pointer;
  transition: color 200ms ease;
  &:hover { color: var(--accent, #5B5BD6); }
`;

const Main = styled.main`
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 32px;
`;

const PageHeader = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary, #1C1B1A);
`;

const Subtitle = styled.p`
  color: var(--text-secondary, #6B6760);
  font-size: 15px;
  margin-top: 6px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
`;

const Card = styled.div`
  background: var(--bg-surface, #FFFFFF);
  border-radius: var(--radius-lg, 16px);
  padding: 24px;
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.06));
  cursor: pointer;
  transition: all 200ms ease;
  &:hover {
    box-shadow: var(--shadow-md, 0 4px 16px rgba(0, 0, 0, 0.1));
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #1C1B1A);
  flex: 1;
  margin-right: 12px;
`;

const StatusBadge = styled.span`
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  white-space: nowrap;
  background: ${p => ({
    not_started: 'var(--bg-subtle, #F0EDE8)',
    in_progress: '#FEF3C7',
    completed: '#DCFCE7',
  }[p.$status] || 'var(--bg-subtle, #F0EDE8)')};
  color: ${p => ({
    not_started: 'var(--text-tertiary, #9C9690)',
    in_progress: '#B45309',
    completed: '#15803D',
  }[p.$status] || 'var(--text-tertiary, #9C9690)')};
`;

const CardQuestion = styled.p`
  color: var(--text-secondary, #6B6760);
  font-size: 14px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 16px;
`;

const CardMeta = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const Badge = styled.span`
  font-size: 11px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: var(--radius-sm, 6px);
  background: var(--bg-subtle, #F0EDE8);
  color: var(--text-tertiary, #9C9690);
  text-transform: capitalize;
`;

const Empty = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: var(--text-secondary, #6B6760);
  font-size: 15px;
`;

/* -- Feedback Modal -- */
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(28, 27, 26, 0.35);
  z-index: 50;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 48px 20px;
  overflow-y: auto;
  backdrop-filter: blur(4px);
`;

const ModalCard = styled.div`
  background: var(--bg-surface, #FFFFFF);
  border-radius: var(--radius-xl, 20px);
  width: 100%;
  max-width: 640px;
  box-shadow: var(--shadow-lg, 0 25px 80px rgba(0, 0, 0, 0.18));
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: 28px 32px 20px;
  border-bottom: 1px solid var(--border, #E8E4DE);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`;

const ModalHeaderLeft = styled.div`
  flex: 1;
  margin-right: 16px;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary, #1C1B1A);
`;

const ModalSubtitle = styled.p`
  font-size: 13px;
  color: var(--text-secondary, #6B6760);
  margin-top: 4px;
  line-height: 1.5;
`;

const CloseBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md, 10px);
  border: 1px solid var(--border, #E8E4DE);
  background: var(--bg-subtle, #F0EDE8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--text-secondary, #6B6760);
  cursor: pointer;
  transition: all 200ms ease;
  flex-shrink: 0;
  &:hover {
    background: var(--accent-light, #EEEEFF);
    color: var(--accent, #5B5BD6);
    border-color: var(--accent, #5B5BD6);
  }
`;

const ModalBody = styled.div`
  padding: 28px 32px 32px;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb {
    background: var(--border-strong, #D4CFC8);
    border-radius: 3px;
  }
`;

/* Grade display */
const GradeDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 28px;
  padding: 24px;
  background: var(--bg-subtle, #F0EDE8);
  border-radius: var(--radius-lg, 16px);
`;

const GradeCircle = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(--bg-surface, #FFFFFF);
  border: 3px solid ${p => {
    const g = p.$grade;
    if (g >= 80) return '#6EE7B7';
    if (g >= 60) return '#FDE68A';
    return '#FECACA';
  }};
`;

const GradeNumber = styled.span`
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  color: ${p => {
    const g = p.$grade;
    if (g >= 80) return '#15803D';
    if (g >= 60) return '#B45309';
    return '#DC2626';
  }};
`;

const GradeMax = styled.span`
  font-size: 11px;
  font-weight: 500;
  color: var(--text-tertiary, #9C9690);
  margin-top: 1px;
`;

const GradeInfo = styled.div`
  flex: 1;
`;

const GradeLabel = styled.div`
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-tertiary, #9C9690);
  margin-bottom: 4px;
`;

const GradeStatus = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #1C1B1A);
`;

/* Teacher comment */
const CommentBox = styled.div`
  background: var(--accent-light, #EEEEFF);
  border-left: 3px solid var(--accent, #5B5BD6);
  border-radius: 0 var(--radius-md, 10px) var(--radius-md, 10px) 0;
  padding: 18px 20px;
  margin-bottom: 28px;
`;

const CommentLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent, #5B5BD6);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CommentText = styled.p`
  font-size: 14px;
  color: var(--text-primary, #1C1B1A);
  line-height: 1.7;
`;

/* Final answer */
const FinalAnswerBox = styled.div`
  background: var(--bg-surface, #FFFFFF);
  border: 1px solid var(--border, #E8E4DE);
  border-radius: var(--radius-lg, 16px);
  padding: 20px 24px;
  margin-bottom: 28px;
`;

const SectionLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-tertiary, #9C9690);
  margin-bottom: 10px;
`;

const FinalAnswerText = styled.p`
  font-size: 14px;
  color: var(--text-primary, #1C1B1A);
  line-height: 1.7;
`;

/* Concepts */
const ConceptsSection = styled.div`
  margin-bottom: 8px;
`;

const ConceptGroup = styled.div`
  margin-bottom: 20px;
`;

const ConceptGroupTitle = styled.div`
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 10px;
  color: ${p => p.$type === 'hit' ? '#15803D' : '#B45309'};
`;

const ConceptPills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const ConceptPill = styled.span`
  font-size: 13px;
  padding: 7px 14px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-weight: 500;
  background: ${p => p.$hit ? '#DCFCE7' : '#FEF3C7'};
  color: ${p => p.$hit ? '#15803D' : '#B45309'};
  border: 1px solid ${p => p.$hit ? '#BBF7D0' : '#FDE68A'};
`;

const ConceptIcon = styled.span`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
  background: ${p => p.$hit ? '#22C55E' : '#F59E0B'};
  color: #fff;
`;

/* Not graded message */
const NotGradedMsg = styled.div`
  text-align: center;
  padding: 32px 20px;
  color: var(--text-secondary, #6B6760);
  font-size: 14px;
  background: var(--bg-subtle, #F0EDE8);
  border-radius: var(--radius-md, 10px);
  border: 1px dashed var(--border-strong, #D4CFC8);
  line-height: 1.6;
`;

const NotGradedIcon = styled.div`
  font-size: 28px;
  margin-bottom: 8px;
`;

/* SVG Logo Mark */
const LogoMark = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="4" width="16" height="16" rx="4" stroke="var(--accent, #5B5BD6)" strokeWidth="2.2" fill="none" opacity="0.55" />
    <rect x="10" y="8" width="16" height="16" rx="4" stroke="var(--accent, #5B5BD6)" strokeWidth="2.2" fill="var(--accent-light, #EEEEFF)" />
  </svg>
);

function statusLabel(status) {
  return { not_started: 'Not Started', in_progress: 'In Progress', completed: 'Completed' }[status] || 'Not Started';
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [attempts, setAttempts] = useState({});
  const [loading, setLoading] = useState(true);
  const [feedbackModal, setFeedbackModal] = useState(null); // { problem, attempt }

  useEffect(() => {
    async function load() {
      try {
        const probs = await api.get('/api/problems');
        setProblems(probs);

        const attMap = {};
        await Promise.all(probs.map(async (p) => {
          try {
            const att = await api.get(`/api/attempts/${p.id}`);
            if (att) attMap[p.id] = att;
          } catch {}
        }));
        setAttempts(attMap);
      } catch (err) {
        console.error('Failed to load problems:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const getStatus = (problemId) => attempts[problemId]?.status || 'not_started';

  const handleCardClick = (problem) => {
    const status = getStatus(problem.id);
    if (status === 'completed') {
      setFeedbackModal({ problem, attempt: attempts[problem.id] });
    } else {
      navigate(`/workspace/${problem.id}`);
    }
  };

  return (
    <Page>
      <Nav>
        <NavBrand>
          <LogoMark />
          <NavBrandText>ThinkTrace</NavBrandText>
        </NavBrand>
        <NavRight>
          <UserName>{user?.firstname ? `${user.firstname} ${user.lastname}` : user?.username}</UserName>
          <LogoutBtn onClick={handleLogout}>Sign out</LogoutBtn>
        </NavRight>
      </Nav>
      <Main>
        <PageHeader>
          <Title>My Problems</Title>
          <Subtitle>Work through each problem by proving your understanding through conversation.</Subtitle>
        </PageHeader>
        {loading ? (
          <Empty>Loading problems...</Empty>
        ) : problems.length === 0 ? (
          <Empty>No problems have been published yet. Check back soon.</Empty>
        ) : (
          <Grid>
            {problems.map(p => {
              const status = getStatus(p.id);
              return (
                <Card key={p.id} onClick={() => handleCardClick(p)}>
                  <CardHeader>
                    <CardTitle>{p.title}</CardTitle>
                    <StatusBadge $status={status}>{statusLabel(status)}</StatusBadge>
                  </CardHeader>
                  <CardQuestion>{p.question}</CardQuestion>
                  <CardMeta>
                    <Badge>{p.guidance_intensity || 'guided'}</Badge>
                    <Badge>{p.max_interactions || 5} max interactions</Badge>
                  </CardMeta>
                </Card>
              );
            })}
          </Grid>
        )}
      </Main>

      {/* Feedback Modal for Completed Problems */}
      {feedbackModal && (() => {
        const { problem, attempt } = feedbackModal;
        const goalsHit = attempt.goals_hit || [];
        const allGoals = attempt.problem_goals || [];
        const goalsMissed = allGoals.filter(g => !goalsHit.includes(g));
        const hasBeenGraded = attempt.teacher_grade != null;
        const grade = attempt.teacher_grade;

        return (
          <ModalOverlay onClick={e => { if (e.target === e.currentTarget) setFeedbackModal(null); }}>
            <ModalCard>
              <ModalHeader>
                <ModalHeaderLeft>
                  <ModalTitle>{problem.title}</ModalTitle>
                  <ModalSubtitle>{problem.question}</ModalSubtitle>
                </ModalHeaderLeft>
                <CloseBtn onClick={() => setFeedbackModal(null)}>×</CloseBtn>
              </ModalHeader>

              <ModalBody>
                {/* Grade Display */}
                {hasBeenGraded ? (
                  <GradeDisplay>
                    <GradeCircle $grade={grade}>
                      <GradeNumber $grade={grade}>{grade}</GradeNumber>
                      <GradeMax>/ 100</GradeMax>
                    </GradeCircle>
                    <GradeInfo>
                      <GradeLabel>Your Grade</GradeLabel>
                      <GradeStatus>
                        {grade >= 90 ? 'Excellent work!' :
                         grade >= 80 ? 'Great job!' :
                         grade >= 70 ? 'Good effort.' :
                         grade >= 60 ? 'Satisfactory.' :
                         'Needs improvement.'}
                      </GradeStatus>
                    </GradeInfo>
                  </GradeDisplay>
                ) : (
                  <NotGradedMsg>
                    <NotGradedIcon><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></NotGradedIcon>
                    Your teacher hasn't reviewed this yet. Check back later for your grade and feedback.
                  </NotGradedMsg>
                )}

                {/* Teacher Comment */}
                {attempt.teacher_comment && (
                  <CommentBox>
                    <CommentLabel>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> Teacher Feedback
                    </CommentLabel>
                    <CommentText>{attempt.teacher_comment}</CommentText>
                  </CommentBox>
                )}

                {/* Final Answer */}
                {attempt.final_answer && (
                  <FinalAnswerBox>
                    <SectionLabel>Your Final Answer</SectionLabel>
                    <FinalAnswerText>{attempt.final_answer}</FinalAnswerText>
                  </FinalAnswerBox>
                )}

                {/* Concepts Demonstrated / To Review */}
                {(goalsHit.length > 0 || goalsMissed.length > 0) && (
                  <ConceptsSection>
                    {goalsHit.length > 0 && (
                      <ConceptGroup>
                        <ConceptGroupTitle $type="hit">Concepts Demonstrated</ConceptGroupTitle>
                        <ConceptPills>
                          {goalsHit.map((g, i) => (
                            <ConceptPill key={i} $hit>
                              <ConceptIcon $hit><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg></ConceptIcon>
                              {g}
                            </ConceptPill>
                          ))}
                        </ConceptPills>
                      </ConceptGroup>
                    )}
                    {goalsMissed.length > 0 && (
                      <ConceptGroup>
                        <ConceptGroupTitle $type="missed">Concepts to Review</ConceptGroupTitle>
                        <ConceptPills>
                          {goalsMissed.map((g, i) => (
                            <ConceptPill key={i}>
                              <ConceptIcon><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg></ConceptIcon>
                              {g}
                            </ConceptPill>
                          ))}
                        </ConceptPills>
                      </ConceptGroup>
                    )}
                  </ConceptsSection>
                )}
              </ModalBody>
            </ModalCard>
          </ModalOverlay>
        );
      })()}
    </Page>
  );
}
