// types/index.ts
export interface NavButtonProps {
    icon?: React.ReactNode;
    text: string;
    onClick: () => void;
  }
  
  export interface TimeSlot {
    time: string;
    available: boolean;
  }