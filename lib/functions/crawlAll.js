const db = require("../helpers/db");
const request = require("../helpers/request");

class CrawlAll {
    crawlAll() {
        return new Promise((resolve, reject) => {
            db.getAllMainWebsites()
            .then((data) => {
                const promises = [];
                console.time("timer");
                this._sendRequests(data, 40)
                // don't wait for the responses..
                .then(() => {
                    console.timeEnd("timer");
                    resolve();
                })
                .catch((e) => {
                    console.log(e);
                    console.timeEnd("timer");
                    resolve();
                })

            })
            .catch(reject);
        });
    }
    _sendRequests(data, num_of_requests, skip = 0) {
        const len = skip + num_of_requests > data.length ? data.length : num_of_requests + skip;
        return new Promise((resolve, reject) => {
            const promises = [];
            for(let i = skip; i < len; i++) {
                console.log(`starting ${data[i]}`);
                const p = request.sendRequestToInnerFunction("crawl", { url: decodeURIComponent(data[i]) });
                promises.push(p);
            }
            Promise.all(promises)
            .then(() => {
                if(len === data.length) {
                    resolve();
                } else {
                    setTimeout(() => {
                        this._sendRequests(data, num_of_requests, skip + num_of_requests)
                        .then(resolve)
                        .catch(reject);
                    }, 2000);
                }
            })
            .catch(reject);
        })
    }
}   

module.exports = new CrawlAll();