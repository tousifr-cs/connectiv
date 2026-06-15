import { useEffect } from "react";
import { Switch, Route, Redirect, useLocation } from "wouter";
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
import Careers from "@/pages/Careers";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import ProLocal from "@/pages/ProLocal";
import PostJob from "@/pages/PostJob";
import Jobs from "@/pages/Jobs";
import JobDetail from "@/pages/JobDetail";
import Support from "@/pages/Support";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/pros" component={ProsPage} />
      <Route path="/pro/:id" component={ProProfile} />
      <Route path="/about" component={About} />
      <Route path="/careers" component={Careers} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/for-pros" component={ProLocal} />
      <Route path="/creators">
        <Redirect to="/pros" />
      </Route>
      <Route path="/post" component={PostJob} />
      <Route path="/requests/:id" component={JobDetail} />
      <Route path="/requests" component={Jobs} />
      <Route path="/support/:slug" component={Support} />
      <Route path="/support" component={Support} />
      <Route path="/jobs/post">
        <Redirect to="/post" />
      </Route>
      <Route path="/jobs/:id">
        {(params) => <Redirect to={`/requests/${params.id}`} />}
      </Route>
      <Route path="/jobs">
        <Redirect to="/requests" />
      </Route>
      <Route path="/request" component={Request} />
      <Route path="/become-pro" component={BecomePro} />
      <Route path="/become-creator">
        <Redirect to="/become-pro" />
      </Route>
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

function ScrollToTopOnRouteChange() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location]);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <ScrollToTopOnRouteChange />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
