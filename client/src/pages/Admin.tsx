import { useMemo, useState } from "react";
import { Link, Redirect } from "wouter";
import { ArrowLeft, Loader2, Shield, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authedFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BookingLedgerEntry, ConnectionRequest, Pro } from "@shared/schema";

type AdminUserRow = {
  id: string;
  email: string;
  displayName: string | null;
  role: string;
  createdAt: string;
};

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [proFilter, setProFilter] = useState("");
  const [bookingDrafts, setBookingDrafts] = useState<
    Record<
      string,
      {
        paymentRequestLink?: string;
        paymentRequestId?: string;
        payoutReferenceId?: string;
        notes?: string;
      }
    >
  >({});

  const isAdmin = user?.role === "admin";

  const { data: connectionRequests = [], isLoading: loadingCr } = useQuery<
    ConnectionRequest[]
  >({
    queryKey: ["/api/admin/connection-requests"],
    queryFn: async () => {
      const res = await authedFetch("/api/admin/connection-requests");
      if (!res.ok) throw new Error("Failed to load connection requests");
      return res.json();
    },
    enabled: isAdmin,
  });

  const { data: adminUsers = [], isLoading: loadingUsers } = useQuery<
    AdminUserRow[]
  >({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await authedFetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to load users");
      return res.json();
    },
    enabled: isAdmin,
  });

  const { data: pros = [], isLoading: loadingPros } = useQuery<Pro[]>({
    queryKey: ["/api/pros", "admin"],
    queryFn: async () => {
      const res = await fetch("/api/pros");
      if (!res.ok) throw new Error("Failed to load pros");
      return res.json();
    },
    enabled: isAdmin,
  });

  const { data: bookings = [], isLoading: loadingBookings } = useQuery<
    BookingLedgerEntry[]
  >({
    queryKey: ["/api/admin/bookings"],
    queryFn: async () => {
      const res = await authedFetch("/api/admin/bookings");
      if (!res.ok) throw new Error("Failed to load bookings");
      return res.json();
    },
    enabled: isAdmin,
  });

  const filteredPros = useMemo(() => {
    const q = proFilter.trim().toLowerCase();
    if (!q) return pros;
    return pros.filter(
      (p) =>
        p.username.toLowerCase().includes(q) ||
        p.displayName.toLowerCase().includes(q) ||
        String(p.id).includes(q),
    );
  }, [pros, proFilter]);

  function updateBookingDraft(
    bookingId: string,
    patch: Partial<{
      paymentRequestLink: string;
      paymentRequestId: string;
      payoutReferenceId: string;
      notes: string;
    }>,
  ) {
    setBookingDrafts((current) => ({
      ...current,
      [bookingId]: {
        ...current[bookingId],
        ...patch,
      },
    }));
  }

  const roleMutation = useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: "user" | "admin";
    }) => {
      const res = await authedFetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? res.statusText);
      return { userId, role };
    },
    onSuccess: ({ userId, role }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Role updated" });
      if (user && userId === user.id && role === "user") {
        window.location.assign("/");
      }
    },
    onError: (e: Error) => {
      toast({
        title: "Could not update role",
        description: e.message,
        variant: "destructive",
      });
    },
  });

  const proMutation = useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: number;
      patch: { isVerified?: boolean; featured?: boolean };
    }) => {
      const res = await authedFetch(`/api/admin/pros/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? res.statusText);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pros", "admin"] });
      toast({ title: "Pro updated" });
    },
    onError: (e: Error) => {
      toast({
        title: "Update failed",
        description: e.message,
        variant: "destructive",
      });
    },
  });

  const bookingMutation = useMutation({
    mutationFn: async ({
      bookingId,
      action,
      payload,
    }: {
      bookingId: string;
      action:
        | "payment-link"
        | "mark-paid"
        | "complete"
        | "payout"
        | "refund"
        | "cancel";
      payload: Record<string, unknown>;
    }) => {
      const res = await authedFetch(`/api/bookings/${bookingId}/${action}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? res.statusText);
      return bookingId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/me/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/me/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/me/earnings"] });
      toast({ title: "Booking updated" });
    },
    onError: (e: Error) => {
      toast({
        title: "Booking update failed",
        description: e.message,
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-16 max-w-lg text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
          <h1 className="text-xl font-semibold mb-2">Admin only</h1>
          <p className="text-zinc-500 text-sm mb-6">
            This page is restricted to administrators.
          </p>
          <Link href="/">
            <Button variant="outline" className="border-white/20">
              Back home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href="/"
              className="inline-flex items-center text-sm text-zinc-500 hover:text-white mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Home
            </Link>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-7 w-7 text-amber-500/90" />
              Admin
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Connection requests, user roles, and pro verification.
            </p>
          </div>
        </div>

        <div className="space-y-10">
          <Card className="border-white/10 bg-zinc-950/80">
            <CardHeader>
              <CardTitle className="text-lg">Booking ledger</CardTitle>
              <CardDescription className="text-zinc-500">
                Manually reconcile Payoneer payment requests, confirmations,
                session completion, and payouts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingBookings ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
                </div>
              ) : bookings.length === 0 ? (
                <p className="text-sm text-zinc-500">No bookings yet.</p>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => {
                    const draft = bookingDrafts[booking.id] ?? {};
                    return (
                      <div
                        key={booking.id}
                        className="rounded-xl border border-white/10 bg-black/30 p-4"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="secondary" className="bg-white/10">
                                {booking.status}
                              </Badge>
                              <Badge variant="secondary" className="bg-white/10">
                                pro: {booking.proResponseStatus}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white">
                                {booking.proDisplayName ?? "Pro"} ·{" "}
                                {booking.requesterDisplayName ??
                                  booking.requesterEmail ??
                                  "Customer"}
                              </p>
                              <p className="mt-1 text-xs text-zinc-500">
                                Ref {booking.id} · {booking.currency} $
                                {booking.grossAmount.toLocaleString()} gross · $
                                {booking.proPayoutAmount.toLocaleString()} pro
                                payout
                              </p>
                              <p className="mt-1 text-xs text-zinc-500">
                                {booking.topic}
                              </p>
                            </div>
                            <div className="text-xs text-zinc-500">
                              {booking.scheduledAt
                                ? format(
                                    new Date(booking.scheduledAt),
                                    "MMM d, yyyy h:mm a",
                                  )
                                : "Schedule pending"}
                            </div>
                            {booking.paymentRequestLink && (
                              <a
                                href={booking.paymentRequestLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                              >
                                Open Payoneer payment link
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>

                          <div className="grid flex-1 gap-3 lg:max-w-xl">
                            <div className="grid gap-3 md:grid-cols-2">
                              <Input
                                placeholder="Payment request link"
                                value={
                                  draft.paymentRequestLink ??
                                  booking.paymentRequestLink ??
                                  ""
                                }
                                onChange={(e) =>
                                  updateBookingDraft(booking.id, {
                                    paymentRequestLink: e.target.value,
                                  })
                                }
                                className="bg-black/50 border-white/15"
                              />
                              <Input
                                placeholder="Payment request ID"
                                value={
                                  draft.paymentRequestId ??
                                  booking.paymentRequestId ??
                                  ""
                                }
                                onChange={(e) =>
                                  updateBookingDraft(booking.id, {
                                    paymentRequestId: e.target.value,
                                  })
                                }
                                className="bg-black/50 border-white/15"
                              />
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                              <Input
                                placeholder="Payout reference ID"
                                value={
                                  draft.payoutReferenceId ??
                                  booking.payoutReferenceId ??
                                  ""
                                }
                                onChange={(e) =>
                                  updateBookingDraft(booking.id, {
                                    payoutReferenceId: e.target.value,
                                  })
                                }
                                className="bg-black/50 border-white/15"
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-white/15"
                                  disabled={bookingMutation.isPending}
                                  onClick={() =>
                                    bookingMutation.mutate({
                                      bookingId: booking.id,
                                      action: "payment-link",
                                      payload: {
                                        paymentRequestLink:
                                          draft.paymentRequestLink ??
                                          booking.paymentRequestLink,
                                        paymentRequestId:
                                          draft.paymentRequestId ??
                                          booking.paymentRequestId,
                                        notes: draft.notes ?? booking.notes,
                                      },
                                    })
                                  }
                                >
                                  Save link
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-white/15"
                                  disabled={bookingMutation.isPending}
                                  onClick={() =>
                                    bookingMutation.mutate({
                                      bookingId: booking.id,
                                      action: "mark-paid",
                                      payload: {
                                        paymentRequestId:
                                          draft.paymentRequestId ??
                                          booking.paymentRequestId,
                                        notes: draft.notes ?? booking.notes,
                                      },
                                    })
                                  }
                                >
                                  Mark paid
                                </Button>
                              </div>
                            </div>
                            <Textarea
                              placeholder="Internal notes"
                              value={draft.notes ?? booking.notes ?? ""}
                              onChange={(e) =>
                                updateBookingDraft(booking.id, {
                                  notes: e.target.value,
                                })
                              }
                              className="min-h-[88px] bg-black/50 border-white/15"
                            />
                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-white/15"
                                disabled={bookingMutation.isPending}
                                onClick={() =>
                                  bookingMutation.mutate({
                                    bookingId: booking.id,
                                    action: "complete",
                                    payload: { notes: draft.notes ?? booking.notes },
                                  })
                                }
                              >
                                Mark session complete
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-white/15"
                                disabled={bookingMutation.isPending}
                                onClick={() =>
                                  bookingMutation.mutate({
                                    bookingId: booking.id,
                                    action: "payout",
                                    payload: {
                                      status: "payout_pending",
                                      notes: draft.notes ?? booking.notes,
                                    },
                                  })
                                }
                              >
                                Queue payout
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-emerald-500/30 text-emerald-400"
                                disabled={bookingMutation.isPending}
                                onClick={() =>
                                  bookingMutation.mutate({
                                    bookingId: booking.id,
                                    action: "payout",
                                    payload: {
                                      status: "payout_sent",
                                      payoutReferenceId:
                                        draft.payoutReferenceId ??
                                        booking.payoutReferenceId,
                                      notes: draft.notes ?? booking.notes,
                                    },
                                  })
                                }
                              >
                                Mark payout sent
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-500/30 text-red-400"
                                disabled={bookingMutation.isPending}
                                onClick={() =>
                                  bookingMutation.mutate({
                                    bookingId: booking.id,
                                    action: "payout",
                                    payload: {
                                      status: "payout_failed",
                                      payoutReferenceId:
                                        draft.payoutReferenceId ??
                                        booking.payoutReferenceId,
                                      notes: draft.notes ?? booking.notes,
                                    },
                                  })
                                }
                              >
                                Mark payout failed
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-zinc-500/30 text-zinc-300"
                                disabled={bookingMutation.isPending}
                                onClick={() =>
                                  bookingMutation.mutate({
                                    bookingId: booking.id,
                                    action: "refund",
                                    payload: { notes: draft.notes ?? booking.notes },
                                  })
                                }
                              >
                                Refund
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-zinc-500/30 text-zinc-300"
                                disabled={bookingMutation.isPending}
                                onClick={() =>
                                  bookingMutation.mutate({
                                    bookingId: booking.id,
                                    action: "cancel",
                                    payload: { notes: draft.notes ?? booking.notes },
                                  })
                                }
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-zinc-950/80">
            <CardHeader>
              <CardTitle className="text-lg">Connection requests</CardTitle>
              <CardDescription className="text-zinc-500">
                All submissions from the request form.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingCr ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
                </div>
              ) : connectionRequests.length === 0 ? (
                <p className="text-sm text-zinc-500">No connection requests yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-zinc-400">Created</TableHead>
                      <TableHead className="text-zinc-400">Platform</TableHead>
                      <TableHead className="text-zinc-400">Status</TableHead>
                      <TableHead className="text-zinc-400">Amount</TableHead>
                      <TableHead className="text-zinc-400">Profile URL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {connectionRequests.map((r) => (
                      <TableRow key={r.id} className="border-white/10">
                        <TableCell className="text-zinc-300 whitespace-nowrap">
                          {format(new Date(r.createdAt), "MMM d, yyyy HH:mm")}
                        </TableCell>
                        <TableCell>{r.platform}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-white/10">
                            {r.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{r.amount}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-zinc-400">
                          <a
                            href={r.profileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-primary underline-offset-2"
                          >
                            {r.profileUrl}
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-zinc-950/80">
            <CardHeader>
              <CardTitle className="text-lg">Users</CardTitle>
              <CardDescription className="text-zinc-500">
                Promote or demote accounts. You cannot remove the last admin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-zinc-400">Email</TableHead>
                      <TableHead className="text-zinc-400">Name</TableHead>
                      <TableHead className="text-zinc-400">Role</TableHead>
                      <TableHead className="text-zinc-400 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminUsers.map((u) => (
                      <TableRow key={u.id} className="border-white/10">
                        <TableCell className="font-mono text-xs text-zinc-300">
                          {u.email}
                        </TableCell>
                        <TableCell>{u.displayName ?? "—"}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              u.role === "admin"
                                ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                : "bg-white/10"
                            }
                          >
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {u.role === "admin" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-white/15"
                              disabled={roleMutation.isPending}
                              onClick={() =>
                                roleMutation.mutate({ userId: u.id, role: "user" })
                              }
                            >
                              Demote
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-amber-500/40 text-amber-400"
                              disabled={roleMutation.isPending}
                              onClick={() =>
                                roleMutation.mutate({ userId: u.id, role: "admin" })
                              }
                            >
                              Make admin
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-zinc-950/80">
            <CardHeader>
              <CardTitle className="text-lg">Pros</CardTitle>
              <CardDescription className="text-zinc-500">
                Verify profiles and feature them in listings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Filter by name, username, or id…"
                value={proFilter}
                onChange={(e) => setProFilter(e.target.value)}
                className="max-w-md bg-black/50 border-white/15"
              />
              {loadingPros ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
                </div>
              ) : filteredPros.length === 0 ? (
                <p className="text-sm text-zinc-500">No pros match.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-zinc-400">ID</TableHead>
                      <TableHead className="text-zinc-400">Username</TableHead>
                      <TableHead className="text-zinc-400">Display</TableHead>
                      <TableHead className="text-zinc-400 text-center">Verified</TableHead>
                      <TableHead className="text-zinc-400 text-center">Featured</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPros.map((p) => (
                      <TableRow key={p.id} className="border-white/10">
                        <TableCell className="font-mono text-xs">{p.id}</TableCell>
                        <TableCell>
                          <Link
                            href={`/pro/${p.id}`}
                            className="text-primary hover:underline"
                          >
                            @{p.username}
                          </Link>
                        </TableCell>
                        <TableCell className="max-w-[180px] truncate">
                          {p.displayName}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <Switch
                              checked={p.isVerified ?? false}
                              disabled={proMutation.isPending}
                              onCheckedChange={(checked) =>
                                proMutation.mutate({
                                  id: p.id,
                                  patch: { isVerified: checked },
                                })
                              }
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <Switch
                              checked={p.featured ?? false}
                              disabled={proMutation.isPending}
                              onCheckedChange={(checked) =>
                                proMutation.mutate({
                                  id: p.id,
                                  patch: { featured: checked },
                                })
                              }
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
