/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/docs/en/main/file-conventions/entry.client
 */

import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
    </StrictMode>,
  );
});

// if (window.requestIdleCallback) {
//   window.requestIdleCallback(hydrate);
// } else {
//   // Safari doesn't support requestIdleCallback
//   // https://caniuse.com/requestidlecallback
//   window.setTimeout(hydrate, 1);
// }

// if ("serviceWorker" in navigator) {
//   // Use the window load event to keep the page load performant
//   window.addEventListener("load", () => {
//     navigator.serviceWorker
//       .register("/entry.worker.js")
//       .then(() => navigator.serviceWorker.ready)
//       .then(() => {
//         if (navigator.serviceWorker.controller) {
//           navigator.serviceWorker.controller.postMessage({
//             type: "SYNC_REMIX_MANIFEST",
//             manifest: window.__remixManifest,
//           });
//         } else {
//           navigator.serviceWorker.addEventListener("controllerchange", () => {
//             navigator.serviceWorker.controller?.postMessage({
//               type: "SYNC_REMIX_MANIFEST",
//               manifest: window.__remixManifest,
//             });
//           });
//         }
//       })
//       .catch((error) => {
//         console.error("Service worker registration failed", error);
//       });
//   });
// }
