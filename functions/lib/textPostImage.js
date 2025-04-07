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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTextPostImage = void 0;
const functionsV1 = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const chrome_aws_lambda_1 = __importDefault(require("chrome-aws-lambda"));
// Utility to determine text color
const getTextColor = (hexColor) => {
    if (!hexColor)
        return "rgba(255, 255, 255, 0.7)"; // Default white-ish
    const hex = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;
    if (hex.length !== 6)
        return "rgba(255, 255, 255, 0.7)";
    try {
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        // Using perceived luminance formula
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 150 ? "rgba(0, 0, 0, 0.7)" : "rgba(255, 255, 255, 0.7)";
    }
    catch (e) {
        console.error("Error determining text color from hex:", hex, e);
        return "rgba(255, 255, 255, 0.7)"; // Fallback on error
    }
};
// Utility to calculate darker shade for gradient
const darkenColor = (hexColor, amount = 0.2) => {
    if (!hexColor)
        return "000000"; // Default black if no color provided
    const hex = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;
    if (hex.length !== 6)
        return "000000"; // Default black if invalid hex
    try {
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);
        r = Math.max(0, Math.floor(r * (1 - amount))); // Ensure values don't go below 0
        g = Math.max(0, Math.floor(g * (1 - amount)));
        b = Math.max(0, Math.floor(b * (1 - amount)));
        return `${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    catch (e) {
        console.error("Error darkening color hex:", hex, e);
        return "000000"; // Fallback on error
    }
};
// --- Generate Text Post Image Function ---
// Increase memory and timeout for Puppeteer using v1 syntax
exports.generateTextPostImage = functionsV1
    .runWith({ memory: '1GB', timeoutSeconds: 120 })
    .https.onCall(async (data, context) => {
    var _a, _b;
    if (!context.auth) {
        throw new functionsV1.https.HttpsError("unauthenticated", "User must be logged in.");
    }
    const userId = context.auth.uid;
    const { title, organizationId } = data;
    if (!title || typeof title !== 'string' || title.trim() === "") {
        throw new functionsV1.https.HttpsError("invalid-argument", "Missing or invalid title.");
    }
    if (!organizationId || typeof organizationId !== 'string') {
        throw new functionsV1.https.HttpsError("invalid-argument", "Missing or invalid organizationId.");
    }
    let browser = null;
    try {
        // 1. Fetch Organization Theme
        const orgDocRef = admin.firestore().doc(`nonprofits/${organizationId}`);
        const orgDoc = await orgDocRef.get();
        if (!orgDoc.exists) {
            throw new functionsV1.https.HttpsError("not-found", `Organization ${organizationId} not found.`);
        }
        const orgData = orgDoc.data();
        const theme_id = orgData === null || orgData === void 0 ? void 0 : orgData.theme_id;
        let themePrimaryColor = "#2E5C8A"; // Default fallback (Collective Blue)
        if (theme_id) {
            const themeDocRef = admin.firestore().doc(`themes/${theme_id}`);
            const themeDoc = await themeDocRef.get();
            if (themeDoc.exists && ((_a = themeDoc.data()) === null || _a === void 0 ? void 0 : _a.primary_color)) {
                const colorFromDb = (_b = themeDoc.data()) === null || _b === void 0 ? void 0 : _b.primary_color;
                themePrimaryColor = colorFromDb.startsWith('#') ? colorFromDb : `#${colorFromDb}`;
            }
            else {
                console.warn(`Theme document ${theme_id} not found or missing primary_color. Using default.`);
            }
        }
        else {
            console.warn(`No theme_id found for organization ${organizationId}. Using default color.`);
        }
        const backgroundColorHex = themePrimaryColor.startsWith('#') ? themePrimaryColor.slice(1) : themePrimaryColor;
        const darkerShade = darkenColor(backgroundColorHex, 0.2);
        const textColorRgba = getTextColor(themePrimaryColor);
        const titleLength = title.trim().length;
        let fontSizePx;
        if (titleLength < 80)
            fontSizePx = 150;
        else if (titleLength < 120)
            fontSizePx = 120;
        else if (titleLength < 160)
            fontSizePx = 100;
        else
            fontSizePx = 90;
        const htmlContent = `
            <html>
            <head>
                <style>
                    @font-face {
                        font-family: 'Marfa';
                        src: url('https://firebasestorage.googleapis.com/v0/b/collective-rp8rwq.appspot.com/o/public_fonts%2FABCMarfa-Semibold-Trial.woff2?alt=media&token=e7839412-c2c6-4baa-9291-f6b716410681') format('woff2'); /* Use public URL */
                        font-weight: 600;
                        font-style: normal;
                        font-display: swap;
                    }
                    body {
                        margin: 0;
                        width: 1080px;
                        height: 1080px; /* Changed height for square */
                        background: linear-gradient(to bottom, #${darkerShade}, ${themePrimaryColor});
                        font-family: 'Marfa', sans-serif;
                        overflow: hidden;
                    }
                    .title-container {
                        width: 100%;
                        height: 100%; /* Make container full height */
                        padding: 80px; /* Increased padding */
                        box-sizing: border-box;
                        display: flex; /* Make container a flex container */
                        align-items: center; /* Vertically center content (the .title div) */
                        justify-content: center; /* Horizontally center content block */
                    }
                    .title {
                        font-weight: 600;
                        font-size: ${fontSizePx}px;
                        color: ${textColorRgba};
                        text-align: left; /* Keep text left-aligned */
                        line-height: 1.15; /* Adjusted line height */
                        width: 100%; /* Ensure title div takes available width */
                        word-wrap: break-word;
                        overflow-wrap: break-word;
                    }
                </style>
            </head>
            <body>
                <div class="title-container">
                    <div class="title">${title}</div>
                </div>
            </body>
            </html>
        `;
        // 4. Launch Puppeteer using chrome-aws-lambda
        console.log("Launching Puppeteer with chrome-aws-lambda...");
        browser = await puppeteer_core_1.default.launch({
            args: chrome_aws_lambda_1.default.args,
            defaultViewport: chrome_aws_lambda_1.default.defaultViewport,
            executablePath: await chrome_aws_lambda_1.default.executablePath,
            headless: chrome_aws_lambda_1.default.headless,
        });
        const page = await browser.newPage();
        console.log("Puppeteer launched.");
        // Set viewport to square (1080x1080)
        await page.setViewport({ width: 1080, height: 1080 });
        console.log("Setting HTML content...");
        await page.setContent(htmlContent, { waitUntil: ['networkidle0', 'domcontentloaded'] });
        console.log("HTML content set.");
        // Wait for fonts to be ready instead of a fixed timeout
        await page.evaluateHandle('document.fonts.ready');
        console.log("Fonts ready.");
        console.log("Taking screenshot...");
        const screenshotBuffer = await page.screenshot({
            type: 'jpeg',
            quality: 90,
            // Clip to square dimensions
            clip: { x: 0, y: 0, width: 1080, height: 1080 }
        });
        console.log("Screenshot taken.");
        const timestamp = Date.now();
        const filePath = `users/${userId}/post_media/text-posts/${timestamp}.jpg`;
        const bucket = admin.storage().bucket();
        const file = bucket.file(filePath);
        console.log(`Uploading screenshot to gs://${bucket.name}/${filePath}...`);
        await file.save(screenshotBuffer, {
            metadata: { contentType: 'image/jpeg' },
        });
        console.log("Screenshot uploaded.");
        // Make the file publicly readable
        await file.makePublic();
        console.log("Made file public.");
        const imageUrl = file.publicUrl();
        console.log("Generated image URL:", imageUrl);
        return { imageUrl, backgroundColorHex };
    }
    catch (error) {
        console.error("Error generating text post image:", error);
        const errorCode = error instanceof functionsV1.https.HttpsError ? error.code : "internal";
        const errorMessage = error instanceof functionsV1.https.HttpsError ? error.message : error.message;
        const errorDetails = error instanceof functionsV1.https.HttpsError ? error.details : undefined;
        throw new functionsV1.https.HttpsError(errorCode, `Failed to generate image: ${errorMessage}`, errorDetails);
    }
    finally {
        if (browser !== null) {
            console.log("Closing Puppeteer browser...");
            await browser.close();
            console.log("Browser closed.");
        }
    }
});
//# sourceMappingURL=textPostImage.js.map