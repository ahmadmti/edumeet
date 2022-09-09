"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const APP_NAME = 'edumeet-server';
class Logger {
    constructor(prefix) {
        if (prefix) {
            this._debug = (0, debug_1.default)(`${APP_NAME}:${prefix}`);
            this._info = (0, debug_1.default)(`${APP_NAME}:INFO:${prefix}`);
            this._warn = (0, debug_1.default)(`${APP_NAME}:WARN:${prefix}`);
            this._error = (0, debug_1.default)(`${APP_NAME}:ERROR:${prefix}`);
        }
        else {
            this._debug = (0, debug_1.default)(APP_NAME);
            this._info = (0, debug_1.default)(`${APP_NAME}:INFO`);
            this._warn = (0, debug_1.default)(`${APP_NAME}:WARN`);
            this._error = (0, debug_1.default)(`${APP_NAME}:ERROR`);
        }
        /* eslint-disable no-console */
        this._debug.log = console.info.bind(console);
        this._info.log = console.info.bind(console);
        this._warn.log = console.warn.bind(console);
        this._error.log = console.error.bind(console);
        /* eslint-enable no-console */
    }
    get debug() {
        return this._debug;
    }
    get info() {
        return this._info;
    }
    get warn() {
        return this._warn;
    }
    get error() {
        return this._error;
    }
}
exports.default = Logger;
//# sourceMappingURL=Logger.js.map