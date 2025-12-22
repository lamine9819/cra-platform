import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  Users,
  BookOpen,
  Database,
  Award,
  ArrowRight,
  Menu,
  X,
  ChevronRight,
  Microscope,
  Leaf,
  BarChart3,
  Shield,
  Calendar,
  FileText,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Target,
  Lightbulb,
  TrendingUp
} from 'lucide-react';

const HomePage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      icon: Database,
      title: "Gestion de Données",
      description: "Centralisez et analysez vos données de recherche avec des outils puissants et sécurisés"
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "Travaillez ensemble sur des projets avec des outils de partage et de communication avancés"
    },
    {
      icon: FileText,
      title: "Documentation",
      description: "Organisez et partagez vos documents, rapports et publications scientifiques"
    },
    {
      icon: Calendar,
      title: "Gestion de Projets",
      description: "Planifiez et suivez vos projets de recherche avec des tableaux de bord détaillés"
    }
  ];

  const stats = [
    { number: "150+", label: "Chercheurs Actifs", icon: Users },
    { number: "50+", label: "Projets de Recherche", icon: Microscope },
    { number: "1000+", label: "Documents Partagés", icon: FileText },
    { number: "50+", label: "Années d'Excellence", icon: Award }
  ];

  const missions = [
    {
      icon: Target,
      title: "Notre Mission",
      description: "Contribuer à l'amélioration de la productivité agricole et à la sécurité alimentaire dans la vallée du fleuve Sénégal"
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "Développer des variétés améliorées et des techniques agricoles adaptées aux conditions locales"
    },
    {
      icon: TrendingUp,
      title: "Impact",
      description: "Améliorer les revenus des producteurs et renforcer la résilience des systèmes de production"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-md shadow-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                <Leaf className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                  CRA Plateforme
                </h1>
                <p className="text-xs text-gray-500 font-medium">Saint-Louis, Sénégal</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#accueil" className="text-green-600 hover:text-green-700 font-semibold transition-colors">Accueil</a>
              <a href="#apropos" className="text-gray-700 hover:text-green-600 transition-colors font-medium">À Propos</a>
              <a href="#fonctionnalites" className="text-gray-700 hover:text-green-600 transition-colors font-medium">Fonctionnalités</a>
              <a href="#galerie" className="text-gray-700 hover:text-green-600 transition-colors font-medium">Galerie</a>
              <a href="#contact" className="text-gray-700 hover:text-green-600 transition-colors font-medium">Contact</a>
            </div>

            {/* CTA Button */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/login"
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl font-semibold"
              >
                Se Connecter
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-green-600 p-2"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-100 py-4">
              <div className="px-2 space-y-2">
                <a href="#accueil" className="block px-4 py-3 text-green-600 font-semibold rounded-lg hover:bg-green-50">Accueil</a>
                <a href="#apropos" className="block px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50">À Propos</a>
                <a href="#fonctionnalites" className="block px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50">Fonctionnalités</a>
                <a href="#galerie" className="block px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50">Galerie</a>
                <a href="#contact" className="block px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50">Contact</a>
                <div className="pt-4">
                  <Link to="/login" className="block w-full text-center px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold">
                    Se Connecter
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section avec image de fond */}
      <section id="accueil" className="relative min-h-screen flex items-center pt-20">
        {/* Image de fond */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/41076706-les-epis-de-riz-lourds-avec-grains-de-cereales-charnues.jpg)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/50"></div>
        </div>

        {/* Contenu */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-600/20 backdrop-blur-sm border border-green-400/30 text-green-300 text-sm font-semibold mb-8">
              <Leaf className="w-4 h-4 mr-2" />
              Centre de Recherches Agricoles
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight" style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              textShadow: '0 4px 30px rgba(0,0,0,0.5)'
            }}>
              Innovation et Excellence en Recherche Agricole
            </h1>

            <p className="text-xl md:text-2xl text-gray-200 mb-10 leading-relaxed" style={{
              textShadow: '0 2px 20px rgba(0,0,0,0.5)'
            }}>
              Plateforme collaborative dédiée à l'avancement de la recherche agricole et à la sécurité alimentaire dans la vallée du fleuve Sénégal
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/login"
                className="inline-flex items-center justify-center bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-xl font-semibold text-lg group"
              >
                Accéder à la Plateforme
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#apropos"
                className="inline-flex items-center justify-center border-2 border-white/80 text-white px-8 py-4 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all font-semibold text-lg"
              >
                En Savoir Plus
              </a>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronRight className="w-6 h-6 text-white rotate-90" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-gradient-to-br from-green-50 to-green-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                  <stat.icon className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</h3>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* À Propos Section */}
      <section id="apropos" className="py-24 bg-gradient-to-br from-gray-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" style={{
              fontFamily: "'Georgia', 'Times New Roman', serif"
            }}>
              À Propos du CRA de Saint-Louis
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une institution de référence dans la recherche agricole et le développement rural
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {missions.map((mission, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-br from-green-100 to-green-200 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  <mission.icon className="w-8 h-8 text-green-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{mission.title}</h3>
                <p className="text-gray-600 leading-relaxed">{mission.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  Excellence et Innovation depuis plus de 50 ans
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Recherche de Pointe</h4>
                      <p className="text-gray-600">Développement de variétés améliorées et techniques agricoles innovantes</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Partenariats Internationaux</h4>
                      <p className="text-gray-600">Collaboration avec des institutions de recherche mondiales</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Impact Durable</h4>
                      <p className="text-gray-600">Amélioration de la sécurité alimentaire et des revenus agricoles</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <img
                  src="/438841574_751862543798680_3458349495517208121_n-1.jpg"
                  alt="CRA Saint-Louis"
                  className="rounded-2xl shadow-2xl w-full h-80 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fonctionnalites" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" style={{
              fontFamily: "'Georgia', 'Times New Roman', serif"
            }}>
              Fonctionnalités de la Plateforme
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Des outils modernes pour faciliter la recherche agricole et la collaboration scientifique
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all h-full border border-gray-100 hover:border-green-200">
                  <div className="bg-gradient-to-br from-green-100 to-green-200 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-8 h-8 text-green-700" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Galerie Section */}
      <section id="galerie" className="py-24 bg-gradient-to-br from-green-50 to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" style={{
              fontFamily: "'Georgia', 'Times New Roman', serif"
            }}>
              Nos Activités en Images
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez le travail de nos chercheurs et les résultats de nos recherches
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative group overflow-hidden rounded-2xl shadow-xl">
              <img
                src="/photo_2025-01-20_08-37-40.jpg"
                alt="Recherche au CRA"
                className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                <div className="text-white">
                  <h3 className="text-2xl font-bold mb-2">Travaux de Recherche</h3>
                  <p className="text-gray-200">Innovation et développement agricole</p>
                </div>
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-2xl shadow-xl">
              <img
                src="/WhatsApp-Image-2025-07-02-a-15.59.09_f5945a10.jpg"
                alt="Équipe du CRA"
                className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                <div className="text-white">
                  <h3 className="text-2xl font-bold mb-2">Nos Équipes</h3>
                  <p className="text-gray-200">Des chercheurs dévoués et passionnés</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-green-600 via-green-700 to-green-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" style={{
            fontFamily: "'Georgia', 'Times New Roman', serif"
          }}>
            Prêt à rejoindre la plateforme ?
          </h2>
          <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto">
            Découvrez comment notre plateforme peut transformer votre approche de la recherche agricole
          </p>
          <Link
            to="/login"
            className="inline-flex items-center bg-white text-green-700 px-10 py-5 rounded-xl hover:bg-gray-50 transition-all font-bold text-lg shadow-2xl group"
          >
            Accéder à la Plateforme
            <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center">
                  <Leaf className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">CRA Platform</h3>
                  <p className="text-gray-400 text-sm">Saint-Louis, Sénégal</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
                Plateforme collaborative dédiée à l'avancement de la recherche agricole et à l'innovation
                scientifique au Centre de Recherches Agricoles de Saint-Louis.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="bg-gray-800 p-3 rounded-lg hover:bg-green-600 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="bg-gray-800 p-3 rounded-lg hover:bg-green-600 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="bg-gray-800 p-3 rounded-lg hover:bg-green-600 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-6">Liens Rapides</h4>
              <ul className="space-y-3">
                <li><a href="#accueil" className="text-gray-400 hover:text-green-400 transition-colors">Accueil</a></li>
                <li><a href="#apropos" className="text-gray-400 hover:text-green-400 transition-colors">À Propos</a></li>
                <li><a href="#fonctionnalites" className="text-gray-400 hover:text-green-400 transition-colors">Fonctionnalités</a></li>
                <li><a href="#galerie" className="text-gray-400 hover:text-green-400 transition-colors">Galerie</a></li>
                <li><Link to="/login" className="text-gray-400 hover:text-green-400 transition-colors">Se connecter</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-bold mb-6">Contact</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-400">Saint-Louis, Sénégal</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-400">+221 33 XXX XX XX</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-400">contact@cra-platform.sn</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 CRA Platform. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
