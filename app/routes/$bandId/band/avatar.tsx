import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Outlet } from "@remix-run/react";
import { FlexHeader, Link, MaxHeightContainer, Navbar, Title } from "~/components";

export default function AvatarBase() {
  return (
    <MaxHeightContainer
      fullHeight
      header={
        <Navbar>
          <FlexHeader>
            <Title>Band icon</Title>
            <Link kind="ghost" to=".."><FontAwesomeIcon icon={faTimes} /></Link>
          </FlexHeader>
        </Navbar>
      }
    >
      <Outlet />
    </MaxHeightContainer>
  )
}