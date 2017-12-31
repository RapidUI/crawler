const events = require("events");
let eventEmitter = null;

class EventEmitter {
    constructor() {
        this._eventEmitter = new events.EventEmitter();
        this._allEvents = [];
    }

    static get instance() {
        if(!eventEmitter) {
            eventEmitter = new EventEmitter();
        }
        return eventEmitter;
    }

    on(eventName, cb) {
        this._eventEmitter.on(eventName, cb);
        this._allEvents.push(eventName);        
    }

    emit(eventName, ...params) {
        this._eventEmitter.emit(eventName, ...params)
    }

    eventNames() {
        return this._allEvents;
    }
}

module.exports = EventEmitter.instance;