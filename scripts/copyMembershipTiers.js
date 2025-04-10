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
// Source Nonprofit ID (SeekHealing)
var sourceNonprofitId = 'G4q8eBRkKJodg5L6L3Ss';
// List of Target Nonprofit Display Names (Excluding the source)
var targetNonprofitDisplayNames = [
    "DurhamCares",
    "Echo NC",
    "LGBTQ Center of Durham",
    "Leadership Triangle",
    "Living with Autism",
    "Meals on Wheels Durham",
    "Oak City Cares",
    // "A Place At The Table Cafe", // Removed because it might have different tiers?
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
                    return [2 /*return*/, snapshot.empty ? null : snapshot.docs[0].id];
                case 2:
                    error_1 = _a.sent();
                    console.error("Error searching for nonprofit ID for: ".concat(name), error_1);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// --- Main Logic ---
function copyMembershipTiers() {
    return __awaiter(this, void 0, void 0, function () {
        var sourceTiers, sourceTierSnapshot, error_2, nonprofitsProcessed, nonprofitsNotFound, totalTiersCopied, _i, targetNonprofitDisplayNames_1, displayName, targetNonprofitId, targetTierCollection, tiersCopiedForThisNonprofit, _a, sourceTiers_1, sourceTierDoc, tierId, tierData, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("Starting script to copy membership tiers from Source ID: ".concat(sourceNonprofitId, "..."));
                    sourceTiers = [];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    console.log("  - Fetching tiers from ".concat(sourceNonprofitId, "..."));
                    return [4 /*yield*/, nonprofitsCollection.doc(sourceNonprofitId).collection('membershipTiers').get()];
                case 2:
                    sourceTierSnapshot = _b.sent();
                    if (sourceTierSnapshot.empty) {
                        console.error("  - Error: No membership tiers found for source nonprofit ".concat(sourceNonprofitId, ". Aborting."));
                        return [2 /*return*/];
                    }
                    sourceTiers = sourceTierSnapshot.docs;
                    console.log("  - Found ".concat(sourceTiers.length, " tiers to copy."));
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _b.sent();
                    console.error("  - Error fetching source tiers from ".concat(sourceNonprofitId, ":"), error_2);
                    return [2 /*return*/];
                case 4:
                    nonprofitsProcessed = 0;
                    nonprofitsNotFound = 0;
                    totalTiersCopied = 0;
                    _i = 0, targetNonprofitDisplayNames_1 = targetNonprofitDisplayNames;
                    _b.label = 5;
                case 5:
                    if (!(_i < targetNonprofitDisplayNames_1.length)) return [3 /*break*/, 14];
                    displayName = targetNonprofitDisplayNames_1[_i];
                    console.log("\nProcessing target nonprofit: ".concat(displayName));
                    return [4 /*yield*/, findNonprofitIdByName(displayName)];
                case 6:
                    targetNonprofitId = _b.sent();
                    if (!targetNonprofitId) {
                        console.warn("  - Skipping ".concat(displayName, " - Nonprofit ID not found."));
                        nonprofitsNotFound++;
                        return [3 /*break*/, 13];
                    }
                    if (targetNonprofitId === sourceNonprofitId) {
                        console.log("  - Skipping ".concat(displayName, " - Target is the same as source."));
                        return [3 /*break*/, 13];
                    }
                    nonprofitsProcessed++;
                    console.log("  - Found target nonprofit ID: ".concat(targetNonprofitId, ". Copying tiers..."));
                    targetTierCollection = nonprofitsCollection.doc(targetNonprofitId).collection('membershipTiers');
                    tiersCopiedForThisNonprofit = 0;
                    _a = 0, sourceTiers_1 = sourceTiers;
                    _b.label = 7;
                case 7:
                    if (!(_a < sourceTiers_1.length)) return [3 /*break*/, 12];
                    sourceTierDoc = sourceTiers_1[_a];
                    tierId = sourceTierDoc.id;
                    tierData = sourceTierDoc.data();
                    _b.label = 8;
                case 8:
                    _b.trys.push([8, 10, , 11]);
                    console.log("    - Copying tier ID: ".concat(tierId));
                    return [4 /*yield*/, targetTierCollection.doc(tierId).set(tierData)];
                case 9:
                    _b.sent(); // Use set to overwrite
                    tiersCopiedForThisNonprofit++;
                    return [3 /*break*/, 11];
                case 10:
                    error_3 = _b.sent();
                    console.error("    - Failed to copy tier ID: ".concat(tierId, " to ").concat(displayName, ":"), error_3);
                    return [3 /*break*/, 11];
                case 11:
                    _a++;
                    return [3 /*break*/, 7];
                case 12:
                    console.log("  - Finished copying ".concat(tiersCopiedForThisNonprofit, " tiers to ").concat(displayName, "."));
                    totalTiersCopied += tiersCopiedForThisNonprofit;
                    _b.label = 13;
                case 13:
                    _i++;
                    return [3 /*break*/, 5];
                case 14:
                    console.log("\nScript finished. Processed ".concat(nonprofitsProcessed, " target nonprofits (skipped ").concat(nonprofitsNotFound, "). Copied ").concat(totalTiersCopied, " tiers in total."));
                    return [2 /*return*/];
            }
        });
    });
}
// --- Run Script ---
copyMembershipTiers().catch(function (error) {
    console.error('Unhandled error in main script execution:', error);
});
