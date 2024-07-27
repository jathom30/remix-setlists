import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FlexList } from "~/components";
import { H1, InlineCode, P } from "~/components/typography";

export default function BandExisting() {
  return (
    <div className="p-2 space-y-2">
      <H1>Join Band</H1>
      <Card>
        <CardHeader>
          <CardTitle>Join an existing band</CardTitle>
          <CardDescription>
            Joining an existing band is easy and can be accomplished in just a
            few steps.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FlexList gap={4}>
            <P>
              Have a band admin navigate to the{" "}
              <InlineCode>settings</InlineCode> page of their band then click on
              the <InlineCode>Add Member</InlineCode> button.
            </P>
            <P>
              If provided with an <InlineCode>email</InlineCode> address, the
              band admin can send you an email invite.
            </P>
            <P>
              If you'd prefer to not use email, the admin can paste you a direct
              link or allow you to scan a <InlineCode>QR code</InlineCode>.
            </P>
          </FlexList>
        </CardContent>
      </Card>
    </div>
  );
}
