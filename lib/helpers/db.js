const events = require("./events");
const configs = require("../../configs/configs.json").dev;
const firebase = require("firebase");
const co = require("co");
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

    getAllPages() {
        return new Promise((resolve, reject) => {
            const db = app.database();
            db.ref("all_pages_urls")
            .once("value")
            .then((data) => {
                resolve(data.val());
            })
            .catch(reject);
        });
    }

    writeAllPagesFix() {
        return co(function* (){
            const db = app.database();
            const vals = yield this.getAllPages();
            const values = Object.keys(vals).map(val => vals[val]);
            db.ref("all_pages_urls_array").set(values);
            console.log(values);
        }.bind(this));
    }

    deleteKey(keyName) {
        const db = app.database();
        return db.ref(keyName).remove();
    }

    addValue(keyName, value) {
        const db = app.database();
        if(Array.isArray(value)) {
            value.forEach((val) => {
                db.ref(keyName).push(val);
            });
        } else {
            db.ref(keyName).set(value);
        }
    }
}

module.exports = new DB();