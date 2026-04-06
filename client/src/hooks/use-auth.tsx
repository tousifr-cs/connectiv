import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithCustomToken,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { syncUserWithBackend } from "@/lib/sync-auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => ({}))) as {
    message?: string;
    code?: string;
    provider?: string;
    errors?: { path: string; message: string }[];
  };

  if (!res.ok) {
    const err = new Error(data?.message ?? res.statusText) as Error & {
      code?: string;
      provider?: string;
      validationErrors?: { path: string; message: string }[];
    };
    err.code = data?.code;
    err.provider = data?.provider;
    err.validationErrors = data?.errors;
    throw err;
  }
  return data as T;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const syncingUid = useRef<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        const uid = firebaseUser.uid;
        if (syncingUid.current === uid) return;
        syncingUid.current = uid;

        try {
          const token = await firebaseUser.getIdToken();
          await syncUserWithBackend(token);
        } catch (e) {
          console.error("Failed to sync user with backend:", e);
        } finally {
          syncingUid.current = null;
        }
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    const data = await postJson<{ customToken: string }>(
      "/api/auth/password/login",
      { email, password },
    );
    await signInWithCustomToken(auth, data.customToken);
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string,
  ) => {
    const data = await postJson<{ customToken: string }>(
      "/api/auth/password/signup",
      { email, password, displayName },
    );
    await signInWithCustomToken(auth, data.customToken);
  };

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
