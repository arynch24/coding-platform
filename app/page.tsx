'use client';

import { useState } from 'react';
import { CircleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuthContext } from '@/context/AuthenticationContext';
import Loader from '@/components/Loader';
import ErrorBox from '@/components/ErrorBox';

const CodingPlatformHome = () => {
  const [error, setError] = useState('');
  const router = useRouter();
  const { user, setUser, loading, setLoading } = useAuthContext();

  const checkAuth = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const userData = res.data;

      setUser(userData.user);

      // Redirect to dashboard on successful authentication
      if (userData.user.role === 'TEACHER') {
        router.push('/teacher');
      }
      else if (userData.user.role === 'STUDENT') {
        router.push('/coding');
      } else {
        setError('Invalid role selected');
      }

    } catch (error: any) {
      const errorMsg = error.response?.data?.message;
      setError(errorMsg || 'Something went wrong. Please try again.');
    } finally {
      // Always reset loading state
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-qc-accent/10 flex">

      {loading ? (
        <Loader text="Checking authentication..." />
      ) : error ? (
        <ErrorBox message={error} onRetry={checkAuth} />
      ) : (
        <div className="m-auto text-center">
          <CircleAlert className="mx-auto mb-4 text-qc-primary" size={48} />
          <h2 className="text-2xl font-semibold mb-2 text-qc-primary">Authentication Error</h2>
          <p className="text-qc-secondary mb-4">Unable to authenticate. Please try again.</p>
          <button
            onClick={checkAuth}
            className="px-4 py-2 bg-qc-primary text-white rounded hover:bg-qc-primary/90 transition"
          > Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default CodingPlatformHome;