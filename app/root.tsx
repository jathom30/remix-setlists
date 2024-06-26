import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { useEffect } from "react";
import { Toast, ToastBar, Toaster, useToaster } from "react-hot-toast";
import { HoneypotProvider } from "remix-utils/honeypot/react";
import { themeChange } from "theme-change";

import stylesheet from "~/globals.css";

import { getUser } from "./session.server";
import { getFeatureFlags } from "./utils/featureflags.server";
import { honeypot } from "./utils/honeypot.server";

export const links: LinksFunction = () => {
  return [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Fascinate&family=Poppins:wght@100;400;700&display=swap",
    },
    { rel: "stylesheet", href: stylesheet },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  // loading the feature flags here so that they are available to all routes via useFeatureFlags
  const featureFlags = await getFeatureFlags(user);
  return json({
    user,
    featureFlags,
    honeyportInputProps: honeypot.getInputProps(),
  });
}

export default function App() {
  const { honeyportInputProps } = useLoaderData<typeof loader>();
  useEffect(() => {
    themeChange(false);
    // 👆 false parameter is required for react project
  });

  const { toasts } = useToaster();

  // a unique array of toasts based on messages
  // This is a bit of a hack. For some reason the server is double firing toasts.
  // This is a quick fix to only show one message instead of a duplicate.
  const uniqueToasts = toasts.reduce((unique: Toast[], toast) => {
    if (!unique.some((u) => u.message === toast.message)) {
      unique.push(toast);
    }
    return unique;
  }, []);

  return (
    <html lang="en" className="h-full">
      <head>
        <meta title="Setlists" />
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
        <Meta />
        <link rel="manifest" href="/resources/manifest.webmanifest" />
        <Links />
      </head>
      <body className="h-full bg-muted/40">
        <Toaster>
          {(t) => {
            if (uniqueToasts.every((u) => u.id !== t.id)) return <></>;
            return <ToastBar toast={t} />;
          }}
        </Toaster>
        <HoneypotProvider {...honeyportInputProps}>
          <Outlet />
        </HoneypotProvider>
        <div id="modal-portal" />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
