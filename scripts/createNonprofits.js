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
var axios_1 = __importDefault(require("axios"));
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var uuid_1 = require("uuid");
// --- Configuration ---
// IMPORTANT: Replace with the correct path to your service account key
var serviceAccountPath = path.resolve(__dirname, '../keys/Collective Dev Firebase Service Account.json');
var profileDetailsPath = path.resolve(__dirname, '../Misc_tasks/Profile_details.json');
var firebaseUserId = 'nbWN14A9CKSPYaifWpznpMSIGAm2'; // Your user ID for storage path
var communityRefPath = 'communities/DqRTdPa7yGTgU7Z6e5LR';
var defaultZipCode = '27705';
var defaultCity = 'Durham';
var defaultState = 'NC';
var nonprofitToExclude = 'Reality Ministries';
// Initialize Firebase Admin SDK
try {
    var serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: "".concat(serviceAccount.project_id, ".appspot.com") // Dynamically get bucket name
    });
}
catch (error) {
    console.error('Error initializing Firebase Admin SDK. Make sure the service account path is correct and the file exists:', error);
    process.exit(1);
}
var db = admin.firestore();
var storage = admin.storage().bucket();
var nonprofitsCollection = db.collection('nonprofits');
function uploadProfilePicture(imageUrl, nonprofitId) {
    return __awaiter(this, void 0, void 0, function () {
        var response, imageBuffer, imageExtension, uniqueFilename, storagePath, file, publicUrl, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!imageUrl) {
                        console.log("Skipping photo upload for ".concat(nonprofitId, " - no profilePicUrl found."));
                        return [2 /*return*/, null];
                    }
                    console.log("Attempting to download image for ".concat(nonprofitId, " from: ").concat(imageUrl));
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, (0, axios_1.default)({
                            method: 'get',
                            url: imageUrl,
                            responseType: 'arraybuffer' // Important for image data
                        })];
                case 2:
                    response = _b.sent();
                    imageBuffer = Buffer.from(response.data, 'binary');
                    imageExtension = ((_a = imageUrl.split('.').pop()) === null || _a === void 0 ? void 0 : _a.split('?')[0]) || 'jpg';
                    uniqueFilename = "".concat((0, uuid_1.v4)(), ".").concat(imageExtension);
                    storagePath = "users/".concat(firebaseUserId, "/organization_photos/").concat(uniqueFilename);
                    file = storage.file(storagePath);
                    console.log("Uploading image for ".concat(nonprofitId, " to Firebase Storage at: ").concat(storagePath));
                    return [4 /*yield*/, file.save(imageBuffer, {
                            metadata: {
                                contentType: response.headers['content-type'] || 'image/jpeg', // Use content type from response or default
                            },
                            public: true, // Make the file publicly readable
                        })];
                case 3:
                    _b.sent();
                    // Important: Force metadata update to ensure public URL generation works reliably
                    return [4 /*yield*/, file.makePublic()];
                case 4:
                    // Important: Force metadata update to ensure public URL generation works reliably
                    _b.sent();
                    publicUrl = "https://firebasestorage.googleapis.com/v0/b/".concat(storage.name, "/o/").concat(encodeURIComponent(storagePath), "?alt=media");
                    console.log("Successfully uploaded photo for ".concat(nonprofitId, ". Public URL: ").concat(publicUrl));
                    return [2 /*return*/, publicUrl];
                case 5:
                    error_1 = _b.sent();
                    console.error("Error downloading or uploading photo for ".concat(nonprofitId, " from ").concat(imageUrl, ":"), error_1.message || error_1);
                    if (error_1.response) {
                        console.error('Response status:', error_1.response.status);
                        console.error('Response headers:', error_1.response.headers);
                    }
                    return [2 /*return*/, null]; // Return null if upload fails
                case 6: return [2 /*return*/];
            }
        });
    });
}
function createNonprofitDocument(nonprofitData) {
    return __awaiter(this, void 0, void 0, function () {
        var username, fullName, biography, externalUrl, profilePicUrl, firestoreData, newDocRef, uploadedPhotoUrl, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    username = nonprofitData.username, fullName = nonprofitData.fullName, biography = nonprofitData.biography, externalUrl = nonprofitData.externalUrl, profilePicUrl = nonprofitData.profilePicUrl;
                    // Skip the excluded nonprofit
                    if (fullName === nonprofitToExclude) {
                        console.log("Skipping excluded nonprofit: ".concat(fullName));
                        return [2 /*return*/];
                    }
                    console.log("Processing nonprofit: ".concat(fullName, " (").concat(username, ")"));
                    firestoreData = {
                        display_name: fullName || '', // Firestore field name
                        username: username || null,
                        bio: biography || '', // Firestore field name
                        website: externalUrl || '', // Firestore field name
                        zip_code: defaultZipCode, // Firestore field name
                        city: defaultCity,
                        state: defaultState,
                        pitch: '', // Blank as requested
                        community: db.doc(communityRefPath), // Use DocumentReference
                        // Add other default/required fields from Organization.ts model if necessary
                        city_town: defaultCity, // Firestore field name for 'location'
                        video_url: '', // Firestore field name for 'videoURL'
                        photo_url: null, // Will be updated after upload
                        latitude: null,
                        longitude: null,
                        staff: null,
                        members: null,
                        membership_fee: null,
                        hero_video_url: null,
                        user_id: null, // Assuming no specific user owner for these imports
                        ig_access_token: '',
                        theme_id: null,
                        welcome_message: null,
                        community_display_name: null, // Should be populated later if needed
                        // TODO: Add any other mandatory fields with default values based on Organization.ts
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    console.log("Attempting to add document for ".concat(fullName, "..."));
                    return [4 /*yield*/, nonprofitsCollection.add(firestoreData)];
                case 2:
                    newDocRef = _a.sent();
                    console.log("Created base document for ".concat(fullName, " with ID: ").concat(newDocRef.id));
                    return [4 /*yield*/, uploadProfilePicture(profilePicUrl || '', newDocRef.id)];
                case 3:
                    uploadedPhotoUrl = _a.sent();
                    if (!uploadedPhotoUrl) return [3 /*break*/, 5];
                    // Update the document with the actual photo URL
                    return [4 /*yield*/, newDocRef.update({ photo_url: uploadedPhotoUrl })];
                case 4:
                    // Update the document with the actual photo URL
                    _a.sent();
                    console.log("Updated document ".concat(newDocRef.id, " with photo_url: ").concat(uploadedPhotoUrl));
                    return [3 /*break*/, 6];
                case 5:
                    console.log("Document ".concat(newDocRef.id, " created without a photo_url as upload failed or was skipped."));
                    _a.label = 6;
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_2 = _a.sent();
                    console.error("Failed to create or update document for ".concat(fullName, ":"), error_2);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var profileDetails, rawData, _i, profileDetails_1, detail;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Starting nonprofit creation script...');
                    profileDetails = [];
                    try {
                        rawData = fs.readFileSync(profileDetailsPath, 'utf8');
                        profileDetails = JSON.parse(rawData);
                        console.log("Successfully read ".concat(profileDetails.length, " profiles from ").concat(profileDetailsPath));
                    }
                    catch (error) {
                        console.error("Error reading or parsing ".concat(profileDetailsPath, ":"), error);
                        process.exit(1);
                    }
                    if (!Array.isArray(profileDetails)) {
                        console.error('Error: Parsed data from Profile_details.json is not an array.');
                        process.exit(1);
                    }
                    console.log("Found ".concat(profileDetails.length, " nonprofit profiles. Processing..."));
                    _i = 0, profileDetails_1 = profileDetails;
                    _a.label = 1;
                case 1:
                    if (!(_i < profileDetails_1.length)) return [3 /*break*/, 4];
                    detail = profileDetails_1[_i];
                    return [4 /*yield*/, createNonprofitDocument(detail)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    console.log('Nonprofit creation script finished.');
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (error) {
    console.error('Unhandled error in main script execution:', error);
});
