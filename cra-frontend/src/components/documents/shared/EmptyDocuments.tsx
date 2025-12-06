// src/components/documents/shared/EmptyDocuments.tsx
import React from 'react';
import { FileText, Upload, Search, Filter } from 'lucide-react';

interface EmptyDocumentsProps {
  title?: string;
  message?: string;
  icon?: 'file' | 'search' | 'filter';
  actionLabel?: string;
  onAction?: () => void;
  showIllustration?: boolean;
  showUploadButton?: boolean;
  onUploadClick?: () => void;
}

export const EmptyDocuments: React.FC<EmptyDocumentsProps> = ({
  title = 'Aucun document',
  message = 'Vous n\'avez pas encore uploadé de documents.',
  icon = 'file',
  actionLabel,
  onAction,
  showIllustration = true,
  showUploadButton,
  onUploadClick
}) => {
  // Support for legacy props
  const finalActionLabel = actionLabel || (showUploadButton ? 'Uploader un document' : undefined);
  const finalOnAction = onAction || onUploadClick;
  const getIcon = () => {
    switch (icon) {
      case 'search':
        return Search;
      case 'filter':
        return Filter;
      default:
        return FileText;
    }
  };

  const Icon = getIcon();

  return (
    <div className="text-center py-12 px-4">
      {showIllustration && (
        <div className="mb-6">
          <Icon className="h-16 w-16 text-gray-400 mx-auto" />
        </div>
      )}

      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>

      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {message}
      </p>

      {finalActionLabel && finalOnAction && (
        <button
          onClick={finalOnAction}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Upload className="h-4 w-4 mr-2" />
          {finalActionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyDocuments;
