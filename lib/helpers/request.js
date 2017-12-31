const request = require("request");
const functions = require("../../configs/urls.json");
const env = require("./env").getEnvironment();

class RapidRequest {
    /**
     * @description function will send request to the proper inner rapid function
     * @static
     * @param {string} functionName name of the firebase function
     * @param {any} params params object. the key is the param name, and the value is it's value
     * @memberof RapidRequest
     */
    static sendRequestToInnerFunction(functionName, params) {
        return new Promise((resolve, reject) => {
            if(!functions[env].functions[functionName]) {
                reject(new Error("not valid function name"));                
            } else {
                const config = functions[env].functions[functionName];
                const innerFunctionName = `_send${config.method}InnerFunction`;
                if(!RapidRequest[innerFunctionName]) {
                    reject("method not implemented");
                } else {
                    RapidRequest[innerFunctionName](functionName, params)
                    .then(resolve)
                    .catch(reject);
                }
            }
        })
    }

    static _sendPOSTInnerFunction(functionName, params) {
        const config = functions[env].functions[functionName];
        const body = params;
        const options = {
            method: "POST",
            path: config.path,
            headers: {
                "Content-type" : "application/json"
            },
            json: true,
            body
        }
        const url = `${functions[env].main_url}${config.path}`;        
        return RapidRequest._sendRequest(url, options);
    }

    static _sendGETInnerFunction(functionName, params) {
        // todo: implement
    }

    static _sendPUTInnerFunction(functionName, params) {
        // todo: implement
    }

    static _sendDELETEInnerFunction(functionName, params) {
// todo: implement
    }

    static _sendRequest(url, options) {
        return new Promise((resolve, reject) => {
            request(url, options, (err, response, body) => {
                if(err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(body);
                }
            })
        });
    }

    static sendRequest() {
        // todo: implement
    }
}

module.exports = RapidRequest;