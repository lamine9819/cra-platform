// =============================================
// PAGE DE LOGIN MISE À JOUR - Structure deux colonnes
// =============================================

// src/pages/auth/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Globe, ArrowLeft, Leaf, Microscope, Shield, Users, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/auth.service';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated, user, error, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirection automatique si déjà connecté
  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      const from = (location.state as any)?.from?.pathname;
      const defaultPath = authService.getRoleBasedRedirectPath(user.role);
      navigate(from || defaultPath, { replace: true });
    }
  }, [isAuthenticated, user, isLoading, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    // Validation basique
    if (!formData.email || !formData.password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsSubmitting(true);

    try {
      await login(formData.email, formData.password, formData.rememberMe);
      toast.success('Connexion réussie !');
      
      // La redirection sera gérée par useEffect
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      toast.error(error.message || 'Erreur lors de la connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Afficher un loader si en cours de vérification d'auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Partie gauche - Formulaire de connexion */}
      <div className="flex-1 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6 relative">
        {/* Éléments décoratifs flottants pour la partie gauche */}
        <div className="absolute top-20 left-20 opacity-10">
          <div className="w-32 h-32 bg-green-400 rounded-full animate-pulse"></div>
        </div>
        <div className="absolute bottom-20 right-20 opacity-10">
          <div className="w-24 h-24 bg-blue-400 rounded-full animate-bounce"></div>
        </div>

        <div className="max-w-md w-full relative z-10">
          {/* Retour à l'accueil */}
          <div className="mb-8">
            <Link 
              to="/" 
              className="inline-flex items-center text-green-400 hover:text-green-300 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Retour à l'accueil
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center mb-6">
              <Globe className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Affichage des erreurs */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-xl flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Entrez votre email"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 pr-12 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-700/50 rounded-r-lg transition-colors disabled:opacity-50"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-green-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-green-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-600 bg-gray-800 rounded disabled:opacity-50"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-300">
                  Se souvenir de moi
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-green-400 hover:text-green-300 font-medium hover:underline disabled:opacity-50"
                disabled={isSubmitting}
              >
                Mot de passe oublié?
              </button>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-900 text-gray-400 font-medium">OU</span>
              </div>
            </div>
          </div>

          {/* Informations de contact pour création de compte */}
          <div className="text-center bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-sm text-gray-300 mb-2 font-medium">
              Besoin d'un compte ?
            </p>
            <p className="text-sm text-gray-400">
              Contactez l'administrateur système pour obtenir vos identifiants d'accès
            </p>
            <div className="mt-3 flex items-center justify-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center">
                <Shield className="w-3 h-3 mr-1" />
                Plateforme sécurisée
              </span>
              <span className="flex items-center">
                <Globe className="w-3 h-3 mr-1" />
                CRA Saint-Louis
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-gray-500">
            <p>© CRA 2025</p>
          </div>
        </div>
      </div>

      {/* Partie droite - Image et message */}
      <div className="flex-1 bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Éléments décoratifs pour la partie droite */}
        <div className="absolute top-20 right-20 opacity-20">
          <Leaf className="w-24 h-24 text-white animate-pulse" />
        </div>
        <div className="absolute bottom-20 left-20 opacity-20">
          <Microscope className="w-20 h-20 text-white animate-bounce" />
        </div>
        
        {/* Orbites et satellite décoratifs */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Orbites */}
            <div className="absolute w-96 h-96 border border-white/20 rounded-full animate-spin" style={{animationDuration: '20s'}}></div>
            <div className="absolute w-80 h-80 border border-white/20 rounded-full animate-spin" style={{animationDuration: '15s', animationDirection: 'reverse'}}></div>
            <div className="absolute w-64 h-64 border border-white/20 rounded-full animate-spin" style={{animationDuration: '10s'}}></div>
            
            {/* Points satellites */}
            <div className="absolute w-4 h-4 bg-white rounded-full top-0 left-1/2 transform -translate-x-2 animate-pulse"></div>
            <div className="absolute w-3 h-3 bg-white/80 rounded-full bottom-4 right-1/3 transform animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute w-3 h-3 bg-white/80 rounded-full top-1/3 right-0 transform animate-pulse" style={{animationDelay: '2s'}}></div>
            
            {/* Icône satellite central */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Globe className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal de la partie droite */}
        <div className="relative z-10 text-center text-white max-w-md">
          <h2 className="text-4xl font-bold mb-6 leading-tight">
            CRA Platform, proche de vous pour des données fiables et mesurables
          </h2>
          
          {/* Vous pouvez remplacer cette section par votre propre image */}
          <div className="mt-8 p-8 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
            <div className="w-32 h-32 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
              {/* Remplacez cette icône par votre image */}
              <Microscope className="w-16 h-16 text-white" />
            </div>
            <p className="text-lg font-medium mb-2">Centre de Recherches Agricoles</p>
            <p className="text-white/80">Saint-Louis, Sénégal</p>
          </div>

          {/* Indicateurs de fonctionnalités */}
          <div className="mt-8 flex justify-center space-x-6 text-sm">
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              <span>Sécurisé</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              <span>Collaboratif</span>
            </div>
            <div className="flex items-center">
              <Globe className="w-4 h-4 mr-2" />
              <span>Accessible</span>
            </div>
          </div>
        </div>

        {/* Effet de grille décorative */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-12 grid-rows-8 h-full w-full">
            {Array.from({ length: 96 }).map((_, i) => (
              <div key={i} className="border border-white"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;