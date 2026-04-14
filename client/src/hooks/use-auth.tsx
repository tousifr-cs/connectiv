import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface AppUser {
  id: string;
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: "user" | "admin";
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  /** Starts signup; returns true if the user should enter the OTP from email (account not created until verified). */
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<boolean>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  completeSignupVerification: (email: string, code: string) => Promise<void>;
  resendSignupOtp: (email: string) => Promise<void>;
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
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSessionUser = async () => {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    if (!res.ok) {
      setUser(null);
      return;
    }
    const data = (await res.json()) as { user: AppUser };
    setUser(data.user);
  };

  useEffect(() => {
    refreshSessionUser()
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const signIn = async (email: string, password: string) => {
    await postJson<{ ok: boolean }>("/api/auth/password/login", {
      email,
      password,
    });
    await refreshSessionUser();
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string,
  ) => {
    const data = await postJson<{ pendingVerification?: boolean }>(
      "/api/auth/password/signup",
      { email, password, displayName },
    );
    return data.pendingVerification === true;
  };

  const completeSignupVerification = async (email: string, code: string) => {
    await postJson<{ ok: boolean }>("/api/auth/password/signup/complete", {
      email,
      code,
    });
    await refreshSessionUser();
  };

  const resendSignupOtp = async (email: string) => {
    await postJson<{ ok: boolean }>("/api/auth/password/signup/resend", {
      email,
    });
  };

  const signInWithGoogle = async () => {
    window.location.replace("/api/auth/google");
  };

  const signOut = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        completeSignupVerification,
        resendSignupOtp,
      }}
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
