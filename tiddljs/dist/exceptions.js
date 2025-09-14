"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = exports.AuthError = void 0;
class AuthError extends Error {
    constructor(status, error, sub_status, error_description) {
        super(`${status}: ${error} - ${error_description}`);
        this.name = 'AuthError';
        this.status = status;
        this.error = error;
        this.sub_status = sub_status;
        this.error_description = error_description;
    }
}
exports.AuthError = AuthError;
class ApiError extends Error {
    constructor(status, subStatus, userMessage) {
        super(`${userMessage} (${status} - ${subStatus})`);
        this.name = 'ApiError';
        this.status = status;
        this.sub_status = subStatus;
        this.user_message = userMessage;
    }
}
exports.ApiError = ApiError;
