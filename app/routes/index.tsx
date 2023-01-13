import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { FlexHeader, FlexList, Link, MaxHeightContainer, Navbar, Title } from "~/components";
import { getUserId } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request)
  // redirect user if logged in
  if (userId) {
    return redirect("/home")
  }
  return null
}

export default function Landing() {
  return (
    <MaxHeightContainer
      fullHeight
      header={
        <Navbar>
          <FlexHeader>
            <Title>Setlists</Title>
            <FlexList direction="row">
              <Link to="login" kind="ghost">Log in</Link>
              <Link to="join" kind="primary">Sign up</Link>
            </FlexList>
          </FlexHeader>
        </Navbar>
      }
      footer={
        <Navbar>
          <FlexHeader>
            <span>2023 ©</span>
            <a href="mailto:support@setlists.pro">Contact us</a>
          </FlexHeader>
        </Navbar>
      }
    >
      <FlexList pad={4}>
        <p>Here are a list of things I should show on the landing page:</p>
        <ul>
          <li>Hero: Welcome to Setlists.pro</li>
          <li>Some marketing tagline</li>
          <li>What problem is this site solving?</li>
          <li>How do we solve the problem</li>
          <li>CTA: Sign up for free</li>
        </ul>
      </FlexList>
    </MaxHeightContainer>
  )
}