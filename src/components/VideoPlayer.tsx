import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Video } from '../types';
import { getComments, getRelatedVideos } from '../lib/youtube';
import { Clock, MessageCircle, ThumbsUp, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import { VideoCard } from './VideoCard';

interface VideoPlayerProps {
  video: Video;
}

interface Comment {
  id: string;
  authorName: string;
  text: string;
  likeCount: string;
  publishedAt: string;
}

export function VideoPlayer({ video }: VideoPlayerProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [comments, setComments] = useState<Comment[]>([]);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllComments, setShowAllComments] = useState(false);
  const [loadingRelated, setLoadingRelated] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [commentData, relatedData] = await Promise.all([
          getComments(video.id),
          getRelatedVideos(video.id),
        ]);
        setComments(commentData);
        setRelatedVideos(relatedData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
        setLoadingRelated(false);
      }
    }

    loadData();
    setShowAllComments(false);
  }, [video.id]);

  const displayedComments = showAllComments ? comments : comments.slice(0, 3);

  const handleRelatedVideoClick = (relatedVideo: Video) => {
    // Update URL without full page reload
    navigate(`/watch?v=${relatedVideo.id}`, { replace: true });
    // Reload the page to force video player refresh
    window.location.reload();
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Video Player */}
          <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-2xl mb-6">
            <iframe
              src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
              title={video.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Video Info */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2 text-left">{video.title}</h1>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4 gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1 text-cyan-400">
                  <Clock size={16} />
                  {video.duration}
                </span>
                <span className="text-white/70">{video.viewCount} views</span>
              </div>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <ThumbsUp size={18} />
                  Like
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <Share2 size={18} />
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <MessageCircle className="text-cyan-400" />
                <h2 className="text-xl font-semibold">Comments</h2>
              </div>
              {comments.length > 3 && (
                <button
                  onClick={() => setShowAllComments(!showAllComments)}
                  className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  {showAllComments ? (
                    <>
                      Show Less <ChevronUp size={20} />
                    </>
                  ) : (
                    <>
                      Show More <ChevronDown size={20} />
                    </>
                  )}
                </button>
              )}
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-white/5 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-white/5 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {displayedComments.map((comment) => (
                  <div key={comment.id} className="group">
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5 backdrop-blur-lg
                                  transition-all duration-300 hover:bg-white/10">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-cyan-400">{comment.authorName}</h3>
                          <span className="text-sm text-white/50">{comment.publishedAt}</span>
                        </div>
                        <p className="text-white/80">{comment.text}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-white/50">
                          <button className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
                            <ThumbsUp size={14} />
                            {comment.likeCount}
                          </button>
                          <button className="hover:text-cyan-400 transition-colors">Reply</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related Videos */}
        <div className="lg:col-span-1">
          <h3 className="text-xl font-semibold mb-6">Related Videos</h3>
          {loadingRelated ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="w-40 aspect-video bg-white/5 rounded-lg"></div>
                  <div className="mt-2 space-y-2">
                    <div className="h-4 bg-white/5 rounded w-3/4"></div>
                    <div className="h-3 bg-white/5 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {relatedVideos.map((relatedVideo) => (
                <VideoCard
                  key={relatedVideo.id}
                  video={relatedVideo}
                  onClick={() => handleRelatedVideoClick(relatedVideo)}
                  compact
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}