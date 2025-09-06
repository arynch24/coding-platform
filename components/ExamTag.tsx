import type { ExamTag } from "@/types/dashboard";

const ExamTag: React.FC<{ tag: ExamTag }> = ({ tag }) => (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${tag.color}`}>
        {tag.name}
    </span>
);

export default ExamTag;