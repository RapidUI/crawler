const db = require("./lib/helpers/db");
const RapidRequest = require("./lib/helpers/request");

db.getAllMainWebsites()
.then((data) => {
    RapidRequest.sendRequestToInnerFunction("crawl", {url: decodeURIComponent(data[0])});
})