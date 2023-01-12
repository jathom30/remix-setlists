import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";

export let loader: LoaderFunction = () => {
  // https://github.com/ShafSpecs/remix-pwa#going-deeper
  // ^ for info on loading a user's color preferences
  return json(
    {
      short_name: "Setlists",
      name: "Setlists",
      start_url: "/",
      display: "standalone",
      // background color is the background before the site loads
      // background_color: backgroundColor,
      // theme color is the color of UI elements from the web browser
      // theme_color: backgroundColor,
      shortcuts: [
        {
          name: "Homepage",
          url: "/",
          icons: [
            {
              src: "/icons/android-icon-96x96.png",
              sizes: "96x96",
              type: "image/png",
              purpose: "any monochrome",
            },
          ],
        },
      ],
      icons: [
        {
          src: "/icons/android-icon-36x36.png",
          sizes: "36x36",
          type: "image/png",
          density: "0.75",
        },
        {
          src: "/icons/android-icon-48x48.png",
          sizes: "48x48",
          type: "image/png",
          density: "1.0",
        },
        {
          src: "/icons/android-icon-72x72.png",
          sizes: "72x72",
          type: "image/png",
          density: "1.5",
        },
        {
          src: "/icons/android-icon-96x96.png",
          sizes: "96x96",
          type: "image/png",
          density: "2.0",
        },
        {
          src: "/icons/android-icon-144x144.png",
          sizes: "144x144",
          type: "image/png",
          density: "3.0",
        },
        {
          src: "/icons/android-icon-192x192.png",
          sizes: "192x192",
          type: "image/png",
          density: "4.0",
        },
      ],
    },
    {
      headers: {
        "Cache-Control": "public, max-age=600",
        "Content-Type": "application/manifest+json",
      },
    },
  );
};
