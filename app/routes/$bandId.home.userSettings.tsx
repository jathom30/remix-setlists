import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Outlet } from "@remix-run/react";
import { FlexHeader, FlexList, Link, Navbar, Title } from "~/components";

export default function UserSettingsPage() {
  return (
    <FlexList gap={0}>
      <Navbar>
        <FlexHeader>
          <Title>User settings</Title>
          <Link to=".." kind="ghost" aria-label="back"><FontAwesomeIcon icon={faTimes} /></Link>
        </FlexHeader>
      </Navbar>
      <Outlet />
    </FlexList>
  )
}