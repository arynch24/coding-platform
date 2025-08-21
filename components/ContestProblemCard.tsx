// components/ProblemCard.tsx
import React from "react";
import Badge from "./ui/Badge";
import { Edit } from "lucide-react";

interface ProblemCardProps {
  number: number;
  title: string;
  points: number;
  difficulty: "Easy" | "Medium" | "Hard";
  role: "teacher" | "student";
  onClick: () => void;
  isSolved?: boolean;
  onEdit?: () => void;
}

const ProblemCard: React.FC<ProblemCardProps> = ({
  number,
  title,
  points,
  difficulty,
  role,
  onClick,
  isSolved = false,
  onEdit,
}) => {
  const getDifficultyVariant = (diff: string) => {
    switch (diff.toLowerCase()) {
      case "easy":
        return "easy";
      case "medium":
        return "medium";
      case "hard":
        return "hard";
      default:
        return "default";
    }
  };

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-center space-x-4 flex-1">
        <span className="font-bold text-gray-700 w-8">{number}.</span>
        <span className="font-medium text-gray-900">{title}</span>
      </div>

      <div className="flex items-center space-x-6">
        {/* Points */}
        <span className="text-sm text-gray-600 font-medium">{points} pts</span>

        {/* Difficulty Badge */}
        <Badge variant={getDifficultyVariant(difficulty)}>
          {difficulty}
        </Badge>

        {/* Solved Status (for students) */}
        {role === "student" && (
          <span className={`text-sm font-medium ${isSolved ? "text-green-600" : "text-gray-500"}`}>
            {isSolved ? "Solved" : "Unsolved"}
          </span>
        )}

        {/* Edit Button (for teachers, only if enabled) */}
        {role === "teacher" && onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-900"
          >
            <Edit className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ProblemCard;