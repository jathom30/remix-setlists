import { config } from "@fortawesome/fontawesome-svg-core";
import faStylesheet from "@fortawesome/fontawesome-svg-core/styles.css";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { useEffect } from "react";
import { Toast, ToastBar, Toaster, useToaster } from "react-hot-toast";
import { themeChange } from "theme-change";

import stylesheet from "~/tailwind.css";

import { getUser } from "./session.server";
import { getFeatureFlags } from "./utils/featureflags.server";

// Prevent fontawesome from dynamically adding its css since we are going to include it manually
config.autoAddCss = false;

export const links: LinksFunction = () => {
  return [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Fascinate&family=Poppins:wght@100;400;700&display=swap",
    },
    { rel: "stylesheet", href: faStylesheet },
    { rel: "stylesheet", href: stylesheet },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  return json({
    user: await getUser(request),
    // loading the feature flags here so that they are available to all routes via useFeatureFlags
    featureFlags: await getFeatureFlags(),
  });
}

export default function AppWithProviders() {
  return <App />;
}

export function App() {
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
    <html lang="en" className="h-full bg-base-300">
      <head>
        <meta title="Setlists" />
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1, viewport-fit=cover"
        />
        <Meta />
        <link rel="manifest" href="/resources/manifest.webmanifest" />
        <Links />
      </head>
      <body className="h-full">
        <Toaster>
          {(t) => {
            if (uniqueToasts.every((u) => u.id !== t.id)) return <></>;
            return <ToastBar toast={t} />;
          }}
        </Toaster>
        <Outlet />
        <div id="modal-portal" />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
