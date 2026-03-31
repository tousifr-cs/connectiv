import { Link } from "wouter";
import { type Creator } from "@shared/schema";

const CATEGORY_LABELS: Record<string, string> = {
  tech: "TECHNOLOGY",
  technology: "TECHNOLOGY",
  design: "VISUAL DESIGN",
  crypto: "WEB3 STRATEGY",
  web3: "WEB3 STRATEGY",
  marketing: "MARKETING",
  business: "BUSINESS",
  ai: "AI ETHICS",
  ml: "AI & ML",
  content: "CONTENT OP",
  finance: "FINANCE",
  music: "MUSIC",
  photography: "PHOTOGRAPHY",
};

function getCategoryLabel(creator: Creator): string {
  const cats = (creator.categories || "").toLowerCase();
  const bio = creator.bio.toLowerCase();
  for (const [key, label] of Object.entries(CATEGORY_LABELS)) {
    if (cats.includes(key) || bio.includes(key)) return label;
  }
  return "CREATOR";
}

function getResponseRate(id: number): number {
  return 88 + ((id * 7 + 3) % 13);
}

function getConnections(id: number): string {
  const base = ((id * 2341 + 17) % 250) / 10 + 3;
  return base.toFixed(1) + "k";
}

function getAvgProject(price: number): string {
  const val = (price * 14 + 200) / 100;
  return "$" + val.toFixed(1) + "k";
}

interface CreatorCardProps {
  creator: Creator;
  index: number;
}

export function CreatorCard({ creator }: CreatorCardProps) {
  const categoryLabel = getCategoryLabel(creator);
  const responseRate = getResponseRate(creator.id);
  const connections = getConnections(creator.id);
  const avgProject = getAvgProject(creator.price);

  return (
    <Link href={`/creator/${creator.id}`}>
      <div className="group bg-[#0d0d0d] border border-white/10 rounded-2xl p-5 hover:border-[#00fc40]/30 transition-all duration-300 cursor-pointer">
        {/* Header: avatar + badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/10 border border-white/10 shrink-0">
            <img
              src={creator.imageUrl}
              alt={creator.displayName}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
            />
          </div>
          <div className="text-right">
            <span className="inline-block px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-[#00fc40] text-black">
              {categoryLabel}
            </span>
            <p className="text-sm font-semibold text-white/80 mt-1.5">
              {responseRate}% Response
            </p>
          </div>
        </div>

        {/* Name & handle */}
        <h3 className="text-xl font-bold text-white mb-0.5 group-hover:text-[#00fc40] transition-colors">
          {creator.displayName}
        </h3>
        <p className="text-sm text-[#00fc40]/70 mb-3">
          @{creator.socialHandle}
        </p>

        {/* Bio */}
        <p className="text-sm text-white/40 leading-relaxed line-clamp-2 mb-5">
          {creator.bio}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="border border-white/10 rounded-lg px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1">
              Connections
            </p>
            <p className="text-lg font-bold text-white">{connections}</p>
          </div>
          <div className="border border-white/10 rounded-lg px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1">
              Avg. Project
            </p>
            <p className="text-lg font-bold text-white">{avgProject}</p>
          </div>
        </div>

        {/* Connect button */}
        <button className="w-full py-3 rounded-lg btn-gradient-fade text-sm font-bold uppercase tracking-wider transition-all">
          Connect Now
        </button>
      </div>
    </Link>
  );
}
