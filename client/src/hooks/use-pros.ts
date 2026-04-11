import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function usePros(search?: string, platform?: string) {
  return useQuery({
    queryKey: [api.pros.list.path, search, platform],
    queryFn: async () => {
      const url = buildUrl(api.pros.list.path);
      const queryParams = new URLSearchParams();
      if (search) queryParams.append("search", search);
      if (platform) queryParams.append("platform", platform);

      const fullUrl = queryParams.toString()
        ? `${url}?${queryParams.toString()}`
        : url;

      const res = await fetch(fullUrl);
      if (!res.ok) throw new Error("Failed to fetch pros");
      return api.pros.list.responses[200].parse(await res.json());
    },
  });
}

export function usePro(id: number) {
  return useQuery({
    queryKey: [api.pros.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.pros.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch pro");
      return api.pros.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}
