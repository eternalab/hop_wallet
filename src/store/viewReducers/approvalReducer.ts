import { EstimateTransactionEx, ParsedPayload } from '../../types/wallet';

// ============ Sign Transaction State Types ============

export interface SignTransactionState {
    formatPayload: ParsedPayload;
    esTx: EstimateTransactionEx;
    esLoading: boolean;
}

// ============ Action Types ============

export enum SignTransactionActionType {
    SET_FORMAT_PAYLOAD = 'SET_FORMAT_PAYLOAD',
    SET_ES_TX = 'SET_ES_TX',
    SET_ES_LOADING = 'SET_ES_LOADING',
}

export type SignTransactionAction =
    | { type: SignTransactionActionType.SET_FORMAT_PAYLOAD; payload: ParsedPayload }
    | { type: SignTransactionActionType.SET_ES_TX; payload: EstimateTransactionEx }
    | { type: SignTransactionActionType.SET_ES_LOADING; payload: boolean };

// ============ Initial State ============

export const signTransactionInitialState: SignTransactionState = {
    formatPayload: { isParsed: false },
    esTx: { success: false, balanceChange: null, esGasFee: "0" },
    esLoading: true,
};

// ============ Reducer ============

export function signTransactionReducer(state: SignTransactionState, action: SignTransactionAction): SignTransactionState {
    switch (action.type) {
        case SignTransactionActionType.SET_FORMAT_PAYLOAD:
            return { ...state, formatPayload: action.payload };
        case SignTransactionActionType.SET_ES_TX:
            return { ...state, esTx: action.payload };
        case SignTransactionActionType.SET_ES_LOADING:
            return { ...state, esLoading: action.payload };
        default:
            return state;
    }
}
