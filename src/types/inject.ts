import {
    AccountAddress,
    InputGenerateTransactionOptions,
    InputGenerateTransactionPayloadData, Network, Signature
} from "@endlesslab/endless-ts-sdk";

export interface EndlessSignAndSubmitTransaction {
    gasUnitPrice?: number;
    maxGasAmount?: number;
    payload: InputGenerateTransactionPayloadData;
    options?: InputGenerateTransactionOptions;
}

export interface EndlessSignMessageInput {
    address?: string;
    application?: string;
    chainId?: number;
    message: string;
    nonce?: string;
}

export type EndlessSignMessageOutput = {
    address?: string;
    application?: string;
    chainId?: number;
    fullMessage: string;
    publicKey: string;
    message: string;
    nonce: string;
    prefix: 'Endless::Message';
    signature: Signature;
};

// Common Args and Responses
export enum UserResponseStatus {
    APPROVED = 'Approved',
    REJECTED = 'Rejected'
}

export interface UserApproval<TResponseArgs> {
    status: UserResponseStatus.APPROVED;
    args: TResponseArgs;
}

export interface UserRejection {
    status: UserResponseStatus.REJECTED;
    message?: string;
}

export type UserResponse<TResponseArgs> = UserApproval<TResponseArgs> | UserRejection;

export type AccountInfo = {
    account: AccountAddress;
    address: string;
    authKey: string;
    ansName?: string;
}

export type NetworkInfo = {
    name: Network;
    chainId: number;
    url: string;
};


export enum EndLessSDKEvent {
    INIT = 'init',
    WALLET_INIT_LOAD = 'walletInitLoad',
    CONNECT = 'connect',
    GETACCOUNT = 'getAccount',
    DISCONNECT = 'disconnect',
    ACCOUNT_CHANGE = 'accountChange',
    NETWORK_CHANGE ='networkChange',
    COLOR_MODE_CHANGE ='colorModeChange',
    OPEN = 'open',
    CLOSE = 'close'
}
export type EndLessSDKEventType = (typeof EndLessSDKEvent)[keyof typeof EndLessSDKEvent];
export interface EndLessSDKEventsMap {
    [EndLessSDKEvent.CONNECT]: AccountInfo;
    [EndLessSDKEvent.DISCONNECT]: void;
    [EndLessSDKEvent.ACCOUNT_CHANGE]: AccountInfo;
    [EndLessSDKEvent.GETACCOUNT]: AccountInfo[];
    [EndLessSDKEvent.COLOR_MODE_CHANGE]: { colorMode: string };
    [EndLessSDKEvent.NETWORK_CHANGE]: NetworkInfo;
}
export type EndLessSDKEventPayload<T extends EndLessSDKEventType> = T extends keyof EndLessSDKEventsMap ? EndLessSDKEventsMap[T] : undefined;

export type EndLessSDKEventListenersType = {
    [K in EndLessSDKEventType]?: Array<(payload: EndLessSDKEventPayload<K>) => void>;
};