'use client';

import { usePathname } from 'next/navigation';
import TeacherSidebar from "@/components/teacher/TeacherSidebar";
import StickyHeader from "@/components/StickyHeader";
import { useAuthContext } from '@/context/AuthenticationContext';

const DashboardLayout = ({ children }: Readonly<{ children: React.ReactNode; }>) => {
    const pathname = usePathname();
    const { user } = useAuthContext();

    // Function to get header text based on current path
    const getHeaderText = (path: string): string => {
        switch (path) {
            case '/teacher':
                return 'Exam Management';
            case '/teacher/question-bank':
                return 'Question Bank';
            case '/teacher/leaderboard':
                return 'Leaderboard';
            default:
                // Handle dynamic routes or fallback
                return '';
        }
    };

    return (
        <div className="h-screen flex">
            {/* Sidebar Navigation */}
            <TeacherSidebar />

            {/* Main Content Area */}
            <div className=" w-full bg-white">
                {/* Sticky Header */}
                <StickyHeader
                    header={getHeaderText(pathname)}
                    profile={{
                        name: user?.name || '',
                        id: user?.id || '',
                        team: user?.manager?.split(' ')[0] + ' Team',
                        role: user?.role || '',
                        email: user?.email || '',
                    }}
                />
                {/* Main Content */}
                <div className="h-[calc(100vh-73px)] p-2 bg-qc-dark/3  shadow-lg overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;