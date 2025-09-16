import { z } from 'zod';

export const AuthUserSchema = z.object({
    userId: z.number(),
    email: z.string(),
    countryCode: z.string(),
    fullName: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    nickname: z.string().optional(),
    username: z.string(),
    address: z.string().optional(),
    city: z.string().optional(),
    postalcode: z.string().optional(),
    usState: z.string().optional(),
    phoneNumber: z.string().optional(),
    birthday: z.number().optional(),
    channelId: z.number(),
    parentId: z.number(),
    acceptedEULA: z.boolean(),
    created: z.number(),
    updated: z.number(),
    facebookUid: z.number(),
    appleUid: z.string().optional(),
    googleUid: z.string().optional(),
    accountLinkCreated: z.boolean(),
    emailVerified: z.boolean(),
    newUser: z.boolean(),
});

export const AuthResponseSchema = z.object({
    user: AuthUserSchema,
    scope: z.string(),
    clientName: z.string(),
    token_type: z.string(),
    access_token: z.string(),
    expires_in: z.number(),
    user_id: z.number(),
});

export const AuthResponseWithRefreshSchema = AuthResponseSchema.extend({
    refresh_token: z.string(),
});

export const AuthDeviceResponseSchema = z.object({
    deviceCode: z.string(),
    userCode: z.string(),
    verificationUri: z.string(),
    verificationUriComplete: z.string(),
    expiresIn: z.number(),
    interval: z.number(),
});

export type AuthUser = z.infer<typeof AuthUserSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type AuthResponseWithRefresh = z.infer<typeof AuthResponseWithRefreshSchema>;
export type AuthDeviceResponse = z.infer<typeof AuthDeviceResponseSchema>;
