import React from 'react';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbsProps {
  items: string[];
  onNavigate?: (index: number) => void;
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  onNavigate,
  className = ''
}) => {
  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`}>
      {items.map((item, index) => (
        <React.Fragment key={`${item}-${index}`}>
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
          <button
            onClick={() => onNavigate?.(index)}
            className={`
              hover:text-blue-600 transition-colors
              ${index === items.length - 1 
                ? 'text-gray-800 font-medium' 
                : 'text-gray-500'
              }
              ${onNavigate ? 'cursor-pointer' : 'cursor-default'}
            `}
            disabled={!onNavigate}
          >
            {item}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
};

// You can also add a more sophisticated version with tooltips and active states
export const BreadcrumbsAdvanced: React.FC<BreadcrumbsProps & {
  tooltips?: string[];
  activeIndex?: number;
}> = ({
  items,
  onNavigate,
  tooltips,
  activeIndex,
  className = ''
}) => {
  return (
    <nav 
      className={`flex items-center space-x-2 text-sm ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
            )}
            <button
              onClick={() => onNavigate?.(index)}
              className={`
                group relative flex items-center
                hover:text-blue-600 transition-colors
                ${index === activeIndex 
                  ? 'text-blue-600 font-medium' 
                  : index === items.length - 1 
                    ? 'text-gray-800 font-medium'
                    : 'text-gray-500'
                }
                ${onNavigate ? 'cursor-pointer' : 'cursor-default'}
              `}
              disabled={!onNavigate}
              aria-current={index === activeIndex ? 'page' : undefined}
              title={tooltips?.[index]}
            >
              {item}
              
              {/* Optional tooltip */}
              {tooltips?.[index] && (
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                               hidden group-hover:block bg-gray-800 text-white text-xs 
                               rounded py-1 px-2 whitespace-nowrap">
                  {tooltips[index]}
                </span>
              )}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;

// Usage examples:
/*
// Basic usage
<Breadcrumbs 
  items={['Home', 'Booking', 'Select Time']} 
  onNavigate={(index) => handleNavigation(index)}
/>

// Advanced usage with tooltips and active state
<BreadcrumbsAdvanced 
  items={['Home', 'Booking', 'Select Time']}
  tooltips={[
    'Return to home',
    'Booking overview',
    'Select your time slot'
  ]}
  activeIndex={1}
  onNavigate={(index) => handleNavigation(index)}
/>
*/