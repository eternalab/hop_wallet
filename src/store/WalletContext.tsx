import React, { createContext, useContext, useReducer, ReactNode, useMemo } from 'react';
import {
    WalletState,
    WalletAction,
    walletReducer,
    initialWalletState,
    walletActions,
} from './walletReducer';
import { AppView, CollectionItem, NetworkId, NftItem, Token } from '../types/common';
import { LocalPubAccount, WalletSetting } from '../types/wallet';
import { PendingSignOrConfirmRequest } from '../types/background';
import { COPY_FEEDBACK_TIMEOUT_MS } from '../constants';

// ============ Context Types ============

interface WalletActions {
    setLoading: (loading: boolean) => void;
    initWallet: (payload: {
        isInitialized: boolean;
        isLocked: boolean;
        accounts: LocalPubAccount[];
        activeIndex: number;
        setting: WalletSetting;
        largestHDIndex: number;
    }) => void;
    resetWallet: () => void;
    lockWallet: () => void;
    unlockWallet: () => void;
    setAccounts: (accounts: LocalPubAccount[]) => void;
    addAccount: (account: LocalPubAccount) => void;
    removeAccount: (accounts: LocalPubAccount[], activeIndex: number) => void;
    setActiveAccount: (index: number) => void;
    updateSettings: (setting: WalletSetting) => void;
    switchNetwork: (networkId: NetworkId) => void;
    setView: (view: AppView) => void;
    goBack: () => void;
    selectToken: (token: Token | null) => void;
    selectCollection: (collection: CollectionItem | null) => void;
    selectNft: (nft: NftItem | null) => void;
    setTxHash: (hash: string) => void;
    clearSelections: () => void;
    setPendingRequest: (request: PendingSignOrConfirmRequest) => void;
    clearPendingRequest: () => void;
    setUnlockJumpTo: (view: AppView) => void;
    setLoadingBalance: (loading: boolean) => void;
    setCopied: (copied: boolean) => void;
    copyToClipboard: (text: string) => void;
    navigateToTokenDetail: (token: Token | null) => void;
    navigateToCollectionDetail: (collection: CollectionItem) => void;
    navigateToNftDetail: (nft: NftItem) => void;
    navigateToTxResult: (hash: string) => void;
}

interface WalletContextValue {
    state: WalletState;
    dispatch: React.Dispatch<WalletAction>;
    actions: WalletActions;
}

// ============ Create Context ============

const WalletContext = createContext<WalletContextValue | null>(null);

// ============ Provider Component ============

interface WalletProviderProps {
    children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(walletReducer, initialWalletState);

    // Create bound actions with current dispatch
    const actions = useMemo<WalletActions>(() => ({
        setLoading: (loading: boolean) => {
            dispatch(walletActions.setLoading(loading));
        },

        initWallet: (payload) => {
            dispatch(walletActions.initWallet(payload));
        },

        resetWallet: () => {
            dispatch(walletActions.resetWallet());
        },

        lockWallet: () => {
            dispatch(walletActions.lockWallet());
        },

        unlockWallet: () => {
            dispatch(walletActions.unlockWallet());
        },

        setAccounts: (accounts: LocalPubAccount[]) => {
            dispatch(walletActions.setAccounts(accounts));
        },

        addAccount: (account: LocalPubAccount) => {
            dispatch(walletActions.addAccount(account));
        },

        removeAccount: (accounts: LocalPubAccount[], activeIndex: number) => {
            dispatch(walletActions.removeAccount(accounts, activeIndex));
        },

        setActiveAccount: (index: number) => {
            dispatch(walletActions.setActiveAccount(index));
        },

        updateSettings: (setting: WalletSetting) => {
            dispatch(walletActions.updateSettings(setting));
        },

        switchNetwork: (networkId: NetworkId) => {
            dispatch(walletActions.switchNetwork(networkId));
        },

        setView: (view: AppView) => {
            dispatch(walletActions.setView(view));
        },

        goBack: () => {
            dispatch(walletActions.goBack());
        },

        selectToken: (token: Token | null) => {
            dispatch(walletActions.selectToken(token));
        },

        selectCollection: (collection: CollectionItem | null) => {
            dispatch(walletActions.selectCollection(collection));
        },

        selectNft: (nft: NftItem | null) => {
            dispatch(walletActions.selectNft(nft));
        },

        setTxHash: (hash: string) => {
            dispatch(walletActions.setTxHash(hash));
        },

        clearSelections: () => {
            dispatch(walletActions.clearSelections());
        },

        setPendingRequest: (request: PendingSignOrConfirmRequest) => {
            dispatch(walletActions.setPendingRequest(request));
        },

        clearPendingRequest: () => {
            dispatch(walletActions.clearPendingRequest());
        },

        setUnlockJumpTo: (view: AppView) => {
            dispatch(walletActions.setUnlockJumpTo(view));
        },

        setLoadingBalance: (loading: boolean) => {
            dispatch(walletActions.setLoadingBalance(loading));
        },

        setCopied: (copied: boolean) => {
            dispatch(walletActions.setCopied(copied));
        },

        copyToClipboard: (text: string) => {
            navigator.clipboard.writeText(text);
            dispatch(walletActions.setCopied(true));
            setTimeout(() => {
                dispatch(walletActions.setCopied(false));
            }, COPY_FEEDBACK_TIMEOUT_MS);
        },

        navigateToTokenDetail: (token: Token | null) => {
            dispatch(walletActions.selectToken(token));
            dispatch(walletActions.setView(AppView.TOKEN_DETAIL));
        },

        navigateToCollectionDetail: (collection: CollectionItem) => {
            dispatch(walletActions.selectCollection(collection));
            dispatch(walletActions.setView(AppView.COLLECTION_DETAIL));
        },

        navigateToNftDetail: (nft: NftItem) => {
            dispatch(walletActions.selectNft(nft));
            dispatch(walletActions.setView(AppView.NFT_DETAIL));
        },

        navigateToTxResult: (hash: string) => {
            dispatch(walletActions.setTxHash(hash));
            dispatch(walletActions.setView(AppView.TRANSACTION_RESULT));
        },
    }), [dispatch]);

    const value = useMemo<WalletContextValue>(() => ({
        state,
        dispatch,
        actions,
    }), [state, dispatch, actions]);

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
};

// ============ Hook ============

export function useWallet(): WalletContextValue {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
}

// ============ Selector Hooks (for performance optimization) ============

export function useWalletState(): WalletState {
    const { state } = useWallet();
    return state;
}

export function useWalletActions(): WalletActions {
    const { actions } = useWallet();
    return actions;
}

export function useActiveAccount(): LocalPubAccount | null {
    const { state } = useWallet();
    return state.activeAccount;
}

export function useCurrentNetwork() {
    const { state } = useWallet();
    return state.setting.networks[state.setting.currentNetwork];
}

export function useCurrentView(): AppView {
    const { state } = useWallet();
    return state.view;
}

export function useIsLocked(): boolean {
    const { state } = useWallet();
    return state.isLocked;
}
