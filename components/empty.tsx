// components/empty.tsx
import React from 'react';

interface EmptyProps {
  label: string;
}

export const Empty: React.FC<EmptyProps> = ({ label }) => {
  return (
    <div className="text-center text-gray-500">{label}</div>
  );
};