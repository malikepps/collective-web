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
var BATCH_SIZE = 400; // Firestore batch write limit is 500
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
// --- Helper Function to Find Nonprofit ID (copied from previous script) ---
function findNonprofitIdByName(name) {
    return __awaiter(this, void 0, void 0, function () {
        var snapshot, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, nonprofitsCollection.where('display_name', '==', name).limit(1).get()];
                case 1:
                    snapshot = _a.sent();
                    if (snapshot.empty) {
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, snapshot.docs[0].id];
                case 2:
                    error_1 = _a.sent();
                    console.error("Error searching for nonprofit ID for: ".concat(name), error_1);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// --- Main Deletion Logic ---
function deleteVideoFeaturedMedia() {
    return __awaiter(this, void 0, void 0, function () {
        var totalDeleted, _loop_1, _i, nonprofitDisplayNames_1, displayName;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Starting script to delete video featured media...');
                    totalDeleted = 0;
                    _loop_1 = function (displayName) {
                        var nonprofitId, featuredMediaCollection, docsToDeleteRefs, nonprofitDeletedCount, snapshot, _loop_2, i, error_2;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    console.log("\nProcessing nonprofit: ".concat(displayName));
                                    return [4 /*yield*/, findNonprofitIdByName(displayName)];
                                case 1:
                                    nonprofitId = _b.sent();
                                    if (!nonprofitId) {
                                        console.log("  - Skipping ".concat(displayName, " - Nonprofit ID not found."));
                                        return [2 /*return*/, "continue"];
                                    }
                                    featuredMediaCollection = nonprofitsCollection.doc(nonprofitId).collection('featured_media');
                                    docsToDeleteRefs = [];
                                    nonprofitDeletedCount = 0;
                                    _b.label = 2;
                                case 2:
                                    _b.trys.push([2, 8, , 9]);
                                    console.log("  - Querying for featured media with media_type == 'video'...");
                                    return [4 /*yield*/, featuredMediaCollection.where('media_type', '==', 'video').get()];
                                case 3:
                                    snapshot = _b.sent();
                                    console.log("  - Found ".concat(snapshot.size, " video documents to delete for ").concat(displayName, "."));
                                    if (snapshot.empty) {
                                        console.log("  - No video documents found for ".concat(displayName, "."));
                                        return [2 /*return*/, "continue"];
                                    }
                                    snapshot.forEach(function (doc) {
                                        docsToDeleteRefs.push(doc.ref);
                                    });
                                    _loop_2 = function (i) {
                                        var batch, chunk;
                                        return __generator(this, function (_c) {
                                            switch (_c.label) {
                                                case 0:
                                                    batch = db.batch();
                                                    chunk = docsToDeleteRefs.slice(i, i + BATCH_SIZE);
                                                    console.log("    - Processing batch ".concat(Math.floor(i / BATCH_SIZE) + 1, " with ").concat(chunk.length, " deletions..."));
                                                    chunk.forEach(function (ref) {
                                                        batch.delete(ref);
                                                    });
                                                    return [4 /*yield*/, batch.commit()];
                                                case 1:
                                                    _c.sent();
                                                    nonprofitDeletedCount += chunk.length;
                                                    console.log("    - Batch ".concat(Math.floor(i / BATCH_SIZE) + 1, " committed."));
                                                    return [2 /*return*/];
                                            }
                                        });
                                    };
                                    i = 0;
                                    _b.label = 4;
                                case 4:
                                    if (!(i < docsToDeleteRefs.length)) return [3 /*break*/, 7];
                                    return [5 /*yield**/, _loop_2(i)];
                                case 5:
                                    _b.sent();
                                    _b.label = 6;
                                case 6:
                                    i += BATCH_SIZE;
                                    return [3 /*break*/, 4];
                                case 7:
                                    console.log("  - Successfully deleted ".concat(nonprofitDeletedCount, " video documents for ").concat(displayName, "."));
                                    totalDeleted += nonprofitDeletedCount;
                                    return [3 /*break*/, 9];
                                case 8:
                                    error_2 = _b.sent();
                                    console.error("  - Error querying or deleting video featured media for ".concat(displayName, " (ID: ").concat(nonprofitId, "):"), error_2);
                                    return [3 /*break*/, 9];
                                case 9: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, nonprofitDisplayNames_1 = nonprofitDisplayNames;
                    _a.label = 1;
                case 1:
                    if (!(_i < nonprofitDisplayNames_1.length)) return [3 /*break*/, 4];
                    displayName = nonprofitDisplayNames_1[_i];
                    return [5 /*yield**/, _loop_1(displayName)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    console.log("\nScript finished. Total video featured media documents deleted: ".concat(totalDeleted, "."));
                    return [2 /*return*/];
            }
        });
    });
}
// --- Run Script ---
deleteVideoFeaturedMedia().catch(function (error) {
    console.error('Unhandled error in main script execution:', error);
});
