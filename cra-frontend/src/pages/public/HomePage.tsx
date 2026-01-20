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
      <nav className="bg-white/95 backdrop-blur-md shadow-sm fixed w-full top-0 z-50" style={{
        fontFamily: "'Georgia', 'Times New Roman', serif"
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img
                src="/isra.png"
                alt="ISRA Logo"
                className="w-12 h-12 rounded-xl shadow-lg object-contain"
              />
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
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-600/20 backdrop-blur-sm border border-green-400/30 text-green-300 text-sm font-semibold mb-8 animate-fade-in-down" style={{
              fontFamily: "'Georgia', 'Times New Roman', serif"
            }}>
              <img
                src="/isra.png"
                alt="ISRA Logo"
                className="w-5 h-5 mr-2 object-contain animate-pulse-slow"
              />
              Centre de Recherches Agricoles
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight animate-fade-in-up" style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              textShadow: '0 4px 30px rgba(0,0,0,0.5)',
              animation: 'fadeInUp 0.8s ease-out'
            }}>
              Innovation et Excellence en Recherche Agricole
            </h1>

            <p className="text-xl md:text-2xl text-gray-200 mb-10 leading-relaxed animate-fade-in-up" style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              textShadow: '0 2px 20px rgba(0,0,0,0.5)',
              animation: 'fadeInUp 1s ease-out'
            }}>
              Plateforme collaborative dédiée à l'avancement de la recherche agricole et à la sécurité alimentaire dans la vallée du fleuve Sénégal
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              animation: 'fadeInUp 1.2s ease-out'
            }}>
              <Link
                to="/login"
                className="inline-flex items-center justify-center bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-xl hover:from-green-700 hover:to-green-800 hover:scale-105 transition-all shadow-xl font-semibold text-lg group"
              >
                Accéder à la Plateforme
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#apropos"
                className="inline-flex items-center justify-center border-2 border-white/80 text-white px-8 py-4 rounded-xl hover:bg-white/10 hover:scale-105 backdrop-blur-sm transition-all font-semibold text-lg"
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

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-down {
          animation: fadeInDown 0.6s ease-out;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out;
        }

        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>

      {/* Histoire et Présentation du CRA */}
      <section className="py-20 bg-gradient-to-br from-white via-green-50/30 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Histoire du CRA */}
          <div className="mb-20 opacity-0 translate-y-10 animate-slide-up">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" style={{
                fontFamily: "'Georgia', 'Times New Roman', serif"
              }}>
                Le Centre de Recherches Agricoles de Saint-Louis
              </h2>
            </div>
            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-green-100" style={{
              fontFamily: "'Georgia', 'Times New Roman', serif"
            }}>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                L'un des plus grands centres de l'ISRA a été créé en <span className="font-bold text-green-700">1972 à Richard Toll</span>, puis transféré à <span className="font-bold text-green-700">Saint-Louis en 1984</span>. Il couvre la région agro écologique de la vallée du fleuve Sénégal (VFS) qui s'étend sur les régions administratives de Saint-Louis, Matam et le département de Bakel (Région de Tambacounda).
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Cette région agro écologique est l'une des zones agricoles les plus importantes du pays. Elle possède d'importantes potentialités en agriculture, élevage, pêche, de foresterie et de l'agroforesterie. Ce qui justifie son rôle de premier plan dans la <span className="font-semibold text-green-700">politique nationale de développement économique et social</span>.
              </p>
            </div>
          </div>

          {/* Missions du Centre */}
          <div className="mb-20 opacity-0 translate-y-10 animate-slide-up-delay-1">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" style={{
                fontFamily: "'Georgia', 'Times New Roman', serif"
              }}>
                Missions du Centre
              </h2>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-3xl shadow-2xl p-8 md:p-12 text-gray-800" style={{
              fontFamily: "'Georgia', 'Times New Roman', serif"
            }}>
              <p className="text-lg leading-relaxed mb-8">
                Il a pour mission de participer au développement socio-économique en générant des technologies et des connaissances, ainsi qu'en élaborant des innovations techniques visant à améliorer le bien-être des populations rurales en augmentant leurs revenus.
              </p>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-green-300">
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Programme: Systèmes de production et gestion des ressources naturelles dans la VFS</h3>
                <p className="text-gray-700 mb-6">Structuré autour de cinq thématiques :</p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="w-6 h-6 mr-3 mt-1 flex-shrink-0 text-green-600" />
                    <span className="text-gray-800">Intensification de la riziculture</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-6 h-6 mr-3 mt-1 flex-shrink-0 text-green-600" />
                    <span className="text-gray-800">Diversification des cultures</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-6 h-6 mr-3 mt-1 flex-shrink-0 text-green-600" />
                    <span className="text-gray-800">Amélioration des systèmes de production</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-6 h-6 mr-3 mt-1 flex-shrink-0 text-green-600" />
                    <span className="text-gray-800">Environnement institutionnel et dynamique des filières</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-6 h-6 mr-3 mt-1 flex-shrink-0 text-green-600" />
                    <span className="text-gray-800">Gestion durable des ressources et des espaces ruraux</span>
                  </li>
                </ul>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Cette initiative vise à intensifier la riziculture, diversifier les cultures et améliorer les systèmes de production tout en assurant une gestion durable des ressources. Elle contribue également à éclairer les décisions dans les secteurs public et privé. L'organisation dispose de <span className="font-bold text-gray-900">quatre stations d'expérimentation</span> pour soutenir ses activités.
              </p>
            </div>
          </div>

          {/* Nos Missions au CRA */}
          <div className="mb-20 opacity-0 translate-y-10 animate-slide-up-delay-2">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" style={{
                fontFamily: "'Georgia', 'Times New Roman', serif"
              }}>
                Nos Missions au CRA
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8" style={{
              fontFamily: "'Georgia', 'Times New Roman', serif"
            }}>
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all hover:-translate-y-2 border border-green-100">
                <div className="bg-gradient-to-br from-green-100 to-green-200 w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto">
                  <Microscope className="w-8 h-8 text-green-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Intensification de la riziculture</h3>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all hover:-translate-y-2 border border-green-100">
                <div className="bg-gradient-to-br from-green-100 to-green-200 w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto">
                  <Leaf className="w-8 h-8 text-green-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Diversification des cultures et systèmes de production</h3>
                <p className="text-gray-600 text-center">Dans une dynamique de gestion durable des ressources</p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all hover:-translate-y-2 border border-green-100">
                <div className="bg-gradient-to-br from-green-100 to-green-200 w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto">
                  <BarChart3 className="w-8 h-8 text-green-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Contribution à l'éclairage des décisions</h3>
                <p className="text-gray-600 text-center">Du secteur public et privé</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slideUp 0.8s ease-out forwards;
        }

        .animate-slide-up-delay-1 {
          animation: slideUp 0.8s ease-out 0.2s forwards;
        }

        .animate-slide-up-delay-2 {
          animation: slideUp 0.8s ease-out 0.4s forwards;
        }

        .animate-slide-up-delay-3 {
          animation: slideUp 0.8s ease-out 0.6s forwards;
        }

        .animate-slide-up-delay-4 {
          animation: slideUp 0.8s ease-out 0.8s forwards;
        }
      `}</style>

      {/* À Propos Section */}
      <section id="apropos" className="py-24 bg-gradient-to-br from-gray-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" style={{
              fontFamily: "'Georgia', 'Times New Roman', serif"
            }}>
              À Propos du CRA de Saint-Louis
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto" style={{
              fontFamily: "'Georgia', 'Times New Roman', serif"
            }}>
              Une institution de référence dans la recherche agricole et le développement rural
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16" style={{
            fontFamily: "'Georgia', 'Times New Roman', serif"
          }}>
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

          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12" style={{
            fontFamily: "'Georgia', 'Times New Roman', serif"
          }}>
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
                  src="/cra-saint-louis-LOGO50-copie-scaled.jpg"
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
            <p className="text-xl text-gray-600 max-w-3xl mx-auto" style={{
              fontFamily: "'Georgia', 'Times New Roman', serif"
            }}>
              Des outils modernes pour faciliter la recherche agricole et la collaboration scientifique
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" style={{
            fontFamily: "'Georgia', 'Times New Roman', serif"
          }}>
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
            <p className="text-xl text-gray-600 max-w-3xl mx-auto" style={{
              fontFamily: "'Georgia', 'Times New Roman', serif"
            }}>
              Découvrez le travail de nos chercheurs et les résultats de nos recherches
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8" style={{
            fontFamily: "'Georgia', 'Times New Roman', serif"
          }}>
            <a
              href="https://israsaintlouis.sn/2-columns/"
              target="_blank"
              rel="noopener noreferrer"
              className="relative group overflow-hidden rounded-2xl shadow-xl block cursor-pointer"
            >
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
            </a>

            <a
              href="https://israsaintlouis.sn/equipe/"
              target="_blank"
              rel="noopener noreferrer"
              className="relative group overflow-hidden rounded-2xl shadow-xl block cursor-pointer"
            >
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
            </a>
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
          <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto" style={{
            fontFamily: "'Georgia', 'Times New Roman', serif"
          }}>
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
      <footer id="contact" className="bg-gray-900 text-white py-16" style={{
        fontFamily: "'Georgia', 'Times New Roman', serif"
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <img
                  src="/isra.png"
                  alt="ISRA Logo"
                  className="w-12 h-12 rounded-xl object-contain"
                />
                <div>
                  <h3 className="text-2xl font-bold">CRA Plateforme</h3>
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
                  <span className="text-gray-400">+221 33 96138321 </span>
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
              © 2026 CRA Plateforme. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
