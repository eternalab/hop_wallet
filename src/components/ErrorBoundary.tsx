import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './UI';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReset = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    handleReload = (): void => {
        window.location.reload();
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col h-full items-center justify-center p-6 bg-slate-50">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
                        <AlertTriangle size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
                    <p className="text-slate-500 text-sm text-center mb-6 max-w-xs">
                        An unexpected error occurred. Please try again or reload the extension.
                    </p>

                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <div className="w-full mb-6 p-3 bg-red-50 border border-red-200 rounded-lg overflow-auto max-h-32">
                            <p className="text-xs font-mono text-red-600 break-all">
                                {this.state.error.toString()}
                            </p>
                            {this.state.errorInfo && (
                                <pre className="text-xs font-mono text-red-500 mt-2 whitespace-pre-wrap">
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            )}
                        </div>
                    )}

                    <div className="flex gap-3 w-full max-w-xs">
                        <Button
                            variant="secondary"
                            onClick={this.handleReset}
                            className="flex-1"
                        >
                            Try Again
                        </Button>
                        <Button
                            onClick={this.handleReload}
                            icon={RefreshCw}
                            className="flex-1"
                        >
                            Reload
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// HOC for wrapping functional components
export function withErrorBoundary<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    fallback?: ReactNode
): React.FC<P> {
    return function WithErrorBoundaryWrapper(props: P) {
        return (
            <ErrorBoundary fallback={fallback}>
                <WrappedComponent {...props} />
            </ErrorBoundary>
        );
    };
}
