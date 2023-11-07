import { faSignOut } from "@fortawesome/free-solid-svg-icons";
import { Form } from "@remix-run/react";

import { Button, Divider, FlexList, ItemBox, Label, Link } from "~/components";

export default function UserSettings() {
  return (
    <>
      <FlexList pad={4}>
        <FlexList>
          <Form action="/logout" method="post">
            <FlexList>
              <Button size="md" type="submit" icon={faSignOut}>
                Sign out
              </Button>
            </FlexList>
          </Form>
        </FlexList>

        <Divider />

        <FlexList gap={2}>
          <Label isDanger>Danger zone</Label>
          <ItemBox>
            <FlexList>
              <span className="font-bold">Delete your account</span>
              <p className="text-sm text-text-subdued">
                Deleting this account is a perminant action and cannot be
                undone.
              </p>
              <Link to="delete" kind="error">
                Delete account
              </Link>
            </FlexList>
          </ItemBox>
        </FlexList>
      </FlexList>
    </>
  );
}
