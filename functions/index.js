const { onSchedule } = require("firebase-functions/v2/scheduler");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const fetch = require("node-fetch");

initializeApp();
const db = getFirestore();

// We will fetch the instagram token from a secured config document
// and save the feed to a public document.
exports.syncInstagramFeed = onSchedule("every 6 hours", async (event) => {
    try {
        // We are hardcoding the permanent access token here to completely bypass the need for Firestore configuration!
        const accessToken = "EAAOLZAZCsZChK0BSIyBnrvDh6BpFLKaWPkIQOYJBc2kLrac8NPsyaKc0KwYcEktkBwEx7eYBnCaxZCzQSCRMhptBBMPWjHKuOUF7UY1hNKNwtjL79CwlUpH21hDAaM1orzq0IxSLtpfBOVtEbrnJxOjBve7pa6SEycY08gVFcPzo9QNQzxg7o3y2EoUVCDJ1Syko8ZAv0";
        const igAccountId = "17841406986135986";

        // Fetch feed using the modern Instagram Graph API (v20.0)
        // With a Long-Lived Page Access Token, token refresh is no longer necessary!
        const url = `https://graph.facebook.com/v20.0/${igAccountId}/media?fields=id,media_url,permalink,media_type&limit=15&access_token=${accessToken}`;
        const response = await fetch(url);
        const feedData = await response.json();
        
        if (feedData.data) {
            const feed = feedData.data.filter(item => item.media_type === "IMAGE" || item.media_type === "CAROUSEL_ALBUM").slice(0, 6);
            await db.collection("public").doc("instagram_feed").set({
                feed: feed,
                updatedAt: new Date()
            });
            console.log("Successfully updated instagram feed!");
        } else {
            console.error("Error fetching feed:", feedData);
        }
    } catch (error) {
        console.error("Exception during Instagram sync:", error);
    }
});

