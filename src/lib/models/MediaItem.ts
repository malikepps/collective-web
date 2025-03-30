import { MediaType } from './Post';

export interface MediaItem {
  id: string;
  url: string;
  type: MediaType;
  order: number;
  thumbnailUrl: string | null;
  thumbnailColor: string | null;
}

export const mediaItemToFirestore = (mediaItem: MediaItem): Record<string, any> => {
  return {
    id: mediaItem.id,
    url: mediaItem.url,
    order: mediaItem.order,
    media_type: mediaItem.type,
    thumbnail_url: mediaItem.thumbnailUrl,
    thumbnail_color: mediaItem.thumbnailColor
  };
}; 