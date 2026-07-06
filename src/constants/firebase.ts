export function getFirebaseConfig() {
  const read = (value: string | undefined) => value?.trim().replace(/^["']|["']$/g, '') ?? '';

  const config = {
    apiKey: read(import.meta.env.VITE_FIREBASE_API_KEY),
    authDomain: read(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
    projectId: read(import.meta.env.VITE_FIREBASE_PROJECT_ID),
    storageBucket: read(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: read(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
    appId: read(import.meta.env.VITE_FIREBASE_APP_ID),
  };

  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing Firebase env vars: ${missing.join(', ')}. Copy .env.example to .env and fill in values.`,
    );
  }

  return config as Required<typeof config>;
}

export function isFirebaseConfigured(): boolean {
  return Boolean(import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID);
}
