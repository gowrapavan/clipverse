import React, { useState } from 'react';
import { Menu, Search, Info } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { SearchBar } from './SearchBar';

interface HeaderProps {
  onSearch: (query: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-md z-50 border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <Link to="/" className="text-2xl font-bold font-serif italic bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent hover:scale-105 transition-transform">
              Clipverse
            </Link>
          </div>
          
          <div className="flex items-center gap-4 flex-1 max-w-3xl">
            {/* Desktop Search */}
            <div className="hidden md:block flex-1">
              <SearchBar onSearch={onSearch} />
            </div>

            {/* About Button */}
            <Link
              to="/about"
              className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                location.pathname === '/about'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400'
                  : 'hover:bg-white/10'
              }`}
            >
              <span>About</span>
              <Info size={20} />
            </Link>

            {/* Mobile About Icon */}
            <Link
              to="/about"
              className={`md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors ${
                location.pathname === '/about' ? 'text-cyan-400' : 'text-white'
              }`}
            >
              <Info size={24} />
            </Link>

            {/* Mobile Search Icon */}
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="md:hidden p-2 hover:bg-white/10 rounded-lg"
            >
              <Search size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showMobileSearch && (
          <div className="md:hidden py-3 px-2">
            <SearchBar onSearch={onSearch} autoFocus />
          </div>
        )}
      </div>
    </header>
  );
}