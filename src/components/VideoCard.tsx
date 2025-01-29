import React from 'react';
import { Play, Clock, Calendar, ThumbsUp } from 'lucide-react';
import type { Video } from '../types';

interface VideoCardProps {
  video: Video;
  onClick: (video: Video) => void;
  compact?: boolean;
}

export function VideoCard({ video, onClick, compact = false }: VideoCardProps) {
  const cardClass = compact
    ? "flex gap-4 group cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-all duration-300"
    : "group relative overflow-hidden rounded-xl bg-black/20 backdrop-blur-sm border border-white/10 cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:border-cyan-500/50";

  const imageClass = compact
    ? "w-40 aspect-video rounded-lg overflow-hidden"
    : "aspect-video relative overflow-hidden";

  return (
    <div onClick={() => onClick(video)} className={cardClass}>
      <div className={imageClass}>
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-md">
          {video.duration}
        </div>
      </div>
      <div className={compact ? "flex-1" : "p-4"}>
        <h3 className={`font-semibold ${compact ? 'text-sm line-clamp-2' : 'text-lg mb-2'}`}>
          {video.title}
        </h3>
        <p className="text-sm text-cyan-300">{video.channelTitle}</p>
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-white/70">
          <span className="flex items-center gap-1">
            <Play size={12} />
            {video.viewCount} views
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {video.publishedAt}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {video.duration}
          </span>
          {video.likeCount && (
            <span className="flex items-center gap-1">
              <ThumbsUp size={12} />
              {video.likeCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}