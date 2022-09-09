"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = __importDefault(require("../logger/Logger"));
const express = require('express');
const promClient = require('prom-client');
const collectDefaultMetrics = require('../stats/metrics/default');
const RegisterAggregated = require('../stats/metrics/aggregated');
const logger = new Logger_1.default('promClient');
const config_1 = require("../config/config");
module.exports = async function (workers, rooms, peers) {
    try {
        logger.debug(`config.prometheus.deidentify=${config_1.config.prometheus.deidentify}`);
        logger.debug(`config.prometheus.listen=${config_1.config.prometheus.listen}`);
        logger.debug(`config.prometheus.numeric=${config_1.config.prometheus.numeric}`);
        logger.debug(`config.prometheus.port=${config_1.config.prometheus.port}`);
        logger.debug(`config.prometheus.quiet=${config_1.config.prometheus.quiet}`);
        const app = express();
        // default register
        app.get('/', async (req, res) => {
            logger.debug(`GET ${req.originalUrl}`);
            const registry = new promClient.Registry();
            await collectDefaultMetrics(workers, rooms, peers, registry, config_1.config.prometheus);
            res.set('Content-Type', registry.contentType);
            const data = await registry.metrics();
            res.end(data);
        });
        // aggregated register
        const registerAggregated = RegisterAggregated(workers, rooms, peers, config_1.config.prometheus);
        app.get('/metrics', async (req, res) => {
            logger.debug(`GET ${req.originalUrl}`);
            if (config_1.config.prometheus.secret
                && req.headers.authorization !== `Bearer ${config_1.config.prometheus.secret}`) {
                logger.error('Invalid authorization header');
                return res.status(401).end();
            }
            res.set('Content-Type', registerAggregated.contentType);
            const data = await registerAggregated.metrics();
            res.end(data);
        });
        const server = app.listen(config_1.config.prometheus.port, config_1.config.prometheus.listen, () => {
            const address = server.address();
            logger.info(`listening ${address.address}:${address.port}`);
        });
    }
    catch (err) {
        logger.error(err);
    }
};
//# sourceMappingURL=promExporter.js.map