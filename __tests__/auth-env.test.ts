import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Dynamic import paths (tsconfig paths assumed to work in vitest via Node resolution)

const ORIGINAL_ENV = { ...process.env };

// Minimal mock for @supabase/supabase-js createClient
vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: vi.fn(() => ({
      auth: {
        signInWithPassword: vi.fn(async () => ({ data: { user: { id: 'u1' }, session: { access_token: 't' } }, error: null })),
        signUp: vi.fn(async () => ({ data: { user: { id: 'u2' }, session: { access_token: 't2' } }, error: null })),
        signInWithOAuth: vi.fn(async () => ({ error: null })),
        signOut: vi.fn(async () => ({ error: null })),
        getSession: vi.fn(async () => ({ data: { session: { access_token: 'tok', user: { id: 'u1' } } } })),
        getUser: vi.fn(async () => ({ data: { user: { id: 'u1', email: 'test@example.com', user_metadata: {} } } })),
  onAuthStateChange: vi.fn((_cb: (event: string, session: { access_token?: string } | null) => void) => ({ data: { subscription: { unsubscribe: () => void 0 } } })),
      },
    })),
  };
});

describe('Auth + Env safety', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV }; // reset
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }; // restore
  });

  it('isSupabaseConfigured false when vars missing', async () => {
    const { isSupabaseConfigured } = await import('@/lib/supabase/config-check');
    expect(isSupabaseConfigured()).toBe(false);
  });

  it('clientEnv.isSupabaseConfigured false and auth functions noop without throwing', async () => {
    const { clientEnv } = await import('@/env');
    const { signInWithGoogle, signOut, getSession, getCurrentUser } = await import('@/lib/supabase/auth');

    expect(clientEnv.isSupabaseConfigured).toBe(false);
    await expect(signInWithGoogle()).resolves.toEqual({ error: null });
    await expect(signOut()).resolves.toEqual({ error: null });
    await expect(getSession()).resolves.toBeNull();
    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it('auth functions operate when env present', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'public-anon-key';

    const { clientEnv } = await import('@/env');
    const { signInWithEmail, signUpWithEmail, signInWithGoogle, signOut, getSession, getCurrentUser } = await import('@/lib/supabase/auth');

    expect(clientEnv.isSupabaseConfigured).toBe(true);

    const signInRes = await signInWithEmail({ email: 'a@b.com', password: 'pass' });
    expect(signInRes.error).toBeNull();

    const signUpRes = await signUpWithEmail({ email: 'c@d.com', password: 'pass' });
    expect(signUpRes.error).toBeNull();

    const oauthRes = await signInWithGoogle('http://localhost/auth/callback');
    expect(oauthRes.error).toBeNull();

    const session = await getSession();
    expect(session).not.toBeNull();

    const user = await getCurrentUser();
    expect(user?.email).toBe('test@example.com');

    const signOutRes = await signOut();
    expect(signOutRes.error).toBeNull();
  });
});
