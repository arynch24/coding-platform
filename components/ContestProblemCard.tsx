// components/ProblemCard.tsx
import React, { useState } from "react";
import Badge from "./ui/Badge";
import { Edit, MoreHorizontal, Trash2, Save } from "lucide-react";
import DropdownMenu from "@/components/MenuItem";
import { MenuItem } from "@/types/dashboard";
import axios from "axios";
import {toast} from "sonner";

interface ProblemCardProps {
  number: number;
  title: string;
  points: number;
  difficulty: "Easy" | "Medium" | "Hard";
  role: "teacher" | "student";
  onClick: () => void;
  isSolved?: boolean;
  onEdit?: () => void;
  contestProblemId: string;
  onUpdatePoints?: (id: string, points: number) => void;
  onRemove?: (id: string) => Promise<boolean>; // returns success/failure
}

const ProblemCard: React.FC<ProblemCardProps> = ({
  number,
  title,
  points: initialPoints,
  difficulty,
  role,
  onClick,
  isSolved,
  onUpdatePoints,
  contestProblemId,
  onRemove,
}) => {
  const [points, setPoints] = useState(initialPoints);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(points.toString());
  const [isSaving, setIsSaving] = useState(false);

  const handleRemoveProblem = async () => {
    if (!onRemove) return;
    await onRemove(contestProblemId); // Already handles UI + API
  };

  const handleSavePoints = async () => {
    const newPoints = Number(inputValue);
    if (isNaN(newPoints) || newPoints <= 0 || newPoints >10) {
      toast.error("Points must be between 1 and 10");
      return;
    }

    if (newPoints === points) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      if (!onUpdatePoints) return;
      onUpdatePoints(contestProblemId, newPoints);
      setPoints(newPoints);
      setIsEditing(false);
    } catch (err) {
      // Error already handled in parent, but you can log or ignore
    } finally {
      setIsSaving(false);
    }
  };

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

  // Dropdown menu items
  const menuItems: MenuItem[] = [
    {
      id: "edit-points",
      label: isEditing ? "Editing..." : "Edit Points",
      icon: <Edit className="w-4 h-4" />,
      disabled: isSaving,
      action: () => setIsEditing(true),
    },
    {
      id: "remove-problem",
      label: "Remove from Contest",
      icon: <Trash2 className="w-4 h-4" />,
      variant: "danger",
      action: handleRemoveProblem,
    },
  ];

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow ">
      <div className="flex items-center space-x-4 flex-1 cursor-pointer"
        onClick={onClick}
        >
        <span className="font-bold text-gray-700 w-8">{number}.</span>
        <span className="font-medium text-gray-900">{title}</span>
      </div>

      <div className="flex items-center space-x-6">
        {/* Points (Editable) */}
        <div className="text-sm font-medium text-gray-600 flex items-center gap-2">
          {isEditing ? (
            <>
              <input
                type="number"
                min="1"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSavePoints();
                  if (e.key === "Escape") {
                    setInputValue(points.toString());
                    setIsEditing(false);
                  }
                }}
                className="w-20 px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
              <button
                onClick={handleSavePoints}
                disabled={isSaving}
                className="p-1 hover:bg-gray-100 rounded"
              >
                {isSaving ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <Save className="w-4 h-4 text-green-600" />
                )}
              </button>
            </>
          ) : (
            <span>{points} pts</span>
          )}
        </div>

        {/* Difficulty Badge */}
        <Badge variant={getDifficultyVariant(difficulty)}>{difficulty}</Badge>

        {/* Solved Status (for students) */}
        {role === "student" && (
          <span className={`text-sm font-medium ${isSolved ? "text-green-600" : "text-gray-500"}`}>
            {isSolved ? "Solved" : "Unsolved"}
          </span>
        )}

        {/* Dropdown Menu (for teachers) */}
        {role === "teacher" && (
          <DropdownMenu items={menuItems} />
        )}
      </div>
    </div>
  );
};

export default ProblemCard;