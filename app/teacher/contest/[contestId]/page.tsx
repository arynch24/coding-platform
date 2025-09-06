import ContestForm from '@/components/ContestForm';

export default async function ViewContestPage({
  params,
}: {
  params: Promise<{ contestId: string }>;
}) {
  const { contestId } = await params;

  return (
    <ContestForm
      contestId={contestId}
      mode="view"
    />
  );
}