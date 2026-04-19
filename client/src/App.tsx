import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import ProsPage from "@/pages/Pros";
import ProProfile from "@/pages/ProProfile";
import Request from "@/pages/Request";
import BecomePro from "@/pages/BecomePro";
import VideoCall from "@/pages/VideoCall";
import Auth from "@/pages/Auth";
import Profile from "@/pages/Profile";
import MyBookings from "@/pages/MyBookings";
import Dashboard from "@/pages/Dashboard";
import DashboardRequests from "@/pages/DashboardRequests";
import DashboardInbox from "@/pages/DashboardInbox";
import DashboardEarnings from "@/pages/DashboardEarnings";
import DashboardSettings from "@/pages/DashboardSettings";
import Admin from "@/pages/Admin";
import BookingPayment from "@/pages/BookingPayment";
import Policies from "@/pages/Policies";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/pros" component={ProsPage} />
      <Route path="/pro/:id" component={ProProfile} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/request" component={Request} />
      <Route path="/become-pro" component={BecomePro} />
      <Route path="/video-call/:roomId" component={VideoCall} />
      <Route path="/auth" component={Auth} />
      <Route path="/profile" component={Profile} />
      <Route path="/inbox" component={MyBookings} />
      <Route path="/my-bookings">
        <Redirect to="/inbox" />
      </Route>
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/requests" component={DashboardRequests} />
      <Route path="/dashboard/inbox" component={DashboardInbox} />
      <Route path="/dashboard/earnings" component={DashboardEarnings} />
      <Route path="/dashboard/settings" component={DashboardSettings} />
      <Route path="/admin" component={Admin} />
      <Route path="/bookings/:id/payment" component={BookingPayment} />
      <Route path="/policies" component={Policies} />
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
