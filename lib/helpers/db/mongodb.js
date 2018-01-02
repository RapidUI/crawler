const mongo = require("mongodb").MongoClient;
let instance = null;
let cb = [];

class MongoDB {
    _connect() {
        return new Promise((resolve, reject) => {
            mongo.connect("mongodb://admin:RapidUiMe2@rapidaicluster-shard-00-00-oazfw.gcp.mongodb.net:27017,rapidaicluster-shard-00-01-oazfw.gcp.mongodb.net:27017,rapidaicluster-shard-00-02-oazfw.gcp.mongodb.net:27017/ai?ssl=true&replicaSet=RapidAICluster-shard-0&authSource=admin", (err, db) => {
                if (err) {
                    reject(err);
                } else {
                    this._db = db.db("ai");
                    resolve();
                }
            })
        })
    }

    static instance() {
        return new Promise((resolve, reject) => {
            if (!instance) {
                instance = new MongoDB();
                instance._connect()
                    .then(() => {
                        cb.forEach((func) => func());
                        resolve(instance);
                    })
                    .catch(reject);
            } else {
                resolve(instance);
            }
        })
    }

    addWord(document) {
        if (!this._db) {
            cb.push(() => { this.addWord(document) });
        } else {
            if (Array.isArray(document)) {
                this._db.collection("words").insertMany(document)
            } else {
                this._db.collection("words").insert(document);
            }
        }
    }
}

module.exports = MongoDB;