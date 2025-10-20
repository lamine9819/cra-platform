// src/pages/admin/AuditLogsManagement.tsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Download, X, Shield, Calendar } from 'lucide-react';
import { auditLogsApi } from '../../services/auditLogsApi';
import {
  AuditLevel,
  AuditLevelLabels,
  ActionLabels,
  CommonActions,
  EntityTypeLabels,
} from '../../types/auditLog.types';
import { AuditLogsTable } from '../../components/admin/audit-logs/AuditLogsTable';
import { Button } from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import toast from 'react-hot-toast';

const AuditLogsManagement: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState<AuditLevel | ''>('');
  const [filterAction, setFilterAction] = useState<string>('');
  const [filterEntityType, setFilterEntityType] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const pageSize = 20;

  // Fetch audit logs
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      'audit-logs',
      currentPage,
      search,
      filterLevel,
      filterAction,
      filterEntityType,
      startDate,
      endDate,
    ],
    queryFn: () =>
      auditLogsApi.getAuditLogs({
        page: currentPage,
        limit: pageSize,
        action: filterAction || undefined,
        level: filterLevel || undefined,
        entityType: filterEntityType || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['audit-logs-stats', startDate, endDate],
    queryFn: () =>
      auditLogsApi.getAuditLogStats({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
  });

  const clearFilters = () => {
    setSearch('');
    setFilterLevel('');
    setFilterAction('');
    setFilterEntityType('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const handleExport = async () => {
    try {
      toast.loading('Export en cours...');
      const blob = await auditLogsApi.exportAuditLogs({
        action: filterAction || undefined,
        level: filterLevel || undefined,
        entityType: filterEntityType || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.dismiss();
      toast.success('Export réussi');
    } catch (error) {
      toast.dismiss();
      toast.error("Erreur lors de l'export");
    }
  };

  const hasActiveFilters =
    filterLevel || filterAction || filterEntityType || startDate || endDate;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Logs d'Audit
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {data?.total || 0} événement{(data?.total || 0) > 1 ? 's' : ''} enregistré
              {(data?.total || 0) > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Button onClick={handleExport} variant="outline" size="lg">
          <Download className="w-5 h-5 mr-2" />
          Exporter CSV
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalLogs}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Info</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.byLevel.INFO || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">ℹ️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avertissements</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.byLevel.WARNING || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Erreurs</p>
                <p className="text-2xl font-bold text-red-600">
                  {(stats.byLevel.ERROR || 0) + (stats.byLevel.CRITICAL || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">❌</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="sm:w-auto"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtres
            {hasActiveFilters && (
              <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                Actifs
              </span>
            )}
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-t pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Niveau */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Niveau
              </label>
              <select
                value={filterLevel}
                onChange={(e) => {
                  setFilterLevel(e.target.value as AuditLevel | '');
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Tous les niveaux</option>
                {Object.entries(AuditLevelLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Action */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action
              </label>
              <select
                value={filterAction}
                onChange={(e) => {
                  setFilterAction(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Toutes les actions</option>
                {Object.entries(CommonActions).map(([key, value]) => (
                  <option key={value} value={value}>
                    {ActionLabels[value] || value}
                  </option>
                ))}
              </select>
            </div>

            {/* Type d'entité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type d'entité
              </label>
              <select
                value={filterEntityType}
                onChange={(e) => {
                  setFilterEntityType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Tous les types</option>
                {Object.entries(EntityTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date de début */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de début
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Date de fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-sm text-gray-600">
              {Object.values({
                filterLevel,
                filterAction,
                filterEntityType,
                startDate,
                endDate,
              }).filter(Boolean).length}{' '}
              filtre(s) actif(s)
            </p>
            <Button variant="outline" onClick={clearFilters} size="sm">
              <X className="w-4 h-4 mr-2" />
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </div>

      {/* Audit Logs Table */}
      {isError ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-red-600 mb-2">Erreur de chargement</div>
          <p className="text-gray-600 text-sm">
            {(error as any)?.response?.data?.message || 'Une erreur est survenue'}
          </p>
        </div>
      ) : (
        <>
          <AuditLogsTable logs={data?.logs || []} isLoading={isLoading} />

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={data.totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AuditLogsManagement;
