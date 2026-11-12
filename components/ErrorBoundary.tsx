import React from 'react';
import { isStaleBuildError, reloadForNewVersion } from '../services/staleBuild';

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
    console.error(error);
    // An outdated page asked for a file from a previous deploy: quietly reload to the new version.
    if (isStaleBuildError(error)) reloadForNewVersion();
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const stale = isStaleBuildError(error);
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-6">
        <div className="w-full max-w-md text-center">
          <p className="font-script text-4xl">Odipo C. Odero</p>
          <h1 className="mt-8 font-serif text-3xl font-bold">
            {stale ? 'A new version of the site is ready' : 'Something went wrong'}
          </h1>
          <p className="mt-4 text-neutral-600">
            {stale
              ? 'The site was updated while you had it open. Reload to continue.'
              : 'Sorry — this page didn’t load properly. Please reload, or return to the homepage.'}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button type="button" onClick={() => window.location.reload()} className="btn-dark">
              Reload page
            </button>
            <a href="/" className="btn-light">Go to homepage</a>
          </div>
          {!stale && (
            <details className="mt-10 text-left text-xs text-neutral-500">
              <summary className="cursor-pointer select-none">Technical details</summary>
              <pre className="mt-3 whitespace-pre-wrap break-words border border-neutral-200 bg-mist p-4">{error.message}</pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}
