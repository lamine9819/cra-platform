// src/components/reports/QuickReportButton.tsx
import React, { useState } from 'react';
import { Download, FileText, Loader } from 'lucide-react';
import { useReports } from '../../hooks/useReports';

interface QuickReportButtonProps {
  type: 'project' | 'activity' | 'user';
  entityId: string;
  entityTitle: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const QuickReportButton: React.FC<QuickReportButtonProps> = ({
  type,
  entityId,
  entityTitle,
  variant = 'secondary',
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const { downloadReport, loading, error } = useReports();
  const [success, setSuccess] = useState(false);

  const handleDownload = async () => {
    try {
      setSuccess(false);
      await downloadReport(type, entityId);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000); // Reset success after 3s
    } catch (err) {
      console.error('Erreur téléchargement rapport:', err);
    }
  };

  // Classes CSS selon les variants et tailles
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <div className="relative">
      <button
        onClick={handleDownload}
        disabled={loading}
        className={classes}
        title={`Télécharger le rapport de ${entityTitle}`}
      >
        {loading ? (
          <Loader className={`${iconSizes[size]} animate-spin`} />
        ) : success ? (
          showIcon && <FileText className={`${iconSizes[size]} text-green-500`} />
        ) : (
          showIcon && <Download className={iconSizes[size]} />
        )}
        <span>
          {loading ? 'Génération...' : success ? 'Téléchargé!' : 'Rapport'}
        </span>
      </button>

      {/* Message d'erreur */}
      {error && (
        <div className="absolute top-full left-0 mt-1 bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-700 whitespace-nowrap z-10 shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
};
export  {QuickReportButton};
