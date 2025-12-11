import { AppView, CollectionItem, NetworkId, NftItem, Token } from '../types/common';
import { LocalPubAccount, WalletSetting } from '../types/wallet';
import { PendingSignOrConfirmRequest } from '../types/background';
import { DefaultNetworkConfig } from '../constants';

// ============ State Types ============

export interface WalletState {
    // Initialization
    isInitialized: boolean;
    isLocked: boolean;
    isLoading: boolean;

    // Accounts
    accounts: LocalPubAccount[];
    currentAccountIndex: number;
    largestHDIndex: number;
    activeAccount: LocalPubAccount | null;

    // Settings
    setting: WalletSetting;

    // Navigation
    view: AppView;
    previousView: AppView | null;

    // Selections
    selectedToken: Token | null;
    selectedCollection: CollectionItem | null;
    selectedNft: NftItem | null;
    txHash: string;

    // DApp Requests
    pendingRequest: PendingSignOrConfirmRequest | null;
    unlockJumpTo: AppView;

    // UI State
    isLoadingBalance: boolean;
    copied: boolean;
}

export const initialWalletState: WalletState = {
    isInitialized: false,
    isLocked: true,
    isLoading: true,

    accounts: [],
    currentAccountIndex: 0,
    largestHDIndex: 0,
    activeAccount: null,

    setting: {
        networks: DefaultNetworkConfig,
        currentNetwork: NetworkId.MAINNET
    },

    view: AppView.LOCK,
    previousView: null,

    selectedToken: null,
    selectedCollection: null,
    selectedNft: null,
    txHash: '',

    pendingRequest: null,
    unlockJumpTo: AppView.HOME,

    isLoadingBalance: false,
    copied: false,
};

// ============ Action Types ============

export enum ActionType {
    // Initialization
    SET_LOADING = 'SET_LOADING',
    INIT_WALLET = 'INIT_WALLET',
    RESET_WALLET = 'RESET_WALLET',

    // Lock/Unlock
    LOCK_WALLET = 'LOCK_WALLET',
    UNLOCK_WALLET = 'UNLOCK_WALLET',

    // Accounts
    SET_ACCOUNTS = 'SET_ACCOUNTS',
    ADD_ACCOUNT = 'ADD_ACCOUNT',
    REMOVE_ACCOUNT = 'REMOVE_ACCOUNT',
    SET_ACTIVE_ACCOUNT = 'SET_ACTIVE_ACCOUNT',
    SET_LARGEST_HD_INDEX = 'SET_LARGEST_HD_INDEX',

    // Settings
    UPDATE_SETTINGS = 'UPDATE_SETTINGS',
    SWITCH_NETWORK = 'SWITCH_NETWORK',

    // Navigation
    SET_VIEW = 'SET_VIEW',
    GO_BACK = 'GO_BACK',

    // Selections
    SELECT_TOKEN = 'SELECT_TOKEN',
    SELECT_COLLECTION = 'SELECT_COLLECTION',
    SELECT_NFT = 'SELECT_NFT',
    SET_TX_HASH = 'SET_TX_HASH',
    CLEAR_SELECTIONS = 'CLEAR_SELECTIONS',

    // DApp Requests
    SET_PENDING_REQUEST = 'SET_PENDING_REQUEST',
    CLEAR_PENDING_REQUEST = 'CLEAR_PENDING_REQUEST',
    SET_UNLOCK_JUMP_TO = 'SET_UNLOCK_JUMP_TO',

    // UI State
    SET_LOADING_BALANCE = 'SET_LOADING_BALANCE',
    SET_COPIED = 'SET_COPIED',
}

// ============ Action Interfaces ============

interface SetLoadingAction {
    type: ActionType.SET_LOADING;
    payload: boolean;
}

interface InitWalletAction {
    type: ActionType.INIT_WALLET;
    payload: {
        isInitialized: boolean;
        isLocked: boolean;
        accounts: LocalPubAccount[];
        activeIndex: number;
        setting: WalletSetting;
        largestHDIndex: number;
    };
}

interface ResetWalletAction {
    type: ActionType.RESET_WALLET;
}

interface LockWalletAction {
    type: ActionType.LOCK_WALLET;
}

interface UnlockWalletAction {
    type: ActionType.UNLOCK_WALLET;
}

interface SetAccountsAction {
    type: ActionType.SET_ACCOUNTS;
    payload: LocalPubAccount[];
}

interface AddAccountAction {
    type: ActionType.ADD_ACCOUNT;
    payload: LocalPubAccount;
}

interface RemoveAccountAction {
    type: ActionType.REMOVE_ACCOUNT;
    payload: {
        accounts: LocalPubAccount[];
        activeIndex: number;
    };
}

interface SetActiveAccountAction {
    type: ActionType.SET_ACTIVE_ACCOUNT;
    payload: number;
}

interface SetLargestHDIndexAction {
    type: ActionType.SET_LARGEST_HD_INDEX;
    payload: number;
}

interface UpdateSettingsAction {
    type: ActionType.UPDATE_SETTINGS;
    payload: WalletSetting;
}

interface SwitchNetworkAction {
    type: ActionType.SWITCH_NETWORK;
    payload: NetworkId;
}

interface SetViewAction {
    type: ActionType.SET_VIEW;
    payload: AppView;
}

interface GoBackAction {
    type: ActionType.GO_BACK;
}

interface SelectTokenAction {
    type: ActionType.SELECT_TOKEN;
    payload: Token | null;
}

interface SelectCollectionAction {
    type: ActionType.SELECT_COLLECTION;
    payload: CollectionItem | null;
}

interface SelectNftAction {
    type: ActionType.SELECT_NFT;
    payload: NftItem | null;
}

interface SetTxHashAction {
    type: ActionType.SET_TX_HASH;
    payload: string;
}

interface ClearSelectionsAction {
    type: ActionType.CLEAR_SELECTIONS;
}

interface SetPendingRequestAction {
    type: ActionType.SET_PENDING_REQUEST;
    payload: PendingSignOrConfirmRequest;
}

interface ClearPendingRequestAction {
    type: ActionType.CLEAR_PENDING_REQUEST;
}

interface SetUnlockJumpToAction {
    type: ActionType.SET_UNLOCK_JUMP_TO;
    payload: AppView;
}

interface SetLoadingBalanceAction {
    type: ActionType.SET_LOADING_BALANCE;
    payload: boolean;
}

interface SetCopiedAction {
    type: ActionType.SET_COPIED;
    payload: boolean;
}

export type WalletAction =
    | SetLoadingAction
    | InitWalletAction
    | ResetWalletAction
    | LockWalletAction
    | UnlockWalletAction
    | SetAccountsAction
    | AddAccountAction
    | RemoveAccountAction
    | SetActiveAccountAction
    | SetLargestHDIndexAction
    | UpdateSettingsAction
    | SwitchNetworkAction
    | SetViewAction
    | GoBackAction
    | SelectTokenAction
    | SelectCollectionAction
    | SelectNftAction
    | SetTxHashAction
    | ClearSelectionsAction
    | SetPendingRequestAction
    | ClearPendingRequestAction
    | SetUnlockJumpToAction
    | SetLoadingBalanceAction
    | SetCopiedAction;

// ============ Reducer ============

export function walletReducer(state: WalletState, action: WalletAction): WalletState {
    switch (action.type) {
        case ActionType.SET_LOADING:
            return { ...state, isLoading: action.payload };

        case ActionType.INIT_WALLET: {
            const { isInitialized, isLocked, accounts, activeIndex, setting, largestHDIndex } = action.payload;
            return {
                ...state,
                isInitialized,
                isLocked,
                accounts,
                currentAccountIndex: activeIndex,
                activeAccount: accounts[activeIndex] || null,
                setting,
                largestHDIndex,
                isLoading: false,
            };
        }

        case ActionType.RESET_WALLET:
            return {
                ...initialWalletState,
                view: AppView.SETUP_PASSWORD,
                isLoading: false,
            };

        case ActionType.LOCK_WALLET:
            return {
                ...state,
                isLocked: true,
                view: AppView.LOCK,
            };

        case ActionType.UNLOCK_WALLET:
            return {
                ...state,
                isLocked: false,
            };

        case ActionType.SET_ACCOUNTS:
            return {
                ...state,
                accounts: action.payload,
                activeAccount: action.payload[state.currentAccountIndex] || null,
            };

        case ActionType.ADD_ACCOUNT: {
            const newAccounts = [...state.accounts, action.payload];
            const newIndex = newAccounts.length - 1;
            return {
                ...state,
                accounts: newAccounts,
                currentAccountIndex: newIndex,
                activeAccount: action.payload,
                largestHDIndex: Math.max(state.largestHDIndex, action.payload.hdIndex),
            };
        }

        case ActionType.REMOVE_ACCOUNT:
            return {
                ...state,
                accounts: action.payload.accounts,
                currentAccountIndex: action.payload.activeIndex,
                activeAccount: action.payload.accounts[action.payload.activeIndex] || null,
            };

        case ActionType.SET_ACTIVE_ACCOUNT: {
            const newIndex = action.payload;
            return {
                ...state,
                currentAccountIndex: newIndex,
                activeAccount: state.accounts[newIndex] || null,
            };
        }

        case ActionType.SET_LARGEST_HD_INDEX:
            return { ...state, largestHDIndex: action.payload };

        case ActionType.UPDATE_SETTINGS:
            return { ...state, setting: action.payload };

        case ActionType.SWITCH_NETWORK:
            return {
                ...state,
                setting: {
                    ...state.setting,
                    currentNetwork: action.payload,
                },
            };

        case ActionType.SET_VIEW:
            return {
                ...state,
                previousView: state.view,
                view: action.payload,
            };

        case ActionType.GO_BACK:
            return {
                ...state,
                view: state.previousView || AppView.HOME,
                previousView: null,
            };

        case ActionType.SELECT_TOKEN:
            return { ...state, selectedToken: action.payload };

        case ActionType.SELECT_COLLECTION:
            return { ...state, selectedCollection: action.payload };

        case ActionType.SELECT_NFT:
            return { ...state, selectedNft: action.payload };

        case ActionType.SET_TX_HASH:
            return { ...state, txHash: action.payload };

        case ActionType.CLEAR_SELECTIONS:
            return {
                ...state,
                selectedToken: null,
                selectedCollection: null,
                selectedNft: null,
                txHash: '',
            };

        case ActionType.SET_PENDING_REQUEST:
            return { ...state, pendingRequest: action.payload };

        case ActionType.CLEAR_PENDING_REQUEST:
            return { ...state, pendingRequest: null };

        case ActionType.SET_UNLOCK_JUMP_TO:
            return { ...state, unlockJumpTo: action.payload };

        case ActionType.SET_LOADING_BALANCE:
            return { ...state, isLoadingBalance: action.payload };

        case ActionType.SET_COPIED:
            return { ...state, copied: action.payload };

        default:
            return state;
    }
}

// ============ Action Creators ============

export const walletActions = {
    setLoading: (loading: boolean): SetLoadingAction => ({
        type: ActionType.SET_LOADING,
        payload: loading,
    }),

    initWallet: (payload: InitWalletAction['payload']): InitWalletAction => ({
        type: ActionType.INIT_WALLET,
        payload,
    }),

    resetWallet: (): ResetWalletAction => ({
        type: ActionType.RESET_WALLET,
    }),

    lockWallet: (): LockWalletAction => ({
        type: ActionType.LOCK_WALLET,
    }),

    unlockWallet: (): UnlockWalletAction => ({
        type: ActionType.UNLOCK_WALLET,
    }),

    setAccounts: (accounts: LocalPubAccount[]): SetAccountsAction => ({
        type: ActionType.SET_ACCOUNTS,
        payload: accounts,
    }),

    addAccount: (account: LocalPubAccount): AddAccountAction => ({
        type: ActionType.ADD_ACCOUNT,
        payload: account,
    }),

    removeAccount: (accounts: LocalPubAccount[], activeIndex: number): RemoveAccountAction => ({
        type: ActionType.REMOVE_ACCOUNT,
        payload: { accounts, activeIndex },
    }),

    setActiveAccount: (index: number): SetActiveAccountAction => ({
        type: ActionType.SET_ACTIVE_ACCOUNT,
        payload: index,
    }),

    setLargestHDIndex: (index: number): SetLargestHDIndexAction => ({
        type: ActionType.SET_LARGEST_HD_INDEX,
        payload: index,
    }),

    updateSettings: (setting: WalletSetting): UpdateSettingsAction => ({
        type: ActionType.UPDATE_SETTINGS,
        payload: setting,
    }),

    switchNetwork: (networkId: NetworkId): SwitchNetworkAction => ({
        type: ActionType.SWITCH_NETWORK,
        payload: networkId,
    }),

    setView: (view: AppView): SetViewAction => ({
        type: ActionType.SET_VIEW,
        payload: view,
    }),

    goBack: (): GoBackAction => ({
        type: ActionType.GO_BACK,
    }),

    selectToken: (token: Token | null): SelectTokenAction => ({
        type: ActionType.SELECT_TOKEN,
        payload: token,
    }),

    selectCollection: (collection: CollectionItem | null): SelectCollectionAction => ({
        type: ActionType.SELECT_COLLECTION,
        payload: collection,
    }),

    selectNft: (nft: NftItem | null): SelectNftAction => ({
        type: ActionType.SELECT_NFT,
        payload: nft,
    }),

    setTxHash: (hash: string): SetTxHashAction => ({
        type: ActionType.SET_TX_HASH,
        payload: hash,
    }),

    clearSelections: (): ClearSelectionsAction => ({
        type: ActionType.CLEAR_SELECTIONS,
    }),

    setPendingRequest: (request: PendingSignOrConfirmRequest): SetPendingRequestAction => ({
        type: ActionType.SET_PENDING_REQUEST,
        payload: request,
    }),

    clearPendingRequest: (): ClearPendingRequestAction => ({
        type: ActionType.CLEAR_PENDING_REQUEST,
    }),

    setUnlockJumpTo: (view: AppView): SetUnlockJumpToAction => ({
        type: ActionType.SET_UNLOCK_JUMP_TO,
        payload: view,
    }),

    setLoadingBalance: (loading: boolean): SetLoadingBalanceAction => ({
        type: ActionType.SET_LOADING_BALANCE,
        payload: loading,
    }),

    setCopied: (copied: boolean): SetCopiedAction => ({
        type: ActionType.SET_COPIED,
        payload: copied,
    }),
};
