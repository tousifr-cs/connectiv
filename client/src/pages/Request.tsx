import { useState } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ShieldCheck, Wallet, ArrowRight, Instagram, Twitter, Linkedin, Facebook, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function RequestPage() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const profileUrl = searchParams.get("url") || "";
  
  const [amount, setAmount] = useState("50");

  const getPlatformInfo = (url: string) => {
    if (url.includes("facebook.com")) return { name: "Facebook", icon: Facebook };
    if (url.includes("instagram.com")) return { name: "Instagram", icon: Instagram };
    if (url.includes("linkedin.com")) return { name: "LinkedIn", icon: Linkedin };
    if (url.includes("x.com") || url.includes("twitter.com")) return { name: "X.com", icon: Twitter };
    if (url.includes("@") || url.includes("email")) return { name: "Email", icon: Mail };
    return { name: "Social Profile", icon: Globe };
  };

  const platform = getPlatformInfo(profileUrl);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Left Column: Profile Info */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-4xl font-black tracking-tighter mb-4">Request Connection</h1>
              <p className="text-gray-400">You are requesting a verified conversation with the owner of this profile.</p>
            </div>

            <Card className="bg-white/5 border-white/10 text-white overflow-hidden">
              <CardHeader className="bg-white/5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-black/50 border border-white/10">
                    <platform.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{platform.name}</CardTitle>
                    <CardDescription className="text-gray-500 truncate max-w-[200px]">{profileUrl}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-3 text-sm text-gray-400">
                  <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                  <span>We will verify ownership by asking them to add a code to their bio.</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-400">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span>Payment is only released after the conversation is complete.</span>
                </div>
              </CardContent>
            </Card>

            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
              <h4 className="font-bold mb-2">How it works</h4>
              <ol className="space-y-3 text-sm text-gray-400">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">1.</span>
                  <span>We notify the profile owner of your request.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">2.</span>
                  <span>They verify their identity through our secure process.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">3.</span>
                  <span>You both choose a time for a 1:1 encrypted session.</span>
                </li>
              </ol>
            </div>
          </motion.div>

          {/* Right Column: Payment Details */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription className="text-gray-500">Attach cryptocurrency to your request</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="amount">Offer Amount (USD Value)</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input 
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="h-12 pl-8 bg-black border-white/10 focus:border-primary"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Higher offers usually get faster responses.</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/10">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Offer Amount</span>
                    <span>${amount}.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Platform Fee (5%)</span>
                    <span>${(Number(amount) * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-white/10">
                    <span>Total</span>
                    <span className="text-primary">${(Number(amount) * 1.05).toFixed(2)}</span>
                  </div>
                </div>

                <Button className="w-full h-14 bg-primary text-black font-bold hover:bg-primary/90 text-lg rounded-xl shadow-[0_0_20px_rgba(0,255,0,0.2)]">
                  <Wallet className="w-5 h-5 mr-2" />
                  Connect & Pay
                </Button>
                
                <p className="text-center text-xs text-gray-500">
                  Secure escrow payment. Refunded if not accepted in 7 days.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

function Globe(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}
