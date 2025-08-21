'use client';

import ContestForm from '@/components/ContestForm';

interface EditContestPageProps {
  params: {
    contestId: string;
  };
}

export default function EditContestPage({ params }: EditContestPageProps) {
  return (
    <ContestForm 
      contestId={params.contestId} 
      mode="edit" 
    />
  );
}
