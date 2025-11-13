// src/components/ui/Pagination.tsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  showInfo = true 
}) => {
  const pages = [];
  const maxVisiblePages = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between">
      {showInfo && (
        <div className="text-sm text-gray-700">
          Page {currentPage} sur {totalPages}
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            "inline-flex items-center px-2 py-2 rounded-md text-sm font-medium",
            "border border-gray-300 bg-white text-gray-500",
            "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              1
            </button>
            {startPage > 2 && (
              <span className="text-gray-500">...</span>
            )}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              "inline-flex items-center px-3 py-2 rounded-md text-sm font-medium border",
              page === currentPage
                ? "border-green-500 bg-green-600 text-white"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            )}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="text-gray-500">...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            "inline-flex items-center px-2 py-2 rounded-md text-sm font-medium",
            "border border-gray-300 bg-white text-gray-500",
            "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;