"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthDeviceResponseSchema = exports.AuthResponseWithRefreshSchema = exports.AuthResponseSchema = exports.AuthUserSchema = void 0;
const zod_1 = require("zod");
exports.AuthUserSchema = zod_1.z.object({
    userId: zod_1.z.number(),
    email: zod_1.z.string(),
    countryCode: zod_1.z.string(),
    fullName: zod_1.z.string().optional(),
    firstName: zod_1.z.string().optional(),
    lastName: zod_1.z.string().optional(),
    nickname: zod_1.z.string().optional(),
    username: zod_1.z.string(),
    address: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    postalcode: zod_1.z.string().optional(),
    usState: zod_1.z.string().optional(),
    phoneNumber: zod_1.z.string().optional(),
    birthday: zod_1.z.number().optional(),
    channelId: zod_1.z.number(),
    parentId: zod_1.z.number(),
    acceptedEULA: zod_1.z.boolean(),
    created: zod_1.z.number(),
    updated: zod_1.z.number(),
    facebookUid: zod_1.z.number(),
    appleUid: zod_1.z.string().optional(),
    googleUid: zod_1.z.string().optional(),
    accountLinkCreated: zod_1.z.boolean(),
    emailVerified: zod_1.z.boolean(),
    newUser: zod_1.z.boolean(),
});
exports.AuthResponseSchema = zod_1.z.object({
    user: exports.AuthUserSchema,
    scope: zod_1.z.string(),
    clientName: zod_1.z.string(),
    token_type: zod_1.z.string(),
    access_token: zod_1.z.string(),
    expires_in: zod_1.z.number(),
    user_id: zod_1.z.number(),
});
exports.AuthResponseWithRefreshSchema = exports.AuthResponseSchema.extend({
    refresh_token: zod_1.z.string(),
});
exports.AuthDeviceResponseSchema = zod_1.z.object({
    deviceCode: zod_1.z.string(),
    userCode: zod_1.z.string(),
    verificationUri: zod_1.z.string(),
    verificationUriComplete: zod_1.z.string(),
    expiresIn: zod_1.z.number(),
    interval: zod_1.z.number(),
});
