import React, { useEffect, useReducer } from 'react';
import { AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { Button, Card } from '../components/UI';

import { ConfirmInput, MessageResponse, MessageType } from "../types/background.ts";

import { EndlessSignAndSubmitTransaction, EndlessSignMessageInput } from "../types/inject.ts";
import {
    ApprovalViewRequestProps,
    RespType
} from "../types/wallet.ts";
import { EndlessService } from "../services/ExternalUtils.ts";
import { FormatAddress, FormatAmount } from "../utils/formatter.ts";
import Decimal from "decimal.js";
import { EDS_DECIMALS, OCTA_MULTIPLIER } from "../constants";
import {useToast} from "../components/Toast.tsx";
import {
    SignTransactionActionType,
    signTransactionReducer,
    signTransactionInitialState
} from '../store';

// ============ Components ============

export const ConnectRequestView: React.FC<ApprovalViewRequestProps> = ({ psocr, activeAccount, network }) => {
    const confirmData = psocr.data as ConfirmInput;
    const { showToast } = useToast();

    const userChoose = async (connect: boolean) => {
        const resp: MessageResponse = await chrome.runtime.sendMessage({
            type: MessageType.NotifyConfirmOrSignResult,
            data: {
                requestId: psocr.requestId,
                resp: { accountInfo: activeAccount, origin: confirmData.Origin },
                error: !connect ? "user reject" : null
            }
        });
        if (!resp || !resp.success) {
            showToast(resp.error ? resp.error : "connect failed", 'error');
        } else {
            window.close();
        }
    };

    return (
        <div className="flex flex-col h-full p-6 bg-white">
            <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center mb-6">
                    <Shield size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Connection Request</h2>
                <p className="text-slate-500 mb-6">
                    <span className="font-semibold text-slate-900">{confirmData.Origin}</span> wants to connect to your
                    wallet.
                </p>
                <Card className="w-full p-4 bg-slate-50 border-slate-200 text-left">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Permissions:</h4>
                    <ul className="text-sm text-slate-600 space-y-2">
                        <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" /> View
                            your account address
                        </li>
                        <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" /> View
                            your network
                        </li>
                        <li className="flex items-center gap-2"><CheckCircle size={16}
                                                                             className="text-green-500" /> Suggest
                            transactions for approval
                        </li>
                    </ul>
                </Card>
            </div>
            <div className="px-4 pt-4 pb-8 bg-white border-t border-slate-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => userChoose(false)} className="flex-1">Reject</Button>
                    <Button onClick={() => userChoose(true)} className="flex-1">Connect</Button>
                </div>
            </div>
        </div>
    );
};

export const SignMessageRequestView: React.FC<ApprovalViewRequestProps> = ({ psocr, activeAccount, network }) => {
    const { showToast } = useToast();
    const message = psocr.data as EndlessSignMessageInput;

    const userChoose = async (approve: boolean) => {
        if (!approve) {
            const resp: MessageResponse = await chrome.runtime.sendMessage({
                type: MessageType.NotifyConfirmOrSignResult,
                data: {
                    requestId: psocr.requestId,
                    resp: null,
                    error: "user reject"
                }
            });
            if (!resp || !resp.success) {
                showToast(resp.error ? resp.error : "send failed", 'error');
            }
            window.close();
        } else {
            const signResp: MessageResponse = await chrome.runtime.sendMessage({
                type: MessageType.InternalSignMessage,
                data: {
                    address: activeAccount.address,
                    message: message.message,
                    nonce: message.nonce
                }
            });

            const resp: MessageResponse = await chrome.runtime.sendMessage({
                type: MessageType.NotifyConfirmOrSignResult,
                data: {
                    requestId: psocr.requestId,
                    resp: signResp.success ? signResp.data : null,
                    error: signResp.success ? null : signResp.error,
                }
            });
            if (!resp) {
                showToast(resp.error ? resp.error : "sign failed", 'error');
            } else {
                window.close();
            }
        }
    };

    return (
        <div className="flex flex-col h-full p-6 bg-white">
            <div className="mb-6 text-center">
                <div
                    className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full mx-auto flex items-center justify-center mb-3">
                    <Shield size={24} />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Sign Message</h2>
            </div>

            <div className="flex-1">
                <Card className="p-4 bg-slate-50 border-slate-200">
                    <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Message</label>
                    <div className="text-sm font-mono text-slate-800 whitespace-pre-wrap break-words">
                        {message.message}
                    </div>
                </Card>
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-lg flex gap-2">
                    <AlertCircle size={16} className="text-yellow-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-700">
                        Signing this message proves you own this wallet address. Be careful if you don't recognize the
                        message content.
                    </p>
                </div>
            </div>

            <div className="px-4 pt-4 pb-8 bg-white border-t border-slate-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => userChoose(false)} className="flex-1">Reject</Button>
                    <Button onClick={() => userChoose(true)} className="flex-1">Sign</Button>
                </div>
            </div>
        </div>
    );
};

export const SignTransactionRequestView: React.FC<ApprovalViewRequestProps> = ({ psocr, network, activeAccount }) => {
    const signRequest = psocr.data as EndlessSignAndSubmitTransaction;
    const { showToast } = useToast();
    const [state, dispatch] = useReducer(signTransactionReducer, signTransactionInitialState);

    const userChoose = async (approve: boolean) => {
        if (!approve) {
            const resp: MessageResponse = await chrome.runtime.sendMessage({
                type: MessageType.NotifyConfirmOrSignResult,
                data: {
                    requestId: psocr.requestId,
                    resp: null,
                    error: "user reject"
                }
            });
            if (!resp || !resp.success) {
                showToast(resp ? resp.error : "send failed", 'error');
            } else {
                window.close();
            }
        } else {
            const signResp: MessageResponse = await chrome.runtime.sendMessage({
                type: MessageType.InternalSignTransaction,
                data: {
                    address: activeAccount.address,
                    payload: signRequest.payload,
                    options: signRequest.options
                }
            });

            const resp: MessageResponse = await chrome.runtime.sendMessage({
                type: MessageType.NotifyConfirmOrSignResult,
                data: {
                    requestId: psocr.requestId,
                    resp: signResp.success ? signResp.data : null,
                    error: signResp.success ? null : signResp.error,
                }
            });
            if (!resp) {
                showToast(resp.error ? resp.error : "sign failed", 'error');
            } else {
                window.close();
            }
        }
    };

    useEffect(() => {
        dispatch({ type: SignTransactionActionType.SET_FORMAT_PAYLOAD, payload: EndlessService.tryParsePayload(signRequest.payload) });

        EndlessService.estimateTransaction(activeAccount.address, activeAccount.publicKey, signRequest, network).then((r) => {
            if (r.status === RespType.Success) {
                EndlessService.detailBalanceChange(r.data.balanceChange).then((r2) => {
                    dispatch({
                        type: SignTransactionActionType.SET_ES_TX,
                        payload: {
                            success: r.data.success,
                            balanceChange: r2,
                            esGasFee: r.data.esGasFee
                        }
                    });
                });
            }
        }).finally(() => {
            dispatch({ type: SignTransactionActionType.SET_ES_LOADING, payload: false });
        });
    }, []);

    const renderBalanceChanges = () => {
        if (state.esLoading) {
            return <div className="text-sm text-slate-500 italic">Simulating transaction...</div>;
        }
        if (!state.esTx.success) {
            return <div className="text-sm text-red-500">Simulation failed. Proceed with caution.</div>;
        }
        if (!state.esTx.balanceChange || state.esTx.balanceChange.size === 0) {
            return <div className="text-sm text-slate-500">No balance changes detected.</div>;
        }

        const changes: React.ReactNode[] = [];
        state.esTx.balanceChange.forEach((coins, addr) => {
            if (addr == activeAccount.address) {
                coins.forEach((amount, coin) => {
                    const isPositive = amount.greaterThan(0);
                    changes.push(
                        <div key={`${addr}-${coin.id}`} className="flex justify-between items-center text-sm py-1 border-b border-slate-100 last:border-0">
                            <div className="flex flex-col">
                                <div className="font-mono text-xs text-slate-500 ellipsis max-w-[150px]" title={addr}>
                                    {addr === activeAccount.address ? "You" : FormatAddress(addr)}
                                </div>
                                <div className="font-semibold text-slate-700">{coin.symbol}</div>
                            </div>
                            <div className={`font-mono font-bold ${isPositive ? 'text-green-600' : 'text-red-400'}`}>
                                {isPositive ? '+' : ''}{FormatAmount(amount, coin.decimals).toString()}
                            </div>
                        </div>
                    );
                });
            }
        });
        return <div className="space-y-1">{changes}</div>;
    };

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            {/* Header */}
            <div className="px-6 pt-6 pb-2 text-center bg-white border-b border-slate-100">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full mx-auto flex items-center justify-center mb-3 ring-4 ring-blue-50/50">
                    <Shield size={24} />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Sign Transaction</h2>
                <p className="text-xs text-slate-500 mt-1">{network.name}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Transaction Details */}
                <Card className="p-0 overflow-hidden border-slate-200 shadow-sm">
                    <div className="bg-slate-100/50 px-4 py-2 border-b border-slate-100">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Interaction</h3>
                    </div>
                    <div className="p-4 space-y-3">
                        <div>
                            <label className="text-xs text-slate-400 font-medium block mb-1">Module</label>
                            <div className="text-sm font-mono text-blue-500 font-semibold break-all">
                                {state.formatPayload.isParsed ?
                                    <span title={`${state.formatPayload.payloadDetail.moduleAddress}::${state.formatPayload.payloadDetail.moduleName}`}>
                                        {state.formatPayload.payloadDetail.moduleAddress}::{state.formatPayload.payloadDetail.moduleName}
                                    </span>
                                    : "unknown"}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 font-medium block mb-1">Function</label>
                            <div className="text-sm font-mono text-blue-500 font-semibold break-all">
                                {state.formatPayload.isParsed ? state.formatPayload.payloadDetail.functionName : "unknown"}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Arguments */}
                <Card className="p-0 overflow-hidden border-slate-200 shadow-sm">
                    <div className="bg-slate-100/50 px-4 py-2 border-b border-slate-100">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Arguments</h3>
                    </div>
                    <div className="p-4">
                        {state.formatPayload.isParsed && state.formatPayload.payloadDetail.functionArguments && state.formatPayload.payloadDetail.functionArguments.length > 0 ? (
                            <div className="space-y-2">
                                {state.formatPayload.payloadDetail.functionArguments.map((arg, index) => (
                                    <div key={index} className="flex gap-2 text-sm items-start">
                                        <span className="text-slate-400 font-mono text-xs mt-0.5">#{index}</span>
                                        <span className="text-sm font-mono text-slate-400 font-semibold break-all w-full">
                                            {typeof arg === 'object' ? JSON.stringify(arg) : String(arg)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : !state.formatPayload.isParsed && signRequest.payload?.functionArguments ? (
                            <div className="text-xs font-mono bg-slate-50 p-2 rounded max-h-32 overflow-y-auto text-slate-600">
                                {JSON.stringify(signRequest.payload.functionArguments, null, 2)}
                            </div>
                        ) : (
                            <div className="text-sm text-slate-400 italic">No arguments</div>
                        )}
                    </div>
                </Card>

                {/* Simulation & Gas */}
                <Card className="p-0 overflow-hidden border-slate-200 shadow-sm">
                    <div className="bg-slate-100/50 px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Simulation</h3>
                        <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-full border border-slate-200 shadow-sm">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Gas</span>
                            <span className="text-xs font-mono font-medium text-slate-700">
                                {new Decimal(state.esTx.esGasFee).div(OCTA_MULTIPLIER).toFixed(EDS_DECIMALS)} {network.symbol}
                            </span>
                        </div>
                    </div>
                    <div className="p-4">
                        {renderBalanceChanges()}
                    </div>
                </Card>
            </div>

            <div className="px-4 pt-4 pb-10 bg-white border-t border-slate-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => userChoose(false)} className="flex-1 font-medium hover:bg-slate-100">
                        Reject
                    </Button>
                    <Button
                        onClick={() => userChoose(true)}
                        className={`flex-1 font-medium shadow-md shadow-blue-500/20 active:shadow-none transition-all ${(!state.esTx.success || state.esLoading) ? 'opacity-70 cursor-not-allowed' : ''}`}
                        disabled={!state.esTx.success || state.esLoading}
                    >
                        {state.esLoading ? 'Simulating...' : 'Sign & Submit'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
