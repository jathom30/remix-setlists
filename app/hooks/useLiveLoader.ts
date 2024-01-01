import {
  useLoaderData,
  useResolvedPath,
  useRevalidator,
} from "@remix-run/react";
import { useEffect } from "react";
import { useEventSource } from "remix-utils/sse/react";

export function useLiveLoader<T>(onUpdate?: () => void) {
  const path = useResolvedPath("./stream");
  const data = useEventSource(path.pathname);

  const { revalidate } = useRevalidator();

  useEffect(() => {
    revalidate();
    if (typeof data === "string") {
      onUpdate?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- "we know better" — Moishi
  }, [data]);

  return {
    useLoaderData: useLoaderData<T>(),
  };
}
