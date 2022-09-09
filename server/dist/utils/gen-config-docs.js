"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../lib/config/config");
const promises_1 = require("fs/promises");
function formatJson(data) {
    return `\`${data.replace(/\n/g, '')}\``;
}
let data = `# ![edumeet logo](/app/public/images/logo.edumeet.svg) server configuration properties list:

| Name | Description | Format | Default value |
| :--- | :---------- | :----- | :------------ |
`;
Object.entries(config_1.configDocs).forEach((entry) => {
    const [name, value] = entry;
    // escape dynamically created default values
    switch (name) {
        case 'mediasoup.webRtcTransport.listenIps':
            value.default = '[ { "ip": "0.0.0.0", "announcedIp": null } ]';
            break;
        case 'mediasoup.numWorkers':
            value.default = '4';
            break;
    }
    data += `| ${name} | ${value.doc} | ${formatJson(value.format)} | \`${formatJson(value.default)}\` |\n`;
});
data += `

---

*Document generated with:* \`yarn gen-config-docs\`
`;
(0, promises_1.writeFile)('config/README.md', data).then(() => {
    console.log('done'); // eslint-disable-line
}, (err) => {
    console.error(`Error writing file: ${err.message}`); // eslint-disable-line
});
//# sourceMappingURL=gen-config-docs.js.map