import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

// GET /api/creators
export function useCreators(search?: string, platform?: string) {
  return useQuery({
    queryKey: [api.creators.list.path, search, platform],
    queryFn: async () => {
      const url = buildUrl(api.creators.list.path);
      const queryParams = new URLSearchParams();
      if (search) queryParams.append("search", search);
      if (platform) queryParams.append("platform", platform);
      
      const fullUrl = queryParams.toString() ? `${url}?${queryParams.toString()}` : url;

      const res = await fetch(fullUrl);
      if (!res.ok) throw new Error("Failed to fetch creators");
      return api.creators.list.responses[200].parse(await res.json());
    },
  });
}

// GET /api/creators/:id
export function useCreator(id: number) {
  return useQuery({
    queryKey: [api.creators.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.creators.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch creator");
      return api.creators.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}
