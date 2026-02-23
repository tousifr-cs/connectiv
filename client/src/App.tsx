import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Creators from "@/pages/Creators";
import CreatorProfile from "@/pages/CreatorProfile";
import Request from "@/pages/Request";
import BecomeCreator from "@/pages/BecomeCreator";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/creators" component={Creators} />
      <Route path="/creator/:id" component={CreatorProfile} />
      <Route path="/request" component={Request} />
      <Route path="/become-creator" component={BecomeCreator} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
