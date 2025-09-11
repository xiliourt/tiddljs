export class AuthError extends Error {
    status: number;
    error: string;
    sub_status: string;
    error_description: string;

    constructor(status: number, error: string, sub_status: string, error_description: string) {
        super(`${status}: ${error} - ${error_description}`);
        this.name = 'AuthError';
        this.status = status;
        this.error = error;
        this.sub_status = sub_status;
        this.error_description = error_description;
    }
}

export class ApiError extends Error {
    status: number;
    sub_status: string;
    user_message: string;

    constructor(status: number, subStatus: string, userMessage: string) {
        super(`${userMessage} (${status} - ${subStatus})`);
        this.name = 'ApiError';
        this.status = status;
        this.sub_status = subStatus;
        this.user_message = userMessage;
    }
}
