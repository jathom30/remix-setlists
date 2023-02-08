import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { motion, useAnimation, useInView } from "framer-motion";
import { ReactNode, useEffect, useRef } from "react";
import { Divider, FlexHeader, FlexList, ItemBox, Link, MaxWidth, Navbar, Title } from "~/components";
import { getUserId } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request)
  // redirect user if logged in
  if (userId) {
    return redirect("/home")
  }
  return null
}

export const meta: MetaFunction = () => ({
  title: "Welcome!",
});

export default function Landing() {
  const hide = { width: 0, opacity: 0 }
  const show = { width: '100%', opacity: 1 }
  return (
    <div className="mt-16 pb-16">
      <div className="fixed top-0 inset-x-0 z-10">
        <Navbar>
          <FlexHeader>
            <Title>Setlists</Title>
            <FlexList direction="row">
              <Link to="login" kind="ghost">Log in</Link>
              <Link to="join" kind="primary">Sign up</Link>
            </FlexList>
          </FlexHeader>
        </Navbar>
      </div>

      <MaxWidth>
        <FlexList pad={4}>
          <div className="flex gap-4 items-center flex-col md:flex-row">
            <div className="py-12 flex flex-col gap-4">
              <h1 className="text-5xl font-bold">Welcome to <span className="text-primary">Setlists</span></h1>
              <p className="text-xl">A place for bands and their mates.</p>
              <Link to="join" kind="primary" size="lg">Create your account</Link>
            </div>
            <div className="mockup-phone">
              <div className="camera" aria-hidden></div>
              <div className="display">
                <div className="artboard artboard-demo phone-1 block pt-6">
                  <div className="p-4">
                    <FlexList direction="row" gap={4}>
                      <motion.div className="bg-base-300 w-12 h-12 rounded" />
                      <motion.div initial={hide} animate={{ width: '70%', opacity: 1 }} transition={{ width: 4 }} className="bg-base-300 h-12 rounded" />
                    </FlexList>
                    <motion.div className="h-4" />
                    <FlexList gap={2} width="full">
                      {Array.from({ length: 7 }, (_, i) => (
                        <motion.div initial={hide} animate={show} transition={{ delay: .2 * i }} key={i} className="bg-base-300 w-full h-12 rounded" />
                      ))}
                    </FlexList>
                    <Divider />
                    <FlexList direction="row" gap={4}>
                      <motion.div className="bg-base-300 w-12 h-12 rounded" />
                      <motion.div className="bg-base-300 w-48 h-12 rounded" />
                    </FlexList>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Divider />
          <AnimateInView>
            <ItemBox>
              <h2 className="text-2xl font-bold">Why Setlists?</h2>
              <p><span className="text-secondary">Setlists allows bands to keep all their setlists in one place!</span> Easily creatable, editable, and searchable. Simply add your songs to your band's library then select which songs should be added to your setlists.</p>
            </ItemBox>
          </AnimateInView>
          <AnimateInView>
            <ItemBox>
              <h2 className="text-2xl font-bold">But I'm too lazy to write my own setlists...</h2>
              <p><span className="text-secondary">Let us do it for you!</span> With just a little bit of info about your songs, we can programatically create setlists for you. Then adjust the setlists to taste until you get the perfect result for your gig.</p>
            </ItemBox>
          </AnimateInView>
          <AnimateInView>
            <ItemBox>
              <h2 className="text-2xl font-bold">In multiple bands?</h2>
              <p><span className="text-secondary">Not a problem!</span> Setlists allows users to be in as many bands as they want. Users can seemlessly switch between band profiles at anytime within the app.</p>
            </ItemBox>
          </AnimateInView>
          <AnimateInView>
            <ItemBox>
              <h2 className="text-2xl font-bold">How much does it cost?</h2>
              <p><span className="text-secondary">Absolutely nothing!</span> This is the beta release of Setlists. At this time access to the app is entirely free. However, be aware that you may find some bugs. If you do, feel free to report them to us at <a className="link link-accent" href="mailto:support@setlists.pro">support@setlists.pro</a></p>
            </ItemBox>
          </AnimateInView>
          <Divider />
          <AnimateInView>
            <ItemBox>
              <h2 className="text-2xl font-bold">Interested?</h2>
              <Link to="join" kind="primary" size="md">Create your account today</Link>
            </ItemBox>
          </AnimateInView>
        </FlexList>
      </MaxWidth>
      <div className="fixed bottom-0 inset-x-0 z-10">
        <Navbar>
          <FlexHeader>
            <span>2023 © JATHOM</span>
            <a href="mailto:support@setlists.pro">Contact us</a>
          </FlexHeader>
        </Navbar>
      </div>
    </div>
  )
}

const variants = {
  visible: { opacity: 1, translateX: 0, transition: { duration: 1 } },
  hidden: { opacity: 0, translateX: -20 }
}
const AnimateInView = ({ children }: { children: ReactNode }) => {
  const controls = useAnimation()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)

  useEffect(() => {
    if (inView) {
      controls.start('visible')
    }
  }, [controls, inView])

  return (
    <motion.div ref={ref} initial="hidden" variants={variants} animate={controls}>{children}</motion.div>
  )
}