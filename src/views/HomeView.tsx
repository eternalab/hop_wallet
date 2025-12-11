import React, {useEffect, useReducer} from 'react';
import {
    RefreshCw,
    Copy,
    Check,
    Send as SendIcon,
    ArrowDownToLine,
    Settings,
    ChevronDown,
    Layers,
    Users
} from 'lucide-react';
import {AppView, NetworkConfig, Token} from '../types/common.ts';
import {Button, Card} from '../components/UI';
import {
    NETWORK_COLOR_MAINNET,
    NETWORK_COLOR_TESTNET,
    NATIVE_TOKEN_NAME, INFO_LOADING
} from '../constants';
import {LocalPubAccount, WalletState} from "../types/wallet.ts";
import {EndlessService} from "../services/ExternalUtils.ts";
import {MessageType} from "../types/background.ts";
import {ENDLESS_COIN_ID} from "@endlesslab/endless-ts-sdk";
import {FormatAddress, FormatAmount, FormatCoinName} from "../utils/formatter.ts";
import Decimal from "decimal.js";
import {
    HomeActionType,
    homeReducer,
    homeInitialState
} from '../store';

// ============ Component ============

interface HomeViewProps {
    activeAccount: LocalPubAccount | null;
    onSetActiveAccount: (acc: LocalPubAccount) => void;
    isLoadingBalance: boolean;
    copied: boolean;
    onChangeView: (view: AppView) => void;
    onRefreshBalance: () => void;
    onCopyAddress: () => void;
    onSelectToken: (token: Token | null) => void;
    onManageAccounts: () => void;
    walletState: WalletState
    onSetWalletState: (state: WalletState) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
    activeAccount,
    onSetActiveAccount,
    isLoadingBalance,
    copied,
    onChangeView,
    onRefreshBalance,
    onCopyAddress,
    onSelectToken,
    onManageAccounts,
    walletState,
    onSetWalletState
}) => {
    const [state, dispatch] = useReducer(homeReducer, homeInitialState);

    const getNetworkColor = (networkId: string) => networkId.includes('mainnet') ? NETWORK_COLOR_MAINNET : NETWORK_COLOR_TESTNET;

    useEffect(() => {
        const curNetwork = walletState.setting.networks[walletState.setting.currentNetwork];
        dispatch({ type: HomeActionType.SET_NETWORK, payload: curNetwork });

        if (!activeAccount?.address) return;

        dispatch({ type: HomeActionType.SET_LOADING_ASSETS, payload: true });

        EndlessService.getAccountBalance(activeAccount.address, curNetwork).then((balance) => {
            dispatch({ type: HomeActionType.SET_ACTIVE_ACCOUNT_BALANCE, payload: balance });
        });

        EndlessService.getAccountCoins(activeAccount.address, 20, curNetwork).then((coinInfos) => {
            const tokens: Token[] = coinInfos.filter((c) => c.metadata.id != ENDLESS_COIN_ID).map(c => {
                return {
                    id: c.metadata.id,
                    icon: c.metadata.icon_uri,
                    symbol: c.metadata.symbol,
                    decimals: c.metadata.decimals,
                    name: c.metadata.name,
                    balance: FormatAmount(new Decimal(c.balance), c.metadata.decimals),
                    valueUsd: "",
                    change24h: "",
                    contractAddress: c.metadata.id,
                };
            });
            dispatch({ type: HomeActionType.SET_ACCOUNT_ASSETS, payload: tokens });
        }).catch(e => {
            console.error("load coin failed:", e);
        }).finally(() => {
            dispatch({ type: HomeActionType.SET_LOADING_ASSETS, payload: false });
        });
    }, [activeAccount, walletState.setting.currentNetwork]);

    const handleNetworkSwitch = async (net: NetworkConfig) => {
        const newSetting = {
            networks: walletState.setting.networks,
            currentNetwork: net.id,
        };
        const resp = await chrome.runtime.sendMessage({
            type: MessageType.SaveSettings,
            data: { settings: newSetting }
        });
        if (resp && resp.success) {
            onSetWalletState({
                ...walletState,
                setting: newSetting,
            });
        }
        dispatch({ type: HomeActionType.SET_NETWORK_DROPDOWN, payload: false });
    };

    const handleAccountSwitch = async (acc: LocalPubAccount, idx: number) => {
        const resp = await chrome.runtime.sendMessage({
            type: MessageType.UpdateActiveIndex,
            data: { activeIndex: idx }
        });
        if (resp && resp.success) {
            onSetWalletState({ ...walletState, currentAccountIndex: idx });
            onSetActiveAccount(acc);
        }
        dispatch({ type: HomeActionType.SET_ACCOUNT_DROPDOWN, payload: false });
    };

    return (
        <div className="flex flex-col h-full relative">
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                {/* Network Selector */}
                <div className="relative">
                    <button
                        onClick={() => dispatch({ type: HomeActionType.SET_NETWORK_DROPDOWN, payload: !state.isNetworkDropdownOpen })}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                        <div className={`w-2 h-2 rounded-full ${getNetworkColor(state.network.id)}`}/>
                        {state.network.name}
                        <ChevronDown size={14} className="text-slate-400"/>
                    </button>

                    {state.isNetworkDropdownOpen && (
                        <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-20 overflow-hidden">
                            {Object.values(walletState.setting.networks).map((net) => (
                                <button
                                    key={net.id}
                                    onClick={() => handleNetworkSwitch(net)}
                                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm text-slate-700 flex items-center gap-2"
                                >
                                    <div className={`w-2 h-2 rounded-full ${getNetworkColor(net.id)}`}/>
                                    {net.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Account Selector */}
                    <div className="relative">
                        <button
                            onClick={() => dispatch({ type: HomeActionType.SET_ACCOUNT_DROPDOWN, payload: !state.isAccountDropdownOpen })}
                            className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                {activeAccount?.name.charAt(0) || 'A'}
                            </div>
                        </button>

                        {state.isAccountDropdownOpen && (
                            <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-20 overflow-hidden">
                                <div className="px-4 py-2 border-b border-slate-50">
                                    <p className="text-xs font-bold text-slate-400 uppercase">My Accounts</p>
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    {walletState.accounts.map((acc, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleAccountSwitch(acc, idx)}
                                            className={`w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 transition-colors ${walletState.currentAccountIndex === idx ? 'bg-slate-50' : ''}`}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${walletState.currentAccountIndex === idx ? 'bg-cyan-500' : 'bg-slate-300'}`}/>
                                            <div className="flex-1 overflow-hidden">
                                                <div className={`text-sm font-medium truncate ${walletState.currentAccountIndex === idx ? 'text-cyan-700' : 'text-slate-700'}`}>
                                                    {acc.name}
                                                </div>
                                                <div className="text-xs text-slate-400 truncate font-mono">
                                                    {FormatAddress(acc.address)}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <div className="border-t border-slate-50 mt-1 pt-1">
                                    <button
                                        onClick={() => {
                                            onManageAccounts();
                                            dispatch({ type: HomeActionType.SET_ACCOUNT_DROPDOWN, payload: false });
                                        }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-cyan-600 font-medium hover:bg-slate-50 flex items-center gap-2"
                                    >
                                        <Users size={14}/>
                                        Manage Accounts
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Settings Button */}
                    <button
                        onClick={() => onChangeView(AppView.SETTINGS)}
                        className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <Settings size={20}/>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-20">
                {/* Balance Card */}
                <div className="px-6 py-2">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl shadow-slate-500/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-400 text-sm font-medium">{activeAccount?.name}</span>
                            <button onClick={onRefreshBalance}
                                    className={`text-slate-400 hover:text-white transition-colors ${isLoadingBalance ? 'animate-spin' : ''}`}>
                                <RefreshCw size={16}/>
                            </button>
                        </div>
                        <div className="text-4xl font-bold mb-1 tracking-tight flex items-baseline gap-2">
                            {state.activeAccountBalance}
                            <span className="text-lg font-medium text-slate-400">{state.network.symbol}</span>
                        </div>

                        <button
                            onClick={onCopyAddress}
                            className="mt-4 flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-200 transition-colors w-fit"
                        >
                            {FormatAddress(activeAccount?.address || "None")}
                            {copied ? <Check size={12} className="text-green-400"/> : <Copy size={12}/>}
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <Button onClick={() => {
                            onSelectToken(null);
                            onChangeView(AppView.SEND);
                        }} icon={SendIcon}>Send</Button>
                        <Button variant="secondary" onClick={() => onChangeView(AppView.RECEIVE)}
                                icon={ArrowDownToLine}>Receive</Button>
                    </div>
                </div>

                {/* Tokens List */}
                <div className="px-6 mt-6">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Layers size={16} className="text-slate-400"/> Assets
                    </h3>
                    {state.loadingAssets ? (
                        <div className="text-center text-xs text-slate-400 mt-6 pb-4">
                            {INFO_LOADING}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <Card className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                                        <img src="https://www.endless.link/eds-icon.svg" alt={state.network?.symbol} />
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-900">{NATIVE_TOKEN_NAME}</div>
                                        <div className="text-xs text-slate-500">{state.network?.symbol}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold text-slate-900">{state.activeAccountBalance}</div>
                                    <div className="text-xs text-slate-500">$--</div>
                                </div>
                            </Card>

                            {state.accountAssets.map((token, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer active:scale-98 duration-150"
                                    onClick={() => onSelectToken(token)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                                            <img src={token.icon} alt={token.symbol} />
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900">{FormatCoinName(token.name)}</div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                                {token.symbol}
                                                <span className={token.change24h.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
                                                    {token.change24h}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold text-slate-900">{token.balance.toFixed(2)}</div>
                                        <div className="text-xs text-slate-500">${token.valueUsd}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
