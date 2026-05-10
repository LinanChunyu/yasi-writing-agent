"use client";
import { useQuery } from "@tanstack/react-query";

export function useDerivedView<T>(
  viewName: string,
  params: Record<string, string> = {},
  enabled = true
) {
  const queryString = new URLSearchParams(params).toString();
  const url = `/api/derived-views/${viewName}${queryString ? `?${queryString}` : ""}`;

  return useQuery<T>({
    queryKey: ["derived-view", viewName, params],
    queryFn: async () => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch view: ${viewName}`);
      return res.json() as Promise<T>;
    },
    enabled,
  });
}
