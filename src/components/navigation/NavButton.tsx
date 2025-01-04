// navigation/NavButton.tsx
import React from 'react';
import { ChevronRight } from 'lucide-react';

interface NavButtonProps {
  icon?: React.ReactNode;
  text: string;
  onClick: () => void;
}

export const NavButton: React.FC<NavButtonProps> = ({ icon, text, onClick }) => (
  <button
    onClick={onClick}
    className="w-full p-4 flex items-center justify-between bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
  >
    <div className="flex items-center space-x-3">
      {icon}
      <span>{text}</span>
    </div>
    <ChevronRight className="w-5 h-5 text-gray-400" />
  </button>
);

export default NavButton;