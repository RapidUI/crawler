const request = require("request");
const co = require("co");
const htmlToJson = require("html-to-json");
const db = require("../../helpers/db");
const NOT_ALLOWED_CHARS = ["\\n", "\\t"];

class GetWordsClassification {
    constructor(url) {
        this._url = url;
    }

    getAllWordsClassification() {
        return co(function* () {
            const html = yield this._getWebsiteHtml();
            return yield this._getWordClassification(html);
        }.bind(this));
    }

    addWordsClassificationsToDB(wordClassification) {
        db.addValue("ai_data/words", wordClassification);
    }

    _getWordClassification(html) {
        return new Promise((resolve) => {
            htmlToJson.parse(html, (data) => {
                const returnValue = [];
                const promises = [];
                const htmlParent = this._findElements(data, "html");
                if (htmlParent) {
                    const body = this._findBody(htmlParent);
                    promises.push(this._findAllMenuItems(body));
                    promises.push(this._findPlaceHolders(body));
                    promises.push(this._findButtons(body));
                    Promise.all(promises)
                        .then((values) => {
                            values.forEach((value) => returnValue.push(...value));
                            resolve(returnValue);
                        });
                } else {
                    console.error(`there was no html tag in the ${this._url} text`);
                    resolve([]);
                }
            })
        })
    }

    _findAllMenuItems(body) {
        return new Promise((resolve) => {
            const menuItems = [];
            const uls = this._findElements([body], "ul");
            const lis = this._findElements(uls, "li");
            const as = this._findElements(lis, "a");
            as.forEach((a) => {
                if (a.children[0] && a.children[0].type === "text" && a.children[0].data) {
                    const text = a.children[0].data.trim();
                    if (this._filterText(text)) {
                        menuItems.push({
                            value: text,
                            type: "menuItem"
                        });
                    }
                }
            });
            resolve(menuItems);
        })
    }

    _filterText(text) {
        NOT_ALLOWED_CHARS.forEach((char) => {
            if (-1 !== text.indexOf(char)) {
                return false;
            }
        })
        return text !== "";
    }

    _getWebsiteHtml() {
        return new Promise((resolve, reject) => {
            request(this._url, null, (err, data, body) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(body);
                }
            });
        })
    }

    _findHtmlHeader(htmlJson) {
        const nodes = [htmlJson];
        while (nodes.length !== 0) {
            const currNode = nodes.pop();
            if ("html" === currNode.tagName) {
                return currNode;
            } else if (currNode.children) {
                nodes.push(...currNode.children);
            }
        }
        return null;
    }

    _findBody(html) {
        for (let i = 0; i < html.children.length; i++) {
            if ("body" === html.children[i].tagName) {
                return html.children[i];
            }
        }
    }

    _findElements(elements, tagName) {
        const nodes = [...elements];
        const elementsToReturn = []
        while (nodes.length !== 0) {
            const node = nodes.pop();
            if (node.tagName && tagName === node.tagName) {
                elementsToReturn.push(node);
            }
            if (node.children) {
                nodes.push(...node.children);
            }
        }
        return elementsToReturn;
    }

    _findPlaceHolders(body) {
        return new Promise((resolve) => {
            const placeholders = [];
            const inputs = this._findElements([body], "input");
            inputs.forEach((input) => {
                if (input.attribs && input.attribs.placeholder) {
                    placeholders.push({
                        value: input.attribs.placeholder,
                        type: "placeholder",
                        inputType: input.attribs.type
                    });
                }
            })
            resolve(placeholders);
        })

    }

    _findButtons(body) {
        return new Promise((resolve) => {
            const buttonsToReturn = [];
            const buttons = this._findElements([body], "button");
            let inputs = this._findElements([body], "input");
            inputs = inputs.filter((input) => input.attribs.type === "button");
            buttons.push(...inputs);
            const texts = this._findTexts(buttons);
            texts.forEach((text) => {
                text = text.trim();
                if (this._filterText(text)) {
                    buttonsToReturn.push({
                        value: text,
                        type: "button"
                    });
                }
            });
            resolve(buttonsToReturn);
        })
    }

    _findTexts(elements) {
        const texts = [];
        elements.forEach((element) => {
            let text;
            if (text = this._findTextOfElement(element)) {
                texts.push(text);
            }
        })
        return texts;
    }

    _findTextOfElement(element) {
        const nodes = [element];
        while (nodes.length !== 0) {
            const currNode = nodes.pop();
            if (currNode.data) {
                return currNode.data;
            } else if (currNode.children) {
                nodes.push(...currNode.children);
            }
        }
        return null;
    }

}

module.exports = GetWordsClassification;