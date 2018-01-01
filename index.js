const app = require("express")();
const bodyParser = require("body-parser");
const { crawl, crawlAll, getWordsClassification } = require("./lib/functions/allFunctions");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.post("/crawl", (req, res) => {
    let { url } = req.body;
    crawl(url)
    .then(() => {
        res.send(`finished crawling ${url}`);
        res.end();
    })
    .catch((err) => {
        res.send(`finished crawling ${url} width errors:
        ${err}
        `);
        res.end();
    })  
});

app.get("/crawlAll", (req, res) => {
    crawlAll.crawlAll()
    .then(() => {
        res.send("began process");
        res.end();
    })
    .catch((err) => {
        res.send(`finished crawling ${url} width errors:
        ${err}
        `);
        res.end();
    })
});

app.post("/ai/words", (req, res) => {
    const { url } = req.body;
    const wordClassification = new getWordsClassification(url);
    wordClassification.getAllWordsClassification()
    .then((words) => {
        if(words.length > 0) {
            wordClassification.addWordsClassificationsToDB(words);
        }
        res.send("success");
        res.end(200);
    })
});

app.get("/ai/words", (req, res) => {
    
})

app.get("/test", (req, res) => {
    res.send("test");
    res.end(200);
})

app.listen("8080");