// =============================================
// PAGE DE LOGIN MISE À JOUR - Structure deux colonnes
// =============================================

// src/pages/auth/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Globe, ArrowLeft, Shield, Users, AlertCircle } from 'lucide-react';
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
  const hasRedirectedRef = React.useRef(false);

  const { login, isAuthenticated, user, error, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirection automatique si déjà connecté
  useEffect(() => {
    if (isAuthenticated && user && !isLoading && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;

      // Toujours rediriger vers la route basée sur le rôle de l'utilisateur
      // Ne pas utiliser 'from' pour éviter les redirections vers des pages non autorisées
      const roleBasedPath = authService.getRoleBasedRedirectPath(user.role);

      console.log('[LoginPage] ✅ Redirection:',
        '\n  - Authentifié:', isAuthenticated,
        '\n  - Rôle:', user.role,
        '\n  - Email:', user.email,
        '\n  - Vers:', roleBasedPath
      );

      navigate(roleBasedPath, { replace: true });
    }
  }, [isAuthenticated, user, isLoading, navigate]);

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

          {/* Header simplifié */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Connexion</h1>
            <p className="text-gray-400">Accédez à votre espace CRA</p>
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
        </div>
      </div>

      {/* Partie droite - Image et message */}
      <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Image de fond */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/industries-4.jpg)',
          }}
        >
          {/* Overlay sombre pour améliorer la lisibilité du texte */}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* Contenu principal de la partie droite */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-start pt-20 px-6">
          {/* Titre principal avec style artistique */}
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4" style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              textShadow: '0 4px 20px rgba(0,0,0,0.5), 0 2px 10px rgba(0,0,0,0.3)',
              letterSpacing: '-0.02em'
            }}>
              <span className="block bg-gradient-to-r from-white via-green-50 to-white bg-clip-text text-transparent">
                CRA Plateforme
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-white/95 font-light italic" style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              letterSpacing: '0.02em'
            }}>
              Proche de vous pour mieux vous servir
            </p>
          </div>

          {/* Carte d'information */}
          <div className="mt-auto mb-20 p-8 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 max-w-md">
            <p className="text-lg font-medium mb-2 text-white">Centre de Recherches Agricoles</p>
            <p className="text-white/90">Saint-Louis, Sénégal</p>

            {/* Indicateurs de fonctionnalités */}
            <div className="mt-6 flex justify-center space-x-6 text-sm text-white/90">
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
        </div>
      </div>
    </div>
  );
};

export default LoginPage;