import Decimal from "decimal.js";
import {NetworkConfig, NetworkId} from "../types/common.ts";
import {PendingSignOrConfirmRequest} from "@/src/types/background.ts";
import {GetCoinDataResponse} from "@endlesslab/endless-ts-sdk";

export interface LocalAccount {
    address: string;
    publicKey: string;
    authKey: string;
    privateKey: string;
    name: string;
    hdIndex: number; // HD derivation index
    createAt: number;
}

export interface LocalPubAccount {
    address: string;
    publicKey: string;
    authKey: string;
    name: string;
    createAt: number;
    hdIndex: number;
}

export interface PublicAccountInfo {
    pubAccounts: LocalPubAccount[];
}

export interface WalletSetting {
    currentNetwork: NetworkId;
    networks: Record<NetworkId, NetworkConfig>,
}


export interface WalletData {
    mnemonic: string;
    accounts: LocalAccount[];
    createdAt: number;
}

export interface WalletState {
    isInitialized: boolean;
    accounts: LocalPubAccount[];
    currentAccountIndex: number;
    largestHDIndex: number;
    setting: WalletSetting;
    isLocked: boolean
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

export interface ParsedPayload {
    isParsed: boolean;
    payloadDetail?: {
        moduleAddress: string;
        moduleName: string;
        functionName: string;
        functionArguments?: any[];
    }
}
export interface ApprovalViewRequestProps {
    network: NetworkConfig;
    psocr: PendingSignOrConfirmRequest;
    activeAccount: LocalPubAccount;
}

export interface EstimateTransaction {
    success: boolean;
    balanceChange: Map<string, Map<string, Decimal>>;
    esGasFee: string;
}

export interface EstimateTransactionEx {
    success: boolean;
    balanceChange: Map<string, Map<GetCoinDataResponse, Decimal>>;
    esGasFee: string;
    error: string| null;
}


// inner object
export enum RespType {
    Success = 'success',
    Error = 'error',
}

export interface SuccessResp<RespData> {
    status: RespType.Success;
    data: RespData;
}

export interface ErrResp {
    status: RespType.Error;
    errMsg?: string;
}

export type InnerResp<RespData> = SuccessResp<RespData> | ErrResp;
