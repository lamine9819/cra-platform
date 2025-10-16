import React, { useState, useEffect } from 'react';
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
  Play,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Star
} from 'lucide-react';

const HomePage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const heroSlides = [
    {
      title: "Centre de Recherches Agricoles",
      subtitle: "Innovation et Excellence en Recherche Agricole",
      description: "Plateforme collaborative dédiée à l'avancement de la recherche agricole au Sénégal",
      cta: "Découvrir la plateforme"
    },
    {
      title: "Collaboration Scientifique",
      subtitle: "Connecter les Chercheurs et Techniciens",
      description: "Un espace de travail unifié pour partager données, documents et connaissances",
      cta: "Rejoindre la communauté"
    },
    {
      title: "Innovation Technologique",
      subtitle: "Outils Modernes pour la Recherche",
      description: "Formulaires dynamiques, gestion de données et suivi de projets intégrés",
      cta: "Explorer les outils"
    }
  ];

  const features = [
    {
      icon: Users,
      title: "Collaboration",
      description: "Travaillez ensemble sur des projets de recherche avec des outils de partage avancés"
    },
    {
      icon: Database,
      title: "Gestion de Données",
      description: "Centralisez et analysez vos données scientifiques avec des outils puissants"
    },
    {
      icon: FileText,
      title: "Documentation",
      description: "Organisez et partagez vos documents, rapports et publications scientifiques"
    },
    {
      icon: Calendar,
      title: "Séminaires",
      description: "Planifiez et gérez des événements scientifiques, conférences et formations"
    },
    {
      icon: BarChart3,
      title: "Suivi de Projets",
      description: "Suivez l'avancement de vos projets avec des tableaux de bord détaillés"
    },
    {
      icon: Shield,
      title: "Sécurité",
      description: "Plateforme sécurisée avec gestion des droits d'accès et authentification"
    }
  ];

  const stats = [
    { number: "150+", label: "Chercheurs Actifs", icon: Users },
    { number: "50+", label: "Projets en Cours", icon: Microscope },
    { number: "1000+", label: "Documents Partagés", icon: FileText },
    { number: "50+", label: "Années d'Excellence", icon: Award }
  ];

  const testimonials = [
    {
      name: "Dr. Aminata Sow",
      role: "Directrice de Recherche",
      content: "Cette plateforme a révolutionné notre façon de collaborer. L'accès aux données et la coordination des projets sont désormais simplifiés.",
      rating: 5
    },
    {
      name: "Mamadou Fall",
      role: "Coordonateur de Projet",
      content: "Les formulaires de collecte de données sont intuitifs et me permettent de coordonner efficacement les équipes même sur le terrain.",
      rating: 5
    },
    {
      name: "Prof. Ousmane Diallo",
      role: "Chercheur Principal",
      content: "Un outil indispensable pour la recherche moderne. La gestion documentaire et le suivi des projets sont excellents.",
      rating: 5
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CRA Platform</h1>
                <p className="text-xs text-gray-500">Saint-Louis</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#accueil" className="text-green-600 hover:text-green-700 font-medium">Accueil</a>
              <a href="#fonctionnalites" className="text-gray-700 hover:text-green-600 transition-colors">Fonctionnalités</a>
              <a href="#apropos" className="text-gray-700 hover:text-green-600 transition-colors">À Propos</a>
              <a href="#temoignages" className="text-gray-700 hover:text-green-600 transition-colors">Témoignages</a>
              <a href="#contact" className="text-gray-700 hover:text-green-600 transition-colors">Contact</a>
            </div>

            {/* CTA Button */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">
                Se Connecter
              </Link>
              <Link to="/login" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Commencer
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-green-600"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <a href="#accueil" className="block px-3 py-2 text-green-600 font-medium">Accueil</a>
                <a href="#fonctionnalites" className="block px-3 py-2 text-gray-700 hover:text-green-600">Fonctionnalités</a>
                <a href="#apropos" className="block px-3 py-2 text-gray-700 hover:text-green-600">À Propos</a>
                <a href="#temoignages" className="block px-3 py-2 text-gray-700 hover:text-green-600">Témoignages</a>
                <a href="#contact" className="block px-3 py-2 text-gray-700 hover:text-green-600">Contact</a>
                <div className="pt-2 border-t border-gray-200">
                  <Link to="/login" className="block w-full text-left px-3 py-2 text-green-600 font-medium">Se Connecter</Link>
                  <Link to="/login" className="block w-full text-left px-3 py-2 bg-green-600 text-white rounded-lg mt-2">Commencer</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="accueil" className="pt-16 bg-gradient-to-br from-green-50 to-blue-50 min-h-screen flex items-center relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-6">
                <Leaf className="w-4 h-4 mr-2" />
                Nouvelle plateforme numérique
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                {heroSlides[activeSlide].title}
              </h1>
              <h2 className="text-xl md:text-2xl text-green-600 mb-6 font-semibold">
                {heroSlides[activeSlide].subtitle}
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl">
                {heroSlides[activeSlide].description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/login" className="bg-green-600 text-white px-8 py-4 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center group">
                  {heroSlides[activeSlide].cta}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-xl hover:bg-green-50 transition-colors flex items-center justify-center">
                  <Play className="mr-2 w-5 h-5" />
                  Voir la Démo
                </button>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="w-full h-64 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Globe className="w-20 h-20 text-green-600 mx-auto mb-4" />
                    <p className="text-green-700 font-semibold">Plateforme CRA</p>
                  </div>
                </div>
                <div className="absolute -top-4 -left-4 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                  Nouveau !
                </div>
              </div>
              {/* Floating Elements */}
              <div className="absolute top-10 -right-10 bg-white rounded-full p-4 shadow-lg animate-bounce">
                <Microscope className="w-8 h-8 text-green-600" />
              </div>
              <div className="absolute bottom-10 -left-10 bg-white rounded-full p-4 shadow-lg animate-pulse">
                <Leaf className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === activeSlide ? 'bg-green-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                  <stat.icon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fonctionnalites" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Fonctionnalités de la Plateforme
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Des outils modernes et intuitifs pour faciliter la recherche agricole et la collaboration scientifique
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow group">
                <div className="bg-green-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors">
                  <feature.icon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                <div className="mt-6">
                  <Link to="/login" className="text-green-600 hover:text-green-700 font-medium flex items-center group">
                    En savoir plus
                    <ChevronRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="apropos" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                À Propos du CRA de Saint-Louis
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Le Centre de Recherches Agricoles de Saint-Louis est une structure de l'ISRA 
                qui contribue à l'amélioration de la productivité agricole, à la sécurité alimentaire 
                et à la résilience des systèmes de production dans la vallée du fleuve Sénégal.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Innovation Continue</h4>
                    <p className="text-gray-600">Développement de nouvelles variétés et techniques agricoles</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Collaboration Internationale</h4>
                    <p className="text-gray-600">Partenariats avec des institutions de recherche mondiales</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Impact Durable</h4>
                    <p className="text-gray-600">Amélioration de la sécurité alimentaire et des revenus agricoles</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-80 bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl shadow-2xl flex items-center justify-center">
                <div className="text-center">
                  <BookOpen className="w-24 h-24 text-green-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-green-700 mb-2">Recherche Agricole</h3>
                  <p className="text-green-600">Excellence & Innovation</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-green-600 opacity-10 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="temoignages" className="py-20 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ce que disent nos utilisateurs
            </h2>
            <p className="text-xl text-gray-600">
              Témoignages de chercheurs, techniciens et cadres qui utilisent notre plateforme
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-semibold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à rejoindre la communauté ?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Découvrez comment notre plateforme peut transformer votre approche de la recherche agricole
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login" className="bg-white text-green-600 px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors font-semibold">
              Demander une Démo
            </Link>
            <button className="border-2 border-white text-white px-8 py-4 rounded-xl hover:bg-white hover:text-green-600 transition-colors font-semibold">
              Contacter l'Équipe
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">CRA Platform</h3>
                  <p className="text-gray-400 text-sm">Saint-Louis</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Plateforme collaborative dédiée à l'avancement de la recherche agricole et à l'innovation 
                scientifique au Centre de Recherches Agricoles de Saint-Louis.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="w-6 h-6" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Liens Rapides</h4>
              <ul className="space-y-3">
                <li><a href="#accueil" className="text-gray-400 hover:text-white transition-colors">Accueil</a></li>
                <li><a href="#fonctionnalites" className="text-gray-400 hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#apropos" className="text-gray-400 hover:text-white transition-colors">À Propos</a></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors">Se connecter</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Contact</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <span className="text-gray-400">Saint-Louis, Sénégal</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-green-600" />
                  <span className="text-gray-400">+221 33 XXX XX XX</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-green-600" />
                  <span className="text-gray-400">contact@cra-platform.sn</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 CRA Platform. Tous droits réservés. Développé avec passion pour la recherche agricole.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;