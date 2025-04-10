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
// List of Nonprofit Display Names to process
var nonprofitDisplayNames = [
    "DurhamCares", // Manager for special user
    "Echo NC", // Manager for special user
    "LGBTQ Center of Durham", // Manager for special user
    "Leadership Triangle",
    "Living with Autism",
    "Meals on Wheels Durham",
    "Oak City Cares",
    "A Place At The Table Cafe",
    "Bike Durham"
];
// User ID requiring special handling
var specialManagerUserId = 'nbWN14A9CKSPYaifWpznpMSIGAm2';
// Mapping of User IDs to desired Roles (excluding the special user)
var userRoles = {
    'k1ZQEU6lbveRBWw3ScLRwjbnhu22': 'community',
    'vYIFgGL4itPY67p3eM5loxpLsTo2': 'member',
    'riiKOJs3acQxWgrAcKr8lRNhCtA3': 'manager',
    // 'nbWN14A9CKSPYaifWpznpMSIGAm2': 'manager', // Handled separately
    'kmUc1kQnOHeqfdxiPyVDe4Sx9Ov1': 'manager',
    '5XjApaorWcR9c7w1Y79abBVUC3k1': 'community',
    'BaZMg5hj4xVc6JFmu8oHLu4QFEU2': 'member',
    'ZYGFh0HwsuhZLwklsdt8s13TANW2': 'community',
    'Z5VxDjX7uSXxFPoyEqARNv7eTVm1': 'community'
};
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
var usersCollection = db.collection('users');
var relationshipsCollection = db.collection('user_nonprofit_relationships');
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
// --- Function to create relationship data based on role ---
function createRelationshipData(userId, nonprofitId, role) {
    var isManager = role === 'manager';
    var isMember = role === 'member' || role === 'manager'; // Managers are also members
    var isCommunity = role === 'community' || isMember; // Members/Managers are also in community
    return {
        user: usersCollection.doc(userId),
        nonprofit: nonprofitsCollection.doc(nonprofitId),
        is_manager: isManager,
        is_member: isMember,
        is_community: isCommunity,
        is_active: true, // Assume active
        created_time: admin.firestore.FieldValue.serverTimestamp(),
        display_filter: role // Set display_filter directly to role
    };
}
// --- Main Logic ---
function createRelationships() {
    return __awaiter(this, void 0, void 0, function () {
        var relationshipsCreated, nonprofitsProcessed, nonprofitsNotFound, managerNonprofits, _i, nonprofitDisplayNames_1, displayName, nonprofitId, _a, _b, _c, _d, userId, role, relationshipId, relationshipData, error_2, userId, isManagerNonprofit, role, relationshipId, relationshipData, error_3;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    console.log('Starting script to create user-nonprofit relationships...');
                    relationshipsCreated = 0;
                    nonprofitsProcessed = 0;
                    nonprofitsNotFound = 0;
                    managerNonprofits = nonprofitDisplayNames.slice(0, 3);
                    _i = 0, nonprofitDisplayNames_1 = nonprofitDisplayNames;
                    _e.label = 1;
                case 1:
                    if (!(_i < nonprofitDisplayNames_1.length)) return [3 /*break*/, 14];
                    displayName = nonprofitDisplayNames_1[_i];
                    console.log("\nProcessing nonprofit: ".concat(displayName));
                    return [4 /*yield*/, findNonprofitIdByName(displayName)];
                case 2:
                    nonprofitId = _e.sent();
                    if (!nonprofitId) {
                        console.warn("  - Skipping ".concat(displayName, " - Nonprofit ID not found."));
                        nonprofitsNotFound++;
                        return [3 /*break*/, 13];
                    }
                    nonprofitsProcessed++;
                    console.log("  - Found nonprofit ID: ".concat(nonprofitId, ". Creating relationships..."));
                    _a = userRoles;
                    _b = [];
                    for (_c in _a)
                        _b.push(_c);
                    _d = 0;
                    _e.label = 3;
                case 3:
                    if (!(_d < _b.length)) return [3 /*break*/, 8];
                    _c = _b[_d];
                    if (!(_c in _a)) return [3 /*break*/, 7];
                    userId = _c;
                    role = userRoles[userId];
                    relationshipId = "".concat(userId, ":").concat(nonprofitId);
                    relationshipData = createRelationshipData(userId, nonprofitId, role);
                    _e.label = 4;
                case 4:
                    _e.trys.push([4, 6, , 7]);
                    console.log("    - Creating/updating relationship for User: ".concat(userId, " -> Role: ").concat(role, " (Doc ID: ").concat(relationshipId, ")"));
                    return [4 /*yield*/, relationshipsCollection.doc(relationshipId).set(relationshipData, { merge: true })];
                case 5:
                    _e.sent();
                    relationshipsCreated++;
                    return [3 /*break*/, 7];
                case 6:
                    error_2 = _e.sent();
                    console.error("    - Failed to create/update relationship for User: ".concat(userId, ", Nonprofit: ").concat(nonprofitId, ":"), error_2);
                    return [3 /*break*/, 7];
                case 7:
                    _d++;
                    return [3 /*break*/, 3];
                case 8:
                    userId = specialManagerUserId;
                    isManagerNonprofit = managerNonprofits.includes(displayName);
                    role = isManagerNonprofit ? 'manager' : 'community';
                    relationshipId = "".concat(userId, ":").concat(nonprofitId);
                    relationshipData = createRelationshipData(userId, nonprofitId, role);
                    _e.label = 9;
                case 9:
                    _e.trys.push([9, 11, , 12]);
                    console.log("    - Creating/updating relationship for User: ".concat(userId, " -> Role: ").concat(role, " (Doc ID: ").concat(relationshipId, ")"));
                    return [4 /*yield*/, relationshipsCollection.doc(relationshipId).set(relationshipData, { merge: true })];
                case 10:
                    _e.sent();
                    relationshipsCreated++; // Count this relationship as well
                    return [3 /*break*/, 12];
                case 11:
                    error_3 = _e.sent();
                    console.error("    - Failed to create/update relationship for User: ".concat(userId, ", Nonprofit: ").concat(nonprofitId, ":"), error_3);
                    return [3 /*break*/, 12];
                case 12:
                    console.log("  - Finished relationships for ".concat(displayName, "."));
                    _e.label = 13;
                case 13:
                    _i++;
                    return [3 /*break*/, 1];
                case 14:
                    console.log("\nScript finished. Processed ".concat(nonprofitsProcessed, " nonprofits (skipped ").concat(nonprofitsNotFound, "). Created/updated ").concat(relationshipsCreated, " relationships in total."));
                    return [2 /*return*/];
            }
        });
    });
}
// --- Run Script ---
createRelationships().catch(function (error) {
    console.error('Unhandled error in main script execution:', error);
});
