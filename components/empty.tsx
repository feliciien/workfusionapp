// components/empty.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyProps {
  label: string;
  icon?: LucideIcon;
  iconColor?: string;
  bgColor?: string;
}

export const Empty: React.FC<EmptyProps> = ({ 
  label, 
  icon: Icon, 
  iconColor = "text-gray-500",
  bgColor = "bg-gray-100/10" 
}) => {
  return (
    <div className="h-full p-20 flex flex-col items-center justify-center">
      {Icon && (
        <div className={`h-10 w-10 relative rounded-full ${bgColor} ${iconColor} mb-4`}>
          <Icon className="h-6 w-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      )}
      <p className="text-muted-foreground text-sm text-center">{label}</p>
    </div>
  );
};