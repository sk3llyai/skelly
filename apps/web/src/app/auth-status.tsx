'use client';

import { useEffect, useState, type CSSProperties } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface Me {
  authenticated: boolean;
  user?: { id: string; email: string; name: string };
  organisation?: { id: string; name: string };
}

const linkStyle: CSSProperties = {
  display: 'inline-block',
  marginTop: '1rem',
  padding: '0.6rem 1.1rem',
  borderRadius: 8,
  background: '#111',
  color: '#fff',
  textDecoration: 'none',
};

export function AuthStatus() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/auth/me`, { credentials: 'include' })
      .then((r) => (r.ok ? (r.json() as Promise<Me>) : { authenticated: false }))
      .then(setMe)
      .catch(() => setMe({ authenticated: false }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: '#888' }}>Checking your session…</p>;

  if (me?.authenticated && me.user) {
    return (
      <div>
        <p>
          Signed in as <strong>{me.user.name}</strong> ({me.user.email})
        </p>
        <p>
          Organisation: <strong>{me.organisation?.name}</strong>
        </p>
        <a style={linkStyle} href={`${API}/auth/logout`}>
          Log out
        </a>
      </div>
    );
  }

  return (
    <a style={linkStyle} href={`${API}/auth/login`}>
      Log in
    </a>
  );
}
