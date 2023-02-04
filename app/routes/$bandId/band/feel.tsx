import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Outlet } from "@remix-run/react";
import { FlexHeader, Link, Navbar, Title } from "~/components";

export default function BandFeels() {
  return (
    <div>
      <Navbar>
        <FlexHeader>
          <Title>Feels</Title>
          <Link to=".." kind="ghost" isRounded><FontAwesomeIcon icon={faTimes} /></Link>
        </FlexHeader>
      </Navbar>
      <Outlet />
    </div>
  )
}