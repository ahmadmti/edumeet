"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configDocs = exports.configError = exports.config = exports.configSchema = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const convict_1 = __importDefault(require("convict"));
const convict_format_with_validator_1 = require("convict-format-with-validator");
const json5_1 = __importDefault(require("json5"));
const yaml_1 = __importDefault(require("yaml"));
const toml_1 = __importDefault(require("toml"));
const os_1 = require("os");
const Logger_1 = __importDefault(require("../logger/Logger"));
const userRoles = __importStar(require("../access/roles"));
const access_1 = require("../access/access");
const perms_1 = require("../access/perms");
const logger = new Logger_1.default('config');
// add network interfaces list
const ifaceWhiteListRegex = '^(eth.*)|(ens.*)|(br.*)|(wl.*)|(ww.*)';
// add parsers
convict_1.default.addParser([
    { extension: 'json', parse: JSON.parse },
    { extension: 'json5', parse: json5_1.default.parse },
    { extension: ['yml', 'yaml'], parse: yaml_1.default.parse },
    { extension: 'toml', parse: toml_1.default.parse }
]);
// add formats
function assert(assertion, msg) {
    if (!assertion)
        throw new Error(msg);
}
// add automatic IP detection
function getListenIps() {
    const listenIP = [];
    const ifaces = (0, os_1.networkInterfaces)();
    Object.keys(ifaces).forEach(function (ifname) {
        if (ifname.match(ifaceWhiteListRegex)) {
            ifaces[ifname].forEach(function (iface) {
                if ((iface.family !== 'IPv4' &&
                    (iface.family !== 'IPv6' || iface.scopeid !== 0)) ||
                    iface.internal !== false) {
                    // skip over internal (i.e. 127.0.0.1) and non-ipv4 or ipv6 non global addresses
                    return;
                }
                listenIP.push({ ip: iface.address, announcedIp: null });
            });
        }
    });
    if (listenIP.length === 0) {
        listenIP.push({ ip: '0.0.0.0', announcedIp: null });
    }
    logger.info('discovered IP adresses:', JSON.stringify(listenIP, null, 4));
    return listenIP;
}
const isFloat = {
    name: 'float',
    coerce: (v) => parseFloat(v),
    validate: (v) => assert(Number.isFinite(v), 'must be a number')
};
convict_1.default.addFormats({ ipaddress: convict_format_with_validator_1.ipaddress, url: convict_format_with_validator_1.url, isFloat });
// config schema
const configSchema = (0, convict_1.default)({
    turnAPIKey: {
        doc: 'TURN server key for requesting a geoip-based TURN server closest to the client.',
        format: String,
        default: ''
    },
    turnAPIURI: {
        doc: 'TURN server URL for requesting a geoip-based TURN server closest to the client.',
        format: String,
        default: ''
    },
    turnAPIparams: {
        'uri_schema': {
            doc: 'TURN server URL schema.',
            format: String,
            default: 'turn'
        },
        'transport': {
            doc: 'TURN server transport.',
            format: ['tcp', 'udp'],
            default: 'tcp'
        },
        'ip_ver': {
            doc: 'TURN server IP version.',
            format: ['ipv4', 'ipv6'],
            default: 'ipv4'
        },
        'servercount': {
            doc: 'TURN server count.',
            format: 'nat',
            default: 2
        }
    },
    turnAPITimeout: {
        doc: 'TURN server API timeout (seconds).',
        format: 'nat',
        default: 2 * 1000
    },
    backupTurnServers: {
        doc: 'Backup TURN servers if REST fails or is not configured',
        format: '*',
        default: [
            {
                urls: [
                    'turn:turn.example.com:443?transport=tcp'
                ],
                username: 'example',
                credential: 'example'
            }
        ]
    },
    fileTracker: {
        doc: 'Bittorrent tracker.',
        format: String,
        default: 'wss://tracker.openwebtorrent.com'
    },
    redisOptions: {
        host: {
            doc: 'Redis server host.',
            format: String,
            default: 'localhost'
        },
        port: {
            doc: 'Redis server port.',
            format: 'port',
            default: 6379
        },
        password: {
            doc: 'Redis server password.',
            format: String,
            default: ''
        }
    },
    cookieSecret: {
        doc: 'Session cookie secret.',
        format: String,
        default: 'T0P-S3cR3t_cook!e'
    },
    cookieName: {
        doc: 'Session cookie name.',
        format: String,
        default: 'edumeet.sid'
    },
    tls: {
        cert: {
            doc: 'SSL certificate path.',
            format: String,
            default: './certs/edumeet-demo-cert.pem'
        },
        key: {
            doc: 'SSL key path.',
            format: String,
            default: './certs/edumeet-demo-key.pem'
        }
    },
    listeningHost: {
        doc: 'The listening Host or IP address.',
        format: String,
        default: '0.0.0.0'
    },
    listeningPort: {
        doc: 'The HTTPS listening port.',
        format: 'port',
        default: 443
    },
    listeningRedirectPort: {
        doc: 'The HTTP server listening port used for redirecting any HTTP request to HTTPS. If 0, the redirect server is disabled.',
        format: 'port',
        default: 8080
    },
    httpOnly: {
        doc: 'Listens only on HTTP on listeningPort; listeningRedirectPort disabled. Use case: load balancer backend.',
        format: 'Boolean',
        default: false
    },
    trustProxy: {
        doc: 'WebServer/Express trust proxy config for httpOnly mode. More infos: [expressjs](https://expressjs.com/en/guide/behind-proxies.html), [proxy-addr](https://www.npmjs.com/package/proxy-addr)',
        format: String,
        default: ''
    },
    staticFilesCachePeriod: {
        doc: 'The max-age in milliseconds for HTTP caching of static resources. This can also be a string accepted by the [ms module](https://www.npmjs.com/package/ms#readme).',
        format: '*',
        default: 0
    },
    activateOnHostJoin: {
        doc: 'When true, the room will be open to all users since there are users in the room.',
        format: 'Boolean',
        default: true
    },
    roomsUnlocked: {
        doc: 'An array of rooms users can enter without waiting in the lobby.',
        format: Array,
        default: []
    },
    maxUsersPerRoom: {
        doc: 'It defines how many users can join a single room. If not set, no limit is applied.',
        format: 'nat',
        default: 0
    },
    routerScaleSize: {
        doc: 'Room size before spreading to a new router.',
        format: 'nat',
        default: 40
    },
    requestTimeout: {
        doc: 'Socket timeout value (ms).',
        format: 'nat',
        default: 20000
    },
    requestRetries: {
        doc: 'Socket retries when a timeout occurs.',
        format: 'nat',
        default: 3
    },
    // Mediasoup settings
    mediasoup: {
        numWorkers: {
            doc: 'The number of Mediasoup workers to spawn. Defaults to the available CPUs count.',
            format: 'nat',
            default: Object.keys((0, os_1.cpus)()).length
        },
        worker: {
            logLevel: {
                doc: 'The Mediasoup log level.',
                format: String,
                default: 'warn'
            },
            logTags: {
                doc: 'The Mediasoup log tags.',
                format: Array,
                default: [
                    'info',
                    'ice',
                    'dtls',
                    'rtp',
                    'srtp',
                    'rtcp'
                ]
            },
            rtcMinPort: {
                doc: 'The Mediasoup start listening port number.',
                format: 'port',
                default: 40000
            },
            rtcMaxPort: {
                doc: 'The Mediasoup end listening port number.',
                format: 'port',
                default: 49999
            }
        },
        // mediasoup Router settings.
        router: {
            // Router media codecs.
            mediaCodecs: {
                doc: 'The Mediasoup codecs settings. [supportedRtpCapabilities](https://github.com/versatica/mediasoup/blob/v3/src/supportedRtpCapabilities.ts)',
                format: '*',
                default: [
                    {
                        kind: 'audio',
                        mimeType: 'audio/opus',
                        clockRate: 48000,
                        channels: 2
                    },
                    {
                        kind: 'video',
                        mimeType: 'video/VP8',
                        clockRate: 90000,
                        parameters: {
                            'x-google-start-bitrate': 1000
                        }
                    },
                    {
                        kind: 'video',
                        mimeType: 'video/VP9',
                        clockRate: 90000,
                        parameters: {
                            'profile-id': 2,
                            'x-google-start-bitrate': 1000
                        }
                    },
                    {
                        kind: 'video',
                        mimeType: 'video/h264',
                        clockRate: 90000,
                        parameters: {
                            'packetization-mode': 1,
                            'profile-level-id': '4d0032',
                            'level-asymmetry-allowed': 1,
                            'x-google-start-bitrate': 1000
                        }
                    },
                    {
                        kind: 'video',
                        mimeType: 'video/h264',
                        clockRate: 90000,
                        parameters: {
                            'packetization-mode': 1,
                            'profile-level-id': '42e01f',
                            'level-asymmetry-allowed': 1,
                            'x-google-start-bitrate': 1000
                        }
                    }
                ]
            }
        },
        // mediasoup WebRtcTransport settings.
        webRtcTransport: {
            listenIps: {
                doc: 'The Mediasoup listen IPs. [TransportListenIp](https://mediasoup.org/documentation/v3/mediasoup/api/#TransportListenIp)',
                format: Array,
                default: getListenIps()
            },
            initialAvailableOutgoingBitrate: {
                doc: 'The Mediasoup initial available outgoing bitrate (in bps). [WebRtcTransportOptions](https://mediasoup.org/documentation/v3/mediasoup/api/#WebRtcTransportOptions)',
                format: 'nat',
                default: 1000000
            },
            maxIncomingBitrate: {
                doc: 'The Mediasoup maximum incoming bitrate for each transport. (in bps). [setMaxIncomingBitrate](https://mediasoup.org/documentation/v3/mediasoup/api/#transport-setMaxIncomingBitrate)',
                format: 'nat',
                default: 15000000
            }
        }
    },
    // Prometheus exporter
    prometheus: {
        enabled: {
            doc: 'Enables the Prometheus metrics exporter.',
            format: 'Boolean',
            default: false
        },
        listen: {
            doc: 'Prometheus metrics exporter listening address.',
            format: 'String',
            default: 'localhost'
        },
        port: {
            doc: 'The Prometheus metrics exporter listening port.',
            format: 'port',
            default: 8889
        },
        // default metrics options
        deidentify: {
            doc: 'De-identify IP addresses in Prometheus logs.',
            format: 'Boolean',
            default: false
        },
        numeric: {
            doc: 'Show numeric IP addresses in Prometheus logs.',
            format: 'Boolean',
            default: false
        },
        quiet: {
            doc: 'Include fewer labels in Prometheus metrics.',
            format: 'Boolean',
            default: false
        },
        // aggregated metrics options
        period: {
            doc: 'The Prometheus metrics exporter update period (seconds).',
            format: 'nat',
            default: 15
        },
        secret: {
            doc: 'The Prometheus metrics exporter authorization header: `Bearer <secret>` required to allow scraping.',
            format: String,
            default: ''
        }
    },
    // User roles
    // All users have the role "NORMAL" by default. Other roles need to be
    // added in the "userMapping" function. The following accesses and
    // permissions are arrays of roles. Roles can be changed in userRoles.js
    //
    // Example:
    // [ userRoles.MODERATOR, userRoles.AUTHENTICATED ]
    accessFromRoles: {
        doc: 'User roles.',
        format: '*',
        default: {
            // The role(s) will gain access to the room
            // even if it is locked (!)
            [access_1.BYPASS_ROOM_LOCK]: [userRoles.ADMIN],
            // The role(s) will gain access to the room without
            // going into the lobby. If you want to restrict access to your
            // server to only directly allow authenticated users, you could
            // add the userRoles.AUTHENTICATED to the user in the userMapping
            // function, and change to BYPASS_LOBBY : [ userRoles.AUTHENTICATED ]
            [access_1.BYPASS_LOBBY]: [userRoles.NORMAL]
        }
    },
    permissionsFromRoles: {
        doc: 'User permissions from roles.',
        format: '*',
        default: {
            // The role(s) have permission to lock/unlock a room
            [perms_1.CHANGE_ROOM_LOCK]: [userRoles.MODERATOR],
            // The role(s) have permission to promote a peer from the lobby
            [perms_1.PROMOTE_PEER]: [userRoles.NORMAL],
            // The role(s) have permission to give/remove other peers roles
            [perms_1.MODIFY_ROLE]: [userRoles.NORMAL],
            // The role(s) have permission to send chat messages
            [perms_1.SEND_CHAT]: [userRoles.NORMAL],
            // The role(s) have permission to moderate chat
            [perms_1.MODERATE_CHAT]: [userRoles.MODERATOR],
            // The role(s) have permission to share audio
            [perms_1.SHARE_AUDIO]: [userRoles.NORMAL],
            // The role(s) have permission to share video
            [perms_1.SHARE_VIDEO]: [userRoles.NORMAL],
            // The role(s) have permission to share screen
            [perms_1.SHARE_SCREEN]: [userRoles.NORMAL],
            // The role(s) have permission to produce extra video
            [perms_1.EXTRA_VIDEO]: [userRoles.NORMAL],
            // The role(s) have permission to share files
            [perms_1.SHARE_FILE]: [userRoles.NORMAL],
            // The role(s) have permission to moderate files
            [perms_1.MODERATE_FILES]: [userRoles.MODERATOR],
            // The role(s) have permission to moderate room (e.g. kick user)
            [perms_1.MODERATE_ROOM]: [userRoles.MODERATOR]
        }
    },
    // Array of permissions. If no peer with the permission in question
    // is in the room, all peers are permitted to do the action. The peers
    // that are allowed because of this rule will not be able to do this 
    // action as soon as a peer with the permission joins. In this example
    // everyone will be able to lock/unlock room until a MODERATOR joins.
    allowWhenRoleMissing: {
        doc: 'Allow when role missing.',
        format: Array,
        default: [perms_1.CHANGE_ROOM_LOCK]
    }
});
exports.configSchema = configSchema;
/**
 * Formats the schema documentation, calling the same function recursively.
 * @param docs the documentation object to extend
 * @param property the root property
 * @param schema the config schema fragment
 * @returns the documentation object
 */
function formatDocs(docs, property, schema) {
    if (schema._cvtProperties) {
        Object.entries(schema._cvtProperties).forEach(([name, value]) => {
            formatDocs(docs, `${property ? `${property}.` : ''}${name}`, value);
        });
        return docs;
    }
    if (property) {
        docs[property] = // eslint-disable-line no-param-reassign
            {
                doc: schema.doc,
                format: JSON.stringify(schema.format, null, 2),
                default: JSON.stringify(schema.default, null, 2)
            };
    }
    return docs;
}
// format docs
const configDocs = formatDocs({}, null, configSchema.getSchema());
exports.configDocs = configDocs;
let config = {};
exports.config = config;
let configError = '';
exports.configError = configError;
let configLoaded = false;
// Load config from file
for (const format of ['json', 'json5', 'yaml', 'yml', 'toml']) // eslint-disable-line no-restricted-syntax
 {
    const filepath = path.normalize(`${__dirname}/../../config/config.${format}`);
    if (fs.existsSync(filepath)) {
        try {
            logger.debug(`Loading config from ${filepath}`);
            configSchema.loadFile(filepath);
            configLoaded = true;
            break;
        }
        catch (err) {
            logger.debug(`Loading config from ${filepath} failed: ${err.message}`);
        }
    }
}
if (!configLoaded) {
    logger.warn(`No config file found in ${path.normalize(`${__dirname}/../../config/`)}, using defaults.`);
    configSchema.load({});
}
// Perform validation
try {
    configSchema.validate({ allowed: 'strict' });
    exports.config = config = configSchema.getProperties();
}
catch (error) {
    exports.configError = configError = error.message;
}
// load additional config module (no validation is performed)
const configModuleFilepath = path.normalize(`${__dirname}/../../config/config.js`);
if (fs.existsSync(configModuleFilepath)) {
    try {
        logger.info(`Loading config module from ${configModuleFilepath}`);
        const configModule = require('../../config/config.js'); // eslint-disable-line @typescript-eslint/no-var-requires
        Object.assign(config, configModule);
    }
    catch (err) {
        logger.error(`Error loading ${configModuleFilepath} module: ${err.message}`);
    }
}
// eslint-disable-next-line
logger.debug('Using config:', config);
//# sourceMappingURL=config.js.map