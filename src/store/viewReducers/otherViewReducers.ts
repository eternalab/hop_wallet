import Decimal from 'decimal.js';
import { Transaction, DAppItem, CollectionItem, NftItem } from '../../types/common';

// ============ Activity View ============

export interface ActivityState {
    transactions: Transaction[];
    loading: boolean;
}

export enum ActivityActionType {
    SET_TRANSACTIONS = 'SET_TRANSACTIONS',
    SET_LOADING = 'SET_LOADING',
}

export type ActivityAction =
    | { type: ActivityActionType.SET_TRANSACTIONS; payload: Transaction[] }
    | { type: ActivityActionType.SET_LOADING; payload: boolean };

export const activityInitialState: ActivityState = {
    transactions: [],
    loading: true,
};

export function activityReducer(state: ActivityState, action: ActivityAction): ActivityState {
    switch (action.type) {
        case ActivityActionType.SET_TRANSACTIONS:
            return { ...state, transactions: action.payload };
        case ActivityActionType.SET_LOADING:
            return { ...state, loading: action.payload };
        default:
            return state;
    }
}

// ============ DApps View ============

export interface DAppsState {
    presetDapps: DAppItem[];
}

export enum DAppsActionType {
    SET_PRESET_DAPPS = 'SET_PRESET_DAPPS',
}

export type DAppsAction = { type: DAppsActionType.SET_PRESET_DAPPS; payload: DAppItem[] };

export const dappsInitialState: DAppsState = {
    presetDapps: [],
};

export function dappsReducer(state: DAppsState, action: DAppsAction): DAppsState {
    switch (action.type) {
        case DAppsActionType.SET_PRESET_DAPPS:
            return { ...state, presetDapps: action.payload };
        default:
            return state;
    }
}

// ============ Token Detail View ============

export interface TokenDetailState {
    copied: boolean;
}

export enum TokenDetailActionType {
    SET_COPIED = 'SET_COPIED',
}

export type TokenDetailAction = { type: TokenDetailActionType.SET_COPIED; payload: boolean };

export const tokenDetailInitialState: TokenDetailState = {
    copied: false,
};

export function tokenDetailReducer(state: TokenDetailState, action: TokenDetailAction): TokenDetailState {
    switch (action.type) {
        case TokenDetailActionType.SET_COPIED:
            return { ...state, copied: action.payload };
        default:
            return state;
    }
}

// ============ Collections View ============

export interface CollectionsState {
    collectionPage: number;
    totalPage: number;
    total: number;
    collections: CollectionItem[];
    loading: boolean;
}

export enum CollectionsActionType {
    SET_COLLECTION_PAGE = 'SET_COLLECTION_PAGE',
    SET_TOTAL_PAGE = 'SET_TOTAL_PAGE',
    SET_TOTAL = 'SET_TOTAL',
    SET_COLLECTIONS = 'SET_COLLECTIONS',
    SET_LOADING = 'SET_LOADING',
}

export type CollectionsAction =
    | { type: CollectionsActionType.SET_COLLECTION_PAGE; payload: number }
    | { type: CollectionsActionType.SET_TOTAL_PAGE; payload: number }
    | { type: CollectionsActionType.SET_TOTAL; payload: number }
    | { type: CollectionsActionType.SET_COLLECTIONS; payload: CollectionItem[] }
    | { type: CollectionsActionType.SET_LOADING; payload: boolean };

export const collectionsInitialState: CollectionsState = {
    collectionPage: 1,
    totalPage: 1,
    total: 1,
    collections: [],
    loading: true,
};

export function collectionsReducer(state: CollectionsState, action: CollectionsAction): CollectionsState {
    switch (action.type) {
        case CollectionsActionType.SET_COLLECTION_PAGE:
            return { ...state, collectionPage: action.payload };
        case CollectionsActionType.SET_TOTAL_PAGE:
            return { ...state, totalPage: action.payload };
        case CollectionsActionType.SET_TOTAL:
            return { ...state, total: action.payload };
        case CollectionsActionType.SET_COLLECTIONS:
            return { ...state, collections: action.payload };
        case CollectionsActionType.SET_LOADING:
            return { ...state, loading: action.payload };
        default:
            return state;
    }
}

// ============ Collection Detail View ============

export interface CollectionDetailState {
    idCopied: boolean;
    nfts: NftItem[] | undefined;
    nftPage: number;
    totalPage: number;
    nftsLoading: boolean;
}

export enum CollectionDetailActionType {
    SET_ID_COPIED = 'SET_ID_COPIED',
    SET_NFTS = 'SET_NFTS',
    SET_NFT_PAGE = 'SET_NFT_PAGE',
    SET_TOTAL_PAGE = 'SET_TOTAL_PAGE',
    SET_NFTS_LOADING = 'SET_NFTS_LOADING',
}

export type CollectionDetailAction =
    | { type: CollectionDetailActionType.SET_ID_COPIED; payload: boolean }
    | { type: CollectionDetailActionType.SET_NFTS; payload: NftItem[] | undefined }
    | { type: CollectionDetailActionType.SET_NFT_PAGE; payload: number }
    | { type: CollectionDetailActionType.SET_TOTAL_PAGE; payload: number }
    | { type: CollectionDetailActionType.SET_NFTS_LOADING; payload: boolean };

export const collectionDetailInitialState: CollectionDetailState = {
    idCopied: false,
    nfts: undefined,
    nftPage: 1,
    totalPage: 1,
    nftsLoading: true,
};

export function collectionDetailReducer(state: CollectionDetailState, action: CollectionDetailAction): CollectionDetailState {
    switch (action.type) {
        case CollectionDetailActionType.SET_ID_COPIED:
            return { ...state, idCopied: action.payload };
        case CollectionDetailActionType.SET_NFTS:
            return { ...state, nfts: action.payload };
        case CollectionDetailActionType.SET_NFT_PAGE:
            return { ...state, nftPage: action.payload };
        case CollectionDetailActionType.SET_TOTAL_PAGE:
            return { ...state, totalPage: action.payload };
        case CollectionDetailActionType.SET_NFTS_LOADING:
            return { ...state, nftsLoading: action.payload };
        default:
            return state;
    }
}

// ============ Send NFT View ============

export interface SendNFTState {
    recipientAddr: string;
    isSending: boolean;
    gasEstimate: Decimal;
    calFee: boolean;
}

export enum SendNFTActionType {
    SET_RECIPIENT_ADDR = 'SET_RECIPIENT_ADDR',
    SET_IS_SENDING = 'SET_IS_SENDING',
    SET_GAS_ESTIMATE = 'SET_GAS_ESTIMATE',
    SET_CAL_FEE = 'SET_CAL_FEE',
}

export type SendNFTAction =
    | { type: SendNFTActionType.SET_RECIPIENT_ADDR; payload: string }
    | { type: SendNFTActionType.SET_IS_SENDING; payload: boolean }
    | { type: SendNFTActionType.SET_GAS_ESTIMATE; payload: Decimal }
    | { type: SendNFTActionType.SET_CAL_FEE; payload: boolean };

export const sendNFTInitialState: SendNFTState = {
    recipientAddr: '',
    isSending: false,
    gasEstimate: new Decimal(0),
    calFee: false,
};

export function sendNFTReducer(state: SendNFTState, action: SendNFTAction): SendNFTState {
    switch (action.type) {
        case SendNFTActionType.SET_RECIPIENT_ADDR:
            return { ...state, recipientAddr: action.payload };
        case SendNFTActionType.SET_IS_SENDING:
            return { ...state, isSending: action.payload };
        case SendNFTActionType.SET_GAS_ESTIMATE:
            return { ...state, gasEstimate: action.payload };
        case SendNFTActionType.SET_CAL_FEE:
            return { ...state, calFee: action.payload };
        default:
            return state;
    }
}

// ============ Send View ============

export interface SendState {
    receivedAddr: string;
    sendAmount: string;
    isSending: boolean;
    gasEstimate: Decimal;
    bal: Decimal;
    calFee: boolean;
}

export enum SendActionType {
    SET_RECEIVED_ADDR = 'SET_RECEIVED_ADDR',
    SET_SEND_AMOUNT = 'SET_SEND_AMOUNT',
    SET_IS_SENDING = 'SET_IS_SENDING',
    SET_GAS_ESTIMATE = 'SET_GAS_ESTIMATE',
    SET_BAL = 'SET_BAL',
    SET_CAL_FEE = 'SET_CAL_FEE',
    RESET_FORM = 'RESET_FORM',
}

export type SendAction =
    | { type: SendActionType.SET_RECEIVED_ADDR; payload: string }
    | { type: SendActionType.SET_SEND_AMOUNT; payload: string }
    | { type: SendActionType.SET_IS_SENDING; payload: boolean }
    | { type: SendActionType.SET_GAS_ESTIMATE; payload: Decimal }
    | { type: SendActionType.SET_BAL; payload: Decimal }
    | { type: SendActionType.SET_CAL_FEE; payload: boolean }
    | { type: SendActionType.RESET_FORM };

export const sendInitialState: SendState = {
    receivedAddr: '',
    sendAmount: '',
    isSending: false,
    gasEstimate: new Decimal(0),
    bal: new Decimal(0),
    calFee: false,
};

export function sendReducer(state: SendState, action: SendAction): SendState {
    switch (action.type) {
        case SendActionType.SET_RECEIVED_ADDR:
            return { ...state, receivedAddr: action.payload };
        case SendActionType.SET_SEND_AMOUNT:
            return { ...state, sendAmount: action.payload };
        case SendActionType.SET_IS_SENDING:
            return { ...state, isSending: action.payload };
        case SendActionType.SET_GAS_ESTIMATE:
            return { ...state, gasEstimate: action.payload };
        case SendActionType.SET_BAL:
            return { ...state, bal: action.payload };
        case SendActionType.SET_CAL_FEE:
            return { ...state, calFee: action.payload };
        case SendActionType.RESET_FORM:
            return { ...state, receivedAddr: '', sendAmount: '', isSending: false };
        default:
            return state;
    }
}

// ============ Receive View ============

export interface ReceiveState {
    copied: boolean;
}

export enum ReceiveActionType {
    SET_COPIED = 'SET_COPIED',
}

export type ReceiveAction = { type: ReceiveActionType.SET_COPIED; payload: boolean };

export const receiveInitialState: ReceiveState = {
    copied: false,
};

export function receiveReducer(state: ReceiveState, action: ReceiveAction): ReceiveState {
    switch (action.type) {
        case ReceiveActionType.SET_COPIED:
            return { ...state, copied: action.payload };
        default:
            return state;
    }
}
