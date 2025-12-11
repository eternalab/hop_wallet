import { NetworkId } from '../../types/common';
import { WalletData } from '../../types/wallet';

// ============ Settings View State Types ============

export type SettingsMode = 'LIST' | 'NETWORKS' | 'SECURITY' | 'WALLETS' | 'IMPORT_WALLET';

export interface SettingsState {
    mode: SettingsMode;
    editingNetworkId: NetworkId;
    tempRpc: string;
    tempExplorer: string;
    importKey: string;
    showPrivateKey: boolean;
    showMnemonic: boolean;
    walletData: WalletData | undefined;
}

// ============ Action Types ============

export enum SettingsActionType {
    SET_MODE = 'SET_MODE',
    SET_EDITING_NETWORK_ID = 'SET_EDITING_NETWORK_ID',
    SET_TEMP_RPC = 'SET_TEMP_RPC',
    SET_TEMP_EXPLORER = 'SET_TEMP_EXPLORER',
    SET_IMPORT_KEY = 'SET_IMPORT_KEY',
    SET_SHOW_PRIVATE_KEY = 'SET_SHOW_PRIVATE_KEY',
    SET_SHOW_MNEMONIC = 'SET_SHOW_MNEMONIC',
    SET_WALLET_DATA = 'SET_WALLET_DATA',
    RESET_SECURITY_VISIBILITY = 'RESET_SECURITY_VISIBILITY',
    INIT_NETWORK_FIELDS = 'INIT_NETWORK_FIELDS',
}

export type SettingsAction =
    | { type: SettingsActionType.SET_MODE; payload: SettingsMode }
    | { type: SettingsActionType.SET_EDITING_NETWORK_ID; payload: NetworkId }
    | { type: SettingsActionType.SET_TEMP_RPC; payload: string }
    | { type: SettingsActionType.SET_TEMP_EXPLORER; payload: string }
    | { type: SettingsActionType.SET_IMPORT_KEY; payload: string }
    | { type: SettingsActionType.SET_SHOW_PRIVATE_KEY; payload: boolean }
    | { type: SettingsActionType.SET_SHOW_MNEMONIC; payload: boolean }
    | { type: SettingsActionType.SET_WALLET_DATA; payload: WalletData | undefined }
    | { type: SettingsActionType.RESET_SECURITY_VISIBILITY }
    | { type: SettingsActionType.INIT_NETWORK_FIELDS; payload: { rpc: string; explorer: string } };

// ============ Initial State ============

export const settingsInitialState: SettingsState = {
    mode: 'LIST',
    editingNetworkId: NetworkId.MAINNET,
    tempRpc: '',
    tempExplorer: '',
    importKey: '',
    showPrivateKey: false,
    showMnemonic: false,
    walletData: undefined,
};

// ============ Reducer ============

export function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
    switch (action.type) {
        case SettingsActionType.SET_MODE:
            return { ...state, mode: action.payload };
        case SettingsActionType.SET_EDITING_NETWORK_ID:
            return { ...state, editingNetworkId: action.payload };
        case SettingsActionType.SET_TEMP_RPC:
            return { ...state, tempRpc: action.payload };
        case SettingsActionType.SET_TEMP_EXPLORER:
            return { ...state, tempExplorer: action.payload };
        case SettingsActionType.SET_IMPORT_KEY:
            return { ...state, importKey: action.payload };
        case SettingsActionType.SET_SHOW_PRIVATE_KEY:
            return { ...state, showPrivateKey: action.payload };
        case SettingsActionType.SET_SHOW_MNEMONIC:
            return { ...state, showMnemonic: action.payload };
        case SettingsActionType.SET_WALLET_DATA:
            return { ...state, walletData: action.payload };
        case SettingsActionType.RESET_SECURITY_VISIBILITY:
            return { ...state, showPrivateKey: false, showMnemonic: false };
        case SettingsActionType.INIT_NETWORK_FIELDS:
            return { ...state, tempRpc: action.payload.rpc, tempExplorer: action.payload.explorer };
        default:
            return state;
    }
}
