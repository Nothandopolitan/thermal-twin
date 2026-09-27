'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', background: '#0a0a0a', color: '#fff' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Something went wrong</h1>
        <p style={{ opacity: 0.7, marginBottom: '1rem' }}>
          {error?.message || 'An unexpected error occurred while loading the app.'}
        </p>
        <button
          onClick={() => reset()}
          style={{
            padding: '0.5rem 1rem',
            background: '#fff',
            color: '#000',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
