import React, { useReducer, useEffect } from 'react';
import { AppView, NetworkId } from '../types/common.ts';
import { Button, Input, Header, Card } from '../components/UI';
import { Users, Globe, Key, Lock, ChevronRight, ArrowDownToLine, Plus, Trash2, Eye, EyeOff, Shield } from 'lucide-react';
import { WalletData, WalletState } from "../types/wallet.ts";
import { MessageResponse, MessageType } from "../types/background.ts";
import {
    SettingsActionType,
    settingsReducer,
    settingsInitialState
} from '../store';

// ============ Component ============

interface SettingsViewProps {
    walletState: WalletState
    onSetWalletState: (state: WalletState) => void;
    onBack: () => void;
    onLogout: () => void;
    onRemoveAccount: (address: string) => void;
    onAddAccount: () => void;
    onImportAccount: (key: string) => void;
    onChangeView: (view: AppView) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
    onBack,
    onLogout,
    onRemoveAccount,
    onAddAccount,
    onImportAccount,
    walletState,
    onSetWalletState,
    onChangeView
}) => {
    const [state, dispatch] = useReducer(settingsReducer, settingsInitialState);

    // Initialize network edit fields
    useEffect(() => {
        if (state.mode === 'NETWORKS') {
            dispatch({
                type: SettingsActionType.INIT_NETWORK_FIELDS,
                payload: {
                    rpc: walletState.setting.networks[state.editingNetworkId].rpcUrl,
                    explorer: walletState.setting.networks[state.editingNetworkId].explorerUrl
                }
            });
        }
    }, [state.mode, state.editingNetworkId, walletState.setting.currentNetwork]);

    // Reset security visibility on mode change
    useEffect(() => {
        if (state.mode !== 'SECURITY') {
            dispatch({ type: SettingsActionType.RESET_SECURITY_VISIBILITY });
        }
        if (state.mode === "SECURITY") {
            exportWallet();
        }
    }, [state.mode]);

    const exportWallet = async () => {
        const statusResp: MessageResponse = await chrome.runtime.sendMessage({
            type: MessageType.CheckUnlockStatus,
            data: {}
        });
        if (statusResp?.data?.isUnlocked) {
            const response: MessageResponse = await chrome.runtime.sendMessage({
                type: MessageType.ExportWallet,
                data: {}
            });
            if (response.success) {
                dispatch({ type: SettingsActionType.SET_WALLET_DATA, payload: response.data });
            }
        } else {
            onChangeView(AppView.LOCK);
        }
    };

    const handleSaveNetwork = async () => {
        let newNetworks = walletState.setting.networks;
        newNetworks[state.editingNetworkId].rpcUrl = state.tempRpc;
        newNetworks[state.editingNetworkId].explorerUrl = state.tempExplorer;
        const newSetting = {
            networks: newNetworks,
            currentNetwork: walletState.setting.currentNetwork,
        };
        const resp = await chrome.runtime.sendMessage({
            type: MessageType.SaveSettings,
            data: { newSetting }
        });
        if (resp && resp.success) {
            onSetWalletState({
                ...walletState,
                setting: newSetting,
            });
        }
        dispatch({ type: SettingsActionType.SET_MODE, payload: 'LIST' });
    };

    const handleImport = () => {
        onImportAccount(state.importKey);
        dispatch({ type: SettingsActionType.SET_IMPORT_KEY, payload: '' });
        dispatch({ type: SettingsActionType.SET_MODE, payload: 'WALLETS' });
    };

    const clickShowPrivateKey = async () => {
        dispatch({ type: SettingsActionType.SET_SHOW_PRIVATE_KEY, payload: !state.showPrivateKey });
    };

    const onSetActiveAccountIndex = async (index: number) => {
        const resp = await chrome.runtime.sendMessage({
            type: MessageType.UpdateActiveIndex,
            data: { activeIndex: index }
        });
        if (resp && resp.success) {
            onSetWalletState({
                ...walletState,
                currentAccountIndex: index,
            });
        }
    };

    const queryPrivateKey = (addr: string) => {
        if (!state.walletData || state.walletData.accounts.length === 0) {
            return "no data";
        } else {
            const r = state.walletData.accounts.filter(w => w.address == addr);
            if (r.length === 0) {
                return "not found";
            } else {
                return r[0].privateKey;
            }
        }
    };

    const clickShowMnemonic = () => {
        dispatch({ type: SettingsActionType.SET_SHOW_MNEMONIC, payload: !state.showMnemonic });
    };

    // --- Sub-View: Network Configuration ---
    if (state.mode === 'NETWORKS') {
        return (
            <div className="flex flex-col h-full bg-slate-50">
                <Header title="Networks" onBack={() => dispatch({ type: SettingsActionType.SET_MODE, payload: 'LIST' })} />
                <div className="p-4 flex-1 overflow-y-auto">
                    <div className="bg-white p-1 rounded-xl flex mb-6 border border-slate-200">
                        <button
                            onClick={() => dispatch({ type: SettingsActionType.SET_EDITING_NETWORK_ID, payload: NetworkId.MAINNET })}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${state.editingNetworkId === NetworkId.MAINNET ? 'bg-cyan-50 text-cyan-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Mainnet
                        </button>
                        <button
                            onClick={() => dispatch({ type: SettingsActionType.SET_EDITING_NETWORK_ID, payload: NetworkId.TESTNET })}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${state.editingNetworkId === NetworkId.TESTNET ? 'bg-cyan-50 text-cyan-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Testnet
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-blue-50 p-3 rounded-lg flex gap-3 items-start">
                            <Globe className="text-blue-500 shrink-0 mt-0.5" size={16} />
                            <p className="text-xs text-blue-700 leading-relaxed">
                                You are editing the connection details
                                for <strong>{walletState.setting.networks[state.editingNetworkId].name}</strong>.
                            </p>
                        </div>

                        <Input
                            label="RPC URL"
                            value={state.tempRpc}
                            onChange={e => dispatch({ type: SettingsActionType.SET_TEMP_RPC, payload: e.target.value })}
                            placeholder="https://..."
                        />
                        <Input
                            label="Block Explorer URL"
                            value={state.tempExplorer}
                            onChange={e => dispatch({ type: SettingsActionType.SET_TEMP_EXPLORER, payload: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>
                </div>
                <div className="p-4 bg-white border-t border-slate-100">
                    <Button onClick={handleSaveNetwork}>Save Configuration</Button>
                </div>
            </div>
        );
    }

    // --- Sub-View: Manage Wallets ---
    if (state.mode === 'WALLETS') {
        return (
            <div className="flex flex-col h-full bg-slate-50">
                <Header title="Manage Accounts" onBack={() => dispatch({ type: SettingsActionType.SET_MODE, payload: 'LIST' })} />
                <div className="p-4 flex-1 overflow-y-auto">
                    <div className="space-y-3 mb-6">
                        {walletState.accounts.map((acc, idx) => (
                            <div key={idx}
                                className={`bg-white p-4 rounded-xl shadow-sm border ${walletState.currentAccountIndex === idx ? 'border-cyan-500 ring-1 ring-cyan-500' : 'border-slate-100'} flex items-center justify-between`}>
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${walletState.currentAccountIndex === idx ? 'bg-cyan-500' : 'bg-slate-300'}`}>
                                        {acc.name.charAt(0)}
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="font-medium text-slate-900 truncate">{acc.name}</div>
                                        <div
                                            className="text-xs text-slate-500 font-mono truncate">{acc.address.slice(0, 6)}...{acc.address.slice(-4)}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {walletState.currentAccountIndex !== idx ? (
                                        <button
                                            onClick={() => onSetActiveAccountIndex(idx)}
                                            className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg text-xs font-bold"
                                        >
                                            Switch
                                        </button>
                                    ) : (
                                        <span
                                            className="text-xs text-cyan-600 font-medium bg-cyan-50 px-2 py-1 rounded">Active</span>
                                    )}

                                    <button
                                        onClick={() => onRemoveAccount(acc.address)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Remove Account"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button variant="secondary" onClick={() => dispatch({ type: SettingsActionType.SET_MODE, payload: 'IMPORT_WALLET' })} className="mb-3"
                        icon={ArrowDownToLine}>
                        Import Account
                    </Button>
                    <Button variant="primary" onClick={onAddAccount} icon={Plus}>
                        Create New Account
                    </Button>
                </div>
            </div>
        );
    }

    // --- Sub-View: Import Wallet ---
    if (state.mode === 'IMPORT_WALLET') {
        return (
            <div className="flex flex-col h-full bg-slate-50">
                <Header title="Import Account" onBack={() => dispatch({ type: SettingsActionType.SET_MODE, payload: 'WALLETS' })} />
                <div className="p-6 flex-1">
                    <div className="space-y-4">
                        <div
                            className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-amber-800 text-xs leading-relaxed">
                            You can import an account using a <strong>Private Key</strong> The account will be added to
                            your existing list.
                        </div>
                        <Input
                            label="Private Key"
                            placeholder="0x...."
                            value={state.importKey}
                            onChange={(e) => dispatch({ type: SettingsActionType.SET_IMPORT_KEY, payload: e.target.value })}
                        />
                    </div>
                </div>
                <div className="p-6 border-t border-slate-100">
                    <Button onClick={handleImport} disabled={!state.importKey}>
                        Import
                    </Button>
                </div>
            </div>
        );
    }

    // --- Sub-View: Security (Active Wallet) ---
    if (state.mode === 'SECURITY') {
        const activeAcc = walletState.accounts[walletState.currentAccountIndex];
        return (
            <div className="flex flex-col h-full bg-slate-50">
                <Header title="Security" onBack={() => dispatch({ type: SettingsActionType.SET_MODE, payload: 'LIST' })} />
                <div className="p-4 flex-1 overflow-y-auto space-y-6">
                    <div className="bg-blue-50 p-3 rounded-lg flex gap-3 items-start">
                        <Shield className="text-blue-500 shrink-0 mt-0.5" size={16} />
                        <p className="text-xs text-blue-700">
                            Displaying credentials
                            for <strong>{activeAcc?.name}</strong>. Never
                            share these keys with anyone.
                        </p>
                    </div>

                    <div className="space-y-2">

                        <Card className="p-4">
                            <div className="flex justify-between items-center mb-3">
                                <div className="font-medium text-slate-700 text-sm">Private Key</div>
                                <button
                                    onClick={clickShowPrivateKey}
                                    className="text-cyan-600 text-xs font-medium flex items-center gap-1 hover:underline"
                                >
                                    {state.showPrivateKey ? <EyeOff size={14} /> : <Eye size={14} />}
                                    {state.showPrivateKey ? 'Hide' : 'Reveal'}
                                </button>
                            </div>
                            <div
                                className={`bg-slate-50 p-3 rounded-lg text-xs font-mono break-all ${state.showPrivateKey ? 'text-slate-700' : 'text-slate-400 select-none'}`}>
                                {state.showPrivateKey ? queryPrivateKey(activeAcc.address) : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
                            </div>
                        </Card>

                        {/* Mnemonic Section (Only if available) */}
                        {activeAcc.hdIndex >= 0 && (
                            <Card className="p-4">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="font-medium text-slate-700 text-sm">Secret Phrase</div>
                                    <button
                                        onClick={clickShowMnemonic}
                                        className="text-cyan-600 text-xs font-medium flex items-center gap-1 hover:underline"
                                    >
                                        {state.showMnemonic ? <EyeOff size={14} /> : <Eye size={14} />}
                                        {state.showMnemonic ? 'Hide' : 'Reveal'}
                                    </button>
                                </div>
                                <div
                                    className={`bg-slate-50 p-3 rounded-lg text-xs font-mono wrap-break-word ${state.showMnemonic ? 'text-slate-700' : 'text-slate-400 select-none'}`}>
                                    {state.showMnemonic ? state.walletData?.mnemonic : '•••• •••• •••• •••• •••• •••• •••• •••• •••• •••• •••• ••••'}
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // --- Main Settings List ---
    return (
        <div className="flex flex-col h-full bg-slate-50">
            <Header title="Settings" onBack={onBack} />
            <div className="p-4 flex-1 space-y-3">
                <button
                    onClick={() => dispatch({ type: SettingsActionType.SET_MODE, payload: 'WALLETS' })}
                    className="w-full bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                            <Users size={20} />
                        </div>
                        <div className="text-left">
                            <div className="font-medium text-slate-900">Manage Accounts</div>
                            <div className="text-xs text-slate-500">Create, Import, Remove</div>
                        </div>
                    </div>
                    <ChevronRight size={20} className="text-slate-400" />
                </button>

                <button
                    onClick={() => dispatch({ type: SettingsActionType.SET_MODE, payload: 'NETWORKS' })}
                    className="w-full bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                            <Globe size={20} />
                        </div>
                        <div className="text-left">
                            <div className="font-medium text-slate-900">Network Settings</div>
                            <div className="text-xs text-slate-500">RPC & Explorer URLs</div>
                        </div>
                    </div>
                    <ChevronRight size={20} className="text-slate-400" />
                </button>

                <button
                    onClick={() => dispatch({ type: SettingsActionType.SET_MODE, payload: 'SECURITY' })}
                    className="w-full bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center">
                            <Key size={20} />
                        </div>
                        <div className="text-left">
                            <div className="font-medium text-slate-900">Security & Keys</div>
                            <div className="text-xs text-slate-500">Export active keys</div>
                        </div>
                    </div>
                    <ChevronRight size={20} className="text-slate-400" />
                </button>

                <div className="pt-2">
                    <button
                        onClick={onLogout}
                        className="w-full bg-slate-200 p-4 rounded-xl shadow-sm border border-slate-300 flex items-center justify-center gap-2 hover:bg-slate-300 transition-colors text-slate-700 font-medium"
                    >
                        <Lock size={16} /> Lock Wallet
                    </button>
                </div>

                <div className="pt-6 text-center">
                    <p className="text-xs text-slate-400">Endless Wallet v1.0.4</p>
                </div>
            </div>
        </div>
    );
};
