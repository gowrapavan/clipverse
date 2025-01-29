import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  autoFocus?: boolean;
}

export function SearchBar({ onSearch, autoFocus = false }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full relative group">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus={autoFocus}
          className="w-full h-10 bg-black/20 backdrop-blur-xl border border-cyan-500/30 rounded-lg px-4 pr-10
                   text-white placeholder-cyan-300/50 focus:outline-none focus:border-cyan-400
                   transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]
                   focus:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          placeholder="Search for videos..."
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg
                   bg-gradient-to-r from-cyan-500 to-purple-500 text-white
                   hover:from-cyan-400 hover:to-purple-400 transition-all duration-300"
          disabled={!query.trim()}
        >
          <Search size={16} />
        </button>
      </div>
    </form>
  );
}