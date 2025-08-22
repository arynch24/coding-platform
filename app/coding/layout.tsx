'use client';

import { usePathname } from 'next/navigation';
import Sidebar from "@/components/student/Sidebar";
import StickyHeader from "@/components/StickyHeader";
import { useAuthContext } from '@/context/AuthenticationContext';

const DashboardLayout = ({ children }: Readonly<{ children: React.ReactNode; }>) => {
    const pathname = usePathname();
    const { user } = useAuthContext();

    // Function to get header text based on current path
    const getHeaderText = (path: string): string => {
        switch (path) {
            case '/coding/leaderboard':
                return 'Leaderboard';
            case '/coding':
                return 'Exam';
            case '/coding/practice':
                return 'Question Bank';
            default:
                // Handle dynamic routes or fallback
                return '';
        }
    };

    return (
        <div className="h-screen flex">
            {/* Sidebar Navigation */}
            <Sidebar />

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
                <div className="h-[calc(100vh-73px)] p-2 overflow-y-auto bg-qc-dark/3  shadow-lg ">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;