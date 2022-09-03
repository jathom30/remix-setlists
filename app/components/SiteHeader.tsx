import { faPlus, faSignOut, faUser } from "@fortawesome/free-solid-svg-icons";
import { Form, Link as RemixLink, NavLink } from "@remix-run/react";
// import { useUser } from "~/utils";
import { MaxWidth, Button, Link } from ".";

export function SiteHeader() {
  // const user = useUser()
  return (
    <header className="bg-white p-4 text-text border-b border-component-background-darken">
      <MaxWidth>
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-4">
            <RemixLink to="/">HOME</RemixLink>
            <NavLink className={isActive => `font-bold ${isActive ? 'text-primary' : ''}`} to="/setlists">Setlists</NavLink>
            <NavLink className={isActive => `font-bold ${isActive ? 'text-primary' : ''}`} to="/songs">Songs</NavLink>
          </div>

          <div className="flex gap-1">
            <Link to="/clients/new" icon={faPlus} isCollapsing type="submit" kind="primary" isRounded>
              New Client
            </Link>
            <Link to="/user" isCollapsing icon={faUser} kind="secondary" isRounded>
              User Details
            </Link>
            <Form action="/logout" method="post">
              <Button
                isCollapsing
                icon={faSignOut}
                type="submit" isRounded
              >
                Logout
              </Button>
            </Form>
          </div>
        </div>
      </MaxWidth>
    </header>
  )
}