// src/components/admin/audit-logs/AuditLogsTable.tsx
import React, { useState } from 'react';
import {
  Eye,
  Calendar,
  User,
  Activity,
  AlertCircle,
  Info,
  AlertTriangle,
  XCircle,
  Zap,
} from 'lucide-react';
import {
  AuditLog,
  AuditLevel,
  AuditLevelLabels,
  AuditLevelColors,
  ActionLabels,
  EntityTypeLabels,
} from '../../../types/auditLog.types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AuditLogsTableProps {
  logs: AuditLog[];
  onView?: (log: AuditLog) => void;
  isLoading?: boolean;
}

// Icônes par niveau
const getLevelIcon = (level: AuditLevel) => {
  switch (level) {
    case AuditLevel.INFO:
      return <Info className="w-4 h-4" />;
    case AuditLevel.WARNING:
      return <AlertTriangle className="w-4 h-4" />;
    case AuditLevel.ERROR:
      return <XCircle className="w-4 h-4" />;
    case AuditLevel.CRITICAL:
      return <Zap className="w-4 h-4" />;
    default:
      return <AlertCircle className="w-4 h-4" />;
  }
};

export const AuditLogsTable: React.FC<AuditLogsTableProps> = ({
  logs,
  onView,
  isLoading,
}) => {
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement des logs d'audit...</p>
        </div>
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Aucun log d'audit trouvé</p>
          <p className="text-gray-500 text-sm mt-2">
            Aucune activité ne correspond aux filtres sélectionnés
          </p>
        </div>
      </div>
    );
  }

  const toggleExpand = (logId: string) => {
    setExpandedLog(expandedLog === logId ? null : logId);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Heure
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilisateur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entité
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Niveau
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Détails
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <React.Fragment key={log.id}>
                <tr className="hover:bg-gray-50 transition-colors">
                  {/* Date */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <div className="text-sm">
                        <div className="text-gray-900 font-medium">
                          {format(new Date(log.createdAt), 'dd MMM yyyy', { locale: fr })}
                        </div>
                        <div className="text-gray-500">
                          {format(new Date(log.createdAt), 'HH:mm:ss', { locale: fr })}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Utilisateur */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <div className="text-sm">
                        {log.user ? (
                          <>
                            <div className="text-gray-900 font-medium">
                              {log.user.firstName} {log.user.lastName}
                            </div>
                            <div className="text-gray-500 text-xs">{log.user.email}</div>
                          </>
                        ) : (
                          <span className="text-gray-500 italic">Système</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      <Activity className="w-3 h-3 mr-1" />
                      {ActionLabels[log.action] || log.action}
                    </span>
                  </td>

                  {/* Entité */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.entityType ? (
                      <div className="text-sm">
                        <div className="text-gray-900 font-medium">
                          {EntityTypeLabels[log.entityType] || log.entityType}
                        </div>
                        {log.entityId && (
                          <div className="text-gray-500 text-xs font-mono">
                            #{log.entityId.substring(0, 8)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>

                  {/* Niveau */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        AuditLevelColors[log.level]
                      }`}
                    >
                      {getLevelIcon(log.level)}
                      <span className="ml-1">{AuditLevelLabels[log.level]}</span>
                    </span>
                  </td>

                  {/* Détails */}
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-md truncate">
                      {log.details?.title || log.details?.description || '-'}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => toggleExpand(log.id)}
                      className="text-green-600 hover:text-green-900 inline-flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {expandedLog === log.id ? 'Masquer' : 'Détails'}
                    </button>
                  </td>
                </tr>

                {/* Ligne étendue avec détails complets */}
                {expandedLog === log.id && (
                  <tr className="bg-gray-50">
                    <td colSpan={7} className="px-6 py-4">
                      <div className="space-y-4">
                        {/* Détails */}
                        {log.details && Object.keys(log.details).length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">
                              Détails de l'action
                            </h4>
                            <div className="bg-white p-3 rounded border border-gray-200">
                              <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}

                        {/* Changements */}
                        {log.changes && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">
                              Changements
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {log.changes.before && (
                                <div>
                                  <p className="text-xs font-medium text-gray-600 mb-1">
                                    Avant
                                  </p>
                                  <div className="bg-red-50 p-3 rounded border border-red-200">
                                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                                      {JSON.stringify(log.changes.before, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              )}
                              {log.changes.after && (
                                <div>
                                  <p className="text-xs font-medium text-gray-600 mb-1">
                                    Après
                                  </p>
                                  <div className="bg-green-50 p-3 rounded border border-green-200">
                                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                                      {JSON.stringify(log.changes.after, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              )}
                            </div>
                            {log.changes.fields && log.changes.fields.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-gray-600 mb-1">
                                  Champs modifiés
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {log.changes.fields.map((field) => (
                                    <span
                                      key={field}
                                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                    >
                                      {field}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Métadonnées */}
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">
                              Métadonnées
                            </h4>
                            <div className="bg-white p-3 rounded border border-gray-200">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                {log.metadata.ip && (
                                  <div>
                                    <span className="text-gray-500">IP:</span>
                                    <span className="ml-1 text-gray-900 font-mono">
                                      {log.metadata.ip}
                                    </span>
                                  </div>
                                )}
                                {log.metadata.method && (
                                  <div>
                                    <span className="text-gray-500">Méthode:</span>
                                    <span className="ml-1 text-gray-900 font-semibold">
                                      {log.metadata.method}
                                    </span>
                                  </div>
                                )}
                                {log.metadata.path && (
                                  <div className="col-span-2">
                                    <span className="text-gray-500">Chemin:</span>
                                    <span className="ml-1 text-gray-900 font-mono">
                                      {log.metadata.path}
                                    </span>
                                  </div>
                                )}
                                {log.metadata.userAgent && (
                                  <div className="col-span-4">
                                    <span className="text-gray-500">User-Agent:</span>
                                    <span className="ml-1 text-gray-700 break-all">
                                      {log.metadata.userAgent}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogsTable;
