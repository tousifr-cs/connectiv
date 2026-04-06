import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Mail, Lock, User } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [step, setStep] = useState<"form" | "verify-email">("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    signIn,
    signUp,
    signInWithGoogle,
    completeSignupVerification,
    resendSignupOtp,
  } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        if (!displayName.trim()) {
          toast({
            title: "Name required",
            description: "Please enter your display name.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        const needsVerify = await signUp(email, password, displayName);
        if (needsVerify) {
          setStep("verify-email");
          setOtp("");
          toast({
            title: "Check your email",
            description:
              "Enter the 6-digit code we sent to finish setting up your account.",
          });
          return;
        }
      }
      toast({
        title: mode === "login" ? "Welcome back!" : "Account created!",
        description: "You're now signed in.",
      });
      setLocation("/");
    } catch (err: any) {
      const code = err?.code;
      const provider = err?.provider;
      if (
        mode === "login" &&
        code === "PROVIDER_MISMATCH" &&
        provider === "google"
      ) {
        // Redirect user to Google SSO instead of showing incorrect-password UX
        try {
          toast({
            title: "Use Google sign-in",
            description:
              "This account was created with Google. Continuing with Google...",
          });
          await signInWithGoogle();
          toast({ title: "Welcome!", description: "Signed in with Google." });
          setLocation("/");
          return;
        } catch (googleErr: any) {
          const message = googleErr?.message ?? "Google sign-in failed.";
          toast({
            title: "Error",
            description: message,
            variant: "destructive",
          });
        }
      } else {
        const message =
          typeof err?.message === "string"
            ? err.message
            : "Something went wrong. Please try again.";
        toast({ title: "Error", description: message, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Enter all 6 digits from your email.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      await completeSignupVerification(email, otp);
      toast({
        title: "Account ready",
        description: "You're signed in.",
      });
      setLocation("/");
    } catch (err: any) {
      toast({
        title: "Error",
        description:
          typeof err?.message === "string"
            ? err.message
            : "Verification failed.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await resendSignupOtp(email);
      toast({
        title: "Code sent",
        description: "Check your inbox for a new verification code.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description:
          typeof err?.message === "string"
            ? err.message
            : "Could not resend.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast({ title: "Welcome!", description: "Signed in with Google." });
      setLocation("/");
    } catch (err: any) {
      if (!err?.message?.includes("popup-closed")) {
        toast({
          title: "Error",
          description: "Google sign-in failed. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Back nav */}
      <div className="container mx-auto px-4 pt-6">
        <Link href="/">
          <Button
            variant="ghost"
            className="hover:text-primary pl-0 text-white/60"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-20">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-10">
            <Link href="/">
              <span className="text-2xl font-bold tracking-tighter text-primary cursor-pointer">
                ProConnectiv
              </span>
            </Link>
            <h1 className="text-3xl font-bold mt-6 mb-2">
              {step === "verify-email"
                ? "Verify your email"
                : mode === "login"
                  ? "Welcome back"
                  : "Create your account"}
            </h1>
            <p className="text-white/40">
              {step === "verify-email"
                ? `We sent a code to ${email || "your inbox"}. Enter it below.`
                : mode === "login"
                  ? "Sign in to access your sessions and connections."
                  : "Join ProConnectiv and start connecting with creators."}
            </p>
          </div>

          {step === "verify-email" ? (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <Label className="text-white/60 text-sm self-start">
                  6-digit code
                </Label>
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(v) => setOtp(v.replace(/\D/g, "").slice(0, 6))}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full h-12 text-base font-bold bg-primary text-black hover:bg-primary/90 rounded-xl"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Verify & continue
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={loading}
                onClick={handleResend}
                className="w-full text-primary"
              >
                Resend code
              </Button>
              <button
                type="button"
                onClick={() => {
                  setStep("form");
                  setOtp("");
                }}
                className="w-full text-sm text-white/40 hover:text-white/70"
              >
                Back to sign in
              </button>
            </form>
          ) : (
            <>
          {/* Google button */}
          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-12 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 mb-6"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-black px-4 text-white/30">
                or continue with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/60 text-sm">
                  Display Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="h-12 pl-10 bg-white/5 border-white/10 text-white rounded-xl focus:border-primary focus:ring-primary/20"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/60 text-sm">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 pl-10 bg-white/5 border-white/10 text-white rounded-xl focus:border-primary focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/60 text-sm">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  id="password"
                  type="password"
                  placeholder={
                    mode === "signup" ? "Min 8 characters" : "Your password"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="h-12 pl-10 bg-white/5 border-white/10 text-white rounded-xl focus:border-primary focus:ring-primary/20"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-bold bg-primary text-black hover:bg-primary/90 rounded-xl shadow-[0_0_20px_rgba(0,255,0,0.2)] hover:shadow-[0_0_30px_rgba(0,255,0,0.4)] transition-all mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>

          {/* Toggle mode */}
          <p className="text-center text-sm text-white/40 mt-6">
            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-primary font-medium hover:underline"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
