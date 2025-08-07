'use client';

import { createContext, useContext, useState, Dispatch, SetStateAction, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/types/dashboard'
import { usePathname } from 'next/navigation';

type AuthContextType = {
    success: boolean;
    user: UserProfile | null;
    setUser: Dispatch<SetStateAction<UserProfile | null>>;
    setSuccess: Dispatch<SetStateAction<boolean>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = {
                    data: {
                        user: null,
                        success: true
                    }
                }
                setUser(res.data.user);
                setSuccess(res.data.success);
            } catch (err) {
                setUser(null);
                router.push('/')
            }
        };

        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, success, setSuccess }}>
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
