import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import styled from 'styled-components';
import { auth } from '../../firebase-config.js';
import { api } from '../../utils/api.js';

const Wrap = styled.div`
  min-height: 100vh; background: var(--bg-page);
  display: flex; align-items: center; justify-content: center; padding: 24px;
`;

const Card = styled.div`
  background: var(--bg-surface); border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg); padding: 40px; width: 100%; max-width: 420px;
`;

const LogoRow = styled.div`display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 8px;`;
const LogoMark = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect x="2" y="5" width="16" height="16" rx="4" fill="var(--accent)" opacity="0.35"/>
    <rect x="10" y="7" width="16" height="16" rx="4" fill="var(--accent)"/>
  </svg>
);
const LogoText = styled.h1`font-size: 24px; font-weight: 700; color: var(--accent); letter-spacing: -0.5px;`;
const Tagline = styled.p`text-align: center; color: var(--text-tertiary); font-size: 14px; margin-bottom: 32px; font-weight: 400;`;

const Field = styled.div`margin-bottom: 18px;`;
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

const Btn = styled.button`
  width: 100%; padding: 0; height: 44px; margin-top: 8px;
  background: var(--accent); color: #fff; border: none; border-radius: var(--radius-md);
  font-size: 14px; font-weight: 600; letter-spacing: 0.01em;
  transition: all 150ms ease;
  &:hover { background: var(--accent-hover); transform: translateY(-1px); box-shadow: var(--shadow-md); }
  &:active { transform: translateY(0); }
  &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
`;

const ErrMsg = styled.p`color: #DC2626; font-size: 13px; text-align: center; margin-bottom: 12px; font-weight: 500;`;

const BottomLink = styled.p`
  text-align: center; margin-top: 24px; color: var(--text-secondary); font-size: 14px;
  a { color: var(--accent); font-weight: 600; transition: color 150ms ease; &:hover { color: var(--accent-hover); } }
`;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await cred.user.getIdToken();
      await api.post('/api/auth/login', { idToken });
      const me = await api.get('/api/auth/me');
      navigate(me.role === 'teacher' ? '/teacher' : '/dashboard');
    } catch (err) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else {
        setError(err.message || 'Login failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrap>
      <Card>
        <LogoRow><LogoMark /><LogoText>ThinkTrace</LogoText></LogoRow>
        <Tagline>Think deeply. Learn genuinely.</Tagline>
        <form onSubmit={handleSubmit}>
          <Field>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </Field>
          <Field>
            <Label>Password</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required />
          </Field>
          {error && <ErrMsg>{error}</ErrMsg>}
          <Btn type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Btn>
        </form>
        <BottomLink>Don't have an account? <Link to="/signup">Create one</Link></BottomLink>
      </Card>
    </Wrap>
  );
}
