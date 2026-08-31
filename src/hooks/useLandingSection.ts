import { useEffect, useState } from "react";
import { fetchSection, landingDefaults, type LandingSections, type SectionKey } from "@/lib/landingContent";

export function useLandingSection<K extends SectionKey>(key: K) {
  const [data, setData] = useState<LandingSections[K]>(landingDefaults[key]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchSection(key)
      .then((res) => {
        if (active) setData(res);
      })
      .catch(() => {
        if (active) setData(landingDefaults[key]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [key]);

  return { data, loading };
}
