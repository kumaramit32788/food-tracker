import { describe, expect, it } from 'vitest';
import { formatFirebaseAuthError, mapFirebaseUser } from './googleAuth.ts';

describe('mapFirebaseUser', () => {
  it('maps Firebase user fields including profile photo', () => {
    const user = mapFirebaseUser({
      uid: 'abc123',
      displayName: 'Amit Kumar',
      email: 'amit@example.com',
      photoURL: 'https://lh3.googleusercontent.com/a/photo.jpg',
    } as Parameters<typeof mapFirebaseUser>[0]);

    expect(user).toEqual({
      id: 'abc123',
      name: 'Amit Kumar',
      email: 'amit@example.com',
      photoURL: 'https://lh3.googleusercontent.com/a/photo.jpg',
    });
  });

  it('falls back when optional Google fields are missing', () => {
    const user = mapFirebaseUser({
      uid: 'abc123',
      displayName: null,
      email: null,
      photoURL: null,
    } as Parameters<typeof mapFirebaseUser>[0]);

    expect(user).toEqual({
      id: 'abc123',
      name: 'User',
      email: undefined,
      photoURL: undefined,
    });
  });
});

describe('formatFirebaseAuthError', () => {
  it('returns actionable guidance for internal auth errors', () => {
    const message = formatFirebaseAuthError({ code: 'auth/internal-error', message: 'Firebase: Error (auth/internal-error).' });
    expect(message).toMatch(/apis\.google\.com/i);
  });

  it('returns domain guidance for unauthorized domains', () => {
    const message = formatFirebaseAuthError({
      code: 'auth/unauthorized-domain',
      message: 'Firebase: Error (auth/unauthorized-domain).',
    });
    expect(message).toMatch(/Authorized domains/i);
  });

  it('passes through unknown Firebase messages', () => {
    expect(formatFirebaseAuthError({ code: 'auth/network-request-failed', message: 'Network error' })).toBe(
      'Network error',
    );
  });
});
