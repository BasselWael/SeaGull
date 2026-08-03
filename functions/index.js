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
        const configDoc = await db.collection("config").doc("instagram").get();
        if (!configDoc.exists) {
            console.error("No Instagram configuration found.");
            return;
        }
        
        const data = configDoc.data();
        let accessToken = data.access_token;
        const lastRefresh = data.last_refresh ? data.last_refresh.toDate() : new Date(0);
        
        // Refresh token if older than 30 days
        const daysSinceRefresh = (Date.now() - lastRefresh.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceRefresh > 30) {
            const refreshUrl = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${accessToken}`;
            const refreshRes = await fetch(refreshUrl);
            const refreshData = await refreshRes.json();
            if (refreshData.access_token) {
                accessToken = refreshData.access_token;
                await db.collection("config").doc("instagram").update({
                    access_token: accessToken,
                    last_refresh: new Date()
                });
                console.log("Instagram access token refreshed.");
            } else {
                console.error("Failed to refresh token:", refreshData);
            }
        }

        // Fetch feed
        const url = `https://graph.instagram.com/me/media?fields=id,media_url,permalink,media_type&limit=6&access_token=${accessToken}`;
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
