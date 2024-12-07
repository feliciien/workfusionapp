// components/heading.tsx
import React from 'react';
import { Icon as LucideIcon } from "lucide-react";

interface HeadingProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  bgColor?: string;
}

export const Heading: React.FC<HeadingProps> = ({ title, description, icon: Icon, iconColor, bgColor }) => {
  return (
    <div className="mb-8">
      {Icon && (
        <div className={`p-2 inline-block rounded-md ${bgColor}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      )}
      <h1 className="text-2xl font-bold mt-2">{title}</h1>
      {description && <p className="text-gray-600">{description}</p>}
    </div>
  );
};