import { useEffect, useState } from "react";

type PublicConfig = {
  deactivated: boolean;
};

let cachedConfig: PublicConfig | null = null;
let configPromise: Promise<PublicConfig> | null = null;

async function loadPublicConfig(): Promise<PublicConfig> {
  if (cachedConfig) return cachedConfig;

  configPromise ??= fetch("/api/public-config", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load public config: ${response.status}`);
      }
      return response.json() as Promise<PublicConfig>;
    })
    .then((config) => {
      cachedConfig = config;
      return config;
    })
    .finally(() => {
      configPromise = null;
    });

  return configPromise;
}

export function useWebsiteDeactivation() {
  const [config, setConfig] = useState<PublicConfig | null>(cachedConfig);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;

    loadPublicConfig()
      .then((nextConfig) => {
        if (active) {
          setConfig(nextConfig);
          setError(null);
        }
      })
      .catch((nextError) => {
        if (active) {
          setError(
            nextError instanceof Error
              ? nextError
              : new Error(String(nextError))
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return {
    deactivated: config?.deactivated ?? false,
    error,
    isLoading: config === null && error === null,
  };
}
