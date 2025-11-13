// src/components/ui/Dropdown.tsx - Version corrigée avec support des séparateurs
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';

interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'item';
}

interface DropdownSeparator {
  type: 'separator';
}

type DropdownMenuItems = (DropdownItem | DropdownSeparator)[];

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownMenuItems;
  align?: 'left' | 'right';
}

const Dropdown: React.FC<DropdownProps> = ({ trigger, items, align = 'right' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (item: DropdownItem) => {
    if (!item.disabled) {
      item.onClick();
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      {isOpen && (
        <div className={cn(
          "absolute z-50 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5",
          align === 'right' ? 'right-0' : 'left-0'
        )}>
          <div className="py-1">
            {items.map((item, index) => {
              if (item.type === 'separator') {
                return <div key={index} className="border-t border-gray-100 my-1" />;
              }
              
              return (
                <button
                  key={index}
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                  className={cn(
                    "flex items-center w-full px-4 py-2 text-sm text-left",
                    "hover:bg-gray-100 focus:bg-gray-100 focus:outline-none",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    item.className
                  )}
                >
                  {item.icon && (
                    <span className="mr-3">{item.icon}</span>
                  )}
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;