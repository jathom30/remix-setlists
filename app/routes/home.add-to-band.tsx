import { data, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { z } from "zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { H1, P } from "~/components/typography";
import { addUserToBand, compareBandToken } from "~/models/band.server";
import { requireUserId } from "~/session.server";
import { decrypt } from "~/utils/encryption.server";
import { redirectWithToast } from "~/utils/toast.server";

const addBandSchema = z.object({
  token: z.string(),
  bandId: z.string(),
});

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);

  const searchParams = new URL(request.url).searchParams;
  const token = searchParams.get("token");
  const bandId = searchParams.get("bandId");

  const safeParse = addBandSchema.safeParse({ token, bandId });
  if (!safeParse.success) {
    return data({ error: "no token or band id found" }, { status: 400 });
  }
  // verify token
  const isMatchingToken = await compareBandToken(
    decrypt(safeParse.data.token),
    safeParse.data.bandId,
  );
  if (!isMatchingToken) {
    return data({ error: "Token does not match" }, { status: 403 });
  }
  await addUserToBand(userId, safeParse.data.bandId);
  return redirectWithToast(`/${safeParse.data.bandId}`, {
    title: "Joined Band!",
    description: "You now have access to this band.",
    type: "success",
  });
}

export default function AddToBand() {
  const { error } = useLoaderData<typeof loader>();
  return (
    <div className="p-2 space-y-2">
      <H1>Oops...</H1>
      <Card>
        <CardHeader>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>
            {error === "Token does not match"
              ? "The token provided does not match the band you are trying to join."
              : "An error occurred while trying to join this band."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <P>
            Reach out to your band admin to get a new invite link or try again.
          </P>
        </CardContent>
      </Card>
    </div>
  );
}
