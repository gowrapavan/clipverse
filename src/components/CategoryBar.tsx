import React from 'react';
import type { Category } from '../types';

interface CategoryBarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function CategoryBar({ categories, selectedCategory, onSelectCategory }: CategoryBarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300
                     ${selectedCategory === category.id
                       ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/25'
                       : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
          style={{
            borderImage: selectedCategory === category.id
              ? `linear-gradient(to right, ${category.color}, ${category.color}00) 1`
              : 'none'
          }}
        >
          {category.title}
        </button>
      ))}
    </div>
  );
}