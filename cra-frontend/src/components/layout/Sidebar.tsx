// src/components/layout/Sidebar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

export interface SidebarItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  children?: Omit<SidebarItem, 'children'>[];
  color?: string; // Couleur personnalisée pour l'icône
}

interface SidebarProps {
  navigation: SidebarItem[];
  isOpen: boolean;
  onClose?: () => void;
}

// Palette de couleurs pour les icônes
const iconColors: { [key: string]: { bg: string; icon: string; activeBg: string; activeIcon: string } } = {
  'Tableau de bord': {
    bg: 'bg-gradient-to-br from-blue-100 to-blue-200',
    icon: 'text-blue-600',
    activeBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
    activeIcon: 'text-white'
  },
  'Mon Profil': {
    bg: 'bg-gradient-to-br from-purple-100 to-purple-200',
    icon: 'text-purple-600',
    activeBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
    activeIcon: 'text-white'
  },
  'Mes projets': {
    bg: 'bg-gradient-to-br from-green-100 to-green-200',
    icon: 'text-green-600',
    activeBg: 'bg-gradient-to-br from-green-500 to-green-600',
    activeIcon: 'text-white'
  },
  'Tous les projets': {
    bg: 'bg-gradient-to-br from-green-100 to-green-200',
    icon: 'text-green-600',
    activeBg: 'bg-gradient-to-br from-green-500 to-green-600',
    activeIcon: 'text-white'
  },
  'Activités': {
    bg: 'bg-gradient-to-br from-orange-100 to-orange-200',
    icon: 'text-orange-600',
    activeBg: 'bg-gradient-to-br from-orange-500 to-orange-600',
    activeIcon: 'text-white'
  },
  'Documents': {
    bg: 'bg-gradient-to-br from-cyan-100 to-cyan-200',
    icon: 'text-cyan-600',
    activeBg: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
    activeIcon: 'text-white'
  },
  'Formulaires': {
    bg: 'bg-gradient-to-br from-pink-100 to-pink-200',
    icon: 'text-pink-600',
    activeBg: 'bg-gradient-to-br from-pink-500 to-pink-600',
    activeIcon: 'text-white'
  },
  'Publications & Transferts': {
    bg: 'bg-gradient-to-br from-indigo-100 to-indigo-200',
    icon: 'text-indigo-600',
    activeBg: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    activeIcon: 'text-white'
  },
  'Calendrier': {
    bg: 'bg-gradient-to-br from-red-100 to-red-200',
    icon: 'text-red-600',
    activeBg: 'bg-gradient-to-br from-red-500 to-red-600',
    activeIcon: 'text-white'
  },
  'Formations': {
    bg: 'bg-gradient-to-br from-yellow-100 to-yellow-200',
    icon: 'text-yellow-600',
    activeBg: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
    activeIcon: 'text-white'
  },
  'Rapports': {
    bg: 'bg-gradient-to-br from-teal-100 to-teal-200',
    icon: 'text-teal-600',
    activeBg: 'bg-gradient-to-br from-teal-500 to-teal-600',
    activeIcon: 'text-white'
  },
  // Menu Admin
  'Gestion des utilisateurs': {
    bg: 'bg-gradient-to-br from-violet-100 to-violet-200',
    icon: 'text-violet-600',
    activeBg: 'bg-gradient-to-br from-violet-500 to-violet-600',
    activeIcon: 'text-white'
  },
  'Planification stratégique': {
    bg: 'bg-gradient-to-br from-emerald-100 to-emerald-200',
    icon: 'text-emerald-600',
    activeBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    activeIcon: 'text-white'
  },
  'Projets': {
    bg: 'bg-gradient-to-br from-green-100 to-green-200',
    icon: 'text-green-600',
    activeBg: 'bg-gradient-to-br from-green-500 to-green-600',
    activeIcon: 'text-white'
  },
  'Partenaires': {
    bg: 'bg-gradient-to-br from-blue-100 to-blue-200',
    icon: 'text-blue-600',
    activeBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
    activeIcon: 'text-white'
  },
  'Conventions': {
    bg: 'bg-gradient-to-br from-amber-100 to-amber-200',
    icon: 'text-amber-600',
    activeBg: 'bg-gradient-to-br from-amber-500 to-amber-600',
    activeIcon: 'text-white'
  },
  'Gestion des documents': {
    bg: 'bg-gradient-to-br from-sky-100 to-sky-200',
    icon: 'text-sky-600',
    activeBg: 'bg-gradient-to-br from-sky-500 to-sky-600',
    activeIcon: 'text-white'
  },
  'Sécurité': {
    bg: 'bg-gradient-to-br from-red-100 to-red-200',
    icon: 'text-red-600',
    activeBg: 'bg-gradient-to-br from-red-500 to-red-600',
    activeIcon: 'text-white'
  },
  'Configuration système': {
    bg: 'bg-gradient-to-br from-slate-100 to-slate-200',
    icon: 'text-slate-600',
    activeBg: 'bg-gradient-to-br from-slate-500 to-slate-600',
    activeIcon: 'text-white'
  },
  'Journal d\'audit': {
    bg: 'bg-gradient-to-br from-lime-100 to-lime-200',
    icon: 'text-lime-600',
    activeBg: 'bg-gradient-to-br from-lime-500 to-lime-600',
    activeIcon: 'text-white'
  },
  'Publications': {
    bg: 'bg-gradient-to-br from-indigo-100 to-indigo-200',
    icon: 'text-indigo-600',
    activeBg: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    activeIcon: 'text-white'
  },
  'Transferts de connaissances': {
    bg: 'bg-gradient-to-br from-fuchsia-100 to-fuchsia-200',
    icon: 'text-fuchsia-600',
    activeBg: 'bg-gradient-to-br from-fuchsia-500 to-fuchsia-600',
    activeIcon: 'text-white'
  },
  'default': {
    bg: 'bg-gradient-to-br from-gray-100 to-gray-200',
    icon: 'text-gray-600',
    activeBg: 'bg-gradient-to-br from-gray-500 to-gray-600',
    activeIcon: 'text-white'
  }
};

export const Sidebar: React.FC<SidebarProps> = ({ navigation, isOpen, onClose }) => {
  const location = useLocation();

  const isActiveRoute = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const getIconColors = (itemName: string) => {
    return iconColors[itemName] || iconColors['default'];
  };

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-xl',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
            <div className="flex items-center">
              <div className="relative">
                <img
                  src="/isra.png"
                  alt="CRA Saint-Louis Logo"
                  className="w-16 h-16 rounded-2xl object-cover shadow-lg ring-2 ring-green-200"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="ml-3">
                <h2 className="text-lg font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">ISRA</h2>
                <p className="text-xs text-gray-600 font-medium">CRA Saint-Louis</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
            {navigation.map((item) => {
              const colors = getIconColors(item.name);
              const isActive = isActiveRoute(item.href);

              return (
                <div key={item.name}>
                  <Link
                    to={item.href}
                    className={clsx(
                      'flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 group',
                      isActive
                        ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100/80 hover:shadow-sm'
                    )}
                  >
                    {/* Icône avec badge coloré */}
                    <div className={clsx(
                      'flex items-center justify-center w-10 h-10 rounded-xl mr-3 transition-all duration-200',
                      isActive ? colors.activeBg : colors.bg,
                      'group-hover:scale-110 shadow-sm'
                    )}>
                      <item.icon
                        className={clsx(
                          'w-5 h-5 transition-all duration-200',
                          isActive ? colors.activeIcon : colors.icon
                        )}
                      />
                    </div>

                    <span className="flex-1">{item.name}</span>

                    {item.badge && (
                      <span className="ml-auto bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-2.5 py-1 rounded-full font-semibold shadow-sm">
                        {item.badge}
                      </span>
                    )}
                  </Link>

                  {/* Sous-navigation */}
                  {item.children && isActiveRoute(item.href) && (
                    <div className="ml-6 mt-1.5 space-y-1 pl-8 border-l-2 border-green-200">
                      {item.children.map((child) => {
                        const childColors = getIconColors(child.name);
                        const isChildActive = isActiveRoute(child.href);

                        return (
                          <Link
                            key={child.name}
                            to={child.href}
                            className={clsx(
                              'flex items-center px-3 py-2.5 text-sm rounded-lg transition-all duration-200 group',
                              isChildActive
                                ? 'bg-green-50 text-green-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            )}
                          >
                            <div className={clsx(
                              'flex items-center justify-center w-7 h-7 rounded-lg mr-2.5 transition-all duration-200',
                              isChildActive ? childColors.activeBg : childColors.bg,
                              'group-hover:scale-110'
                            )}>
                              <child.icon
                                className={clsx(
                                  'w-4 h-4',
                                  isChildActive ? childColors.activeIcon : childColors.icon
                                )}
                              />
                            </div>
                            <span className="flex-1">{child.name}</span>
                            {child.badge && (
                              <span className="ml-auto bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                {child.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Footer du sidebar */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="text-xs text-center text-gray-500">
              <p className="font-medium">Version 1.0.0</p>
              <p className="mt-1">© 2024 ISRA</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
