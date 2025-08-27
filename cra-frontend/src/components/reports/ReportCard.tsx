// src/components/reports/ReportCard.tsx
import React from 'react';
import { Eye, Download, FileText, Activity, Users, BarChart3 } from 'lucide-react';
import { ReportTemplate } from '../../services/reportsApi';

interface ReportCardProps {
  template: ReportTemplate;
  onPreview: () => void;
  onGenerate: () => void;
  onDownload: () => void;
}

const getTemplateIcon = (type: string) => {
  switch (type) {
    case 'project': return FileText;
    case 'activity': return Activity;
    case 'user': return Users;
    case 'global': return BarChart3;
    default: return FileText;
  }
};

const getTemplateColor = (type: string) => {
  switch (type) {
    case 'project': return 'blue';
    case 'activity': return 'green';
    case 'user': return 'purple';
    case 'global': return 'orange';
    default: return 'gray';
  }
};

const ReportCard: React.FC<ReportCardProps> = ({ 
  template, 
  onPreview, 
  onDownload 
}) => {
  const Icon = getTemplateIcon(template.type);
  const color = getTemplateColor(template.type);
  
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200'
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <div className={`p-2 rounded-lg border ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">
            {template.name}
          </h4>
          <p className="text-sm text-gray-500 mt-1">
            {template.description}
          </p>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={onPreview}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Eye className="h-4 w-4" />
          Prévisualiser
        </button>
        <button
          onClick={onDownload}
          className="flex items-center justify-center gap-1 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
        >
          <Download className="h-4 w-4" />
          Télécharger
        </button>
      </div>
    </div>
  );
};
export { ReportCard };