// src/pages/admin/UsersManagement.tsx
import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Filter, RefreshCw } from 'lucide-react';
import { User, usersApi } from '../../services/usersApi';
import { UserRole } from '../../types/auth.types';
import UserTable from '../../components/admin/UserTable';
import UserFormModal from '../../components/admin/UserFormModal';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';
import { toast } from 'react-hot-toast';

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Load users
  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersApi.listUsers();
      setUsers(data.users);
      setFilteredUsers(data.users);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filter users
  useEffect(() => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(term) ||
          user.lastName.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          (user.department && user.department.toLowerCase().includes(term))
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((user) =>
        statusFilter === 'active' ? user.isActive : !user.isActive
      );
    }

    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, statusFilter, users]);

  // Statistics
  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    chercheurs: users.filter((u) => u.role === UserRole.CHERCHEUR).length,
    coordonateurs: users.filter((u) => u.role === UserRole.COORDONATEUR_PROJET).length,
    admins: users.filter((u) => u.role === UserRole.ADMINISTRATEUR).length,
  };

  // Handlers
  const handleCreate = async (userData: Partial<User> & { password?: string }) => {
    try {
      await usersApi.createUser(userData);
      toast.success('Utilisateur créé avec succès');
      await loadUsers();
      setIsCreateModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création');
      throw error;
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (userData: Partial<User> & { password?: string }) => {
    if (!selectedUser) return;

    try {
      await usersApi.updateUser(selectedUser.id, userData);
      toast.success('Utilisateur modifié avec succès');
      await loadUsers();
      setIsEditModalOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la modification');
      throw error;
    }
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    try {
      await usersApi.deleteUser(selectedUser.id);
      toast.success('Utilisateur supprimé avec succès');
      await loadUsers();
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      if (user.isActive) {
        await usersApi.deactivateUser(user.id);
        toast.success(`${user.firstName} ${user.lastName} a été désactivé`);
      } else {
        await usersApi.activateUser(user.id);
        toast.success(`${user.firstName} ${user.lastName} a été activé`);
      }
      await loadUsers();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du changement de statut');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
          <p className="text-gray-600 mt-1">
            Gérez les comptes utilisateurs et leurs permissions
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Nouvel utilisateur
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Actifs</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Chercheurs</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.chercheurs}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Coordonateurs</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.coordonateurs}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.admins}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, email ou département..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none"
              >
                <option value="all">Tous les rôles</option>
                <option value={UserRole.CHERCHEUR}>Chercheurs</option>
                <option value={UserRole.COORDONATEUR_PROJET}>Coordonateurs</option>
                <option value={UserRole.ADMINISTRATEUR}>Administrateurs</option>
              </select>
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>

            <button
              onClick={loadUsers}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Actualiser"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-3 text-sm text-gray-600">
          {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} trouvé{filteredUsers.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Users Table */}
      <UserTable
        users={filteredUsers}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onToggleStatus={handleToggleStatus}
        loading={loading}
      />

      {/* Create Modal */}
      <UserFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        mode="create"
      />

      {/* Edit Modal */}
      <UserFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleUpdate}
        user={selectedUser}
        mode="edit"
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Supprimer l'utilisateur"
        message={
          selectedUser
            ? `Êtes-vous sûr de vouloir supprimer ${selectedUser.firstName} ${selectedUser.lastName} ? Cette action est irréversible.`
            : ''
        }
      />
    </div>
  );
};

export default UsersManagement;
