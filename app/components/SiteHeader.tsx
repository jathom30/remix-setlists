import { faSignOut, faUser } from "@fortawesome/free-solid-svg-icons";
import { Form } from "@remix-run/react";

import { Button, Link } from ".";

export function SiteHeader() {
  return (
    <header className="bg-white p-2 text-text border-b border-component-background-darken">
      <div className="flex items-center justify-end gap-4">
        <Link to="/user" isCollapsing icon={faUser} kind="secondary" isRounded>
          User Details
        </Link>
        <Form action="/logout" method="post">
          <Button isCollapsing icon={faSignOut} type="submit" isRounded>
            Logout
          </Button>
        </Form>
      </div>
    </header>
  );
}
