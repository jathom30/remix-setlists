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
import { themeChange } from "theme-change";

import stylesheet from "~/tailwind.css";

import { getUser } from "./session.server";


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
  return json({
    user: await getUser(request),
  });
}

export default function App() {
  useEffect(() => {
    themeChange(false);
    // 👆 false parameter is required for react project
  });
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
        <Outlet />
        <div id="modal-portal" />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
