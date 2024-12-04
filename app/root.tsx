import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import { HoneypotProvider } from "remix-utils/honeypot/react";

import { EpicToaster } from "@/components/ui/sonner";
import stylesheet from "~/globals.css?url";
import sonnerStyles from "~/sonner.css?url";

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
    { rel: "stylesheet", href: sonnerStyles },
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
  const { pathname } = useLocation();
  const isRootRoute = pathname === "/";
  useToast(toast);

  return (
    <html lang="en" className={`${!isRootRoute ? theme : ""} h-full`}>
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
        <EpicToaster />
        <HoneypotProvider {...honeyportInputProps}>
          <Outlet />
        </HoneypotProvider>
        <div id="modal-portal" />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
