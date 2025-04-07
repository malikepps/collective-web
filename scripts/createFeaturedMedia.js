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
Object.defineProperty(exports, "__esModule", { value: true });
var admin = __importStar(require("firebase-admin"));
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
// --- Configuration ---
var serviceAccountPath = path.resolve(__dirname, '../keys/Collective Dev Firebase Service Account.json');
var uploaderUserId = 'nbWN14A9CKSPYaifWpznpMSIGAm2'; // User ID for uploaded_by
// List of Nonprofit Display Names to process
var nonprofitDisplayNames = [
    "DurhamCares",
    "Echo NC",
    "LGBTQ Center of Durham",
    "Leadership Triangle",
    "Living with Autism",
    "Meals on Wheels Durham",
    "Oak City Cares",
    "A Place At The Table Cafe",
    "Bike Durham"
];
// Enum mapping (assuming based on previous scripts/models)
var MediaType = {
    IMAGE: 0,
    VIDEO: 1,
};
// Map numeric MediaType to string
function mapMediaTypeToString(type) {
    if (type === MediaType.VIDEO) {
        return 'video';
    }
    // Default to image if type is IMAGE (0) or undefined/null
    return 'image';
}
// --- Firebase Initialization ---
try {
    var serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    admin.firestore().settings({ ignoreUndefinedProperties: true });
    console.log('Firebase Admin SDK Initialized.');
}
catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    process.exit(1);
}
var db = admin.firestore();
var nonprofitsCollection = db.collection('nonprofits');
var postsCollection = db.collection('posts');
// --- Helper Function to Find Nonprofit ID ---
function findNonprofitIdByName(name) {
    return __awaiter(this, void 0, void 0, function () {
        var snapshot, nonprofitId, error_1;
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
                        console.warn("  - No nonprofit found with display_name: ".concat(name));
                        return [2 /*return*/, null];
                    }
                    nonprofitId = snapshot.docs[0].id;
                    console.log("  - Found nonprofit ID: ".concat(nonprofitId));
                    return [2 /*return*/, nonprofitId];
                case 3:
                    error_1 = _a.sent();
                    console.error("  - Error searching for nonprofit ID for: ".concat(name), error_1);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// --- Main Logic ---
function createFeaturedMediaForAll() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, nonprofitDisplayNames_1, displayName, nonprofitId, nonprofitRef, featuredMediaCollection, sequence, featuredMediaCount, postsSnapshot, _a, _b, postDoc, postData, _c, _d, item, mediaTypeString, featuredMediaData, addError_1, error_2;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    console.log('Starting featured media creation script...');
                    _i = 0, nonprofitDisplayNames_1 = nonprofitDisplayNames;
                    _e.label = 1;
                case 1:
                    if (!(_i < nonprofitDisplayNames_1.length)) return [3 /*break*/, 19];
                    displayName = nonprofitDisplayNames_1[_i];
                    console.log("\nProcessing nonprofit: ".concat(displayName));
                    return [4 /*yield*/, findNonprofitIdByName(displayName)];
                case 2:
                    nonprofitId = _e.sent();
                    if (!nonprofitId) {
                        console.log("  - Skipping ".concat(displayName, " - Nonprofit ID not found."));
                        return [3 /*break*/, 18];
                    }
                    nonprofitRef = nonprofitsCollection.doc(nonprofitId);
                    featuredMediaCollection = nonprofitRef.collection('featured_media');
                    sequence = 1;
                    featuredMediaCount = 0;
                    _e.label = 3;
                case 3:
                    _e.trys.push([3, 17, , 18]);
                    console.log("  - Querying posts for nonprofit ID: ".concat(nonprofitId, "..."));
                    return [4 /*yield*/, postsCollection.where('nonprofit', '==', nonprofitRef).get()];
                case 4:
                    postsSnapshot = _e.sent();
                    console.log("  - Found ".concat(postsSnapshot.size, " posts for ").concat(displayName, "."));
                    if (postsSnapshot.empty) {
                        console.log("  - No posts found for ".concat(displayName, ", skipping featured media creation."));
                        return [3 /*break*/, 18];
                    }
                    _a = 0, _b = postsSnapshot.docs;
                    _e.label = 5;
                case 5:
                    if (!(_a < _b.length)) return [3 /*break*/, 16];
                    postDoc = _b[_a];
                    postData = postDoc.data();
                    console.log("    - Processing post ID: ".concat(postDoc.id));
                    if (!(postData.mediaItems && Array.isArray(postData.mediaItems))) return [3 /*break*/, 14];
                    _c = 0, _d = postData.mediaItems;
                    _e.label = 6;
                case 6:
                    if (!(_c < _d.length)) return [3 /*break*/, 13];
                    item = _d[_c];
                    if (!(item && item.url)) return [3 /*break*/, 11];
                    mediaTypeString = mapMediaTypeToString(item.type);
                    featuredMediaData = {
                        created_at: admin.firestore.FieldValue.serverTimestamp(), // Use server timestamp
                        media_type: mediaTypeString,
                        media_url: item.url,
                        nonprofit: nonprofitRef,
                        sequence: sequence,
                        source_type: "direct",
                        uploaded_by: uploaderUserId
                    };
                    _e.label = 7;
                case 7:
                    _e.trys.push([7, 9, , 10]);
                    console.log("      - Adding featured media: sequence ".concat(sequence, ", type ").concat(mediaTypeString, ", URL: ").concat(item.url.substring(0, 60), "..."));
                    return [4 /*yield*/, featuredMediaCollection.add(featuredMediaData)];
                case 8:
                    _e.sent();
                    sequence++;
                    featuredMediaCount++;
                    return [3 /*break*/, 10];
                case 9:
                    addError_1 = _e.sent();
                    console.error("      - Error adding featured media document for post ".concat(postDoc.id, ", item URL ").concat(item.url, ":"), addError_1);
                    return [3 /*break*/, 10];
                case 10: return [3 /*break*/, 12];
                case 11:
                    console.log("      - Skipping media item in post ".concat(postDoc.id, " - missing URL."));
                    _e.label = 12;
                case 12:
                    _c++;
                    return [3 /*break*/, 6];
                case 13: return [3 /*break*/, 15];
                case 14:
                    console.log("    - Post ".concat(postDoc.id, " has no mediaItems array."));
                    _e.label = 15;
                case 15:
                    _a++;
                    return [3 /*break*/, 5];
                case 16:
                    console.log("  - Finished processing ".concat(displayName, ". Added ").concat(featuredMediaCount, " featured media documents."));
                    return [3 /*break*/, 18];
                case 17:
                    error_2 = _e.sent();
                    console.error("  - Error processing posts or featured media for ".concat(displayName, " (ID: ").concat(nonprofitId, "):"), error_2);
                    return [3 /*break*/, 18];
                case 18:
                    _i++;
                    return [3 /*break*/, 1];
                case 19:
                    console.log('\nFeatured media creation script finished.');
                    return [2 /*return*/];
            }
        });
    });
}
// --- Run Script ---
createFeaturedMediaForAll().catch(function (error) {
    console.error('Unhandled error in main script execution:', error);
});
