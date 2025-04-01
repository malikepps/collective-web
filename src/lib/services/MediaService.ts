import { getStorage, ref, getDownloadURL } from "firebase/storage";

class MediaService {
  private static instance: MediaService;
  private imageCache: Map<string, string>;
  private failedUrls: Set<string>;

  private constructor() {
    this.imageCache = new Map();
    this.failedUrls = new Set();
    
    // Clear failed URLs periodically (every 5 minutes)
    setInterval(() => {
      this.failedUrls.clear();
    }, 300000);
  }

  public static getInstance(): MediaService {
    if (!MediaService.instance) {
      MediaService.instance = new MediaService();
    }
    return MediaService.instance;
  }

  /**
   * Resolves a Firebase Storage URL to ensure it's valid and has a fresh token if needed
   */
  public async resolveFirebaseStorageUrl(url: string): Promise<string> {
    console.log(`[MediaService] Resolving URL: ${url}`);

    // If not a Firebase Storage URL, return as is
    if (!url.includes('firebasestorage.googleapis.com')) {
      return url;
    }

    // Check if URL is already cached
    if (this.imageCache.has(url)) {
      console.log(`[MediaService] Using cached URL for ${url}`);
      return this.imageCache.get(url)!;
    }

    // If URL has failed before and not enough time has passed, don't retry
    if (this.failedUrls.has(url)) {
      console.log(`[MediaService] Skipping previously failed URL: ${url}`);
      return url;
    }

    try {
      // Extract storage path from the URL
      const storagePath = this.extractStoragePathFromUrl(url);
      if (!storagePath) {
        console.warn(`[MediaService] Could not extract storage path from URL: ${url}`);
        return url;
      }

      console.log(`[MediaService] Extracted storage path: ${storagePath}`);

      // Get fresh download URL
      const storage = getStorage();
      const storageRef = ref(storage, storagePath);
      const freshUrl = await getDownloadURL(storageRef);
      
      console.log(`[MediaService] Successfully resolved URL to: ${freshUrl}`);

      // Cache the result
      this.imageCache.set(url, freshUrl);
      return freshUrl;
    } catch (error) {
      console.error(`[MediaService] Error resolving URL ${url}:`, error);

      // Try alternative path (with/without post_media folder)
      try {
        const alternativePath = this.getAlternativePath(url);
        if (alternativePath) {
          console.log(`[MediaService] Trying alternative path: ${alternativePath}`);
          const storage = getStorage();
          const altRef = ref(storage, alternativePath);
          const altUrl = await getDownloadURL(altRef);
          
          console.log(`[MediaService] Alternative path succeeded: ${altUrl}`);
          this.imageCache.set(url, altUrl);
          return altUrl;
        }
      } catch (altError) {
        console.warn(`[MediaService] Alternative path also failed:`, altError);
      }

      // Mark as failed to avoid repeated attempts
      this.failedUrls.add(url);
      return url;
    }
  }

  /**
   * Extracts the storage path from a Firebase Storage URL
   */
  private extractStoragePathFromUrl(url: string): string | null {
    try {
      const parsedUrl = new URL(url);
      
      // Check for different URL formats
      if (url.includes('/v0/b/') && url.includes('/o/')) {
        // Format: https://firebasestorage.googleapis.com/v0/b/[bucket]/o/[encoded-path]?alt=media&token=[token]
        const pathMatch = url.match(/\/o\/([^?]+)/);
        if (pathMatch && pathMatch[1]) {
          return decodeURIComponent(pathMatch[1]);
        }
      } else if (parsedUrl.hostname.includes('firebasestorage.googleapis.com')) {
        // Format: https://[bucket].firebasestorage.googleapis.com/[path]?alt=media&token=[token]
        const path = parsedUrl.pathname;
        if (path) {
          return path.startsWith('/') ? path.substring(1) : path;
        }
      }
      
      return null;
    } catch (error) {
      console.error(`[MediaService] Error parsing URL: ${url}`, error);
      return null;
    }
  }

  /**
   * Gets an alternative path by either adding or removing the post_media folder
   */
  private getAlternativePath(url: string): string | null {
    const path = this.extractStoragePathFromUrl(url);
    if (!path) return null;

    if (path.includes('post_media/')) {
      // Remove post_media folder
      return path.replace('post_media/', '');
    } else {
      // Try to add post_media folder
      const parts = path.split('/');
      if (parts.length >= 2) {
        const userFolder = parts[0]; // "users"
        const userId = parts[1];     // user ID
        const filename = parts[parts.length - 1]; // filename
        
        if (parts.length === 3) {
          // Simple case: users/userId/filename.jpg
          return `${userFolder}/${userId}/post_media/${filename}`;
        }
      }
    }
    
    return null;
  }

  /**
   * Preloads images by resolving their URLs and triggering browser caching
   */
  public async preloadImages(urls: string[]): Promise<void> {
    const uniqueUrls = [...new Set(urls)];
    
    console.log(`[MediaService] Preloading ${uniqueUrls.length} images`);
    
    await Promise.allSettled(
      uniqueUrls.map(async (url) => {
        if (!url) return;
        
        try {
          const resolvedUrl = await this.resolveFirebaseStorageUrl(url);
          
          // Create a new Image to trigger browser caching
          const img = new Image();
          img.src = resolvedUrl;
          
          // Wait for load or error
          await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve; // Resolve even on error to continue with other images
          });
        } catch (error) {
          console.warn(`[MediaService] Failed to preload image: ${url}`, error);
        }
      })
    );
  }
}

export default MediaService; 