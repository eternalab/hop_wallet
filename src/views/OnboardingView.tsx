import React, { useEffect, useReducer } from 'react';
import {
    Shield,
    Wallet,
    Key,
    CheckCircle,
    AlertCircle,
    Copy,
    Check,
    ArrowLeft,
    ArrowRight,
    Eye,
    EyeOff
} from 'lucide-react';
import { Button, Input, Card } from '../components/UI';
import {
    PASSWORD_MIN_LENGTH,
    ERROR_PASSWORD_TOO_SHORT,
    ERROR_PASSWORD_MISMATCH,
    ERROR_INVALID_MNEMONIC,
    BRAND_NAME,
    BRAND_TAGLINE
} from '../constants';
import {
    OnboardingStep,
    OnboardingActionType,
    onboardingReducer,
    onboardingInitialState
} from '../store';

// ============ Component ============

interface OnboardingViewProps {
    onComplete: (password: string, mnemonic?: string) => Promise<void>;
    onGenerateMnemonic: () => Promise<string>;
    onValidateMnemonic: (mnemonic: string) => Promise<boolean>;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({
    onComplete,
    onGenerateMnemonic,
    onValidateMnemonic
}) => {
    const [state, dispatch] = useReducer(onboardingReducer, onboardingInitialState);

    // Generate random words to confirm
    useEffect(() => {
        if (state.step === OnboardingStep.CONFIRM_MNEMONIC && state.mnemonic) {
            const words = state.mnemonic.split(' ');
            const indices: number[] = [];
            while (indices.length < 3) {
                const randomIndex = Math.floor(Math.random() * words.length);
                if (!indices.includes(randomIndex)) {
                    indices.push(randomIndex);
                }
            }
            indices.sort((a, b) => a - b);
            dispatch({ type: OnboardingActionType.SET_CONFIRM_WORDS, payload: indices.map(i => ({ index: i, word: words[i] })) });
        }
    }, [state.step, state.mnemonic]);

    const handleSetPassword = () => {
        dispatch({ type: OnboardingActionType.SET_ERROR, payload: '' });
        if (state.password.length < PASSWORD_MIN_LENGTH) {
            dispatch({ type: OnboardingActionType.SET_ERROR, payload: ERROR_PASSWORD_TOO_SHORT });
            return;
        }
        if (state.password !== state.confirmPassword) {
            dispatch({ type: OnboardingActionType.SET_ERROR, payload: ERROR_PASSWORD_MISMATCH });
            return;
        }
        dispatch({ type: OnboardingActionType.SET_STEP, payload: OnboardingStep.CHOOSE_METHOD });
    };

    const handleChooseCreate = async () => {
        dispatch({ type: OnboardingActionType.SET_LOADING, payload: true });
        dispatch({ type: OnboardingActionType.SET_ERROR, payload: '' });
        dispatch({ type: OnboardingActionType.SET_IS_CREATE_FLOW, payload: true });
        try {
            const generatedMnemonic = await onGenerateMnemonic();
            dispatch({ type: OnboardingActionType.SET_MNEMONIC, payload: generatedMnemonic });
            dispatch({ type: OnboardingActionType.SET_STEP, payload: OnboardingStep.GENERATE_MNEMONIC });
        } catch (e) {
            dispatch({ type: OnboardingActionType.SET_ERROR, payload: 'Failed to generate mnemonic' });
        } finally {
            dispatch({ type: OnboardingActionType.SET_LOADING, payload: false });
        }
    };

    const handleChooseImport = () => {
        dispatch({ type: OnboardingActionType.SET_IS_CREATE_FLOW, payload: false });
        dispatch({ type: OnboardingActionType.SET_MNEMONIC_INPUT, payload: '' });
        dispatch({ type: OnboardingActionType.SET_STEP, payload: OnboardingStep.IMPORT_MNEMONIC });
    };

    const handleCopyMnemonic = () => {
        navigator.clipboard.writeText(state.mnemonic);
        dispatch({ type: OnboardingActionType.SET_COPIED, payload: true });
        setTimeout(() => dispatch({ type: OnboardingActionType.SET_COPIED, payload: false }), 2000);
    };

    const handleConfirmMnemonic = () => {
        dispatch({ type: OnboardingActionType.SET_ERROR, payload: '' });
        for (const { index, word } of state.confirmWords) {
            if (state.userConfirmInput[index]?.toLowerCase().trim() !== word.toLowerCase()) {
                dispatch({ type: OnboardingActionType.SET_ERROR, payload: `Word #${index + 1} is incorrect. Please check your backup.` });
                return;
            }
        }
        dispatch({ type: OnboardingActionType.SET_STEP, payload: OnboardingStep.COMPLETE });
    };

    const handleImportMnemonic = async () => {
        dispatch({ type: OnboardingActionType.SET_LOADING, payload: true });
        dispatch({ type: OnboardingActionType.SET_ERROR, payload: '' });
        try {
            const trimmedMnemonic = state.mnemonicInput.trim().toLowerCase();
            const isValid = await onValidateMnemonic(trimmedMnemonic);
            if (!isValid) {
                dispatch({ type: OnboardingActionType.SET_ERROR, payload: ERROR_INVALID_MNEMONIC });
                return;
            }
            dispatch({ type: OnboardingActionType.SET_MNEMONIC, payload: trimmedMnemonic });
            dispatch({ type: OnboardingActionType.SET_STEP, payload: OnboardingStep.COMPLETE });
        } catch (e) {
            dispatch({ type: OnboardingActionType.SET_ERROR, payload: ERROR_INVALID_MNEMONIC });
        } finally {
            dispatch({ type: OnboardingActionType.SET_LOADING, payload: false });
        }
    };

    const handleComplete = async () => {
        dispatch({ type: OnboardingActionType.SET_LOADING, payload: true });
        dispatch({ type: OnboardingActionType.SET_ERROR, payload: '' });
        try {
            await onComplete(state.password, state.mnemonic);
        } catch (e) {
            dispatch({ type: OnboardingActionType.SET_ERROR, payload: 'Failed to create wallet' });
        } finally {
            dispatch({ type: OnboardingActionType.SET_LOADING, payload: false });
        }
    };

    const goBack = () => {
        dispatch({ type: OnboardingActionType.SET_ERROR, payload: '' });
        switch (state.step) {
            case OnboardingStep.SET_PASSWORD:
                dispatch({ type: OnboardingActionType.SET_STEP, payload: OnboardingStep.WELCOME });
                break;
            case OnboardingStep.CHOOSE_METHOD:
                dispatch({ type: OnboardingActionType.SET_STEP, payload: OnboardingStep.SET_PASSWORD });
                break;
            case OnboardingStep.GENERATE_MNEMONIC:
                dispatch({ type: OnboardingActionType.SET_STEP, payload: OnboardingStep.CHOOSE_METHOD });
                break;
            case OnboardingStep.CONFIRM_MNEMONIC:
                dispatch({ type: OnboardingActionType.SET_STEP, payload: OnboardingStep.GENERATE_MNEMONIC });
                break;
            case OnboardingStep.IMPORT_MNEMONIC:
                dispatch({ type: OnboardingActionType.SET_STEP, payload: OnboardingStep.CHOOSE_METHOD });
                break;
            case OnboardingStep.COMPLETE:
                if (state.isCreateFlow) {
                    dispatch({ type: OnboardingActionType.SET_STEP, payload: OnboardingStep.CONFIRM_MNEMONIC });
                } else {
                    dispatch({ type: OnboardingActionType.SET_STEP, payload: OnboardingStep.IMPORT_MNEMONIC });
                }
                break;
        }
    };

    // Progress indicator
    const getProgress = () => {
        const steps = state.isCreateFlow
            ? [OnboardingStep.WELCOME, OnboardingStep.SET_PASSWORD, OnboardingStep.CHOOSE_METHOD, OnboardingStep.GENERATE_MNEMONIC, OnboardingStep.CONFIRM_MNEMONIC, OnboardingStep.COMPLETE]
            : [OnboardingStep.WELCOME, OnboardingStep.SET_PASSWORD, OnboardingStep.CHOOSE_METHOD, OnboardingStep.IMPORT_MNEMONIC, OnboardingStep.COMPLETE];
        const currentIndex = steps.indexOf(state.step);
        return { current: currentIndex + 1, total: steps.length };
    };

    const progress = getProgress();

    // Render different steps
    const renderWelcome = () => (
        <div className="flex flex-col h-full p-6 justify-center bg-gradient-to-br from-white to-slate-50">
            <div className="mb-10 text-center">
                <div
                    className="w-20 h-20 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-cyan-500/30">
                    <Wallet className="text-white" size={40} />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">{BRAND_NAME}</h1>
                <p className="text-slate-500 mt-2">{BRAND_TAGLINE}</p>
            </div>
            <div className="space-y-4">
                <Button onClick={() => dispatch({ type: OnboardingActionType.SET_STEP, payload: OnboardingStep.SET_PASSWORD })}>
                    Get Started
                    <ArrowRight size={18} />
                </Button>
            </div>
        </div>
    );

    const renderSetPassword = () => (
        <div className="flex flex-col h-full p-6 bg-white">
            <button onClick={goBack} className="self-start p-2 -ml-2 hover:bg-slate-100 rounded-lg text-slate-600 mb-4">
                <ArrowLeft size={20} />
            </button>

            <div className="text-center mb-8">
                <div
                    className="w-16 h-16 bg-cyan-100 text-cyan-600 rounded-full mx-auto flex items-center justify-center mb-4">
                    <Shield size={32} />
                </div>
                <h1 className="text-xl font-bold text-slate-900">Create Password</h1>
                <p className="text-slate-500 mt-2 text-sm">This password will unlock your wallet.</p>
            </div>

            <div className="flex-1 space-y-4">
                <div className="relative">
                    <Input
                        type={state.showPassword ? 'text' : 'password'}
                        label="New Password"
                        value={state.password}
                        onChange={e => dispatch({ type: OnboardingActionType.SET_PASSWORD, payload: e.target.value })}
                        placeholder="Min 8 characters"
                    />
                    <button
                        type="button"
                        onClick={() => dispatch({ type: OnboardingActionType.TOGGLE_SHOW_PASSWORD })}
                        className="absolute right-3 top-8 text-slate-400 hover:text-slate-600"
                    >
                        {state.showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                <Input
                    type={state.showPassword ? 'text' : 'password'}
                    label="Confirm Password"
                    value={state.confirmPassword}
                    onChange={e => dispatch({ type: OnboardingActionType.SET_CONFIRM_PASSWORD, payload: e.target.value })}
                    placeholder="Re-enter password"
                    error={state.error}
                />
            </div>

            <Button onClick={handleSetPassword} disabled={!state.password || !state.confirmPassword}>
                Continue
                <ArrowRight size={18} />
            </Button>
        </div>
    );

    const renderChooseMethod = () => (
        <div className="flex flex-col h-full p-6 bg-white">
            <button onClick={goBack} className="self-start p-2 -ml-2 hover:bg-slate-100 rounded-lg text-slate-600 mb-4">
                <ArrowLeft size={20} />
            </button>

            <div className="text-center mb-8">
                <h1 className="text-xl font-bold text-slate-900">Set Up Wallet</h1>
                <p className="text-slate-500 mt-2 text-sm">Choose how you want to set up your wallet</p>
            </div>

            <div className="flex-1 space-y-4">
                <Card
                    className="p-5 cursor-pointer hover:border-cyan-300 hover:shadow-md transition-all"
                    onClick={handleChooseCreate}
                >
                    <div className="flex items-start gap-4">
                        <div
                            className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center shrink-0">
                            <Wallet size={24} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">Create New Wallet</h3>
                            <p className="text-sm text-slate-500 mt-1">Generate a new wallet with a fresh recovery
                                phrase</p>
                        </div>
                    </div>
                </Card>

                <Card
                    className="p-5 cursor-pointer hover:border-cyan-300 hover:shadow-md transition-all"
                    onClick={handleChooseImport}
                >
                    <div className="flex items-start gap-4">
                        <div
                            className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center shrink-0">
                            <Key size={24} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">Import Existing Wallet</h3>
                            <p className="text-sm text-slate-500 mt-1">Restore your wallet using a recovery phrase</p>
                        </div>
                    </div>
                </Card>
            </div>

            {state.isLoading && (
                <div className="text-center text-slate-500 text-sm">Generating...</div>
            )}
        </div>
    );

    const renderGenerateMnemonic = () => {
        const words = state.mnemonic.split(' ');
        return (
            <div className="flex flex-col h-full p-6 bg-white">
                <button onClick={goBack}
                    className="self-start p-2 -ml-2 hover:bg-slate-100 rounded-lg text-slate-600 mb-4">
                    <ArrowLeft size={20} />
                </button>

                <div className="text-center mb-6">
                    <h1 className="text-xl font-bold text-slate-900">Recovery Phrase</h1>
                    <p className="text-slate-500 mt-2 text-sm">Write down these 12 words in order and keep them
                        safe.</p>
                </div>

                <div className="flex-1">
                    <Card className="p-4 bg-slate-50 border-slate-200">
                        <div className="grid grid-cols-3 gap-2">
                            {words.map((word, idx) => (
                                <div key={idx} className="flex items-center-safe gap-2 bg-white rounded-lg px-3 py-2 border border-slate-100">
                                    <span className="text-xs text-slate-400 w-5">{idx + 1}.</span>
                                    <span className="text-sm font-medium text-slate-800">{word}</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <button
                        onClick={handleCopyMnemonic}
                        className="mt-2 flex items-center justify-center gap-2 w-full py-2 text-sm text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                    >
                        {state.copied ? <Check size={16} /> : <Copy size={16} />}
                        {state.copied ? 'Copied!' : 'Copy to clipboard'}
                    </button>

                    <div className="mt-2 mb-2 p-3 bg-yellow-50 border border-yellow-100 rounded-lg flex gap-2">
                        <AlertCircle size={16} className="text-yellow-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-yellow-700">
                            Never share your recovery phrase. Anyone with these words can access your wallet.
                        </p>
                    </div>
                </div>

                <Button onClick={() => dispatch({ type: OnboardingActionType.SET_STEP, payload: OnboardingStep.CONFIRM_MNEMONIC })}>
                    I've Saved It
                    <ArrowRight size={18} />
                </Button>
            </div>
        );
    };

    const renderConfirmMnemonic = () => (
        <div className="flex flex-col h-full p-6 bg-white">
            <button onClick={goBack} className="self-start p-2 -ml-2 hover:bg-slate-100 rounded-lg text-slate-600 mb-4">
                <ArrowLeft size={20} />
            </button>

            <div className="text-center mb-6">
                <h1 className="text-xl font-bold text-slate-900">Confirm Backup</h1>
                <p className="text-slate-500 mt-2 text-sm">Enter the following words from your recovery phrase</p>
            </div>

            <div className="flex-1 space-y-4">
                {state.confirmWords.map(({ index }) => (
                    <Input
                        key={index}
                        label={`Word #${index + 1}`}
                        value={state.userConfirmInput[index] || ''}
                        onChange={e => dispatch({ type: OnboardingActionType.SET_USER_CONFIRM_INPUT, payload: { index, value: e.target.value } })}
                        placeholder={`Enter word #${index + 1}`}
                    />
                ))}
                {state.error && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                        <p className="text-xs text-red-600">{state.error}</p>
                    </div>
                )}
            </div>

            <Button
                onClick={handleConfirmMnemonic}
                disabled={state.confirmWords.some(({ index }) => !state.userConfirmInput[index])}
            >
                Confirm
                <ArrowRight size={18} />
            </Button>
        </div>
    );

    const renderImportMnemonic = () => (
        <div className="flex flex-col h-full p-6 bg-white">
            <button onClick={goBack} className="self-start p-2 -ml-2 hover:bg-slate-100 rounded-lg text-slate-600 mb-4">
                <ArrowLeft size={20} />
            </button>

            <div className="text-center mb-6">
                <h1 className="text-xl font-bold text-slate-900">Import Wallet</h1>
                <p className="text-slate-500 mt-2 text-sm">Enter your 12-word recovery phrase</p>
            </div>

            <div className="flex-1">
                <textarea
                    className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-200 transition-all resize-none"
                    placeholder="Enter your recovery phrase, separated by spaces"
                    value={state.mnemonicInput}
                    onChange={e => dispatch({ type: OnboardingActionType.SET_MNEMONIC_INPUT, payload: e.target.value })}
                />
                {state.error && (
                    <p className="text-red-500 text-xs mt-2">{state.error}</p>
                )}

                <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <p className="text-xs text-slate-500">
                        Typically 12 words separated by single spaces
                    </p>
                </div>
            </div>

            <Button onClick={handleImportMnemonic} isLoading={state.isLoading} disabled={!state.mnemonicInput.trim()}>
                Import Wallet
                <ArrowRight size={18} />
            </Button>
        </div>
    );

    const renderComplete = () => (
        <div className="flex flex-col h-full p-6 justify-center bg-white">
            <div className="text-center mb-8">
                <div
                    className="w-20 h-20 bg-green-100 text-green-600 rounded-full mx-auto flex items-center justify-center mb-6">
                    <CheckCircle size={40} />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">You're All Set!</h1>
                <p className="text-slate-500 mt-2">
                    {state.isCreateFlow
                        ? 'Your wallet has been created successfully.'
                        : 'Your wallet has been imported successfully.'}
                </p>
            </div>

            <Button onClick={handleComplete} isLoading={state.isLoading}>
                Enter Wallet
            </Button>

            {state.error && (
                <p className="text-red-500 text-xs mt-4 text-center">{state.error}</p>
            )}
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Progress bar */}
            {state.step !== OnboardingStep.WELCOME && (
                <div className="px-6 pt-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400">Step {progress.current} of {progress.total}</span>
                    </div>
                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-cyan-500 transition-all duration-300"
                            style={{ width: `${(progress.current / progress.total) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                {state.step === OnboardingStep.WELCOME && renderWelcome()}
                {state.step === OnboardingStep.SET_PASSWORD && renderSetPassword()}
                {state.step === OnboardingStep.CHOOSE_METHOD && renderChooseMethod()}
                {state.step === OnboardingStep.GENERATE_MNEMONIC && renderGenerateMnemonic()}
                {state.step === OnboardingStep.CONFIRM_MNEMONIC && renderConfirmMnemonic()}
                {state.step === OnboardingStep.IMPORT_MNEMONIC && renderImportMnemonic()}
                {state.step === OnboardingStep.COMPLETE && renderComplete()}
            </div>
        </div>
    );
};
