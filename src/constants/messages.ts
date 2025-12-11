/**
 * Messages Constants
 * Error messages, UI text, and alert messages
 */

// Error Messages
export const ERROR_NO_ACCOUNT = 'No active account or private key found.';
export const ERROR_PASSWORD_TOO_SHORT = 'Password must be at least 8 characters';
export const ERROR_PASSWORD_MISMATCH = 'Passwords do not match';
export const ERROR_DECRYPT_FAILED = 'Failed to decrypt wallet. Data might be corrupted.';
export const ERROR_INCORRECT_PASSWORD = 'Incorrect password';
export const ERROR_INVALID_CREDENTIALS = 'Invalid credentials';
export const ERROR_INVALID_MNEMONIC = 'Invalid mnemonic or private key';
export const ERROR_INVALID_ADDRESS = 'Invalid Address';
export const ERROR_SIMULATE_NULL = 'simulate resp is null';
export const ERROR_SEND_TRANSACTION = 'unable to send transaction';
export const ERROR_SIGN_MESSAGE = 'unable to sign message';
export const ERROR_SIGNING_FAILED = 'Signing failed';

// Success Messages
export const SUCCESS_ADDRESS_COPIED = 'Address Copied!';
export const SUCCESS_CONTRACT_COPIED = 'Contract address copied!';

// Info Messages
export const INFO_RECENT_TX_ONLY = 'Only recent transactions are shown';
export const INFO_NO_COLLECTIONS = 'No Collection found';
export const INFO_LOADING = 'Loading...';

// Feature Messages
export const FEATURE_COMING_SOON_TRANSFER = 'Transfer feature coming soon!';

// Branding
export const BRAND_NAME = 'Hop Wallet';
export const BRAND_TAGLINE = 'The gateway to the Endless Chain';
export const NATIVE_TOKEN_NAME = 'Endless';

export const URL_PARAM_REQUEST_ID = 'requestId';

// message type
export const MESSAGE_TYPE_WALLET_EVENT = "WALLET_EVENT"
export const MESSAGE_TYPE_ENDLESS_WALLET_EVENT = "ENDLESS_WALLET_EVENT"
export const MESSAGE_TYPE_ENDLESS_WALLET_REQUEST = "ENDLESS_WALLET_REQUEST"
export const MESSAGE_TYPE_ENDLESS_WALLET_RESPONSE = "ENDLESS_WALLET_RESPONSE"