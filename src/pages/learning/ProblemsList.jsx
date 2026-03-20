import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useUser } from '@/common/contexts/UserContext';

const buildUrl = (e) => `${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '')}${e}`;

const Page = styled.div`
  max-width: 780px;
  margin: 2rem auto;
  padding: 0 1.5rem 4rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
`;

const Grid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ProblemCard = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: box-shadow 0.15s ease, border-color 0.15s ease;
  &:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); border-color: #6366f1; }
`;

const ProblemInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const ProblemTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: #1e293b;
`;

const ProblemQuestion = styled.p`
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
  max-width: 560px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const StartBtn = styled.button`
  flex-shrink: 0;
  padding: 0.55rem 1.2rem;
  background: #6366f1;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  &:hover { opacity: 0.88; }
`;

const Empty = styled.div`
  text-align: center;
  padding: 3rem;
  color: #94a3b8;
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
`;

export default function ProblemsList() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch(buildUrl('/api/problems/all'), {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (res.ok) setProblems(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) return <Page><p style={{ color: '#94a3b8' }}>Loading…</p></Page>;

  return (
    <Page>
      <Title>My Problems</Title>
      {problems.length === 0 ? (
        <Empty>No problems assigned yet. Check back soon.</Empty>
      ) : (
        <Grid>
          {problems.map((p) => (
            <ProblemCard key={p.id} onClick={() => navigate(`/workspace/${p.id}`)}>
              <ProblemInfo>
                <ProblemTitle>{p.title}</ProblemTitle>
                <ProblemQuestion>{p.question}</ProblemQuestion>
              </ProblemInfo>
              <StartBtn onClick={(e) => { e.stopPropagation(); navigate(`/workspace/${p.id}`); }}>
                Start →
              </StartBtn>
            </ProblemCard>
          ))}
        </Grid>
      )}
    </Page>
  );
}
