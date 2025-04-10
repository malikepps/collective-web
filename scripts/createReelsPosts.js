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
var reelsDataPath = path.resolve(__dirname, '../Misc_tasks/Profile_reels.json'); // NEW: Path to the single Reels JSON file
var firebaseUserId = 'nbWN14A9CKSPYaifWpznpMSIGAm2'; // Your user ID for posts
// Map Instagram username to Firestore display_name - VERIFY THESE ARE CORRECT
var nonprofitUsernameToDisplayNameMap = {
    "durhamcares": "DurhamCares",
    "echo.entrepreneurs": "Echo NC",
    "lgbtqdurham": "LGBTQ Center of Durham",
    "leadershiptriangle": "Leadership Triangle",
    "livingwithautismnc": "Living with Autism",
    "mowdurham": "Meals on Wheels Durham",
    "oakcitycares": "Oak City Cares",
    "tableraleigh": "A Place At The Table Cafe",
    "bikedurham": "Bike Durham"
};
// --- NEW: Specify target usernames to process ---
var targetUsernames = [
    'livingwithautismnc', // Corrected: removed underscore
    'lgbtqdurham', // Corrected: shortened name
    'echo.entrepreneurs', // Corrected: used full name with dot
    'tableraleigh' // No change needed
];
// --- Firebase Initialization (same as before) ---
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
// --- Media Upload Function (same as before) ---
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
                                contentType: response.headers['content-type'] || (isThumbnail ? 'image/jpeg' : 'video/mp4'), // Default to mp4 if video
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
                    console.log("Successfully uploaded ".concat(isThumbnail ? 'thumbnail' : 'media', ". Public URL: ").concat(tokenizedUrl));
                    return [2 /*return*/, tokenizedUrl !== null && tokenizedUrl !== void 0 ? tokenizedUrl : null];
                case 6:
                    error_1 = _c.sent();
                    console.error("Error downloading/uploading ".concat(isThumbnail ? 'thumbnail' : 'media', " for post ").concat(postId, " index ").concat(mediaIndex, " from ").concat(mediaUrl, ":"), error_1.message || error_1);
                    return [2 /*return*/, null];
                case 7: return [2 /*return*/];
            }
        });
    });
}
// --- Find Nonprofit ID Function (same as before) ---
function findNonprofitIdByName(name) {
    return __awaiter(this, void 0, void 0, function () {
        var snapshot, error_2;
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
                        console.warn("No nonprofit found with display_name: ".concat(name));
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, snapshot.docs[0].id];
                case 3:
                    error_2 = _a.sent();
                    console.error("Error searching for nonprofit ID for: ".concat(name), error_2);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// --- REVISED: createMediaItems specifically for Reels ---
function createMediaItemsForReel(reelData) {
    return __awaiter(this, void 0, void 0, function () {
        var mediaType, mediaItems, videoFirebaseUrl, thumbnailFirebaseUrl;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mediaType = undefined;
                    mediaItems = [];
                    if (!(reelData.videoUrl && reelData.displayUrl)) return [3 /*break*/, 3];
                    return [4 /*yield*/, uploadPostMedia(reelData.videoUrl, reelData.id, 0, false)];
                case 1:
                    videoFirebaseUrl = _a.sent();
                    return [4 /*yield*/, uploadPostMedia(reelData.displayUrl, reelData.id, 0, true)];
                case 2:
                    thumbnailFirebaseUrl = _a.sent();
                    // Only create media item if both uploads were successful
                    if (videoFirebaseUrl && thumbnailFirebaseUrl) {
                        mediaType = Post_1.MediaType.VIDEO;
                        mediaItems.push({
                            id: "".concat(reelData.id, "_0"),
                            url: videoFirebaseUrl, // Use Firebase video URL
                            type: Post_1.MediaType.VIDEO,
                            order: 0,
                            thumbnailUrl: thumbnailFirebaseUrl, // Use Firebase thumbnail URL
                            thumbnailColor: null
                        });
                    }
                    else {
                        console.warn("Failed to upload video or thumbnail for Reel ".concat(reelData.id, ". Video URL: ").concat(videoFirebaseUrl, ", Thumb URL: ").concat(thumbnailFirebaseUrl));
                    }
                    return [3 /*break*/, 4];
                case 3:
                    console.warn("Skipping Reel ".concat(reelData.id, " due to missing videoUrl or displayUrl."));
                    _a.label = 4;
                case 4: return [2 /*return*/, { mediaType: mediaType, mediaItems: mediaItems.length > 0 ? mediaItems : undefined }];
            }
        });
    });
}
// --- END REVISED createMediaItemsForReel ---
// --- REVISED: createPostDocument to use Reels data structure ---
function createReelPostDocument(reelData, nonprofitId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, mediaType, mediaItems, firestorePostData, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("Processing Reel ID: ".concat(reelData.id, " for nonprofit ID: ").concat(nonprofitId));
                    return [4 /*yield*/, createMediaItemsForReel(reelData)];
                case 1:
                    _a = _b.sent(), mediaType = _a.mediaType, mediaItems = _a.mediaItems;
                    // If no valid media items were created/uploaded, skip Firestore document creation
                    if (!mediaItems || mediaItems.length === 0) {
                        console.warn("Skipping Reel post ".concat(reelData.id, " - no valid media items could be created/uploaded."));
                        return [2 /*return*/];
                    }
                    firestorePostData = {
                        caption: reelData.caption || '',
                        created_time: admin.firestore.Timestamp.fromDate(new Date(reelData.timestamp)), // Use created_time
                        nonprofit: db.doc("nonprofits/".concat(nonprofitId)),
                        numComments: 0, // Default to 0
                        numLikes: reelData.likesCount || 0,
                        user: db.doc("users/".concat(firebaseUserId)),
                        is_for_members_only: false,
                        is_for_broader_ecosystem: false,
                        mediaType: mediaType,
                        mediaItems: mediaItems,
                        community: db.doc("communities/DqRTdPa7yGTgU7Z6e5LR"), // Default community
                        videoViewCount: reelData.videoViewCount || 0 // Add view count
                    };
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, postsCollection.doc(reelData.id).set(firestorePostData, { merge: true })];
                case 3:
                    _b.sent(); // Use set with merge to overwrite or create
                    console.log("Successfully created/updated Reel post document: ".concat(reelData.id));
                    return [3 /*break*/, 5];
                case 4:
                    error_3 = _b.sent();
                    console.error("Failed to create/update Firestore document for Reel post ".concat(reelData.id, ":"), error_3);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// --- END REVISED createPostDocument ---
// --- NEW MAIN LOGIC for Reels Processing ---
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var targetUsernames, allReelsData, rawData, reelsByUsername, _i, allReelsData_1, reel, _a, targetUsernames_1, username, displayName, nonprofitId, sortedReels, _b, sortedReels_1, reel;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log('Starting Reels post creation script...');
                    targetUsernames = [
                        'livingwithautismnc', // Corrected: removed underscore
                        'lgbtqdurham', // Corrected: shortened name
                        'echo.entrepreneurs', // Corrected: used full name with dot
                        'tableraleigh' // No change needed
                    ];
                    allReelsData = [];
                    try {
                        console.log("Reading Reels data from: ".concat(reelsDataPath));
                        if (!fs.existsSync(reelsDataPath)) {
                            console.error("Error: Reels JSON file not found at ".concat(reelsDataPath));
                            process.exit(1);
                        }
                        rawData = fs.readFileSync(reelsDataPath, 'utf8');
                        allReelsData = JSON.parse(rawData);
                        if (!Array.isArray(allReelsData)) {
                            console.error("Error: Data in ".concat(reelsDataPath, " is not an array."));
                            process.exit(1);
                        }
                        console.log("Found ".concat(allReelsData.length, " total Reels in the file."));
                    }
                    catch (error) {
                        console.error("Error reading or parsing ".concat(reelsDataPath, ":"), error);
                        process.exit(1);
                    }
                    reelsByUsername = {};
                    for (_i = 0, allReelsData_1 = allReelsData; _i < allReelsData_1.length; _i++) {
                        reel = allReelsData_1[_i];
                        if (reel.ownerUsername) {
                            if (!reelsByUsername[reel.ownerUsername]) {
                                reelsByUsername[reel.ownerUsername] = [];
                            }
                            reelsByUsername[reel.ownerUsername].push(reel);
                        }
                    }
                    _a = 0, targetUsernames_1 = targetUsernames;
                    _c.label = 1;
                case 1:
                    if (!(_a < targetUsernames_1.length)) return [3 /*break*/, 9];
                    username = targetUsernames_1[_a];
                    if (!(nonprofitUsernameToDisplayNameMap[username] && reelsByUsername[username])) return [3 /*break*/, 7];
                    displayName = nonprofitUsernameToDisplayNameMap[username];
                    console.log("\n--- Processing TARGET Reels for ".concat(username, " (mapped to ").concat(displayName, ") ---"));
                    return [4 /*yield*/, findNonprofitIdByName(displayName)];
                case 2:
                    nonprofitId = _c.sent();
                    if (!nonprofitId) {
                        console.warn("Could not find nonprofit ID for ".concat(displayName, ". Skipping Reels for ").concat(username, "."));
                        return [3 /*break*/, 8]; // Skip to the next target username
                    }
                    sortedReels = reelsByUsername[username]
                        .filter(function (reel) { return reel.videoViewCount !== undefined && reel.videoViewCount !== null; })
                        .sort(function (a, b) { var _a, _b; return ((_a = b.videoViewCount) !== null && _a !== void 0 ? _a : 0) - ((_b = a.videoViewCount) !== null && _b !== void 0 ? _b : 0); })
                        .slice(0, 3);
                    console.log("Found ".concat(reelsByUsername[username].length, " Reels for ").concat(username, ". Processing top ").concat(sortedReels.length, " by view count."));
                    if (sortedReels.length === 0) {
                        console.log("No valid Reels with view counts found for ".concat(username, "."));
                        return [3 /*break*/, 8]; // Skip to the next target username
                    }
                    _b = 0, sortedReels_1 = sortedReels;
                    _c.label = 3;
                case 3:
                    if (!(_b < sortedReels_1.length)) return [3 /*break*/, 6];
                    reel = sortedReels_1[_b];
                    if (!reel.id || !reel.timestamp || !reel.videoUrl || !reel.displayUrl) {
                        console.warn('Skipping Reel due to missing ID, timestamp, videoUrl, or displayUrl:', reel.id || 'unknown ID');
                        return [3 /*break*/, 5];
                    }
                    console.log("  - Reel ID: ".concat(reel.id, ", Views: ").concat(reel.videoViewCount));
                    return [4 /*yield*/, createReelPostDocument(reel, nonprofitId)];
                case 4:
                    _c.sent();
                    _c.label = 5;
                case 5:
                    _b++;
                    return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 8];
                case 7:
                    if (nonprofitUsernameToDisplayNameMap[username]) {
                        // Handle case where username is mapped but no reels data exists for it
                        console.log("\n--- Skipping TARGET ".concat(username, " - No Reels found in the data file for this username. ---"));
                    }
                    else {
                        // Handle case where username isn't in the map (shouldn't happen if targetUsernames is based on the map keys)
                        console.warn("\n--- Skipping TARGET ".concat(username, " - Username not found in nonprofitUsernameToDisplayNameMap. ---"));
                    }
                    _c.label = 8;
                case 8:
                    _a++;
                    return [3 /*break*/, 1];
                case 9:
                    // --- END MODIFIED LOOP ---
                    console.log('\nReels post creation script finished.');
                    return [2 /*return*/];
            }
        });
    });
}
// --- END NEW MAIN LOGIC ---
main().catch(function (error) {
    console.error('Unhandled error in main Reels script execution:', error);
});
