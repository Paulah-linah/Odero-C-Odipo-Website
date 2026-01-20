import React from 'react';

type Props = {
  children: React.ReactNode;
};

type State = {
  error: Error | null;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    // Intentionally minimal: we only want to prevent a white screen.
    console.error(error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white p-6">
          <div className="max-w-lg w-full border border-black p-8">
            <h1 className="text-2xl font-serif font-bold mb-4">Something went wrong</h1>
            <p className="text-sm text-gray-600 mb-6">
              The app crashed while loading. Check the browser console for details.
            </p>
            <pre className="text-[11px] whitespace-pre-wrap break-words bg-gray-50 border border-gray-200 p-4">
              {this.state.error.message}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
