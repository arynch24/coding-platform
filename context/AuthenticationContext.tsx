'use client';

import { createContext, useContext, useState, Dispatch, SetStateAction, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/types/dashboard'
import { usePathname } from 'next/navigation';

type AuthContextType = {
    loading: boolean;
    user: UserProfile | null;
    setUser: Dispatch<SetStateAction<UserProfile | null>>;
    setLoading: Dispatch<SetStateAction<boolean>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const userData = res.data;

                setUser(userData.user);
                if (userData.user.role === 'TEACHER') {
                    router.push('/teacher');
                }
                else if (userData.user.role === 'STUDENT') {
                    router.push('/coding');
                } 
            } catch (err) {
                setUser(null);
                router.push('/');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook for using the auth context
export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuthContext must be used within AuthProvider');
    return context;
};
