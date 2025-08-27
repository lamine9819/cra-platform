// src/utils/cn.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine et fusionne les classes CSS intelligemment
 * - Utilise clsx pour la logique conditionnelle des classes
 * - Utilise tailwind-merge pour résoudre les conflits Tailwind
 * 
 * @param inputs - Classes CSS ou conditions
 * @returns String de classes CSS optimisée
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Exemples d'utilisation :
/*
// Classes simples
cn('px-4 py-2', 'bg-blue-500')
// → "px-4 py-2 bg-blue-500"

// Classes conditionnelles
cn('px-4 py-2', {
  'bg-blue-500': true,
  'text-white': isActive,
  'opacity-50': isDisabled
})

// Résolution de conflits Tailwind
cn('px-4 px-6') // → "px-6" (garde seulement la dernière)
cn('text-blue-500 text-red-500') // → "text-red-500"

// Avec variables
cn(
  'base-class',
  variant === 'primary' && 'bg-blue-500',
  size === 'large' && 'text-lg',
  className // prop className externe
)
*/