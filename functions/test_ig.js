async function test() {
    const accessToken = "EAAOLZAZCsZChK0BSIyBnrvDh6BpFLKaWPkIQOYJBc2kLrac8NPsyaKc0KwYcEktkBwEx7eYBnCaxZCzQSCRMhptBBMPWjHKuOUF7UY1hNKNwtjL79CwlUpH21hDAaM1orzq0IxSLtpfBOVtEbrnJxOjBve7pa6SEycY08gVFcPzo9QNQzxg7o3y2EoUVCDJ1Syko8ZAv0";
    const igAccountId = "17841406986135986";
    const url = `https://graph.facebook.com/v20.0/${igAccountId}/media?fields=id,media_url,permalink,media_type&limit=15&access_token=${accessToken}`;
    console.log("Fetching...");
    const response = await fetch(url);
    const feedData = await response.json();
    console.log(JSON.stringify(feedData, null, 2));
}
test();
