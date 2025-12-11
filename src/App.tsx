import React, { useCallback, useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { AppView } from './types/common';
import { ERROR_INCORRECT_PASSWORD, URL_PARAM_REQUEST_ID } from './constants';
import { Button, Input } from './components/UI';
import { BottomNav } from './components/BottomNav';
import { ToastProvider, useToast } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomeView } from './views/HomeView';
import { SettingsView } from './views/SettingsView';
import {
    ActivityView,
    CollectionDetail,
    CollectionsView,
    DAppsView,
    ReceiveView,
    SendView,
    TokenDetailView,
    NFTDetailView,
    SendNFTView,
    TransactionResultView
} from './views/OtherViews';
import { ConnectRequestView, SignMessageRequestView, SignTransactionRequestView } from './views/ApprovalViews';
import { OnboardingView } from './views/OnboardingView';
import { LocalPubAccount } from "./types/wallet";
import { MessageResponse, MessageType } from "./types/background";
import { EndlessService, MnemonicUtils } from "./services/ExternalUtils";
import { ConfirmModal } from './components/ConfirmModal';
import { WalletProvider, useWallet, useWalletState, useWalletActions } from './store';

// Inner App component that uses Toast and Wallet Context
const AppContent: React.FC = () => {
    const { showToast } = useToast();
    const state = useWalletState();
    const actions = useWalletActions();

    const [unlockPasswordInput, setUnlockPasswordInput] = useState('');

    // Modal State
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        type?: 'danger' | 'warning' | 'info';
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'danger'
    });

    // Current network helper
    const currentNetwork = state.setting.networks[state.setting.currentNetwork];

    useEffect(() => {
        initRequest();
    }, []);

    useEffect(() => {
        if (state.view !== AppView.LOCK && state.view !== AppView.SETUP_PASSWORD && state.view !== AppView.ONBOARDING) {
            updateAppInfo();
        }
    }, [state.view]);

    const initRequest = async () => {
        const params = new URLSearchParams(window.location.search);
        const requestId = params.get(URL_PARAM_REQUEST_ID);

        try {
            const response: MessageResponse = await chrome.runtime.sendMessage({
                type: MessageType.InitializedRequests,
                data: { requestId: requestId ?? "" }
            });

            if (response && response.success) {
                const resp = response.data;
                if (resp.isInitialized) {
                    let jumpTo = AppView.HOME;
                    if (resp.psocr !== null) {
                        actions.setPendingRequest(resp.psocr);
                        switch (resp.psocr.type) {
                            case MessageType.WalletConnect:
                                jumpTo = AppView.CONNECT_REQUEST;
                                break;
                            case MessageType.WalletSignAndSubmitTransaction:
                                jumpTo = AppView.SIGN_TRANSACTION_REQUEST;
                                break;
                            case MessageType.WalletSignMessage:
                                jumpTo = AppView.SIGN_MESSAGE_REQUEST;
                                break;
                        }
                        actions.setUnlockJumpTo(jumpTo);
                    }

                    let largestHDIndex = 0;
                    if (resp.localPubAccounts.length > 0) {
                        const maxAccount = resp.localPubAccounts.reduce(
                            (max: LocalPubAccount, current: LocalPubAccount) =>
                                current.hdIndex > max.hdIndex ? current : max
                        );
                        largestHDIndex = maxAccount.hdIndex;
                    }

                    actions.initWallet({
                        isInitialized: true,
                        isLocked: resp.isLocked,
                        accounts: resp.localPubAccounts,
                        activeIndex: resp.activeIndex,
                        setting: resp.setting,
                        largestHDIndex,
                    });

                    actions.setView(resp.isLocked ? AppView.LOCK : jumpTo);
                } else {
                    actions.setView(AppView.SETUP_PASSWORD);
                    actions.setLoading(false);
                }
            } else {
                showToast("Failed to init app", 'error');
                actions.setLoading(false);
            }
        } catch (e) {
            console.error("Init request failed:", e);
            showToast("Failed to init app", 'error');
            actions.setLoading(false);
        }
    };

    const updateAppInfo = async () => {
        try {
            const response: MessageResponse = await chrome.runtime.sendMessage({
                type: MessageType.InitializedRequests,
                data: { requestId: "" }
            });

            if (response && response.success) {
                const resp = response.data;
                let largestHDIndex = state.largestHDIndex;
                if (resp.localPubAccounts.length > 0) {
                    const maxAccount = resp.localPubAccounts.reduce(
                        (max: LocalPubAccount, current: LocalPubAccount) =>
                            current.hdIndex > max.hdIndex ? current : max
                    );
                    largestHDIndex = maxAccount.hdIndex;
                }

                actions.initWallet({
                    isInitialized: resp.isInitialized,
                    isLocked: state.isLocked,
                    accounts: resp.localPubAccounts,
                    activeIndex: resp.activeIndex,
                    setting: resp.setting,
                    largestHDIndex,
                });
            }
        } catch (e) {
            console.error("Update app info failed:", e);
        }
    };

    const createWallet = async (password: string, mnemonic?: string) => {
        const response: MessageResponse = await chrome.runtime.sendMessage({
            type: MessageType.CreateWallet,
            data: { password, mnemonic }
        });

        if (response && response.success) {
            actions.initWallet({
                isInitialized: true,
                isLocked: false,
                accounts: response.data,
                activeIndex: 0,
                setting: state.setting,
                largestHDIndex: 0,
            });
        } else {
            throw new Error("Failed to create wallet");
        }
    };

    const unlockWithPassword = async (password: string) => {
        const response = await chrome.runtime.sendMessage({
            type: MessageType.UnlockWallet,
            data: { password }
        });
        if (response && response.success) {
            setUnlockPasswordInput('');
            actions.unlockWallet();
            actions.setView(state.unlockJumpTo);
        } else {
            showToast(ERROR_INCORRECT_PASSWORD, 'error');
        }
    };

    const handleUnlockApp = async () => {
        await unlockWithPassword(unlockPasswordInput);
    };

    const handleCreateAccount = async () => {
        const statusResp: MessageResponse = await chrome.runtime.sendMessage({
            type: MessageType.CheckUnlockStatus,
            data: {}
        });

        if (statusResp?.data?.isUnlocked) {
            const response: MessageResponse = await chrome.runtime.sendMessage({
                type: MessageType.CreateWalletWithMnemonicAndIndex,
                data: {
                    name: `Account ${state.largestHDIndex + 1}`,
                    index: state.largestHDIndex + 1
                }
            });

            if (response.success) {
                actions.addAccount(response.data.account);
            }
        } else {
            actions.lockWallet();
        }
    };

    const handleImportPrivateKey = async (input: string) => {
        const statusResp: MessageResponse = await chrome.runtime.sendMessage({
            type: MessageType.CheckUnlockStatus,
            data: {}
        });

        if (statusResp?.data?.isUnlocked) {
            const response = await chrome.runtime.sendMessage({
                type: MessageType.ImportPrivateKey,
                data: {
                    name: "Account " + state.accounts.length,
                    privateKey: input,
                }
            });

            if (response?.success) {
                actions.addAccount(response.data.account);
            }
            actions.setView(AppView.HOME);
        } else {
            actions.lockWallet();
        }
    };

    const confirmAction = (title: string, message: string, action: () => void, type: 'danger' | 'warning' = 'danger') => {
        setModalConfig({
            isOpen: true,
            title,
            message,
            onConfirm: () => {
                action();
                setModalConfig(prev => ({ ...prev, isOpen: false }));
            },
            type
        });
    };

    const handleRemoveAccount = async (address: string) => {
        confirmAction(
            "Remove Account",
            "This operation is irreversible. Are you sure you want to delete this account?",
            async () => {
                const statusResp: MessageResponse = await chrome.runtime.sendMessage({
                    type: MessageType.CheckUnlockStatus,
                    data: {}
                });

                if (statusResp?.data?.isUnlocked) {
                    const processRemoval = async () => {
                        const response: MessageResponse = await chrome.runtime.sendMessage({
                            type: MessageType.RemoveWallet,
                            data: { address }
                        });

                        if (response.success) {
                            if (response.data.reset) {
                                actions.resetWallet();
                            } else {
                                actions.removeAccount(
                                    response.data.localPubAccounts,
                                    response.data.activeIndex
                                );
                            }
                        }
                    };

                    if (state.accounts.length === 1) {
                        setTimeout(() => {
                            confirmAction(
                                "Reset Wallet",
                                "This operation will completely reset your wallet. ALL data will be lost. Are you sure?",
                                processRemoval,
                                'danger'
                            );
                        }, 300);
                    } else {
                        await processRemoval();
                    }
                } else {
                    actions.lockWallet();
                }
            }
        );
    };

    const handleOnboardingComplete = async (password: string, mnemonic?: string) => {
        await createWallet(password, mnemonic);
        actions.setView(AppView.HOME);
    };

    const handleGenerateMnemonic = async (): Promise<string> => {
        const response: MessageResponse = await chrome.runtime.sendMessage({
            type: MessageType.GenerateMnemonic,
            data: {}
        });
        if (response && response.success) {
            return response.data;
        }
        throw new Error('Failed to generate mnemonic');
    };

    const handleValidateMnemonic = async (mnemonic: string): Promise<boolean> => {
        return MnemonicUtils.validateMnemonic(mnemonic);
    };

    const refreshBalance = useCallback(async () => {
        if (!state.activeAccount) return;
        actions.setLoadingBalance(true);
        try {
            await EndlessService.getAccountBalance(
                state.activeAccount.address,
                currentNetwork
            );
        } catch (e) {
            console.error(e);
        } finally {
            actions.setLoadingBalance(false);
        }
    }, [state.activeAccount, currentNetwork]);

    const logout = async () => {
        await chrome.runtime.sendMessage({
            type: MessageType.LockWallet,
            data: {}
        });
        actions.lockWallet();
    };

    const renderLockScreen = () => (
        <div className="flex flex-col h-full p-8 justify-center items-center bg-slate-900 text-white">
            <div className="w-25 h-25 rounded-2xl flex items-center justify-center mb-6">
                <img src="/public/logo.png" alt="Logo" className="w-full h-full" />
            </div>
            <h1 className="text-2xl font-bold mb-8">Welcome Back</h1>
            <form onSubmit={(e) => {
                e.preventDefault();
                handleUnlockApp();
            }} className="w-full space-y-4">
                <Input
                    type="password"
                    placeholder="Enter Password"
                    value={unlockPasswordInput}
                    onChange={e => setUnlockPasswordInput(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
                />
                <Button variant="primary">Unlock</Button>
            </form>
        </div>
    );

    const showBottomNav = [
        AppView.HOME,
        AppView.ACTIVITY,
        AppView.COLLECTION,
        AppView.DAPPS,
        AppView.TOKEN_DETAIL,
        AppView.COLLECTION_DETAIL,
        AppView.NFT_DETAIL,
        AppView.SEND_NFT,
        AppView.TRANSACTION_RESULT
    ].includes(state.view);

    return (
        <>
            <div className="flex-1 overflow-hidden relative bg-slate-50">
                {state.view === AppView.LOCK && renderLockScreen()}

                {(state.view === AppView.SETUP_PASSWORD || state.view === AppView.ONBOARDING) && (
                    <OnboardingView
                        onComplete={handleOnboardingComplete}
                        onGenerateMnemonic={handleGenerateMnemonic}
                        onValidateMnemonic={handleValidateMnemonic}
                    />
                )}

                {state.view === AppView.HOME && state.activeAccount && (
                    <HomeView
                        activeAccount={state.activeAccount}
                        onSetActiveAccount={(acc) => {
                            const idx = state.accounts.findIndex(a => a.address === acc.address);
                            if (idx >= 0) actions.setActiveAccount(idx);
                        }}
                        isLoadingBalance={state.isLoadingBalance}
                        copied={state.copied}
                        onChangeView={actions.setView}
                        onCopyAddress={() => {
                            if (state.activeAccount) {
                                actions.copyToClipboard(state.activeAccount.address);
                            }
                        }}
                        onSelectToken={(t) => actions.navigateToTokenDetail(t)}
                        onManageAccounts={() => actions.setView(AppView.SETTINGS)}
                        onRefreshBalance={refreshBalance}
                        walletState={{
                            isInitialized: state.isInitialized,
                            accounts: state.accounts,
                            currentAccountIndex: state.currentAccountIndex,
                            largestHDIndex: state.largestHDIndex,
                            setting: state.setting,
                            isLocked: state.isLocked,
                        }}
                        onSetWalletState={(ws) => {
                            actions.updateSettings(ws.setting);
                            if (ws.currentAccountIndex !== state.currentAccountIndex) {
                                actions.setActiveAccount(ws.currentAccountIndex);
                            }
                        }}
                    />
                )}

                {state.view === AppView.SETTINGS && (
                    <SettingsView
                        walletState={{
                            isInitialized: state.isInitialized,
                            accounts: state.accounts,
                            currentAccountIndex: state.currentAccountIndex,
                            largestHDIndex: state.largestHDIndex,
                            setting: state.setting,
                            isLocked: state.isLocked,
                        }}
                        onSetWalletState={(ws) => {
                            actions.updateSettings(ws.setting);
                            if (ws.currentAccountIndex !== state.currentAccountIndex) {
                                actions.setActiveAccount(ws.currentAccountIndex);
                            }
                        }}
                        onChangeView={actions.setView}
                        onBack={() => actions.setView(AppView.HOME)}
                        onLogout={logout}
                        onRemoveAccount={handleRemoveAccount}
                        onAddAccount={handleCreateAccount}
                        onImportAccount={handleImportPrivateKey}
                    />
                )}

                {state.view === AppView.ACTIVITY && state.activeAccount && (
                    <ActivityView
                        address={state.activeAccount.address}
                        network={currentNetwork}
                    />
                )}

                {state.view === AppView.COLLECTION && state.activeAccount && (
                    <CollectionsView
                        address={state.activeAccount.address}
                        network={currentNetwork}
                        onSelect={(collection) => actions.navigateToCollectionDetail(collection)}
                    />
                )}

                {state.view === AppView.COLLECTION_DETAIL && state.activeAccount && (
                    <CollectionDetail
                        collection={state.selectedCollection}
                        address={state.activeAccount.address}
                        network={currentNetwork}
                        onBack={() => actions.setView(AppView.COLLECTION)}
                        onSelectNft={(nft) => actions.navigateToNftDetail(nft)}
                    />
                )}

                {state.view === AppView.NFT_DETAIL && (
                    <NFTDetailView
                        nft={state.selectedNft}
                        onBack={() => actions.setView(AppView.COLLECTION_DETAIL)}
                        onTransfer={() => actions.setView(AppView.SEND_NFT)}
                    />
                )}

                {state.view === AppView.SEND_NFT && state.selectedNft && state.activeAccount && (
                    <SendNFTView
                        nft={state.selectedNft}
                        network={currentNetwork}
                        activeAccount={state.activeAccount}
                        onBack={() => actions.setView(AppView.COLLECTION_DETAIL)}
                        onSuccess={(hash) => actions.navigateToTxResult(hash)}
                    />
                )}

                {state.view === AppView.TOKEN_DETAIL && (
                    <TokenDetailView
                        token={state.selectedToken}
                        network={currentNetwork}
                        onBack={() => actions.setView(AppView.HOME)}
                        onAction={actions.setView}
                    />
                )}

                {state.view === AppView.DAPPS && (
                    <DAppsView networkId={state.setting.currentNetwork} />
                )}

                {state.view === AppView.SEND && state.activeAccount && (
                    <SendView
                        activeAccount={state.activeAccount}
                        network={currentNetwork}
                        onBack={() => actions.setView(AppView.HOME)}
                        onSuccess={(hash) => actions.navigateToTxResult(hash)}
                        sendToken={state.selectedToken}
                        setView={actions.setView}
                        onRefresh={refreshBalance}
                    />
                )}

                {state.view === AppView.RECEIVE && (
                    <ReceiveView
                        address={state.activeAccount?.address || ''}
                        onBack={() => actions.setView(AppView.HOME)}
                    />
                )}

                {state.view === AppView.TRANSACTION_RESULT && (
                    <TransactionResultView
                        txHash={state.txHash}
                        network={currentNetwork}
                        onBack={() => actions.setView(AppView.HOME)}
                    />
                )}

                {state.view === AppView.CONNECT_REQUEST && state.pendingRequest && state.activeAccount && (
                    <ConnectRequestView
                        network={currentNetwork}
                        psocr={state.pendingRequest}
                        activeAccount={state.activeAccount}
                    />
                )}

                {state.view === AppView.SIGN_TRANSACTION_REQUEST && state.pendingRequest && state.activeAccount && (
                    <SignTransactionRequestView
                        network={currentNetwork}
                        psocr={state.pendingRequest}
                        activeAccount={state.activeAccount}
                    />
                )}

                {state.view === AppView.SIGN_MESSAGE_REQUEST && state.pendingRequest && state.activeAccount && (
                    <SignMessageRequestView
                        network={currentNetwork}
                        psocr={state.pendingRequest}
                        activeAccount={state.activeAccount}
                    />
                )}
            </div>

            {showBottomNav && <BottomNav currentView={state.view} onChangeView={actions.setView} />}

            <ConfirmModal
                isOpen={modalConfig.isOpen}
                title={modalConfig.title}
                message={modalConfig.message}
                onConfirm={modalConfig.onConfirm}
                onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                type={modalConfig.type}
            />
        </>
    );
};

// Main App component with all providers
const App: React.FC = () => {
    return (
        <ErrorBoundary>
            <WalletProvider>
                <ToastProvider>
                    <AppContent />
                </ToastProvider>
            </WalletProvider>
        </ErrorBoundary>
    );
};

export default App;