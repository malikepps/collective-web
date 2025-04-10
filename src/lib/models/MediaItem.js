"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaItemToFirestore = void 0;
var mediaItemToFirestore = function (mediaItem) {
    return {
        id: mediaItem.id,
        url: mediaItem.url,
        order: mediaItem.order,
        media_type: mediaItem.type,
        thumbnail_url: mediaItem.thumbnailUrl,
        thumbnail_color: mediaItem.thumbnailColor
    };
};
exports.mediaItemToFirestore = mediaItemToFirestore;
