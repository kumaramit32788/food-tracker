import { afterEach, describe, expect, it, vi } from 'vitest';
import { getFirebaseConfig, isFirebaseConfigured } from './firebase.ts';

describe('getFirebaseConfig', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('strips surrounding quotes from env values', () => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', '"test-api-key"');
    vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', "'test.firebaseapp.com'");
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'test-project');
    vi.stubEnv('VITE_FIREBASE_STORAGE_BUCKET', 'test.appspot.com');
    vi.stubEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', '123456789');
    vi.stubEnv('VITE_FIREBASE_APP_ID', '1:123456789:web:abc');

    expect(getFirebaseConfig()).toEqual({
      apiKey: 'test-api-key',
      authDomain: 'test.firebaseapp.com',
      projectId: 'test-project',
      storageBucket: 'test.appspot.com',
      messagingSenderId: '123456789',
      appId: '1:123456789:web:abc',
    });
  });

  it('throws when required env vars are missing', () => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', '');
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', '');

    expect(() => getFirebaseConfig()).toThrow(/Missing Firebase env vars/);
  });
});

describe('isFirebaseConfigured', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns true when api key and project id are set', () => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'key');
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'project');
    expect(isFirebaseConfigured()).toBe(true);
  });

  it('returns false when api key or project id is missing', () => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', '');
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'project');
    expect(isFirebaseConfigured()).toBe(false);
  });
});
