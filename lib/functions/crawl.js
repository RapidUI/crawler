const events = require("../helpers/events");
require("../helpers/db");

const links = {};

function crawl(url) {
  return new Promise((resolve, reject) => {
    try {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

      var Crawler = require("simplecrawler");

      var crawler = new Crawler(url);

      crawler.on("fetchcomplete", function(
        queueItem,
        responseBuffer,
        response
      ) {
        if (!links[queueItem.url] && -1 === queueItem.url.indexOf("#")) {
          links[queueItem.url] = true;
          events.emit("add_link", queueItem.url);
        }
      });

      crawler.on("complete", () => {
        resolve();
      });

      crawler.on("fetcherror", (queueItem, responseObject) => {
        reject(queueItem, responseObject);
      });

      crawler.maxDepth = 3;

      crawler.allowInitialDomainChange = true;

      crawler.maxResourceSize = 10000000;

      crawler.ignoreInvalidSSL = true;

      crawler.supportedMimeTypes = [
        "text/html",
        "text/html; charset=UTF-8",
        "text/html; charset=utf-8",
        "text/html; charset=utf8",
        "text/html; charset=ISO-8859-1"
      ];
      crawler.downloadUnsupported = false;
      crawler.respectRobotsTxt = false;

      crawler.start();
    } catch (err) {
      reject(err);
    }

    events.on("added_link", url => {
      // do nothing
    });

    events.on("error", (url, error) => {
      const err = {
        url,
        error
      };
      console.log(JSON.stringify(err));
      links[url] = false;
      // will try again if possible
    });
  });
}

function checkIfDone() {
  return 0 === Object.keys(links).length;
}

module.exports = crawl;