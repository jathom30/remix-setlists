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
import { HoneypotProvider } from "remix-utils/honeypot/react";
import { themeChange } from "theme-change";

import { EpicToaster } from "@/components/ui/sonner";
import stylesheet from "~/globals.css";

import { useToast } from "./hooks/use-toast";
import { userPrefs } from "./models/cookies.server";
import { getUser } from "./session.server";
import { getFeatureFlags } from "./utils/featureflags.server";
import { honeypot } from "./utils/honeypot.server";
import { combineHeaders, getToast } from "./utils/toast.server";

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
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await userPrefs.parse(cookieHeader)) || {};

  const { toast, headers: toastHeaders } = await getToast(request);
  return json(
    {
      user,
      featureFlags,
      honeyportInputProps: honeypot.getInputProps(),
      theme: cookie.theme,
      toast,
    },
    {
      headers: combineHeaders(
        // { 'Server-Timing': timings.toString() },
        toastHeaders,
      ),
    },
  );
}

export default function App() {
  const { honeyportInputProps, theme, toast } = useLoaderData<typeof loader>();
  useEffect(() => {
    themeChange(false);
    // 👆 false parameter is required for react project
  });

  // const { toasts } = useToaster();
  useToast(toast);

  // a unique array of toasts based on messages
  // This is a bit of a hack. For some reason the server is double firing toasts.
  // This is a quick fix to only show one message instead of a duplicate.
  // const uniqueToasts = toasts.reduce((unique: Toast[], toast) => {
  //   if (!unique.some((u) => u.message === toast.message)) {
  //     unique.push(toast);
  //   }
  //   return unique;
  // }, []);

  return (
    <html lang="en" className={`${theme} h-full`}>
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
      <body className="h-full bg-card/95">
        {/* <OgToaster>
          {(t) => {
            if (uniqueToasts.every((u) => u.id !== t.id)) return <></>;
            return <ToastBar toast={t} />;
          }}
        </OgToaster> */}
        <EpicToaster />
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
