import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Outlet } from "@remix-run/react";
import { FlexHeader, Link, Navbar, Title } from "~/components";

export default function AvatarBase() {
  return (
    <div className="h-full flex flex-col">
      <Navbar>
        <FlexHeader>
          <Title>Band icon</Title>
          <Link kind="ghost" to=".."><FontAwesomeIcon icon={faTimes} /></Link>
        </FlexHeader>
      </Navbar>
      <Outlet />
    </div>
  )
}