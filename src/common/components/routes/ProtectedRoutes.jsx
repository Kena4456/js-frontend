import { Navigate, Outlet } from 'react-router-dom';

import { useUser } from '@/common/contexts/UserContext';

export function PrivateRoute() {
  const { user, isLoading } = useUser();
  if (isLoading) return <div>Loading...</div>;
  return user ? <Outlet /> : <Navigate to='/login' replace />;
}

export function PublicOnlyRoute() {
  const { user, isLoading } = useUser();
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Outlet />;
  return <Navigate to={user.role === 'instructor' ? '/instructor' : '/workspace'} replace />;
}

export function InstructorRoute() {
  const { user, isLoading } = useUser();
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to='/login' replace />;
  if (user.role !== 'instructor') return <Navigate to='/workspace' replace />;
  return <Outlet />;
}

export function StudentRoute() {
  const { user, isLoading } = useUser();
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to='/login' replace />;
  if (user.role !== 'student') return <Navigate to='/instructor' replace />;
  return <Outlet />;
}
