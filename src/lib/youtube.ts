import axios from 'axios';
import type { Video, Category, SearchResult } from '../types';

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

const youtube = axios.create({
  baseURL: BASE_URL,
  params: {
    key: API_KEY,
  },
});

// Error handler utility
const handleApiError = (error: any, context: string) => {
  const errorMessage = error?.response?.data?.error?.message || error.message || 'Unknown error';
  const status = error?.response?.status;
  
  let userMessage = 'An error occurred. Please try again later.';
  
  if (status === 403) {
    if (errorMessage.includes('quota')) {
      userMessage = 'Daily API limit reached. Please try again tomorrow.';
    } else {
      userMessage = 'Access denied. Please check your API key configuration.';
    }
  }
  
  console.error(`Error ${context}:`, errorMessage);
  throw new Error(userMessage);
};

export async function getComments(videoId: string) {
  try {
    const { data } = await youtube.get('/commentThreads', {
      params: {
        part: 'snippet',
        videoId,
        maxResults: 25,
        order: 'relevance',
      },
    });

    return data.items.map((item: any) => ({
      id: item.id,
      authorName: item.snippet.topLevelComment.snippet.authorDisplayName,
      text: item.snippet.topLevelComment.snippet.textDisplay,
      likeCount: formatCount(item.snippet.topLevelComment.snippet.likeCount),
      publishedAt: formatDate(item.snippet.topLevelComment.snippet.publishedAt),
    }));
  } catch (error) {
    // For comments, we'll return an empty array instead of throwing
    console.error('Error fetching comments:', error instanceof Error ? error.message : 'Unknown error');
    return [];
  }
}

export async function getVideoCategories(): Promise<Category[]> {
  try {
    const { data } = await youtube.get('/videoCategories', {
      params: {
        part: 'snippet',
        regionCode: 'US',
      },
    });

    return data.items
      .filter((item: any) => item.snippet.assignable)
      .map((item: any) => ({
        id: item.id,
        title: item.snippet.title,
        color: getColorForCategory(item.id),
      }));
  } catch (error) {
    // Return default categories if API fails
    return [
      { id: '0', title: 'All', color: '#6b7280' },
      { id: '10', title: 'Music', color: '#06b6d4' },
      { id: '20', title: 'Gaming', color: '#6366f1' },
      { id: '24', title: 'Entertainment', color: '#0ea5e9' },
      { id: '28', title: 'Science & Tech', color: '#10b981' },
    ];
  }
}

export async function getTrendingVideos(categoryId?: string, pageToken?: string): Promise<SearchResult> {
  try {
    const params: any = {
      part: 'snippet,statistics,contentDetails',
      chart: 'mostPopular',
      maxResults: 24,
      regionCode: 'US',
      videoCategoryId: categoryId !== '0' ? categoryId : undefined,
      pageToken,
    };

    const { data } = await youtube.get('/videos', { params });

    return {
      items: data.items.map(formatVideoResponse),
      nextPageToken: data.nextPageToken,
    };
  } catch (error) {
    handleApiError(error, 'fetching trending videos');
  }
}

export async function searchVideos(query: string, categoryId?: string): Promise<SearchResult> {
  try {
    const params: any = {
      part: 'snippet',
      type: 'video',
      q: query,
      maxResults: 24,
      videoCategoryId: categoryId !== '0' ? categoryId : undefined,
      order: 'date', // Sort by date to get newest videos first
    };

    const { data } = await youtube.get('/search', { params });

    const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
    if (!videoIds) {
      return { items: [], nextPageToken: undefined };
    }

    const { data: videoData } = await youtube.get('/videos', {
      params: {
        part: 'statistics,contentDetails',
        id: videoIds,
      },
    });

    const videoDetails = new Map(videoData.items.map((item: any) => [item.id, item]));

    const items = data.items.map((item: any) => {
      const details = videoDetails.get(item.id.videoId);
      return formatVideoResponse({
        ...item,
        statistics: details?.statistics,
        contentDetails: details?.contentDetails,
      });
    });

    return {
      items,
      nextPageToken: data.nextPageToken,
    };
  } catch (error) {
    handleApiError(error, 'searching videos');
  }
}

export async function getVideoById(videoId: string): Promise<Video> {
  try {
    const { data } = await youtube.get('/videos', {
      params: {
        part: 'snippet,statistics,contentDetails',
        id: videoId,
      },
    });

    if (!data.items?.[0]) {
      throw new Error('Video not found');
    }

    return formatVideoResponse(data.items[0]);
  } catch (error) {
    handleApiError(error, 'fetching video');
  }
}

export async function getRelatedVideos(videoId: string): Promise<Video[]> {
  try {
    const { data: videoData } = await youtube.get('/videos', {
      params: {
        part: 'snippet',
        id: videoId,
      },
    });

    if (!videoData.items?.[0]) {
      throw new Error('Video not found');
    }

    const categoryId = videoData.items[0].snippet.categoryId;
    const channelId = videoData.items[0].snippet.channelId;

    // Try to get videos from the same channel first
    const { data: channelVideos } = await youtube.get('/search', {
      params: {
        part: 'snippet',
        type: 'video',
        maxResults: 8,
        channelId: channelId,
        videoCategoryId: categoryId,
      },
    });

    // Get full video details
    const videoIds = channelVideos.items
      .map((item: any) => item.id.videoId)
      .filter((id: string) => id !== videoId)
      .slice(0, 15)
      .join(',');

    if (!videoIds) {
      return [];
    }

    const { data: relatedData } = await youtube.get('/videos', {
      params: {
        part: 'snippet,statistics,contentDetails',
        id: videoIds,
      },
    });

    return relatedData.items.map(formatVideoResponse);
  } catch (error) {
    console.error('Error fetching related videos:', error instanceof Error ? error.message : 'Unknown error');
    return []; // Return empty array instead of throwing
  }
}

function formatVideoResponse(item: any): Video {
  const { id, snippet, statistics, contentDetails } = item;
  return {
    id: typeof id === 'string' ? id : id.videoId,
    title: snippet.title,
    thumbnail: snippet.thumbnails.high?.url || snippet.thumbnails.default?.url,
    channelTitle: snippet.channelTitle,
    publishedAt: formatDate(snippet.publishedAt),
    viewCount: formatCount(statistics?.viewCount) || 'N/A',
    duration: formatDuration(contentDetails?.duration) || 'N/A',
    likeCount: statistics?.likeCount ? formatCount(statistics.likeCount) : undefined,
  };
}

function formatCount(count: string): string {
  const num = parseInt(count, 10);
  if (isNaN(num)) return 'N/A';
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return count;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years}y ago`;
  if (months > 0) return `${months}mo ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

function formatDuration(duration: string): string {
  try {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 'N/A';

    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');

    let result = '';
    if (hours) result += `${hours}:`;
    result += `${minutes || '0'}:`;
    result += seconds.padStart(2, '0');

    return result;
  } catch (error) {
    console.error('Error formatting duration:', error instanceof Error ? error.message : 'Unknown error');
    return 'N/A';
  }
}

function getColorForCategory(id: string): string {
  const colors: Record<string, string> = {
    '1': '#ef4444',  // Film & Animation - Red
    '2': '#f97316',  // Autos & Vehicles - Orange
    '10': '#06b6d4', // Music - Cyan
    '15': '#84cc16', // Pets & Animals - Lime
    '17': '#ec4899', // Sports - Pink
    '19': '#8b5cf6', // Travel & Events - Purple
    '20': '#6366f1', // Gaming - Indigo
    '22': '#14b8a6', // People & Blogs - Teal
    '23': '#f59e0b', // Comedy - Amber
    '24': '#0ea5e9', // Entertainment - Sky
    '25': '#dc2626', // News & Politics - Red
    '26': '#0891b2', // Howto & Style - Cyan
    '27': '#84cc16', // Education - Lime
    '28': '#10b981', // Science & Technology - Emerald
    '29': '#6366f1', // Nonprofits & Activism - Indigo
  };
  return colors[id] || '#6b7280'; // Default to gray if category not found
}