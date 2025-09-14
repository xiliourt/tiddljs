"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUALITY_TO_ARG = exports.ARG_TO_QUALITY = exports.SinglesFilterSchema = exports.TrackArgSchema = exports.TrackQualitySchema = void 0;
const zod_1 = require("zod");
exports.TrackQualitySchema = zod_1.z.enum(['LOW', 'HIGH', 'LOSSLESS', 'HI_RES_LOSSLESS']);
exports.TrackArgSchema = zod_1.z.enum(['low', 'normal', 'high', 'master']);
exports.SinglesFilterSchema = zod_1.z.enum(['none', 'only', 'include']);
exports.ARG_TO_QUALITY = {
    low: 'LOW',
    normal: 'HIGH',
    high: 'LOSSLESS',
    master: 'HI_RES_LOSSLESS',
};
exports.QUALITY_TO_ARG = {
    LOW: 'low',
    HIGH: 'normal',
    LOSSLESS: 'high',
    HI_RES_LOSSLESS: 'master',
};
