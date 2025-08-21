'use client';

import ContestForm from '@/components/ContestForm';

interface ViewContestPageProps {
  params: {
    contestId: string;
  };
}

export default function ViewContestPage({ params }: ViewContestPageProps) {
  return (
    <ContestForm 
      contestId={params.contestId} 
      mode="view" 
    />
  );
}