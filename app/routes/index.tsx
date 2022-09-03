import type { LoaderArgs } from "@remix-run/server-runtime";
import { requireUserId } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request)
  return null
}

export default function Index() {
  return (
    <main className="relative min-h-screen">
      <h2 className="text-2xl">TODO</h2>
      <p>Create list route (setlists or songs)</p>
      <p>List route should have a mobile view (similar to deployed view) and desktop view (list of items on left, click to see selection on right)</p>
      <p>index page should be a dashboard or something where users are prompted to visit either their setlists or songs or userpage?</p>
    </main>
  );
}
