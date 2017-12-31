const events = require("./events");
const configs = require("../../configs/configs.json").dev;
const firebase = require("firebase");
let app;

class DB {
    constructor() {
        events.on("add_link", this._addLink);
        app = firebase.initializeApp(configs);
    }

    _addLink(url) {
        const db = app.database();
        db.ref("all_pages_urls")
        .push(url)
        .then((d) => {
            console.log(`added ${url}`);
            events.emit("added_link", url);
        })
        .catch((e) => {
            events.emit("error", url, e);
        })
    }

    getAllMainWebsites() {
        return new Promise((resolve, reject) => {
            const db = app.database();
            db.ref("main_websites_urls")
            .once("value")
            .then((data) => {
                resolve(data.val());
            })
            .catch(reject);
        });
    }
}

module.exports = new DB();