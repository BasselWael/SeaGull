const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const fetch = require("node-fetch");

initializeApp();
const db = getFirestore();

async function performInstagramSync() {
    const accessToken = "EAAOLZAZCsZChK0BSIyBnrvDh6BpFLKaWPkIQOYJBc2kLrac8NPsyaKc0KwYcEktkBwEx7eYBnCaxZCzQSCRMhptBBMPWjHKuOUF7UY1hNKNwtjL79CwlUpH21hDAaM1orzq0IxSLtpfBOVtEbrnJxOjBve7pa6SEycY08gVFcPzo9QNQzxg7o3y2EoUVCDJ1Syko8ZAv0";
    const igAccountId = "17841406986135986";

    const url = `https://graph.facebook.com/v20.0/${igAccountId}/media?fields=id,media_url,permalink,media_type&limit=15&access_token=${accessToken}`;
    const response = await fetch(url);
    const feedData = await response.json();

    if (feedData.data) {
        const feed = feedData.data.filter(item => item.media_type === "IMAGE" || item.media_type === "CAROUSEL_ALBUM" || item.media_type === "VIDEO").slice(0, 6);
        await db.collection("public").doc("instagram_feed").set({
            feed: feed,
            updatedAt: new Date()
        });
        console.log("Successfully updated instagram feed!");
        return true;
    } else {
        console.error("Error fetching feed:", feedData);
        throw new Error("Failed to fetch feed data from Instagram");
    }
}

// Scheduled sync every 6 hours
exports.syncInstagramFeed = onSchedule("every 6 hours", async (event) => {
    try {
        await performInstagramSync();
    } catch (error) {
        console.error("Exception during scheduled Instagram sync:", error);
    }
});

// Callable sync for admins to trigger manually
exports.forceSyncInstagramFeed = onCall(async (request) => {
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "You must be logged in to sync the feed.");
    }
    
    try {
        await performInstagramSync();
        return { success: true, message: "Instagram feed updated successfully." };
    } catch (error) {
        console.error("Exception during manual Instagram sync:", error);
        throw new HttpsError("internal", "Failed to sync Instagram feed.");
    }
});
