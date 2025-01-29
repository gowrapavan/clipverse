import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Menu } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { CategoryBar } from '../components/CategoryBar';
import { VideoCard } from '../components/VideoCard';
import { getVideoCategories, getTrendingVideos, searchVideos } from '../lib/youtube';
import type { Video, Category } from '../types';

export function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('0');
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const observer = useRef<IntersectionObserver>();

  const lastVideoElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreVideos();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const loadMoreVideos = async () => {
    if (!hasMore || loading) return;
    setLoading(true);
    try {
      const result = await getTrendingVideos(selectedCategory, nextPageToken);
      setVideos(prev => [...prev, ...result.items]);
      setNextPageToken(result.nextPageToken);
      setHasMore(!!result.nextPageToken);
    } catch (err) {
      setError('Failed to load more videos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialSearchQuery = searchParams.get('search');
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
      handleSearch(initialSearchQuery);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function fetchInitialData() {
      try {
        const [categoriesData, videosData] = await Promise.all([
          getVideoCategories(),
          !searchQuery ? getTrendingVideos(selectedCategory) : searchVideos(searchQuery, selectedCategory),
        ]);
        
        if (!mounted) return;
        
        setCategories([{ id: '0', title: 'All', color: '#6b7280' }, ...categoriesData]);
        setVideos(videosData.items);
        setNextPageToken(videosData.nextPageToken);
        setHasMore(!!videosData.nextPageToken);
        setError(null);
      } catch (err) {
        if (!mounted) return;
        setError('Failed to load content. Please try again later.');
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialLoading(false);
        }
      }
    }

    fetchInitialData();

    // Refresh videos every 5 minutes
    const interval = setInterval(fetchInitialData, 5 * 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [selectedCategory]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setLoading(true);
    try {
      const result = await searchVideos(query, selectedCategory);
      setVideos(result.items);
      setNextPageToken(result.nextPageToken);
      setHasMore(!!result.nextPageToken);
      setError(null);
      // Update URL with search query
      navigate(`/?search=${encodeURIComponent(query)}`, { replace: true });
    } catch (err) {
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSearchQuery('');
    setVideos([]);
    setNextPageToken(undefined);
    setHasMore(true);
    setShowMobileMenu(false);
    // Clear search query from URL when changing category
    navigate('/', { replace: true });
  };

  const handleVideoSelect = (video: Video) => {
    navigate(`/watch?v=${video.id}`);
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-cyan-400 animate-pulse">Loading Clipverse contents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header onSearch={handleSearch} />

      {/* Mobile Category Menu */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden">
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-[#0a0a0a] border-r border-white/10 p-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Categories</h2>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                ×
              </button>
            </div>
            <div className="space-y-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400'
                      : 'hover:bg-white/5'
                  }`}
                >
                  {category.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24">
        {/* Desktop Categories */}
        <div className="hidden lg:block mb-8 sticky top-16 bg-[#0a0a0a]/95 backdrop-blur-md z-40 py-4">
          <CategoryBar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-400 text-center mb-8 p-4 bg-red-950/20 rounded-lg">
            {error}
          </div>
        )}

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video, index) => (
            <div
              key={`${video.id}-${index}`}
              ref={index === videos.length - 1 ? lastVideoElementRef : undefined}
            >
              <VideoCard
                video={video}
                onClick={() => handleVideoSelect(video)}
              />
            </div>
          ))}
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center my-8">
            <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </main>
    </div>
  );
}