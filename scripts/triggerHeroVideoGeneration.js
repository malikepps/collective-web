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
// List of Nonprofit Display Names to trigger
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
// --- Main Logic ---
function triggerHeroGeneration() {
    return __awaiter(this, void 0, void 0, function () {
        var updatedToFalse, updatedToTrue, notFoundCount, _i, nonprofitDisplayNames_1, displayName, snapshot, nonprofitDoc, error_1, _a, nonprofitDisplayNames_2, displayName, snapshot, nonprofitDoc, error_2;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log('Starting script to trigger hero video generation (two-step update)...');
                    updatedToFalse = 0;
                    updatedToTrue = 0;
                    notFoundCount = 0;
                    // --- Step 1: Set all to False first ---
                    console.log('\n--- Step 1: Setting rerender_hero to false for all nonprofits ---');
                    _i = 0, nonprofitDisplayNames_1 = nonprofitDisplayNames;
                    _c.label = 1;
                case 1:
                    if (!(_i < nonprofitDisplayNames_1.length)) return [3 /*break*/, 9];
                    displayName = nonprofitDisplayNames_1[_i];
                    console.log("Processing (Step 1: False): ".concat(displayName));
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 7, , 8]);
                    return [4 /*yield*/, nonprofitsCollection.where('display_name', '==', displayName).limit(1).get()];
                case 3:
                    snapshot = _c.sent();
                    if (snapshot.empty) {
                        console.warn("  - No nonprofit found with display_name: ".concat(displayName, ". Skipping."));
                        notFoundCount++; // Count only once
                        return [3 /*break*/, 8];
                    }
                    nonprofitDoc = snapshot.docs[0];
                    if (!(((_b = nonprofitDoc.data()) === null || _b === void 0 ? void 0 : _b.rerender_hero) !== false)) return [3 /*break*/, 5];
                    return [4 /*yield*/, nonprofitDoc.ref.update({ rerender_hero: false })];
                case 4:
                    _c.sent();
                    console.log("  - Set rerender_hero = false for ".concat(displayName, " (ID: ").concat(nonprofitDoc.id, ")."));
                    updatedToFalse++;
                    return [3 /*break*/, 6];
                case 5:
                    console.log("  - rerender_hero already false for ".concat(displayName, " (ID: ").concat(nonprofitDoc.id, "). Skipping update."));
                    _c.label = 6;
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_1 = _c.sent();
                    console.error("  - Error setting flag to false for ".concat(displayName, ":"), error_1);
                    return [3 /*break*/, 8];
                case 8:
                    _i++;
                    return [3 /*break*/, 1];
                case 9:
                    console.log("--- Step 1 Finished: Set ".concat(updatedToFalse, " flags to false ---"));
                    // --- Step 2: Set all to True ---
                    console.log('\n--- Step 2: Setting rerender_hero to true for all nonprofits ---');
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
                case 10:
                    _c.sent(); // Small delay to ensure writes propagate
                    _a = 0, nonprofitDisplayNames_2 = nonprofitDisplayNames;
                    _c.label = 11;
                case 11:
                    if (!(_a < nonprofitDisplayNames_2.length)) return [3 /*break*/, 17];
                    displayName = nonprofitDisplayNames_2[_a];
                    console.log("Processing (Step 2: True): ".concat(displayName));
                    _c.label = 12;
                case 12:
                    _c.trys.push([12, 15, , 16]);
                    return [4 /*yield*/, nonprofitsCollection.where('display_name', '==', displayName).limit(1).get()];
                case 13:
                    snapshot = _c.sent();
                    if (snapshot.empty) {
                        // Already warned in step 1
                        return [3 /*break*/, 16];
                    }
                    nonprofitDoc = snapshot.docs[0];
                    console.log("  - Setting rerender_hero = true for ".concat(displayName, " (ID: ").concat(nonprofitDoc.id, ")."));
                    return [4 /*yield*/, nonprofitDoc.ref.update({ rerender_hero: true })];
                case 14:
                    _c.sent();
                    console.log("  - Successfully set rerender_hero = true for ".concat(displayName, " (ID: ").concat(nonprofitDoc.id, ")."));
                    updatedToTrue++;
                    return [3 /*break*/, 16];
                case 15:
                    error_2 = _c.sent();
                    console.error("  - Error setting flag to true for ".concat(displayName, ":"), error_2);
                    return [3 /*break*/, 16];
                case 16:
                    _a++;
                    return [3 /*break*/, 11];
                case 17:
                    console.log("\nScript finished. Set ".concat(updatedToFalse, " flags to false, then set ").concat(updatedToTrue, " flags to true. Could not find ").concat(notFoundCount, " nonprofits."));
                    return [2 /*return*/];
            }
        });
    });
}
// --- Run Script ---
triggerHeroGeneration().catch(function (error) {
    console.error('Unhandled error in main script execution:', error);
});
