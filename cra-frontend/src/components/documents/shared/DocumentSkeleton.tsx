// src/components/documents/shared/DocumentSkeleton.tsx
import React from 'react';

interface DocumentSkeletonProps {
  count?: number;
  compact?: boolean;
}

export const DocumentSkeleton: React.FC<DocumentSkeletonProps> = ({
  count = 3,
  compact = false
}) => {
  if (compact) {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse"
          >
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gray-200 rounded" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
              <div className="flex space-x-2">
                <div className="h-8 w-8 bg-gray-200 rounded" />
                <div className="h-8 w-8 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse"
        >
          <div className="flex items-start space-x-4 mb-4">
            <div className="h-12 w-12 bg-gray-200 rounded" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="h-3 bg-gray-200 rounded" />
            <div className="h-3 bg-gray-200 rounded w-5/6" />
          </div>

          <div className="flex items-center justify-between">
            <div className="h-6 w-16 bg-gray-200 rounded" />
            <div className="flex space-x-2">
              <div className="h-8 w-8 bg-gray-200 rounded" />
              <div className="h-8 w-8 bg-gray-200 rounded" />
              <div className="h-8 w-8 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentSkeleton;
