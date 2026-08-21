const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
initializeApp({ projectId: "seagull-menu-db-35" });
const db = getFirestore();

async function forceSync() {
    const accessToken = "EAAOLZAZCsZChK0BSIyBnrvDh6BpFLKaWPkIQOYJBc2kLrac8NPsyaKc0KwYcEktkBwEx7eYBnCaxZCzQSCRMhptBBMPWjHKuOUF7UY1hNKNwtjL79CwlUpH21hDAaM1orzq0IxSLtpfBOVtEbrnJxOjBve7pa6SEycY08gVFcPzo9QNQzxg7o3y2EoUVCDJ1Syko8ZAv0";
    const igAccountId = "17841406986135986";
    const url = `https://graph.facebook.com/v20.0/${igAccountId}/media?fields=id,media_url,permalink,media_type&limit=15&access_token=${accessToken}`;
    
    console.log("Fetching live IG feed...");
    const response = await fetch(url);
    const feedData = await response.json();

    if (feedData.data) {
        const feed = feedData.data.filter(item => item.media_type === "IMAGE" || item.media_type === "CAROUSEL_ALBUM").slice(0, 6);
        await db.collection("public").doc("instagram_feed").set({
            feed: feed,
            updatedAt: new Date()
        });
        console.log("Successfully updated instagram feed in Firestore!");
    } else {
        console.error("Error fetching feed:", feedData);
    }
}
forceSync().catch(console.error);
