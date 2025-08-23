// components/Tag.tsx
import React from "react";

export type TagVariant = "status" | "difficulty" | "language" | "topic" | "batch" | "subject"| "score";

interface TagProps {
  children: React.ReactNode;
  variant?: TagVariant;
  className?: string;
}

const Tag: React.FC<TagProps> = ({ children, variant = "topic", className = "" }) => {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium";
  
  const variantClasses = {
    status: "bg-emerald-100 text-emerald-800",
    difficulty: "bg-green-100 text-green-800",
    language: "bg-blue-100 text-blue-800",
    topic: "bg-gray-100 text-gray-800",
    batch: "bg-purple-100 text-purple-800",
    subject: "bg-indigo-100 text-indigo-800",
    score: "bg-yellow-100 text-yellow-800",
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Tag;