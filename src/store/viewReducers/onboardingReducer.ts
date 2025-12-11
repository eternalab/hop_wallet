// ============ Onboarding View State Types ============

export enum OnboardingStep {
    WELCOME = 'welcome',
    SET_PASSWORD = 'set_password',
    CHOOSE_METHOD = 'choose_method',
    GENERATE_MNEMONIC = 'generate_mnemonic',
    CONFIRM_MNEMONIC = 'confirm_mnemonic',
    IMPORT_MNEMONIC = 'import_mnemonic',
    COMPLETE = 'complete'
}

export interface OnboardingState {
    step: OnboardingStep;
    password: string;
    confirmPassword: string;
    showPassword: boolean;
    mnemonic: string;
    mnemonicInput: string;
    confirmWords: { index: number; word: string }[];
    userConfirmInput: Record<number, string>;
    error: string;
    isLoading: boolean;
    copied: boolean;
    isCreateFlow: boolean;
}

// ============ Action Types ============

export enum OnboardingActionType {
    SET_STEP = 'SET_STEP',
    SET_PASSWORD = 'SET_PASSWORD',
    SET_CONFIRM_PASSWORD = 'SET_CONFIRM_PASSWORD',
    TOGGLE_SHOW_PASSWORD = 'TOGGLE_SHOW_PASSWORD',
    SET_MNEMONIC = 'SET_MNEMONIC',
    SET_MNEMONIC_INPUT = 'SET_MNEMONIC_INPUT',
    SET_CONFIRM_WORDS = 'SET_CONFIRM_WORDS',
    SET_USER_CONFIRM_INPUT = 'SET_USER_CONFIRM_INPUT',
    SET_ERROR = 'SET_ERROR',
    SET_LOADING = 'SET_LOADING',
    SET_COPIED = 'SET_COPIED',
    SET_IS_CREATE_FLOW = 'SET_IS_CREATE_FLOW',
    RESET_CONFIRM_STATE = 'RESET_CONFIRM_STATE',
}

export type OnboardingAction =
    | { type: OnboardingActionType.SET_STEP; payload: OnboardingStep }
    | { type: OnboardingActionType.SET_PASSWORD; payload: string }
    | { type: OnboardingActionType.SET_CONFIRM_PASSWORD; payload: string }
    | { type: OnboardingActionType.TOGGLE_SHOW_PASSWORD }
    | { type: OnboardingActionType.SET_MNEMONIC; payload: string }
    | { type: OnboardingActionType.SET_MNEMONIC_INPUT; payload: string }
    | { type: OnboardingActionType.SET_CONFIRM_WORDS; payload: { index: number; word: string }[] }
    | { type: OnboardingActionType.SET_USER_CONFIRM_INPUT; payload: { index: number; value: string } }
    | { type: OnboardingActionType.SET_ERROR; payload: string }
    | { type: OnboardingActionType.SET_LOADING; payload: boolean }
    | { type: OnboardingActionType.SET_COPIED; payload: boolean }
    | { type: OnboardingActionType.SET_IS_CREATE_FLOW; payload: boolean }
    | { type: OnboardingActionType.RESET_CONFIRM_STATE };

// ============ Initial State ============

export const onboardingInitialState: OnboardingState = {
    step: OnboardingStep.WELCOME,
    password: '',
    confirmPassword: '',
    showPassword: false,
    mnemonic: '',
    mnemonicInput: '',
    confirmWords: [],
    userConfirmInput: {},
    error: '',
    isLoading: false,
    copied: false,
    isCreateFlow: true,
};

// ============ Reducer ============

export function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
    switch (action.type) {
        case OnboardingActionType.SET_STEP:
            return { ...state, step: action.payload, error: '' };
        case OnboardingActionType.SET_PASSWORD:
            return { ...state, password: action.payload };
        case OnboardingActionType.SET_CONFIRM_PASSWORD:
            return { ...state, confirmPassword: action.payload };
        case OnboardingActionType.TOGGLE_SHOW_PASSWORD:
            return { ...state, showPassword: !state.showPassword };
        case OnboardingActionType.SET_MNEMONIC:
            return { ...state, mnemonic: action.payload };
        case OnboardingActionType.SET_MNEMONIC_INPUT:
            return { ...state, mnemonicInput: action.payload };
        case OnboardingActionType.SET_CONFIRM_WORDS:
            return { ...state, confirmWords: action.payload };
        case OnboardingActionType.SET_USER_CONFIRM_INPUT:
            return {
                ...state,
                userConfirmInput: {
                    ...state.userConfirmInput,
                    [action.payload.index]: action.payload.value
                }
            };
        case OnboardingActionType.SET_ERROR:
            return { ...state, error: action.payload };
        case OnboardingActionType.SET_LOADING:
            return { ...state, isLoading: action.payload };
        case OnboardingActionType.SET_COPIED:
            return { ...state, copied: action.payload };
        case OnboardingActionType.SET_IS_CREATE_FLOW:
            return { ...state, isCreateFlow: action.payload };
        case OnboardingActionType.RESET_CONFIRM_STATE:
            return { ...state, confirmWords: [], userConfirmInput: {} };
        default:
            return state;
    }
}
