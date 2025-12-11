/**
 * Cryptographic Constants
 * Encryption, hashing, and key derivation parameters
 */
import {ENDLESS_COIN_ID} from "@endlesslab/endless-ts-sdk";

// Decimal Precision
export const EDS_DECIMALS = 8;
export const OCTA_MULTIPLIER = 1e8; // 10^8 for converting EDS to octas
export const EDS_META = {
    id: ENDLESS_COIN_ID,
    symbol: "EDS",
    project_uri: "https://www.endless.link",
    name: "Endless Coin",
    icon_uri: "https://www.endless.link/eds-icon.svg",
    decimals: EDS_DECIMALS,
    supply: "10000000000"
};
// Supply Formatting Thresholds
export const THOUSAND = 1000;
export const MILLION = 1000000;
export const BILLION = 1000000000;
export const TRILLION = 1000000000000;
