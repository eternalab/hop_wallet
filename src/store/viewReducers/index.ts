// Onboarding View Reducer
export {
    OnboardingStep,
    OnboardingActionType,
    onboardingReducer,
    onboardingInitialState,
} from './onboardingReducer';
export type { OnboardingState, OnboardingAction } from './onboardingReducer';

// Home View Reducer
export {
    HomeActionType,
    homeReducer,
    homeInitialState,
} from './homeReducer';
export type { HomeState, HomeAction } from './homeReducer';

// Settings View Reducer
export {
    SettingsActionType,
    settingsReducer,
    settingsInitialState,
} from './settingsReducer';
export type { SettingsState, SettingsAction, SettingsMode } from './settingsReducer';

// Approval View Reducer
export {
    SignTransactionActionType,
    signTransactionReducer,
    signTransactionInitialState,
} from './approvalReducer';
export type { SignTransactionState, SignTransactionAction } from './approvalReducer';

// Other View Reducers
export {
    // Activity
    ActivityActionType,
    activityReducer,
    activityInitialState,
    // DApps
    DAppsActionType,
    dappsReducer,
    dappsInitialState,
    // Token Detail
    TokenDetailActionType,
    tokenDetailReducer,
    tokenDetailInitialState,
    // Collections
    CollectionsActionType,
    collectionsReducer,
    collectionsInitialState,
    // Collection Detail
    CollectionDetailActionType,
    collectionDetailReducer,
    collectionDetailInitialState,
    // Send NFT
    SendNFTActionType,
    sendNFTReducer,
    sendNFTInitialState,
    // Send
    SendActionType,
    sendReducer,
    sendInitialState,
    // Receive
    ReceiveActionType,
    receiveReducer,
    receiveInitialState,
} from './otherViewReducers';
export type {
    ActivityState,
    ActivityAction,
    DAppsState,
    DAppsAction,
    TokenDetailState,
    TokenDetailAction,
    CollectionsState,
    CollectionsAction,
    CollectionDetailState,
    CollectionDetailAction,
    SendNFTState,
    SendNFTAction,
    SendState,
    SendAction,
    ReceiveState,
    ReceiveAction,
} from './otherViewReducers';
