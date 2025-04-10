"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postFromFirestore = exports.MediaType = void 0;
var MediaType;
(function (MediaType) {
    MediaType["VIDEO"] = "VIDEO";
    MediaType["IMAGE"] = "IMAGE";
    MediaType["CAROUSEL_ALBUM"] = "CAROUSEL_ALBUM";
    MediaType["CAROUSEL"] = "carousel";
    MediaType["REELS"] = "REELS";
})(MediaType || (exports.MediaType = MediaType = {}));
// Helper function to parse document references or paths
var parseReference = function (ref) {
    if (!ref)
        return null;
    if (typeof ref === 'string') {
        // Handle path strings
        var id = ref.split('/').pop() || null;
        console.log("[DEBUG] Parsed string reference: ".concat(ref, " -> ID: ").concat(id));
        return id;
    }
    else {
        // Handle DocumentReference objects
        console.log("[DEBUG] Parsed DocumentReference: path=".concat(ref.path, " -> ID: ").concat(ref.id));
        return ref.id;
    }
};
var postFromFirestore = function (doc) {
    var data = doc.data();
    if (!data) {
        console.log("[DEBUG] No data found for document: ".concat(doc.id));
        return null;
    }
    console.log("[DEBUG] Processing post document: ".concat(doc.id));
    // Required fields
    var caption = data.caption;
    // Check for the timestamp field with logging
    console.log("[DEBUG] Checking timestamp fields for post ".concat(doc.id, ":"));
    console.log("[DEBUG] - created_time exists: ".concat(data.created_time !== undefined));
    console.log("[DEBUG] - created_date exists: ".concat(data.created_date !== undefined));
    var timestamp = (data.created_time || data.created_date);
    if (!caption || !timestamp) {
        console.error("[DEBUG] Missing required post fields for doc: ".concat(doc.id, ". caption: ").concat(!!caption, ", timestamp: ").concat(!!timestamp));
        return null;
    }
    // Parse nonprofit reference
    var nonprofitId = null;
    console.log("[DEBUG] Processing nonprofit field for post ".concat(doc.id));
    console.log("[DEBUG] Nonprofit reference type: ".concat(typeof data.nonprofit));
    if (data.nonprofit) {
        // Check if it's a string path to a document
        if (typeof data.nonprofit === 'string') {
            // Check if it's a path or just an ID
            if (data.nonprofit.includes('/')) {
                console.log("[DEBUG] Found nonprofit as string path: ".concat(data.nonprofit));
                nonprofitId = parseReference(data.nonprofit);
            }
            else {
                // It's just an ID string
                console.log("[DEBUG] Found nonprofit as direct ID string: ".concat(data.nonprofit));
                nonprofitId = data.nonprofit;
            }
        }
        // Check if it's a DocumentReference
        else if (typeof data.nonprofit === 'object' && data.nonprofit.path) {
            console.log("[DEBUG] Found nonprofit as DocumentReference with path: ".concat(data.nonprofit.path));
            nonprofitId = parseReference(data.nonprofit);
        }
        // Special case for handling other formats
        else if (data.nonprofitId) {
            console.log("[DEBUG] Found direct nonprofitId field: ".concat(data.nonprofitId));
            nonprofitId = data.nonprofitId;
        }
        console.log("[DEBUG] Resolved nonprofitId for post ".concat(doc.id, ": ").concat(nonprofitId));
    }
    else if (data.nonprofitId) {
        // Some documents might have the ID directly in a separate field
        console.log("[DEBUG] Found standalone nonprofitId field: ".concat(data.nonprofitId));
        nonprofitId = data.nonprofitId;
    }
    else if (data.community && typeof data.community === 'string' && !data.community.includes('/')) {
        // In some cases, the ID might be in the community field
        console.log("[DEBUG] No nonprofit reference found, using community as fallback: ".concat(data.community));
        nonprofitId = data.community;
    }
    else if (doc.id.includes('_')) {
        // Last resort: try to extract from post ID if it follows pattern like "nonprofitId_postId"
        var potentialId = doc.id.split('_')[0];
        if (potentialId && potentialId.length > 10) { // Typical Firebase ID length check
            console.log("[DEBUG] Extracted potential nonprofitId from post ID: ".concat(potentialId));
            nonprofitId = potentialId;
        }
        else {
            console.log("[DEBUG] No nonprofit reference found for post: ".concat(doc.id));
        }
    }
    else {
        console.log("[DEBUG] No nonprofit reference found for post: ".concat(doc.id));
    }
    // Parse user reference
    var userId = null;
    if (data.user) {
        userId = parseReference(data.user);
    }
    else {
        userId = data.user_id || null;
    }
    // Parse community reference
    var community = null;
    if (data.community) {
        community = parseReference(data.community);
    }
    // Handle media
    var mediaType = undefined;
    var mediaItems = undefined;
    // --- NEW: Prioritize mediaItems and mediaType fields if they exist ---
    if (Array.isArray(data.mediaItems) && data.mediaItems.length > 0) {
        console.log("[DEBUG] Post ".concat(doc.id, " using modern mediaItems field."));
        mediaItems = data.mediaItems.map(function (item, index) { return ({
            id: item.id || "".concat(doc.id, "_").concat(index),
            url: item.url || '',
            type: item.type || MediaType.IMAGE, // Default to IMAGE if type is missing
            order: typeof item.order === 'number' ? item.order : index,
            thumbnailUrl: item.thumbnailUrl || null,
            thumbnailColor: item.thumbnailColor || null
        }); });
        // Assign mediaType if provided, otherwise infer later if needed
        mediaType = data.mediaType || undefined;
        console.log("[DEBUG] Using mediaType field: ".concat(mediaType));
    }
    // --- END NEW --- 
    // --- OLD Logic (kept as fallback) ---
    // Check for the media array (lowercase 'media')
    else if (Array.isArray(data.media)) {
        // New format with media array
        var mediaArray = data.media;
        console.log("[DEBUG] Post ".concat(doc.id, " using legacy 'media' array field with ").concat(mediaArray.length, " items"));
        // Parse media type from data
        if (data.media_type) {
            // Try to match the string to a MediaType enum value
            var mediaTypeString_1 = data.media_type;
            mediaType = Object.values(MediaType).find(function (type) { return type.toLowerCase() === mediaTypeString_1.toLowerCase(); });
            console.log("[DEBUG] Using specified media_type: ".concat(mediaTypeString_1, " -> ").concat(mediaType));
        }
        else {
            // Infer type based on content or count
            var hasVideo = mediaArray.some(function (item) { var _a; return ((_a = item.media_type) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === 'video'; });
            if (mediaArray.length > 1) {
                mediaType = MediaType.CAROUSEL_ALBUM;
            }
            else if (hasVideo) {
                mediaType = MediaType.VIDEO;
            }
            else {
                mediaType = MediaType.IMAGE;
            }
            console.log("[DEBUG] Inferring media_type: ".concat(mediaType));
        }
        // Parse media items
        mediaItems = mediaArray.map(function (itemData, index) {
            var _a;
            var type = MediaType.IMAGE;
            if (((_a = itemData.media_type) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === 'video') {
                type = MediaType.VIDEO;
            }
            var url = '';
            var thumbnailUrl = null;
            if (type === MediaType.VIDEO) {
                url = itemData.video_url || itemData.url || '';
                // Use image_url as thumbnail if available, otherwise thumbnail_url
                thumbnailUrl = itemData.image_url || itemData.thumbnail_url || null;
            }
            else {
                url = itemData.image_url || itemData.url || '';
                thumbnailUrl = null; // Images don't have separate thumbnails in this model
            }
            return {
                id: itemData.id || String(index), // Ensure ID exists
                url: url,
                type: type,
                order: typeof itemData.order === 'number' ? itemData.order : index, // Ensure order is a number, default to index
                thumbnailUrl: thumbnailUrl,
                thumbnailColor: itemData.thumbnail_color || null // Ensure null if undefined
            };
        });
    }
    else {
        console.log("[DEBUG] Post ".concat(doc.id, " using legacy media format"));
        // Legacy format - Single image or video
        if (data.video || data.video_url) {
            mediaType = MediaType.VIDEO;
            console.log("[DEBUG] Post ".concat(doc.id, " is a legacy video post"));
            mediaItems = [{
                    id: '0',
                    url: data.video_url || '',
                    type: MediaType.VIDEO,
                    order: 0,
                    thumbnailUrl: data.image_url || null, // Legacy video thumbnail is postImage
                    thumbnailColor: null // Legacy format doesn't have color
                }];
        }
        else if (data.postImage || data.image_url) {
            mediaType = MediaType.IMAGE;
            console.log("[DEBUG] Post ".concat(doc.id, " is a legacy image post"));
            mediaItems = [{
                    id: '0',
                    url: data.postImage || data.image_url || '',
                    type: MediaType.IMAGE,
                    order: 0,
                    thumbnailUrl: null,
                    thumbnailColor: null
                }];
        }
    }
    // --- END OLD Logic ---
    // Infer mediaType if it wasn't explicitly provided by mediaType field
    if (!mediaType && mediaItems && mediaItems.length > 0) {
        var hasVideo = mediaItems.some(function (item) { return item.type === MediaType.VIDEO; });
        if (mediaItems.length > 1) {
            mediaType = MediaType.CAROUSEL_ALBUM;
        }
        else if (hasVideo) {
            mediaType = MediaType.VIDEO;
        }
        else {
            mediaType = MediaType.IMAGE;
        }
        console.log("[DEBUG] Inferred media_type based on mediaItems: ".concat(mediaType));
    }
    var post = {
        id: doc.id,
        caption: caption,
        createdDate: timestamp.toDate(),
        nonprofitId: nonprofitId,
        numComments: data.num_comments || 0,
        numLikes: data.num_likes || 0,
        userId: userId,
        username: data.username || null,
        community: community,
        postImage: data.image_url || data.postImage || null,
        videoUrl: data.video_url || null,
        video: !!(data.video || data.video_url),
        mediaType: mediaType,
        mediaItems: mediaItems,
        backgroundColorHex: data.background_color_hex || null,
        isForMembersOnly: data.is_for_members_only === true,
        isForBroaderEcosystem: data.is_for_broader_ecosystem === true,
        text_content: data.text_content || undefined // Read text_content, default to undefined
    };
    console.log("[DEBUG] Successfully created post object: ".concat(doc.id, ", nonprofitId: ").concat(nonprofitId));
    return post;
};
exports.postFromFirestore = postFromFirestore;
