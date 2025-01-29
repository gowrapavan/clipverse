import React, { useEffect, useState } from 'react';
import { VideoPlayer } from '../components/VideoPlayer';
import { Header } from '../components/Header';
import { getVideoById } from '../lib/youtube';
import type { Video } from '../types';

export function Watch() {
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadVideo() {
      const videoId = new URLSearchParams(window.location.search).get('v');
      if (!videoId) {
        setError('No video ID provided');
        setLoading(false);
        return;
      }

      try {
        const videoData = await getVideoById(videoId);
        setVideo(videoData);
      } catch (err) {
        setError('Failed to load video');
      } finally {
        setLoading(false);
      }
    }

    loadVideo();
  }, []);

  const handleSearch = (query: string) => {
    window.location.href = `/?search=${encodeURIComponent(query)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-cyan-400 animate-pulse">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-red-400 text-center p-4 bg-red-950/20 rounded-lg">
          {error || 'Video not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header onSearch={handleSearch} />
      <div className="pt-16">
        <VideoPlayer video={video} />
      </div>
    </div>
  );
}