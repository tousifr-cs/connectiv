import { Link, useLocation } from "wouter";
import { Wallet, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Creators", href: "/creators" },
    { name: "Inbox", href: "/inbox" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <span className="font-bold text-xl tracking-tighter text-white">
            ProConnect
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location === link.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/become-creator">
            <Button variant="outline" className="border-white/20 text-white hover:border-primary hover:text-primary bg-transparent font-medium">
              Become a Creator
            </Button>
          </Link>
          <Button className="bg-primary text-black hover:bg-primary/90 font-bold rounded-lg px-6 transition-all">
            Sign up
          </Button>
        </div>

        {/* Mobile Nav Toggle */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] border-l border-white/10 bg-black">
              <div className="flex flex-col gap-8 mt-10">
                <div className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link 
                      key={link.name} 
                      href={link.href}
                      className="text-lg font-medium text-white hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex flex-col gap-4">
                  <Button variant="outline" className="w-full border-white/20 text-white hover:border-primary hover:text-primary bg-transparent">
                    Log In
                  </Button>
                  <Button className="w-full bg-primary text-black font-bold">
                    Connect Wallet
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
