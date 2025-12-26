import React, { useEffect, useReducer } from 'react';
import {
    AppView,
    NetworkConfig,
    Token,
    NetworkId,
    CollectionItem, NftItem
} from '../types/common.ts';
import { Button, Input, Header, Card } from '../components/UI';
import {
    Send as SendIcon,
    ArrowDownToLine,
    Copy,
    Check,
    ExternalLink,
    ImageIcon,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    Clock
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import {
    MainnetPreSetDapps,
    TestnetPreSetDapps,
    TRANSACTION_HISTORY_LIMIT,
    COPY_FEEDBACK_TIMEOUT_MS,
    QR_CODE_SIZE,
    INFO_RECENT_TX_ONLY,
    INFO_NO_COLLECTIONS,
    INFO_LOADING,
    SUCCESS_CONTRACT_COPIED,
    SUCCESS_ADDRESS_COPIED,
    ERROR_INVALID_ADDRESS,
    COLLECTION_PAGE_SIZE, NFT_PAGE_SIZE
} from '../constants';
import { useToast } from '../components/Toast';
import Decimal from "decimal.js";
import { EndlessService } from "../services/ExternalUtils.ts";
import { MessageResponse, MessageType } from "../types/background.ts";
import { LocalPubAccount } from "../types/wallet.ts";
import { FormatAddress, FormatEdsAmount, WithDecimal } from "../utils/formatter.ts";
import {
    ActivityActionType,
    activityReducer,
    activityInitialState,
    DAppsActionType,
    dappsReducer,
    dappsInitialState,
    TokenDetailActionType,
    tokenDetailReducer,
    tokenDetailInitialState,
    CollectionsActionType,
    collectionsReducer,
    collectionsInitialState,
    CollectionDetailActionType,
    collectionDetailReducer,
    collectionDetailInitialState,
    SendNFTActionType,
    sendNFTReducer,
    sendNFTInitialState,
    SendActionType,
    sendReducer,
    sendInitialState,
    ReceiveActionType,
    receiveReducer,
    receiveInitialState,
} from '../store';

// ============ Activity View ============

export const ActivityView: React.FC<{ address: string, network: NetworkConfig }> = ({ address, network }) => {
    const [state, dispatch] = useReducer(activityReducer, activityInitialState);

    useEffect(() => {
        EndlessService.getTransactionHistory(address, TRANSACTION_HISTORY_LIMIT, network).then((resp) => {
            dispatch({ type: ActivityActionType.SET_LOADING, payload: false });
            dispatch({ type: ActivityActionType.SET_TRANSACTIONS, payload: resp });
        }).catch(() => {
            dispatch({ type: ActivityActionType.SET_LOADING, payload: false });
        });
    }, [address, network]);

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <Header title="Activity" />
            <div className="flex-1 overflow-y-auto p-4 pb-20">
                <div className="space-y-3">
                    {state.loading ? <div className="text-center text-xs text-slate-400 mt-6 pb-4">
                        {INFO_LOADING}
                    </div> : state.transactions.map(tx => (
                        <Card key={tx.hash}
                            onClick={() => {
                                window.open(`${network.explorerUrl}/txn/${tx.hash}?network=${network.id}`, "_blank")
                            }}
                            className="p-4 flex items-center justify-between hover:shadow-md transition-shadow cursor-default">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.status === 'failed' ? 'bg-red-100 text-red-600' :
                                        tx.type === 'receive' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                    {tx.status === 'failed' ? <AlertCircle size={18} /> :
                                        tx.type === 'receive' ? <ArrowDownToLine size={18} /> : <SendIcon size={18} />}
                                </div>
                                <div>
                                    <div className="font-medium text-slate-900 capitalize">{tx.type}</div>
                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                        {tx.status} • {new Date(tx.timestamp).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <div
                                className={`font-semibold ${tx.status === 'failed' ? 'text-red-500' : tx.type === 'receive' ? 'text-green-600' : 'text-slate-900'}`}>
                                {tx.type === 'send' ? '' : '+'}{FormatEdsAmount(tx.amount)} {network.symbol}
                            </div>
                        </Card>
                    ))}
                    <div className="text-center text-xs text-slate-400 mt-6 pb-4" hidden={state.loading}>
                        {INFO_RECENT_TX_ONLY}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============ DApps View ============

export const DAppsView: React.FC<{ networkId: NetworkId }> = ({ networkId }) => {
    const [state, dispatch] = useReducer(dappsReducer, dappsInitialState);

    useEffect(() => {
        dispatch({ type: DAppsActionType.SET_PRESET_DAPPS, payload: networkId === NetworkId.MAINNET ? MainnetPreSetDapps : TestnetPreSetDapps });
    }, [networkId]);

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <Header title="Explore DApps" />
            <div className="flex-1 overflow-y-auto p-4 pb-20">
                <div
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-4 text-white mb-6 shadow-lg shadow-purple-500/20">
                    <h3 className="font-bold text-lg">Discover Web3</h3>
                    <p className="text-sm text-purple-100 mt-1 mb-3">Explore the best applications on Endless Chain.</p>
                </div>

                <h3 className="font-bold text-slate-900 mb-3 text-sm flex items-center gap-2">
                    <Clock size={16} className="text-cyan-500" /> Recommended
                </h3>

                <div className="space-y-3">
                    {state.presetDapps.map(dapp => (
                        <Card key={dapp.id} className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                            <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm shrink-0`}>
                                <img src={dapp.iconUrl} alt={dapp.name} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-slate-900 truncate">{dapp.name}</h4>
                                    <span
                                        className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded uppercase tracking-wide">{dapp.category}</span>
                                </div>
                                <p className="text-xs text-slate-500 truncate">{dapp.description}</p>
                            </div>
                            <a
                                href={dapp.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-full transition-colors"
                            >
                                <ExternalLink size={18} />
                            </a>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
};

// ============ Token Detail View ============

export const TokenDetailView: React.FC<{
    token: Token | null;
    network: NetworkConfig;
    onBack: () => void;
    onAction: (view: AppView) => void
}> = ({ token, network, onBack, onAction }) => {
    const { showToast } = useToast();
    const [state, dispatch] = useReducer(tokenDetailReducer, { copied: false });

    const handleCopyContract = () => {
        if (token?.contractAddress) {
            navigator.clipboard.writeText(token.contractAddress);
            dispatch({ type: TokenDetailActionType.SET_COPIED, payload: true });
            showToast(SUCCESS_CONTRACT_COPIED, 'success');
            setTimeout(() => dispatch({ type: TokenDetailActionType.SET_COPIED, payload: false }), COPY_FEEDBACK_TIMEOUT_MS);
        }
    };

    if (!token) return null;
    return (
        <div className="flex flex-col h-full bg-slate-50">
            <Header title={token.name} onBack={onBack} />
            <div className="p-6 flex-1 overflow-y-auto">
                <div className="flex flex-col items-center mb-8 mt-4">
                    <div
                        className={`w-20 h-20 rounded-full bg-transparent text-white flex items-center justify-center font-bold text-3xl shadow-xl shadow-slate-200`}>
                        <img src={token.icon} alt={token.symbol} />
                    </div>
                    <div className="mt-4 text-3xl font-bold text-slate-900">
                        {token.balance.toFixed(2)} <span className="text-lg text-slate-500">{token.symbol}</span>
                    </div>
                    <div className="text-slate-500 font-medium">≈ ${token.valueUsd}</div>
                    <div
                        className={`mt-1 text-sm font-semibold ${token.change24h.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                        {token.change24h} (24h)
                    </div>
                </div>

                <div className="space-y-4">
                    <Card className="p-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">About {token.symbol}</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600">Contract Address</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-slate-500">
                                        {token.contractAddress ? `${token.contractAddress.slice(0, 6)}...${token.contractAddress.slice(-4)}` : 'Native'}
                                    </span>
                                    {token.contractAddress && (
                                        <button
                                            onClick={handleCopyContract}
                                            className="text-cyan-600 hover:text-cyan-700"
                                        >
                                            {state.copied ? <Check size={14} /> : <Copy size={14} />}
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600">Decimal</span>
                                <span className="font-medium text-slate-800">{token.decimals}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600">Network</span>
                                <span className="font-medium text-slate-800">{network.name}</span>
                            </div>
                        </div>
                    </Card>

                    <div className="grid grid-cols-2 gap-3">
                        <Button onClick={() => onAction(AppView.SEND)} icon={SendIcon}>Send</Button>
                        <Button variant="secondary" onClick={() => onAction(AppView.RECEIVE)}
                            icon={ArrowDownToLine}>Receive</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============ Collections View ============

export const CollectionsView: React.FC<{
    address: string,
    network: NetworkConfig,
    onSelect: (collectionItem: CollectionItem) => void
}> = ({ address, network, onSelect }) => {
    const [state, dispatch] = useReducer(collectionsReducer, collectionsInitialState);

    useEffect(() => {
        EndlessService.queryAccountCollections(address, network).then(r => {
            if (r) {
                dispatch({ type: CollectionsActionType.SET_COLLECTIONS, payload: r?.data || [] });
                dispatch({ type: CollectionsActionType.SET_TOTAL, payload: r?.total || 0 });
                dispatch({ type: CollectionsActionType.SET_TOTAL_PAGE, payload: r.total <= COLLECTION_PAGE_SIZE ? 1 : Math.ceil(r.total / COLLECTION_PAGE_SIZE) });
            }
        }).catch(e => {
            console.error(e);
        }).finally(() => {
            dispatch({ type: CollectionsActionType.SET_LOADING, payload: false });
        });
    }, [address, network]);

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <Header title="Collections" />
            {state.loading ? <div className="text-center text-xs text-slate-400 mt-6 pb-4">
                {INFO_LOADING}
            </div> : <div className="flex-1 overflow-y-auto p-4 pb-20">
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {state.collections.map(collection => (
                        <Card
                            key={collection.id}
                            className="overflow-hidden hover:shadow-md transition-shadow group cursor-pointer active:scale-95 duration-150"
                            onClick={() => onSelect(collection)}
                        >
                            <div className="aspect-square bg-slate-200 relative overflow-hidden">
                                <img src={collection.uri} alt={collection.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            </div>
                            <div className="p-3">
                                <div className="font-semibold text-sm text-slate-900 truncate">{collection.name}</div>
                                <div className="text-xs text-slate-500 truncate">{collection.id}</div>
                            </div>
                        </Card>
                    ))}
                </div>

                {state.collections.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                        <ImageIcon size={48} className="mb-2 opacity-50" />
                        <p className="text-sm">{INFO_NO_COLLECTIONS}</p>
                    </div>
                )}

                {state.totalPage > 1 && (
                    <div className="flex items-center justify-between px-2 py-4">
                        <button
                            onClick={() => dispatch({ type: CollectionsActionType.SET_COLLECTION_PAGE, payload: Math.max(1, state.collectionPage - 1) })}
                            disabled={state.collectionPage === 1}
                            className="p-2 rounded-lg bg-white shadow-sm border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                        >
                            <ChevronLeft size={20} className="text-slate-600" />
                        </button>
                        <span className="text-sm font-medium text-slate-500">
                            Page {state.collectionPage} of {state.totalPage}
                        </span>
                        <button
                            onClick={() => dispatch({ type: CollectionsActionType.SET_COLLECTION_PAGE, payload: Math.min(state.totalPage, state.collectionPage + 1) })}
                            disabled={state.collectionPage === state.totalPage}
                            className="p-2 rounded-lg bg-white shadow-sm border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                        >
                            <ChevronRight size={20} className="text-slate-600" />
                        </button>
                    </div>
                )}
            </div>}
        </div>
    );
};

// ============ Collection Detail View ============

export const CollectionDetail: React.FC<{
    address: string,
    network: NetworkConfig,
    collection: CollectionItem | null;
    onBack: () => void;
    onSelectNft: (nft: NftItem) => void;
}> = ({
    address, network,
    collection,
    onBack,
    onSelectNft
}) => {
    const { showToast } = useToast();
    const [state, dispatch] = useReducer(collectionDetailReducer, collectionDetailInitialState);

    const handleCopyId = () => {
        if (collection?.id) {
            navigator.clipboard.writeText(collection.id);
            dispatch({ type: CollectionDetailActionType.SET_ID_COPIED, payload: true });
            showToast(SUCCESS_ADDRESS_COPIED, 'success');
            setTimeout(() => dispatch({ type: CollectionDetailActionType.SET_ID_COPIED, payload: false }), COPY_FEEDBACK_TIMEOUT_MS);
        }
    };

    useEffect(() => {
        dispatch({ type: CollectionDetailActionType.SET_NFTS_LOADING, payload: true });
        EndlessService.queryNftsByCollectionId(address, collection?.id || '', network, state.nftPage - 1).then((aa) => {
            dispatch({ type: CollectionDetailActionType.SET_NFTS, payload: aa.data });
            dispatch({ type: CollectionDetailActionType.SET_TOTAL_PAGE, payload: aa.total <= NFT_PAGE_SIZE ? 1 : Math.ceil(aa.total / NFT_PAGE_SIZE) });
        }).finally(() => {
            dispatch({ type: CollectionDetailActionType.SET_NFTS_LOADING, payload: false });
        });
    }, [state.nftPage, address, network, collection]);

    if (!collection) return null;
    return (
        <div className="flex flex-col h-full bg-white">
            <Header title="Collection Details" onBack={onBack} />
            <div className="flex-1 overflow-y-auto pb-4">
                <div className="w-full aspect-square bg-slate-100">
                    <img src={collection.uri} alt={collection.name} className="w-full h-full object-cover" />
                </div>

                <div className="p-6 space-y-8">
                    <div className="flex justify-between items-start gap-4">
                        <h2 className="text-2xl font-bold text-slate-900 leading-tight">{collection.name}</h2>
                        <span
                            className="shrink-0 bg-slate-900 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                            {collection.count} Items
                        </span>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="h-px bg-slate-100 flex-1"></div>
                                <span
                                    className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Collection ID</span>
                                <div className="h-px bg-slate-100 flex-1"></div>
                            </div>

                            <div
                                onClick={handleCopyId}
                                className="group cursor-pointer relative bg-slate-50 border border-slate-200 rounded-lg p-4 hover:border-slate-300 hover:shadow-sm transition-all"
                            >
                                <div className="font-mono text-xs text-slate-600 break-all leading-relaxed pr-6">
                                    {collection.id}
                                </div>
                                <div
                                    className="absolute top-4 right-4 text-slate-400 group-hover:text-slate-600 transition-colors">
                                    {state.idCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                </div>
                            </div>
                        </div>

                        {collection.description && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-px bg-slate-100 flex-1"></div>
                                    <span
                                        className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">About</span>
                                    <div className="h-px bg-slate-100 flex-1"></div>
                                </div>
                                <div
                                    className="text-sm text-slate-600 leading-7 whitespace-pre-wrap break-words px-2 font-medium">
                                    {collection.description}
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="h-px bg-slate-100 flex-1"></div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">NFT Items</span>
                                <div className="h-px bg-slate-100 flex-1"></div>
                            </div>

                            {state.nftsLoading ? (
                                <div className="text-center text-xs text-slate-400 py-8">
                                    {INFO_LOADING}
                                </div>
                            ) : state.nfts && state.nfts.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                        {state.nfts.map(nft => (
                                            <Card
                                                key={nft.id}
                                                className="overflow-hidden hover:shadow-md transition-shadow group cursor-pointer active:scale-95 duration-150"
                                                onClick={() => onSelectNft(nft)}
                                            >
                                                <div className="aspect-square bg-slate-200 relative overflow-hidden">
                                                    <img src={nft.uri} alt={nft.name}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                </div>
                                                <div className="p-3">
                                                    <div
                                                        className="font-semibold text-sm text-slate-900 truncate">{nft.name}</div>
                                                    <div className="text-xs text-slate-500">#{nft.index}</div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>

                                    {state.totalPage > 1 && (
                                        <div className="flex items-center justify-center gap-4 mt-6">
                                            <button
                                                onClick={() => dispatch({ type: CollectionDetailActionType.SET_NFT_PAGE, payload: Math.max(1, state.nftPage - 1) })}
                                                disabled={state.nftPage === 1}
                                                className="p-2 rounded-lg bg-white shadow-sm border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                                            >
                                                <ChevronLeft size={20} className="text-slate-600" />
                                            </button>
                                            <span className="text-sm font-medium text-slate-500">
                                                Page {state.nftPage} of {state.totalPage}
                                            </span>
                                            <button
                                                onClick={() => dispatch({ type: CollectionDetailActionType.SET_NFT_PAGE, payload: Math.min(state.totalPage, state.nftPage + 1) })}
                                                disabled={state.nftPage === state.totalPage}
                                                className="p-2 rounded-lg bg-white shadow-sm border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                                            >
                                                <ChevronRight size={20} className="text-slate-600" />
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center text-xs text-slate-400 py-8">
                                    No NFTs in this collection
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============ NFT Detail View ============

export const NFTDetailView: React.FC<{
    nft: NftItem | null;
    onBack: () => void;
    onTransfer: () => void;
}> = ({ nft, onBack, onTransfer }) => {
    if (!nft) return null;
    return (
        <div className="flex flex-col h-full bg-white">
            <Header title="NFT Details" onBack={onBack} />
            <div className="flex-1 overflow-y-auto pb-4">
                <div className="w-full aspect-square bg-slate-100">
                    <img src={nft.uri} alt={nft.name} className="w-full h-full object-cover" />
                </div>

                <div className="p-6 space-y-8">
                    <div className="flex justify-between items-start gap-4">
                        <h2 className="text-2xl font-bold text-slate-900 leading-tight">{nft.name}</h2>
                        <span
                            className="shrink-0 bg-slate-900 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                            #{nft.index}
                        </span>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="h-px bg-slate-100 flex-1"></div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Token ID</span>
                                <div className="h-px bg-slate-100 flex-1"></div>
                            </div>
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                <div className="font-mono text-xs text-slate-600 break-all leading-relaxed">
                                    {nft.id}
                                </div>
                            </div>
                        </div>

                        {nft.properties && Object.keys(nft.properties).length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-px bg-slate-100 flex-1"></div>
                                    <span
                                        className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Properties</span>
                                    <div className="h-px bg-slate-100 flex-1"></div>
                                </div>
                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                    <pre className="text-xs text-slate-600 whitespace-pre-wrap break-words font-mono">
                                        {JSON.stringify(nft.properties, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="px-4 pt-4 pb-4 border-t border-slate-100 bg-white/80 backdrop-blur-sm z-10 shrink-0">
                <Button
                    onClick={onTransfer}
                    icon={SendIcon}
                    className="w-full py-4 text-sm font-bold shadow-lg shadow-blue-500/20 active:scale-[0.98]">
                    Transfer NFT
                </Button>
            </div>
        </div>
    );
};

// ============ Send NFT View ============

export const SendNFTView: React.FC<{
    nft: NftItem;
    network: NetworkConfig;
    onBack: () => void;
    activeAccount: LocalPubAccount;
    onSuccess: (hash: string) => void
}> = ({ nft, network, onBack, activeAccount, onSuccess }) => {
    const { showToast } = useToast();
    const [state, dispatch] = useReducer(sendNFTReducer, sendNFTInitialState);

    useEffect(() => {
        if (state.recipientAddr && EndlessService.validateAddress(state.recipientAddr)) {
            dispatch({ type: SendNFTActionType.SET_CAL_FEE, payload: true });
            EndlessService.estimateSendNftGasFee(
                activeAccount.address,
                activeAccount.publicKey,
                nft.id,
                state.recipientAddr,
                network
            ).then((fee) => {
                dispatch({ type: SendNFTActionType.SET_GAS_ESTIMATE, payload: new Decimal(fee) });
            }).finally(() => {
                dispatch({ type: SendNFTActionType.SET_CAL_FEE, payload: false });
            });
        }
    }, [state.recipientAddr, nft, activeAccount, network]);

    const handleSend = async () => {
        if (!state.recipientAddr) return;

        if (!EndlessService.validateAddress(state.recipientAddr)) {
            showToast(ERROR_INVALID_ADDRESS, 'error');
            return;
        }

        dispatch({ type: SendNFTActionType.SET_IS_SENDING, payload: true });
        try {
            const response = await chrome.runtime.sendMessage({
                type: MessageType.CheckUnlockStatus,
                data: {}
            });

            if (!response?.data?.isUnlocked) {
                showToast('Wallet is locked. Please unlock first.', 'error');
                dispatch({ type: SendNFTActionType.SET_IS_SENDING, payload: false });
                return;
            }

            const transferResponse = await chrome.runtime.sendMessage({
                type: MessageType.SendNftTransaction,
                data: {
                    nftAddress: nft.id,
                    toAddress: state.recipientAddr
                }
            });

            if (transferResponse?.success) {
                onSuccess(transferResponse.data);
            } else {
                showToast(transferResponse?.error || 'Transfer failed', 'error');
            }
        } catch (error) {
            console.error('Transfer error:', error);
            showToast('Failed to transfer NFT', 'error');
        } finally {
            dispatch({ type: SendNFTActionType.SET_IS_SENDING, payload: false });
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <Header title="Send NFT" onBack={onBack} />
            <div className="p-6 flex-1 overflow-y-auto">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200">
                    <div className="w-20 h-20 bg-slate-200 rounded-lg overflow-hidden shrink-0">
                        <img src={nft.uri} alt={nft.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-bold text-base text-slate-900 truncate">{nft.name}</div>
                        <div className="text-sm text-slate-500">#{nft.index}</div>
                    </div>
                </div>

                <div className="space-y-4">
                    <Input
                        label="Recipient Address"
                        placeholder="Enter address"
                        value={state.recipientAddr}
                        onChange={(e) => dispatch({ type: SendNFTActionType.SET_RECIPIENT_ADDR, payload: e.target.value })}
                        disabled={state.isSending}
                    />

                    {state.recipientAddr && EndlessService.validateAddress(state.recipientAddr) && (
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Estimated Gas Fee:</span>
                                <span className="font-medium text-slate-900">
                                    {state.calFee ? 'Calculating...' : `${state.gasEstimate.toFixed(8)} ${network.symbol}`}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6 border-t border-slate-100 shrink-0">
                <Button
                    onClick={handleSend}
                    disabled={!state.recipientAddr || state.isSending || !EndlessService.validateAddress(state.recipientAddr)}
                    icon={SendIcon}
                    className="w-full"
                >
                    {state.isSending ? 'Sending...' : 'Send NFT'}
                </Button>
            </div>
        </div>
    );
};

// ============ Send View ============

export const SendView: React.FC<{
    activeAccount: LocalPubAccount;
    network: NetworkConfig;
    onBack: () => void;
    onRefresh: () => void;
    sendToken: Token | null;
    setView: (v: AppView) => void
    onSuccess: (hash: string) => void
}> = ({ network, onBack, onRefresh, setView, activeAccount, sendToken, onSuccess }) => {
    const { showToast } = useToast();
    const [state, dispatch] = useReducer(sendReducer, sendInitialState);

    useEffect(() => {
        if (sendToken === null) {
            EndlessService.getAccountBalance(activeAccount.address, network).then((bal) => {
                dispatch({ type: SendActionType.SET_BAL, payload: new Decimal(bal) });
            });
        } else {
            dispatch({ type: SendActionType.SET_BAL, payload: sendToken.balance });
        }
    }, [activeAccount, sendToken]);

    useEffect(() => {
        if (EndlessService.validateAddress(state.receivedAddr) && state.sendAmount !== '' && new Decimal(state.sendAmount).gt(0)) {
            dispatch({ type: SendActionType.SET_CAL_FEE, payload: true });
            if (sendToken === null) {
                EndlessService.estimateSendGasFee(activeAccount.address, activeAccount.publicKey, state.receivedAddr, state.sendAmount, network).then((r) => {
                    dispatch({ type: SendActionType.SET_GAS_ESTIMATE, payload: new Decimal(r) });
                }).finally(() => {
                    dispatch({ type: SendActionType.SET_CAL_FEE, payload: false });
                });
            } else {
                EndlessService.estimateSendCoinGasFee(activeAccount.address, activeAccount.publicKey, sendToken.id, state.receivedAddr, state.sendAmount, network).then((r) => {
                    dispatch({ type: SendActionType.SET_GAS_ESTIMATE, payload: new Decimal(r) });
                }).finally(() => {
                    dispatch({ type: SendActionType.SET_CAL_FEE, payload: false });
                });
            }
        }
    }, [state.receivedAddr, state.sendAmount]);

    const handleSend = async () => {
        if (!EndlessService.validateAddress(state.receivedAddr)) {
            showToast(ERROR_INVALID_ADDRESS, 'error');
            return;
        }
        const sendAmountWithDecimal = sendToken === null ? new Decimal(state.sendAmount).mul(1e8) : WithDecimal(state.sendAmount, sendToken.decimals);
        const balWithDecimal = sendToken === null ? state.bal.mul(1e8) : WithDecimal(state.sendAmount, sendToken.decimals);
        if (state.bal.gt(0) && balWithDecimal.sub(sendAmountWithDecimal).gte(0)) {
            if (sendToken === null && !state.bal.sub(state.sendAmount).gte(state.gasEstimate)) {
                showToast("Insufficient balance with gas required", 'error');
                return;
            }
            if (sendToken !== null) {
                const edsBalance = await EndlessService.getAccountBalance(activeAccount.address, network);
                if (!new Decimal(edsBalance).gt(state.gasEstimate)) {
                    showToast("balance is less than gas required", 'error');
                    return;
                }
            }
            dispatch({ type: SendActionType.SET_IS_SENDING, payload: true });
            try {
                const statusResp: MessageResponse = await chrome.runtime.sendMessage({
                    type: MessageType.CheckUnlockStatus,
                    data: {}
                });
                if (!statusResp?.data?.isUnlocked) {
                    setView(AppView.LOCK);
                    return;
                }

                if (sendToken === null) {
                    const sendResp: MessageResponse = await chrome.runtime.sendMessage({
                        type: MessageType.InternalSendEDS,
                        data: {
                            fromAddress: activeAccount.address,
                            toAddress: state.receivedAddr,
                            amount: state.sendAmount
                        }
                    });
                    if (sendResp.success) {
                        showToast(`Sent tx: ${sendResp.data.hash}`, 'success');
                    } else {
                        showToast(sendResp.error || "Send failed", 'error');
                    }
                } else {
                    const sendResp: MessageResponse = await chrome.runtime.sendMessage({
                        type: MessageType.InternalSendCoin,
                        data: {
                            fromAddress: activeAccount.address,
                            toAddress: state.receivedAddr,
                            amount: sendAmountWithDecimal.toString(),
                            coinId: sendToken.id
                        }
                    });
                    if (sendResp.success) {
                        onSuccess(sendResp.data.hash);
                    } else {
                        showToast(sendResp.error || "Send failed", 'error');
                    }
                }
            } catch {
                showToast("Unexpected error", 'error');
            } finally {
                dispatch({ type: SendActionType.RESET_FORM });
                onRefresh();
            }
        } else {
            showToast("Insufficient balance", 'error');
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <Header title="Send Assets" onBack={onBack} />
            <div className="p-6 flex-1">
                <div className="space-y-6">
                    <Input
                        label="Recipient Address"
                        placeholder="received addr"
                        value={state.receivedAddr}
                        onChange={(e) => dispatch({ type: SendActionType.SET_RECEIVED_ADDR, payload: e.target.value })}
                    />
                    <div className="relative">
                        <Input
                            label="Amount"
                            placeholder="0.00"
                            type="number"
                            value={state.sendAmount}
                            onChange={(e) => dispatch({ type: SendActionType.SET_SEND_AMOUNT, payload: e.target.value })}
                        />
                        <div className="absolute right-4 top-[34px] text-sm font-bold text-slate-400">
                            {sendToken === null ? network.symbol : sendToken.symbol}
                        </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl text-sm space-y-2 text-slate-500">
                        <div className="flex justify-between">
                            <span>Acc. Balance</span>
                            <span
                                className="font-medium text-slate-700">{state.bal.toFixed(8)} {sendToken === null ? network.symbol : sendToken.symbol}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Est. Network Fee</span>
                            <span
                                className="font-medium text-slate-700">{state.calFee ? "loading..." : state.gasEstimate.toFixed(8)} {network.symbol}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-6 border-t border-slate-100">
                <Button onClick={handleSend} disabled={!state.receivedAddr || !state.sendAmount || state.calFee} isLoading={state.isSending}>
                    {state.isSending ? "Sending..." : "Confirm Send"}
                </Button>
            </div>
        </div>
    );
};

// ============ Receive View ============

export const ReceiveView: React.FC<{ address: string; onBack: () => void }> = ({
    address,
    onBack
}) => {
    const { showToast } = useToast();
    const [state, dispatch] = useReducer(receiveReducer, receiveInitialState);

    const handleCopy = () => {
        navigator.clipboard.writeText(address);
        dispatch({ type: ReceiveActionType.SET_COPIED, payload: true });
        showToast(SUCCESS_ADDRESS_COPIED, 'success');
        setTimeout(() => dispatch({ type: ReceiveActionType.SET_COPIED, payload: false }), COPY_FEEDBACK_TIMEOUT_MS);
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <Header title="Receive Assets" onBack={onBack} />
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm mb-6">
                    {address && <QRCodeSVG value={address} size={QR_CODE_SIZE} />}
                </div>
                <div className="space-y-2">
                    <p className="text-sm text-slate-500 font-medium">Scan to send endless asset to this address</p>
                    <div
                        onClick={handleCopy}
                        className="bg-slate-50 px-4 py-3 rounded-xl text-xs font-mono text-slate-700 break-all cursor-pointer hover:bg-slate-100 active:scale-95 transition-all"
                    >
                        {address}
                    </div>
                    {state.copied && <p className="text-xs text-green-500 font-bold animate-pulse">Address Copied!</p>}
                </div>
            </div>
        </div>
    );
};

// ============ Transaction Result View ============

export const TransactionResultView: React.FC<{
    txHash: string;
    network: NetworkConfig;
    onBack: () => void;
}> = ({ txHash, network, onBack }) => {
    const handleViewInBrowser = () => {
        const explorerUrl = `${network.explorerUrl}/txn/${txHash}?network=${network.id}`;
        chrome.tabs.create({ url: explorerUrl });
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(txHash);
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <Header title="Transaction Submitted" onBack={onBack} />
            <div className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <Check size={48} className="text-green-600" />
                </div>

                <h2 className="text-xl font-bold text-slate-900 mb-2">Transaction Sent!</h2>
                <p className="text-sm text-slate-500 text-center mb-8">
                    Your transaction has been submitted to the network
                </p>

                <div className="w-full space-y-4">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <div className="text-xs text-slate-500 mb-2 uppercase tracking-wide font-semibold">
                            Transaction Hash
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="font-mono text-sm text-slate-900 break-all flex-1">
                                {FormatAddress(txHash)}
                            </div>
                            <button
                                onClick={copyToClipboard}
                                className="p-2 hover:bg-slate-200 rounded-lg transition-colors shrink-0"
                            >
                                <Copy size={16} className="text-slate-600" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-6 border-t border-slate-100">
                <Button
                    onClick={handleViewInBrowser}
                    variant="secondary"
                    className="w-full"
                >
                    View in Explorer
                </Button>
            </div>
        </div>
    );
};
