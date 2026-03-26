import admin from "firebase-admin";

let initialized = false;

function initFirebaseAdmin() {
  if (initialized) return;

  if (admin.apps.length > 0) {
    initialized = true;
    return;
  }

  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json) {
    const credentials = JSON.parse(json) as admin.ServiceAccount;
    admin.initializeApp({ credential: admin.credential.cert(credentials) });
    initialized = true;
    return;
  }

  // Uses GOOGLE_APPLICATION_CREDENTIALS or default credentials (e.g. GCP)
  admin.initializeApp();
  initialized = true;
}

export function getFirebaseAdmin(): typeof admin {
  initFirebaseAdmin();
  return admin;
}
