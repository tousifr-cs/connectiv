import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authedFetch } from "@/lib/api";
import type {
  Job,
  JobWithPoster,
  JobProposal,
  JobProposalWithPro,
  InsertJob,
  InsertJobProposal,
} from "@shared/schema";

export function useJobs(filters?: {
  status?: string;
  category?: string;
  search?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.category) params.set("category", filters.category);
  if (filters?.search) params.set("search", filters.search);
  const qs = params.toString();

  return useQuery<JobWithPoster[]>({
    queryKey: ["/api/jobs", filters],
    queryFn: async () => {
      const res = await fetch(`/api/jobs${qs ? `?${qs}` : ""}`);
      if (!res.ok) throw new Error("Failed to load jobs");
      return res.json();
    },
  });
}

export function useJob(id: string, options?: { enabled?: boolean }) {
  return useQuery<JobWithPoster>({
    queryKey: ["/api/jobs", id],
    queryFn: async () => {
      const res = await fetch(`/api/jobs/${id}`);
      if (!res.ok) throw new Error("Job not found");
      return res.json();
    },
    enabled: !!id && options?.enabled !== false,
  });
}

export function useMyJobs() {
  return useQuery<JobWithPoster[]>({
    queryKey: ["/api/me/jobs"],
    queryFn: async () => {
      const res = await authedFetch("/api/me/jobs");
      if (!res.ok) throw new Error("Failed to load your jobs");
      return res.json();
    },
  });
}

export function useJobProposals(jobId: string, enabled: boolean) {
  return useQuery<JobProposalWithPro[]>({
    queryKey: ["/api/jobs", jobId, "proposals"],
    queryFn: async () => {
      const res = await authedFetch(`/api/jobs/${jobId}/proposals`);
      if (!res.ok) throw new Error("Failed to load proposals");
      return res.json();
    },
    enabled: enabled && !!jobId,
  });
}

export function useMyJobProposals() {
  return useQuery<
    (JobProposal & { jobTitle: string; jobStatus: string })[]
  >({
    queryKey: ["/api/me/job-proposals"],
    queryFn: async () => {
      const res = await authedFetch("/api/me/job-proposals");
      if (!res.ok) throw new Error("Failed to load proposals");
      return res.json();
    },
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertJob) => {
      const res = await authedFetch("/api/jobs", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Failed" }));
        throw new Error(err.message);
      }
      return res.json() as Promise<Job>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/me/jobs"] });
    },
  });
}

export function useCreateProposal(jobId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertJobProposal) => {
      const res = await authedFetch(`/api/jobs/${jobId}/proposals`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Failed" }));
        throw new Error(err.message);
      }
      return res.json() as Promise<JobProposal>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs", jobId] });
      queryClient.invalidateQueries({
        queryKey: ["/api/jobs", jobId, "proposals"],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/me/job-proposals"] });
    },
  });
}

export function useAcceptProposal(jobId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (proposalId: string) => {
      const res = await authedFetch(
        `/api/jobs/${jobId}/proposals/${proposalId}/accept`,
        { method: "POST" },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Failed" }));
        throw new Error(err.message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs", jobId] });
      queryClient.invalidateQueries({
        queryKey: ["/api/jobs", jobId, "proposals"],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/me/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/me/bookings"] });
    },
  });
}

export function useRejectProposal(jobId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (proposalId: string) => {
      const res = await authedFetch(
        `/api/jobs/${jobId}/proposals/${proposalId}/reject`,
        { method: "POST" },
      );
      if (!res.ok) throw new Error("Failed to reject proposal");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/jobs", jobId, "proposals"],
      });
    },
  });
}

export function useCloseJob(jobId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await authedFetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "closed" }),
      });
      if (!res.ok) throw new Error("Failed to close job");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs", jobId] });
      queryClient.invalidateQueries({ queryKey: ["/api/me/jobs"] });
    },
  });
}
