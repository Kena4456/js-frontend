import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import GoogleButton from '@/common/components/atoms/GoogleButton';
import { Form, FormTitle } from '@/common/components/form/Form';
import { Input } from '@/common/components/form/Input';
import SubmitButton from '@/common/components/form/SubmitButton';
import { useUser } from '@/common/contexts/UserContext';
import { RedSpan } from '@/common/components/form/styles';

import { StyledPage } from './styles';

export default function SignUp() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { googleAuth } = useUser();

  const [role, setRole] = useState('student');
  const [formState, setFormState] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    username: '',
  });

  const handleChangeFirstname = (e) => {
    setFormState({ ...formState, firstname: e.target.value });
    setError('');
  };

  const handleChangeLastname = (e) => {
    setFormState({ ...formState, lastname: e.target.value });
    setError('');
  };

  const handleChangeEmail = (e) => {
    setFormState({ ...formState, email: e.target.value });
    setError('');
  };

  const handleChangePassword = (e) => {
    setFormState({ ...formState, password: e.target.value });
    setError('');
  };

  const handleChangeUsername = (e) => {
    setFormState({ ...formState, username: e.target.value });
    setError('');
  };

  const handleGoogleSignup = async () => {
    try {
      await googleAuth();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formState.email,
            password: formState.password,
            username: formState.username || undefined,
            firstname: formState.firstname || undefined,
            lastname: formState.lastname || undefined,
            role,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }
      navigate('/login', {
        state: {
          message:
            'Account created successfully! Please check your email to verify your account.',
        },
      });
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StyledPage>
      <Form onSubmit={handleSubmit}>
        <FormTitle>Create an account</FormTitle>
        {error && <RedSpan>{error}</RedSpan>}

        {/* Role toggle */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          {['student', 'instructor'].map((r) => (
            <button
              key={r}
              type='button'
              onClick={() => setRole(r)}
              style={{
                flex: 1,
                padding: '0.6rem',
                borderRadius: '8px',
                border: '2px solid',
                borderColor: role === r ? '#6366f1' : '#e2e8f0',
                background: role === r ? '#eef2ff' : '#fff',
                color: role === r ? '#4338ca' : '#64748b',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {r === 'student' ? 'I\'m a Student' : 'I\'m an Instructor'}
            </button>
          ))}
        </div>
        <Input.Text
          title='First name'
          placeholder='John'
          value={formState.firstname}
          onChange={handleChangeFirstname}
        />
        <Input.Text
          title='Last name'
          placeholder='Smith'
          value={formState.lastname}
          onChange={handleChangeLastname}
        />
        <Input.Text
          title='Email'
          placeholder='j@example.com'
          value={formState.email}
          onChange={handleChangeEmail}
          required
        />
        <Input.Text
          title='Username'
          placeholder='johnsmith'
          value={formState.username}
          onChange={handleChangeUsername}
        />
        <Input.Password
          title='Password'
          value={formState.password}
          onChange={handleChangePassword}
          required
        />
        <SubmitButton onClick={() => {}} disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Sign Up'}
        </SubmitButton>
        <GoogleButton
          onClick={handleGoogleSignup}
          isLoading={isLoading}
          text='Sign up with Google'
        />
      </Form>
    </StyledPage>
  );
}
