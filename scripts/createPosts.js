"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var admin = __importStar(require("firebase-admin"));
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var Post_1 = require("../src/lib/models/Post"); // Adjust path as needed
var uuid_1 = require("uuid"); // Import uuid
var axios_1 = __importDefault(require("axios")); // Import axios for HTTP requests
// --- Configuration ---
var serviceAccountPath = path.resolve(__dirname, '../keys/Collective Dev Firebase Service Account.json');
var baseProfileFolderPath = path.resolve(__dirname, '../Misc_tasks/API Profile Folders');
var firebaseUserId = 'nbWN14A9CKSPYaifWpznpMSIGAm2'; // Your user ID for posts
var nonprofitsToExclude = ['Reality Ministries']; // Nonprofits folders to skip
// Initialize Firebase Admin SDK
try {
    var serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: "".concat(serviceAccount.project_id, ".appspot.com")
    });
    admin.firestore().settings({ ignoreUndefinedProperties: true });
    console.log('Firebase Admin SDK Initialized.');
}
catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    process.exit(1);
}
var db = admin.firestore();
var storage = admin.storage().bucket(); // Initialize storage bucket
var nonprofitsCollection = db.collection('nonprofits');
var postsCollection = db.collection('posts');
// --- NEW: Function to upload post media ---
function uploadPostMedia(mediaUrl_1, postId_1, mediaIndex_1) {
    return __awaiter(this, arguments, void 0, function (mediaUrl, postId, mediaIndex, isThumbnail) {
        var response, mediaBuffer, guessedExtension, uniqueFilename, storageDir, storagePath, file, metadata, tokenizedUrl, error_1;
        var _a, _b;
        if (isThumbnail === void 0) { isThumbnail = false; }
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!mediaUrl) {
                        console.log("Skipping media upload for post ".concat(postId, " index ").concat(mediaIndex, " - no URL provided."));
                        return [2 /*return*/, null];
                    }
                    console.log("Attempting to download ".concat(isThumbnail ? 'thumbnail' : 'media', " for post ").concat(postId, " index ").concat(mediaIndex, " from: ").concat(mediaUrl));
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, (0, axios_1.default)({
                            method: 'get',
                            url: mediaUrl,
                            responseType: 'arraybuffer'
                        })];
                case 2:
                    response = _c.sent();
                    mediaBuffer = Buffer.from(response.data, 'binary');
                    guessedExtension = ((_a = mediaUrl.split('.').pop()) === null || _a === void 0 ? void 0 : _a.split('?')[0]) || (((_b = response.headers['content-type']) === null || _b === void 0 ? void 0 : _b.includes('video')) ? 'mp4' : 'jpg');
                    uniqueFilename = "".concat(mediaIndex, "_").concat((0, uuid_1.v4)(), ".").concat(guessedExtension);
                    storageDir = isThumbnail ? "posts/".concat(postId, "/thumbnails") : "posts/".concat(postId);
                    storagePath = "".concat(storageDir, "/").concat(uniqueFilename);
                    file = storage.file(storagePath);
                    console.log("Uploading ".concat(isThumbnail ? 'thumbnail' : 'media', " for post ").concat(postId, " index ").concat(mediaIndex, " to: ").concat(storagePath));
                    return [4 /*yield*/, file.save(mediaBuffer, {
                            metadata: {
                                contentType: response.headers['content-type'] || (isThumbnail ? 'image/jpeg' : 'application/octet-stream'),
                            },
                            public: true,
                        })];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, file.makePublic()];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, file.getMetadata()];
                case 5:
                    metadata = (_c.sent())[0];
                    tokenizedUrl = metadata.mediaLink;
                    // --- END MODIFICATION ---
                    console.log("Successfully uploaded ".concat(isThumbnail ? 'thumbnail' : 'media', ". Public URL: ").concat(tokenizedUrl)); // Use tokenized URL
                    return [2 /*return*/, tokenizedUrl !== null && tokenizedUrl !== void 0 ? tokenizedUrl : null]; // Return the URL with the token, or null if undefined
                case 6:
                    error_1 = _c.sent();
                    console.error("Error downloading/uploading ".concat(isThumbnail ? 'thumbnail' : 'media', " for post ").concat(postId, " index ").concat(mediaIndex, " from ").concat(mediaUrl, ":"), error_1.message || error_1);
                    return [2 /*return*/, null];
                case 7: return [2 /*return*/];
            }
        });
    });
}
// --- END NEW MEDIA UPLOAD FUNCTION ---
function findNonprofitIdByName(name) {
    return __awaiter(this, void 0, void 0, function () {
        var snapshot, nonprofitId, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Searching for nonprofit ID for: ".concat(name));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, nonprofitsCollection.where('display_name', '==', name).limit(1).get()];
                case 2:
                    snapshot = _a.sent();
                    if (snapshot.empty) {
                        console.warn("Nonprofit not found in Firestore for display_name: ".concat(name));
                        return [2 /*return*/, null];
                    }
                    nonprofitId = snapshot.docs[0].id;
                    console.log("Found nonprofit ID: ".concat(nonprofitId, " for ").concat(name));
                    return [2 /*return*/, nonprofitId];
                case 3:
                    error_2 = _a.sent();
                    console.error("Error querying Firestore for nonprofit ".concat(name, ":"), error_2);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// --- MODIFIED: createMediaItems to use uploadPostMedia ---
function createMediaItems(postData) {
    return __awaiter(this, void 0, void 0, function () {
        var mediaType, mediaItems, _a, firebaseUrl, videoFirebaseUrl, thumbnailFirebaseUrl, index, child, childMediaType, sourceUrl, sourceThumbnailUrl, mediaFirebaseUrl, thumbnailFirebaseUrl, firebaseUrl, firebaseUrl;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    mediaType = undefined;
                    mediaItems = [];
                    _a = postData.type;
                    switch (_a) {
                        case 'Image': return [3 /*break*/, 1];
                        case 'Video': return [3 /*break*/, 4];
                        case 'Sidecar': return [3 /*break*/, 9];
                    }
                    return [3 /*break*/, 20];
                case 1:
                    if (!postData.displayUrl) return [3 /*break*/, 3];
                    return [4 /*yield*/, uploadPostMedia(postData.displayUrl, postData.id, 0)];
                case 2:
                    firebaseUrl = _b.sent();
                    if (firebaseUrl) {
                        mediaType = Post_1.MediaType.IMAGE;
                        mediaItems.push({
                            id: "".concat(postData.id, "_0"),
                            url: firebaseUrl, // Use Firebase URL
                            type: Post_1.MediaType.IMAGE,
                            order: 0,
                            thumbnailUrl: null,
                            thumbnailColor: null
                        });
                    }
                    _b.label = 3;
                case 3: return [3 /*break*/, 22];
                case 4:
                    if (!postData.videoUrl) return [3 /*break*/, 8];
                    return [4 /*yield*/, uploadPostMedia(postData.videoUrl, postData.id, 0)];
                case 5:
                    videoFirebaseUrl = _b.sent();
                    thumbnailFirebaseUrl = null;
                    if (!postData.displayUrl) return [3 /*break*/, 7];
                    return [4 /*yield*/, uploadPostMedia(postData.displayUrl, postData.id, 0, true)];
                case 6:
                    thumbnailFirebaseUrl = _b.sent();
                    _b.label = 7;
                case 7:
                    if (videoFirebaseUrl) {
                        mediaType = Post_1.MediaType.VIDEO;
                        mediaItems.push({
                            id: "".concat(postData.id, "_0"),
                            url: videoFirebaseUrl, // Use Firebase URL
                            type: Post_1.MediaType.VIDEO,
                            order: 0,
                            thumbnailUrl: thumbnailFirebaseUrl !== null && thumbnailFirebaseUrl !== void 0 ? thumbnailFirebaseUrl : null, // Explicitly ensure null if undefined
                            thumbnailColor: null
                        });
                    }
                    _b.label = 8;
                case 8: return [3 /*break*/, 22];
                case 9:
                    if (!(postData.childPosts && postData.childPosts.length > 0)) return [3 /*break*/, 17];
                    mediaType = Post_1.MediaType.CAROUSEL_ALBUM;
                    index = 0;
                    _b.label = 10;
                case 10:
                    if (!(index < postData.childPosts.length)) return [3 /*break*/, 16];
                    child = postData.childPosts[index];
                    childMediaType = Post_1.MediaType.IMAGE;
                    sourceUrl = child.displayUrl;
                    sourceThumbnailUrl = null;
                    // Basic check if child might be a video
                    if (child.type === 'Video') {
                        childMediaType = Post_1.MediaType.VIDEO;
                        // Assume video URL might be in displayUrl or videoUrl for children
                        sourceUrl = child.videoUrl || child.displayUrl;
                        sourceThumbnailUrl = child.displayUrl; // Use displayUrl as the source for thumbnail
                    }
                    if (!sourceUrl) return [3 /*break*/, 14];
                    return [4 /*yield*/, uploadPostMedia(sourceUrl, postData.id, index)];
                case 11:
                    mediaFirebaseUrl = _b.sent();
                    thumbnailFirebaseUrl = null;
                    if (!(childMediaType === Post_1.MediaType.VIDEO && sourceThumbnailUrl)) return [3 /*break*/, 13];
                    return [4 /*yield*/, uploadPostMedia(sourceThumbnailUrl, postData.id, index, true)];
                case 12:
                    thumbnailFirebaseUrl = _b.sent();
                    _b.label = 13;
                case 13:
                    if (mediaFirebaseUrl) {
                        mediaItems.push({
                            id: child.id || "".concat(postData.id, "_").concat(index),
                            url: mediaFirebaseUrl, // Use Firebase URL
                            type: childMediaType,
                            order: index,
                            thumbnailUrl: thumbnailFirebaseUrl ? thumbnailFirebaseUrl : null, // Use ternary to ensure null
                            thumbnailColor: null
                        });
                    }
                    else {
                        console.warn("Skipping child post ".concat(index, " for ").concat(postData.id, " due to media upload failure."));
                    }
                    return [3 /*break*/, 15];
                case 14:
                    console.warn("Skipping child post ".concat(index, " for ").concat(postData.id, " due to missing source URL."));
                    _b.label = 15;
                case 15:
                    index++;
                    return [3 /*break*/, 10];
                case 16:
                    // Filter out any items that failed upload
                    mediaItems = mediaItems.filter(function (item) { return item.url; });
                    if (mediaItems.length === 0) {
                        mediaType = undefined; // No valid media items found
                    }
                    return [3 /*break*/, 19];
                case 17:
                    if (!postData.displayUrl) return [3 /*break*/, 19];
                    // Fallback for Sidecar with no childPosts but a displayUrl
                    console.warn("Sidecar post ".concat(postData.id, " has no childPosts, treating as single image."));
                    return [4 /*yield*/, uploadPostMedia(postData.displayUrl, postData.id, 0)];
                case 18:
                    firebaseUrl = _b.sent();
                    if (firebaseUrl) {
                        mediaType = Post_1.MediaType.IMAGE;
                        mediaItems.push({
                            id: "".concat(postData.id, "_0"),
                            url: firebaseUrl,
                            type: Post_1.MediaType.IMAGE,
                            order: 0,
                            thumbnailUrl: null,
                            thumbnailColor: null
                        });
                    }
                    _b.label = 19;
                case 19: return [3 /*break*/, 22];
                case 20:
                    console.warn("Unknown post type: ".concat(postData.type, " for post ID: ").concat(postData.id));
                    if (!postData.displayUrl) return [3 /*break*/, 22];
                    return [4 /*yield*/, uploadPostMedia(postData.displayUrl, postData.id, 0)];
                case 21:
                    firebaseUrl = _b.sent();
                    if (firebaseUrl) {
                        mediaType = Post_1.MediaType.IMAGE;
                        mediaItems.push({
                            id: "".concat(postData.id, "_0"),
                            url: firebaseUrl,
                            type: Post_1.MediaType.IMAGE,
                            order: 0,
                            thumbnailUrl: null,
                            thumbnailColor: null
                        });
                    }
                    _b.label = 22;
                case 22: return [2 /*return*/, { mediaType: mediaType, mediaItems: mediaItems.length > 0 ? mediaItems : undefined }];
            }
        });
    });
}
// --- END MODIFIED createMediaItems ---
function createPostDocument(postData, nonprofitId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, mediaType, mediaItems, firestorePostData, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("Processing post ID: ".concat(postData.id, " for nonprofit ID: ").concat(nonprofitId));
                    return [4 /*yield*/, createMediaItems(postData)];
                case 1:
                    _a = _b.sent(), mediaType = _a.mediaType, mediaItems = _a.mediaItems;
                    if (!mediaItems || mediaItems.length === 0) {
                        console.warn("Skipping post ".concat(postData.id, " - no valid media items could be created/uploaded."));
                        return [2 /*return*/];
                    }
                    firestorePostData = {
                        caption: postData.caption || '',
                        created_time: admin.firestore.Timestamp.fromDate(new Date(postData.timestamp)),
                        nonprofit: db.doc("nonprofits/".concat(nonprofitId)),
                        numComments: postData.commentsCount || 0,
                        numLikes: postData.likesCount || 0,
                        user: db.doc("users/".concat(firebaseUserId)),
                        is_for_members_only: false,
                        is_for_broader_ecosystem: false,
                        mediaType: mediaType,
                        mediaItems: mediaItems,
                        community: db.doc("communities/DqRTdPa7yGTgU7Z6e5LR"),
                        postImage: null,
                        videoUrl: null,
                        video: false,
                        backgroundColorHex: null,
                        text_content: null,
                    };
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, postsCollection.doc(postData.id).set(firestorePostData)];
                case 3:
                    _b.sent();
                    console.log("Successfully created/updated post document: ".concat(postData.id));
                    return [3 /*break*/, 5];
                case 4:
                    error_3 = _b.sent();
                    console.error("Failed to create/update Firestore document for post ".concat(postData.id, ":"), error_3);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function processNonprofitFolder(folderName) {
    return __awaiter(this, void 0, void 0, function () {
        var firestoreDisplayName, nonprofitId, jsonFileName, jsonFilePath, postsData, rawData, _i, postsData_1, post;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (nonprofitsToExclude.includes(folderName)) {
                        console.log("Skipping excluded folder: ".concat(folderName));
                        return [2 /*return*/];
                    }
                    firestoreDisplayName = folderName;
                    switch (folderName) {
                        case 'Durham Cares':
                            firestoreDisplayName = 'DurhamCares';
                            break;
                        case 'Echo Entrepreneurs':
                            firestoreDisplayName = 'Echo NC';
                            break;
                        case 'Living with Autism NC':
                            firestoreDisplayName = 'Living with Autism';
                            break;
                        case 'Place at the Table':
                            firestoreDisplayName = 'A Place At The Table Cafe';
                            break;
                        // Add other cases if needed
                    }
                    return [4 /*yield*/, findNonprofitIdByName(firestoreDisplayName)];
                case 1:
                    nonprofitId = _a.sent();
                    if (!nonprofitId) {
                        console.error("Could not find nonprofit ID for folder ".concat(folderName, " (searched for name: ").concat(firestoreDisplayName, "). Skipping post import."));
                        return [2 /*return*/];
                    }
                    jsonFileName = "".concat(folderName, ".json");
                    if (folderName === 'Living with Autism NC') {
                        jsonFileName = 'Living With Autism.json'; // Corrected filename
                    }
                    jsonFilePath = path.join(baseProfileFolderPath, folderName, jsonFileName);
                    console.log("Reading posts from: ".concat(jsonFilePath));
                    postsData = [];
                    try {
                        if (!fs.existsSync(jsonFilePath)) {
                            console.error("Error: JSON file not found at ".concat(jsonFilePath));
                            return [2 /*return*/];
                        }
                        rawData = fs.readFileSync(jsonFilePath, 'utf8');
                        postsData = JSON.parse(rawData);
                        if (!Array.isArray(postsData)) {
                            console.error("Error: Data in ".concat(jsonFilePath, " is not an array."));
                            return [2 /*return*/];
                        }
                        console.log("Found ".concat(postsData.length, " posts in ").concat(jsonFileName));
                    }
                    catch (error) {
                        console.error("Error reading or parsing ".concat(jsonFilePath, ":"), error);
                        return [2 /*return*/];
                    }
                    _i = 0, postsData_1 = postsData;
                    _a.label = 2;
                case 2:
                    if (!(_i < postsData_1.length)) return [3 /*break*/, 5];
                    post = postsData_1[_i];
                    if (!post.id || !post.timestamp) {
                        console.warn('Skipping post due to missing ID or timestamp:', post);
                        return [3 /*break*/, 4];
                    }
                    return [4 /*yield*/, createPostDocument(post, nonprofitId)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var folderNames, _i, folderNames_1, folderName;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Starting post creation script...');
                    folderNames = [];
                    try {
                        folderNames = fs.readdirSync(baseProfileFolderPath, { withFileTypes: true })
                            .filter(function (dirent) { return dirent.isDirectory(); })
                            .map(function (dirent) { return dirent.name; });
                        console.log("Found nonprofit folders: ".concat(folderNames.join(', ')));
                    }
                    catch (error) {
                        console.error("Error reading nonprofit folders from ".concat(baseProfileFolderPath, ":"), error);
                        process.exit(1);
                    }
                    _i = 0, folderNames_1 = folderNames;
                    _a.label = 1;
                case 1:
                    if (!(_i < folderNames_1.length)) return [3 /*break*/, 4];
                    folderName = folderNames_1[_i];
                    return [4 /*yield*/, processNonprofitFolder(folderName)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    console.log('Post creation script finished.');
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (error) {
    console.error('Unhandled error in main post script execution:', error);
});
