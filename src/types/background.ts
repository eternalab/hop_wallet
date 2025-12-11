import { EndlessSignAndSubmitTransaction, EndlessSignMessageInput } from "./inject.ts";

export interface MessageRequest {
    type: MessageType
    data?: any
    tabId?: number
    requestId?: string
}

export interface MessageResponse {
    success: boolean
    data?: any
    error?: string
    requestId?: string
}

export interface ConfirmInput {
    Origin: string
}

// Store pending sign requests
export interface PendingSignOrConfirmRequest {
    type: MessageType;
    requestId: string;
    data: EndlessSignMessageInput | EndlessSignAndSubmitTransaction | ConfirmInput;
    resolve: (value: MessageResponse) => void;
    reject: (error: Error) => void;
    timestamp: number;
}

// Internal signing request types (all signing happens in background)
export interface InternalSendEDSRequest {
    fromAddress: string;
    toAddress: string;
    amount: string;  // without decimals, e.g. "1.5"
}

export interface InternalSendCoinRequest {
    fromAddress: string;
    toAddress: string;
    amount: string;  // with decimals applied
    coinId: string;
}

export interface InternalSignMessageRequest {
    address: string;
    message: string;
    nonce?: string;
}

export interface InternalSignTransactionRequest {
    address: string;
    payload: any;
    options?: any;
}

// message type
export enum MessageType {
    GenerateMnemonic = 'generateMnemonic',
    CreateWallet = 'createWallet',
    RemoveWallet = 'removeWallet',
    CreateWalletWithMnemonicAndIndex = "createWalletWithMnemonicAndIndex",
    ImportPrivateKey = "importPrivateKey",
    UpdateActiveIndex = "updateActiveIndex",
    UnlockWallet = 'unlockWallet',
    LockWallet = 'lockWallet',
    SaveSettings = 'saveSettings',
    InitializedRequests = 'initializedRequests',
    ExportWallet = 'exportWallet',
    // Internal secure signing APIs
    InternalSendEDS = 'internalSendEDS',
    InternalSendCoin = 'internalSendCoin',
    InternalSignMessage = 'internalSignMessage',
    InternalSignTransaction = 'internalSignTransaction',
    SendNftTransaction = 'sendNftTransaction',
    CheckUnlockStatus = 'checkUnlockStatus',
    //web3 wallet api
    WalletConnect = 'walletConnect',
    WalletDisconnect = 'walletDisconnect',
    WalletIsConnected = 'walletIsConnected',
    WalletGetAccount = "walletGetAccount",
    WalletGetNetwork = "walletGetNetwork",
    WalletSignAndSubmitTransaction = "walletSignAndSubmitTransaction",
    WalletSignMessage = "walletSignMessage",
    // Sign confirmation flow
    GetPendingSignRequestById = 'getPendingSignRequestById',
    NotifyConfirmOrSignResult = 'notifyConfirmOrSignResult',
}