import type { Job, JobWithPoster } from "@shared/schema";

export interface RequestPreview {
  id: string;
  title: string;
  description: string;
  category: string | null;
  budgetAmount: number;
  currency: string;
  skills: string;
  proposalCount: number;
  createdAt: string;
  isDemo?: boolean;
}

export interface DemoProposal {
  id: string;
  proDisplayName: string;
  proHeadline: string;
  proImageUrl: string;
  coverLetter: string;
  proposedAmount: number;
  currency: string;
}

export interface DemoRequestDetail extends RequestPreview {
  fullDescription: string;
  posterDisplayName: string;
  goals: string[];
  proposals: DemoProposal[];
}

export const DEMO_REQUESTS: DemoRequestDetail[] = [
  {
    id: "demo-1",
    title: "Teach me Automa for engineering workflows",
    description:
      "I need a walkthrough of Automa for browser automation on internal tools. 30 minutes to cover setup, triggers, and one real example.",
    fullDescription: `I'm an engineering lead trying to automate repetitive browser tasks on our internal admin panel. I've heard Automa is lighter than full RPA tools but I'm not sure where to start.

In a 30-minute session I'd like to:
• Install and configure Automa for Chrome
• Build one workflow that logs in and exports a CSV
• Understand triggers (schedule vs. manual) and how to debug failures

I have a test environment ready. Happy to share screen and follow along live.`,
    category: "Engineering",
    budgetAmount: 2500,
    currency: "BDT",
    skills: "duration:30,type:video,automa,automation",
    proposalCount: 3,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isDemo: true,
    posterDisplayName: "Rahim K.",
    goals: [
      "Automa setup on Chrome",
      "One working automation workflow",
      "Debugging tips for failed runs",
    ],
    proposals: [
      {
        id: "demo-1-p1",
        proDisplayName: "David Miller",
        proHeadline: "Fullstack dev · automation enthusiast",
        proImageUrl:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
        coverLetter:
          "I've built Automa flows for QA teams and internal ops. I'll walk you through blocks, variables, and a login→export pattern. We can use your test env live.",
        proposedAmount: 2400,
        currency: "BDT",
      },
      {
        id: "demo-1-p2",
        proDisplayName: "Alex Rivera",
        proHeadline: "Tech reviewer · workflow automation",
        proImageUrl:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
        coverLetter:
          "Used Automa + Playwright side by side for a SaaS team. Happy to compare when Automa is enough vs. when you need code. 30 min is perfect for a first workflow.",
        proposedAmount: 2500,
        currency: "BDT",
      },
      {
        id: "demo-1-p3",
        proDisplayName: "Nadia Hossain",
        proHeadline: "DevOps · internal tools",
        proImageUrl:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
        coverLetter:
          "I automate internal dashboards weekly. I'll share my starter template and help you wire triggers so exports run on a schedule.",
        proposedAmount: 2200,
        currency: "BDT",
      },
    ],
  },
  {
    id: "demo-2",
    title: "Portfolio review for junior product designer",
    description:
      "Looking for honest feedback on my case studies before I start applying. Want notes on narrative, visual hierarchy, and what to cut.",
    fullDescription: `I'm applying for junior product design roles and have three case studies on Notion + Figma links. I need a senior eye before I send applications.

Please review:
• Story structure — problem, process, outcome
• Visual polish and hierarchy on mobile frames
• What to cut if a recruiter spends 90 seconds per case

I'll share links ahead of the call. Brutally honest feedback welcome.`,
    category: "Design",
    budgetAmount: 120,
    currency: "USD",
    skills: "duration:60,type:video,portfolio,ux",
    proposalCount: 5,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    isDemo: true,
    posterDisplayName: "Mina L.",
    goals: [
      "Clearer case study narrative",
      "Mobile layout feedback",
      "Prioritize which project to lead with",
    ],
    proposals: [
      {
        id: "demo-2-p1",
        proDisplayName: "Sarah Chen",
        proHeadline: "Senior product designer · BigTech",
        proImageUrl:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
        coverLetter:
          "I've hired junior designers and reviewed 200+ portfolios. I'll annotate your cases live and send a prioritized fix list after the session.",
        proposedAmount: 120,
        currency: "USD",
      },
      {
        id: "demo-2-p2",
        proDisplayName: "Anna Smith",
        proHeadline: "Digital artist · design mentor",
        proImageUrl:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
        coverLetter:
          "Focus on visual storytelling and what recruiters skim first. 60 minutes lets us walk through all three cases with time for Q&A.",
        proposedAmount: 100,
        currency: "USD",
      },
    ],
  },
  {
    id: "demo-3",
    title: "Debug a slow React dashboard",
    description:
      "Production app re-renders too often after a recent refactor. Need help profiling and a concrete fix plan in a focused session.",
    fullDescription: `Our analytics dashboard got slower after we moved state from Context to several custom hooks. CPU spikes when filters change; React DevTools shows lots of re-renders.

Stack: React 18, Vite, TanStack Query, Recharts.

I'd like help with:
• Profiling with React DevTools Profiler
• Identifying unnecessary re-renders (likely chart + table)
• A short list of fixes ranked by impact

I can share repo access or screen-share the app. NDA-friendly.`,
    category: "Engineering",
    budgetAmount: 85,
    currency: "USD",
    skills: "duration:30,type:video,react,performance",
    proposalCount: 2,
    createdAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
    isDemo: true,
    posterDisplayName: "James T.",
    goals: [
      "Profiler walkthrough on real components",
      "Root cause of re-renders",
      "Actionable fix plan for this week",
    ],
    proposals: [
      {
        id: "demo-3-p1",
        proDisplayName: "David Miller",
        proHeadline: "Fullstack · React performance",
        proImageUrl:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
        coverLetter:
          "Fixed similar issues with Recharts + context. I'll profile live and suggest memoization, query key splits, and chart isolation. 30 min is enough for diagnosis + top 3 fixes.",
        proposedAmount: 85,
        currency: "USD",
      },
      {
        id: "demo-3-p2",
        proDisplayName: "Alex Rivera",
        proHeadline: "Frontend lead · performance audits",
        proImageUrl:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
        coverLetter:
          "I do perf office hours for startups. We'll use Profiler + why-did-you-render patterns and I'll leave you a Loom summary after.",
        proposedAmount: 75,
        currency: "USD",
      },
    ],
  },
  {
    id: "demo-4",
    title: "Pitch deck feedback before investor meeting",
    description:
      "Seed-stage deck needs a sanity check on story arc, metrics slide, and ask. 30 minutes of direct, actionable notes.",
    fullDescription: `Raising a $1.2M seed round. Deck is 12 slides — product is live with early revenue. Meeting is in 10 days.

Want feedback on:
• Opening hook and problem slide
• Traction / metrics slide (what to emphasize)
• Ask slide and use-of-funds clarity

I'll send the PDF before the call. Please be direct — I'd rather cut slides than defend weak ones.`,
    category: "Marketing",
    budgetAmount: 150,
    currency: "USD",
    skills: "duration:30,type:video,startup,pitch",
    proposalCount: 4,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isDemo: true,
    posterDisplayName: "Priya S.",
    goals: [
      "Tighter narrative in first 3 slides",
      "Metrics slide that builds conviction",
      "Clear ask and milestones",
    ],
    proposals: [
      {
        id: "demo-4-p1",
        proDisplayName: "Mark Johnson",
        proHeadline: "DeFi analyst · angel advisor",
        proImageUrl:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
        coverLetter:
          "Reviewed 40+ seed decks last year. I'll mark up your PDF and walk through what investors scan in the first 2 minutes. Focus on traction framing and ask clarity.",
        proposedAmount: 150,
        currency: "USD",
      },
      {
        id: "demo-4-p2",
        proDisplayName: "Jessica Wu",
        proHeadline: "GTM strategist · founder coach",
        proImageUrl:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
        coverLetter:
          "Helped three founders close seed rounds. We'll stress-test story arc and I'll suggest one slide to cut. 30 minutes, no fluff.",
        proposedAmount: 140,
        currency: "USD",
      },
    ],
  },
];

export function isDemoRequestId(id: string): boolean {
  return id.startsWith("demo-");
}

export function getDemoRequest(id: string): DemoRequestDetail | undefined {
  return DEMO_REQUESTS.find((r) => r.id === id);
}

export function demoToMockJob(demo: DemoRequestDetail): Job {
  return {
    id: demo.id,
    posterUserId: "00000000-0000-0000-0000-000000000001",
    posterFirebaseUid: "demo-poster",
    title: demo.title,
    description: demo.fullDescription,
    category: demo.category,
    skills: demo.skills,
    budgetAmount: demo.budgetAmount,
    currency: demo.currency,
    budgetType: "fixed",
    status: "open",
    deadline: null,
    acceptedProposalId: null,
    bookingId: null,
    createdAt: new Date(demo.createdAt),
    updatedAt: new Date(demo.createdAt),
  };
}

export function jobToRequestPreview(job: JobWithPoster): RequestPreview {
  return {
    id: job.id,
    title: job.title,
    description: job.description,
    category: job.category,
    budgetAmount: job.budgetAmount,
    currency: job.currency,
    skills: job.skills ?? "",
    proposalCount: job.proposalCount,
    createdAt:
      typeof job.createdAt === "string"
        ? job.createdAt
        : job.createdAt.toISOString(),
  };
}

export function pickHomePreviews(
  live: JobWithPoster[] | undefined,
  limit = 3,
): RequestPreview[] {
  if (live && live.length > 0) {
    return live.slice(0, limit).map(jobToRequestPreview);
  }
  return DEMO_REQUESTS.slice(0, limit);
}

export function isShowingDemoPreviews(live: JobWithPoster[] | undefined): boolean {
  return !live || live.length === 0;
}
