import * as functionsV1 from "firebase-functions/v1";
import * as admin from "firebase-admin";
import puppeteer from "puppeteer";

// Utility to determine text color
const getTextColor = (hexColor: string): string => {
    if (!hexColor) return "rgba(255, 255, 255, 0.7)"; // Default white-ish
    const hex = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;
    if (hex.length !== 6) return "rgba(255, 255, 255, 0.7)";
    try {
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        // Using perceived luminance formula
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 150 ? "rgba(0, 0, 0, 0.7)" : "rgba(255, 255, 255, 0.7)";
    } catch (e) {
        console.error("Error determining text color from hex:", hex, e);
        return "rgba(255, 255, 255, 0.7)"; // Fallback on error
    }
};

// Utility to calculate darker shade for gradient
const darkenColor = (hexColor: string, amount: number = 0.2): string => {
    if (!hexColor) return "000000"; // Default black if no color provided
    const hex = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;
    if (hex.length !== 6) return "000000"; // Default black if invalid hex
    try {
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);
        r = Math.max(0, Math.floor(r * (1 - amount))); // Ensure values don't go below 0
        g = Math.max(0, Math.floor(g * (1 - amount)));
        b = Math.max(0, Math.floor(b * (1 - amount)));
        return `${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    } catch (e) {
        console.error("Error darkening color hex:", hex, e);
        return "000000"; // Fallback on error
    }
};

// --- Generate Text Post Image Function ---
// Increase memory and timeout for Puppeteer using v1 syntax
export const generateTextPostImage = functionsV1
    .runWith({ memory: '1GB', timeoutSeconds: 120 }) // Use functionsV1
    .https.onCall(async (data: { title: string; organizationId: string }, context: functionsV1.https.CallableContext) => {
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
        const themeId = orgData?.themeId;
        let themePrimaryColor = "#2E5C8A"; // Default fallback (Collective Blue)

        if (themeId) {
            const themeDocRef = admin.firestore().doc(`themes/${themeId}`);
            const themeDoc = await themeDocRef.get();
            if (themeDoc.exists && themeDoc.data()?.primaryColor) {
                 const colorFromDb = themeDoc.data()?.primaryColor;
                 themePrimaryColor = colorFromDb.startsWith('#') ? colorFromDb : `#${colorFromDb}`;
            } else {
                console.warn(`Theme document ${themeId} not found or missing primaryColor for org ${organizationId}. Using default.`);
            }
        } else {
            console.warn(`No themeId found for organization ${organizationId}. Using default color.`);
        }

        const backgroundColorHex = themePrimaryColor.startsWith('#') ? themePrimaryColor.slice(1) : themePrimaryColor;
        const darkerShade = darkenColor(backgroundColorHex, 0.2);
        const textColorRgba = getTextColor(themePrimaryColor);

        const titleLength = title.trim().length;
        let fontSizePx: number;
        if (titleLength < 80) fontSizePx = 100;
        else if (titleLength < 120) fontSizePx = 80;
        else if (titleLength < 160) fontSizePx = 70;
        else fontSizePx = 60;

        const htmlContent = `
            <html>
            <head>
                <style>
                    @font-face {
                        font-family: 'Marfa';
                        /* Updated path and filename, removed ttf */
                        src: url('./fonts/ABCMarfa-Semibold-Trial.woff2') format('woff2');
                        font-weight: 600;
                        font-style: normal;
                        font-display: swap;
                    }
                    body {
                        margin: 0;
                        width: 1080px;
                        height: 1350px;
                        background: linear-gradient(to bottom, #${darkerShade}, ${themePrimaryColor});
                        display: flex;
                        align-items: center; /* Center vertically */
                        justify-content: flex-start; /* Align content to the left */
                        box-sizing: border-box;
                        font-family: 'Marfa', sans-serif; /* Use Marfa */
                        overflow: hidden; /* Prevent potential scrollbars */
                    }
                    .title-container {
                        width: 100%;
                        padding: 60px; /* Generous padding */
                        box-sizing: border-box;
                    }
                    .title {
                        font-weight: 600; /* Semibold */
                        font-size: ${fontSizePx}px;
                        color: ${textColorRgba}; /* Has opacity */
                        text-align: left;
                        line-height: 1.2; /* Adjust line height for readability */
                        /* Optional shadow for light text on light background */
                        ${textColorRgba.startsWith('rgba(255') ? 'text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);' : ''}
                        /* Prevent text overflowing the container */
                        word-wrap: break-word; /* Allow long words to break */
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

        console.log("Launching Puppeteer...");
        browser = await puppeteer.launch({
             args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--font-render-hinting=none'
            ]
        });
        const page = await browser.newPage();
        console.log("Puppeteer launched.");

        await page.setViewport({ width: 1080, height: 1350 });
        console.log("Setting HTML content...");
        await page.setContent(htmlContent, { waitUntil: ['networkidle0', 'domcontentloaded'] });
        console.log("HTML content set.");

        console.log("Taking screenshot...");
        const screenshotBuffer = await page.screenshot({
            type: 'jpeg',
            quality: 90,
            clip: { x: 0, y: 0, width: 1080, height: 1350 }
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

        const imageUrl = file.publicUrl();
        console.log("Generated image URL:", imageUrl);

        return { imageUrl, backgroundColorHex };

    } catch (error: any) {
        console.error("Error generating text post image:", error);
        const errorCode = error instanceof functionsV1.https.HttpsError ? error.code : "internal";
        const errorMessage = error instanceof functionsV1.https.HttpsError ? error.message : (error as Error).message;
        const errorDetails = error instanceof functionsV1.https.HttpsError ? error.details : undefined;
        throw new functionsV1.https.HttpsError(errorCode, `Failed to generate image: ${errorMessage}`, errorDetails);
    } finally {
        if (browser) {
            console.log("Closing Puppeteer browser...");
            await browser.close();
            console.log("Browser closed.");
        }
    }
}); 