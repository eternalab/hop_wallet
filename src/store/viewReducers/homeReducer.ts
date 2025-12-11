import { NetworkConfig, Token } from '../../types/common';
import { DefaultMainnetConfig } from '../../constants';

// ============ Home View State Types ============

export interface HomeState {
    isNetworkDropdownOpen: boolean;
    isAccountDropdownOpen: boolean;
    accountAssets: Token[];
    loadingAssets: boolean;
    activeAccountBalance: string;
    network: NetworkConfig;
}

// ============ Action Types ============

export enum HomeActionType {
    SET_NETWORK_DROPDOWN = 'SET_NETWORK_DROPDOWN',
    SET_ACCOUNT_DROPDOWN = 'SET_ACCOUNT_DROPDOWN',
    SET_ACCOUNT_ASSETS = 'SET_ACCOUNT_ASSETS',
    SET_LOADING_ASSETS = 'SET_LOADING_ASSETS',
    SET_ACTIVE_ACCOUNT_BALANCE = 'SET_ACTIVE_ACCOUNT_BALANCE',
    SET_NETWORK = 'SET_NETWORK',
    CLOSE_ALL_DROPDOWNS = 'CLOSE_ALL_DROPDOWNS',
}

export type HomeAction =
    | { type: HomeActionType.SET_NETWORK_DROPDOWN; payload: boolean }
    | { type: HomeActionType.SET_ACCOUNT_DROPDOWN; payload: boolean }
    | { type: HomeActionType.SET_ACCOUNT_ASSETS; payload: Token[] }
    | { type: HomeActionType.SET_LOADING_ASSETS; payload: boolean }
    | { type: HomeActionType.SET_ACTIVE_ACCOUNT_BALANCE; payload: string }
    | { type: HomeActionType.SET_NETWORK; payload: NetworkConfig }
    | { type: HomeActionType.CLOSE_ALL_DROPDOWNS };

// ============ Initial State ============

export const homeInitialState: HomeState = {
    isNetworkDropdownOpen: false,
    isAccountDropdownOpen: false,
    accountAssets: [],
    loadingAssets: true,
    activeAccountBalance: "0.00",
    network: DefaultMainnetConfig,
};

// ============ Reducer ============

export function homeReducer(state: HomeState, action: HomeAction): HomeState {
    switch (action.type) {
        case HomeActionType.SET_NETWORK_DROPDOWN:
            return { ...state, isNetworkDropdownOpen: action.payload, isAccountDropdownOpen: false };
        case HomeActionType.SET_ACCOUNT_DROPDOWN:
            return { ...state, isAccountDropdownOpen: action.payload, isNetworkDropdownOpen: false };
        case HomeActionType.SET_ACCOUNT_ASSETS:
            return { ...state, accountAssets: action.payload };
        case HomeActionType.SET_LOADING_ASSETS:
            return { ...state, loadingAssets: action.payload };
        case HomeActionType.SET_ACTIVE_ACCOUNT_BALANCE:
            return { ...state, activeAccountBalance: action.payload };
        case HomeActionType.SET_NETWORK:
            return { ...state, network: action.payload };
        case HomeActionType.CLOSE_ALL_DROPDOWNS:
            return { ...state, isNetworkDropdownOpen: false, isAccountDropdownOpen: false };
        default:
            return state;
    }
}
