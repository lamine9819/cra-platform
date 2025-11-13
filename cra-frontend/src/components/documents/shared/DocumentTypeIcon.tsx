// src/components/documents/shared/DocumentTypeIcon.tsx
import React from 'react';
import { getFileIcon, getFileIconColor } from '../../../utils/fileHelpers';
import { DocumentType } from '../../../types/document.types';

interface DocumentTypeIconProps {
  mimeType: string;
  type?: DocumentType | string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const DocumentTypeIcon: React.FC<DocumentTypeIconProps> = ({
  mimeType,
  type,
  size = 'md',
  className = ''
}) => {
  const Icon = getFileIcon(mimeType);
  const colorClass = getFileIconColor(mimeType);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  return (
    <Icon className={`${sizeClasses[size]} ${colorClass} ${className}`} />
  );
};

export default DocumentTypeIcon;
