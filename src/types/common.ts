import Decimal from "decimal.js";
import { Network } from "@endlesslab/endless-ts-sdk";

export enum NetworkId {
    MAINNET = 'mainnet',
    TESTNET = 'testnet'
}

export interface NetworkConfig {
    id: NetworkId;
    name: Network;
    rpcUrl: string;
    indexerUrl: string,
    chainId: number;
    symbol: string;
    explorerUrl: string;
}

export interface WalletAccount {
    address: string;
    privateKey: string;
    mnemonic: string | null;
    balance: string;
    name: string;
    publicKey?: string; // Added for SDK compatibility
}

export interface Token {
    id: string;
    icon: string;
    symbol: string;
    decimals: number;
    name: string;
    balance: Decimal;
    valueUsd: string;
    change24h: string;
    contractAddress: string;
}

export interface Transaction {
    hash: string;
    sender: string;
    receiver: string;
    amount: Decimal;
    timestamp: number;
    status: 'pending' | 'success' | 'failed';
    type: 'send' | 'receive';
}

export interface CoinInfo {
    balance: string;
    frozen: boolean;
    metadata: {
        id: string;
        symbol: string;
        project_uri?: string | null;
        name: string;
        icon_uri?: string | null;
        decimals: number;
        supply: string;
    };
}

export interface NFTAttribute {
    trait_type: string;
    value: string;
}


export interface NFTItem {
    id: string;
    name: string;
    collection: string;
    imageUrl: string;
    description?: string;
    attributes?: NFTAttribute[];
}

export interface CollectionItem {
    id: string;
    name: string;
    description: string;
    uri: string;
    count: number;
}

export interface Collections {
    total: number;
    page: number;
    pageSize: number;
    data: CollectionItem[];
}

export interface NftItem {
    id: string;
    uri: string;
    name: string;
    index: number;
    properties: any;
}

export interface Nfts {
    total: number;
    page: number;
    pageSize: number;
    data: NftItem[];
}


export interface DAppItem {
    id: string;
    name: string;
    description: string;
    url: string;
    iconUrl: string;
    category: 'DeFi' | 'GameFi' | 'NFT' | 'Utility';
}

export enum AppView {
    LOCK = 'LOCK',
    SETUP_PASSWORD = 'SETUP_PASSWORD',
    ONBOARDING = 'ONBOARDING',
    HOME = 'HOME',
    SEND = 'SEND',
    RECEIVE = 'RECEIVE',
    ACTIVITY = 'ACTIVITY',
    COLLECTION = 'COLLECTION',
    COLLECTION_DETAIL = 'COLLECTION_DETAIL',
    NFT_DETAIL = 'NFT_DETAIL',
    SEND_NFT = 'SEND_NFT',
    TOKEN_DETAIL = 'TOKEN_DETAIL',
    TRANSACTION_RESULT = 'TRANSACTION_RESULT',
    DAPPS = 'DAPPS',
    SETTINGS = 'SETTINGS',
    CONNECT_REQUEST = 'CONNECT_REQUEST',
    SIGN_TRANSACTION_REQUEST = 'SIGN_TRANSACTION_REQUEST',
    SIGN_MESSAGE_REQUEST = 'SIGN_MESSAGE_REQUEST'
}

// --- Provider / DApp Interfaces ---
export interface TransactionWDEvent {
    type: string;
    data: {
        amount: string;
        coin: string;
        owner: string;
        store: string;
    }
}