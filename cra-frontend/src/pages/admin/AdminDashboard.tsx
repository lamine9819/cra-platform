// =============================================
// 6. PAGES DE DASHBOARD EXEMPLES
// =============================================

// src/pages/admin/AdminDashboard.tsx
import React from 'react';
import { Users, FileText, Briefcase, Shield, TrendingUp, AlertTriangle } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const stats = [
    {
      name: 'Utilisateurs actifs',
      value: '24',
      change: '+2',
      changeType: 'positive',
      icon: Users,
    },
    {
      name: 'Projets en cours',
      value: '12',
      change: '+1',
      changeType: 'positive',
      icon: Briefcase,
    },
    {
      name: 'Documents',
      value: '1,247',
      change: '+89',
      changeType: 'positive',
      icon: FileText,
    },
    {
      name: 'Incidents sécurité',
      value: '2',
      change: '0',
      changeType: 'neutral',
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord Administrateur</h1>
        <p className="text-gray-600">Vue d'ensemble de la plateforme CRA</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <stat.icon className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' : 
                stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-2">ce mois</span>
            </div>
          </div>
        ))}
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-green-600 mr-3" />
                <span className="font-medium">Créer un utilisateur</span>
              </div>
            </button>
            <button className="w-full text-left p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-blue-600 mr-3" />
                <span className="font-medium">Gérer les permissions</span>
              </div>
            </button>
            <button className="w-full text-left p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-purple-600 mr-3" />
                <span className="font-medium">Voir les rapports</span>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Nouvel utilisateur créé</p>
                <p className="text-xs text-gray-500">Dr. Aminata Diallo - il y a 2h</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Projet approuvé</p>
                <p className="text-xs text-gray-500">Amélioration variétés de riz - il y a 4h</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Sauvegarde effectuée</p>
                <p className="text-xs text-gray-500">Base de données - il y a 6h</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;