
// @ts-check

/**
 * @typedef {object} AuthUser
 * @property {number} userId
 * @property {string} email
 * @property {string} countryCode
 * @property {string | undefined} fullName
 * @property {string | undefined} firstName
 * @property {string | undefined} lastName
 * @property {string | undefined} nickname
 * @property {string} username
 * @property {string | undefined} address
 * @property {string | undefined} city
 * @property {string | undefined} postalcode
 * @property {string | undefined} usState
 * @property {string | undefined} phoneNumber
 * @property {number | undefined} birthday
 * @property {number} channelId
 * @property {number} parentId
 * @property {boolean} acceptedEULA
 * @property {number} created
 * @property {number} updated
 * @property {number} facebookUid
 * @property {string | undefined} appleUid
 * @property {string | undefined} googleUid
 * @property {boolean} accountLinkCreated
 * @property {boolean} emailVerified
 * @property {boolean} newUser
 */

/**
 * @typedef {object} AuthResponse
 * @property {AuthUser} user
 * @property {string} scope
 * @property {string} clientName
 * @property {string} token_type
 * @property {string} access_token
 * @property {number} expires_in
 * @property {number} user_id
 */

/**
 * @typedef {AuthResponse & {refresh_token: string}} AuthResponseWithRefresh
 */

/**
 * @typedef {object} AuthDeviceResponse
 * @property {string} deviceCode
 * @property {string} userCode
 * @property {string} verificationUri
 * @property {string} verificationUriComplete
 * @property {number} expiresIn
 * @property {number} interval
 */
