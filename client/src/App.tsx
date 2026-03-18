import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Creators from "@/pages/Creators";
import CreatorProfile from "@/pages/CreatorProfile";
import Request from "@/pages/Request";
import BecomeCreator from "@/pages/BecomeCreator";
import VideoCall from "@/pages/VideoCall";
import Auth from "@/pages/Auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/creators" component={Creators} />
      <Route path="/creator/:id" component={CreatorProfile} />
      <Route path="/request" component={Request} />
      <Route path="/become-creator" component={BecomeCreator} />
      <Route path="/video-call/:roomId" component={VideoCall} />
      <Route path="/auth" component={Auth} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
