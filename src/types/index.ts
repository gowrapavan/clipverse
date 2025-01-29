export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: string;
  duration: string;
  likeCount?: string;
}

export interface Category {
  id: string;
  title: string;
  color: string;
}

export interface SearchResult {
  items: Video[];
  nextPageToken?: string;
}