import React from 'react';

interface GlobalErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class GlobalErrorBoundary extends React.Component<React.PropsWithChildren, GlobalErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): GlobalErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // TODO: integrate with logging/telemetry if needed
    // console.error('Global error boundary caught:', error, info);
  }

  handleReload = (): void => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-lg shadow p-6 text-center">
            <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">An unexpected error occurred. You can try reloading the app.</p>
            <button
              onClick={this.handleReload}
              className="inline-flex items-center justify-center rounded-md bg-emerald-500 px-4 py-2 font-medium text-white hover:bg-emerald-600"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;