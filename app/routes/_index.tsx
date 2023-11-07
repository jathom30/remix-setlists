import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { motion, useAnimation, useInView } from "framer-motion";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import {
  Divider,
  FlexHeader,
  FlexList,
  ItemBox,
  Link,
  MaxWidth,
  Navbar,
  Title,
} from "~/components";
import { getUserId } from "~/session.server";
import photoBackground from "~/assets/mobileSetlist.png";
import dataMetricScreen from "~/assets/mobileSetData.png";
import membersScreen from "~/assets/mobileMembers.png";
import songScreen from "~/assets/songSample.png";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  // redirect user if logged in
  if (userId) {
    return redirect("/home");
  }
  return null;
}

export const meta: MetaFunction = () => [
  {
    title: "Welcome!",
  },
];

export default function Landing() {
  return (
    <div className="mt-16 pb-16">
      <div className="fixed top-0 inset-x-0 z-20">
        <Navbar>
          <FlexHeader>
            <Title>Setlists</Title>
            <FlexList direction="row">
              <Link to="login" kind="ghost">
                Log in
              </Link>
              <Link to="join" kind="primary">
                Sign up
              </Link>
            </FlexList>
          </FlexHeader>
        </Navbar>
      </div>

      <MaxWidth>
        <FlexList pad={4}>
          <div className="flex gap-4 items-center flex-col md:flex-row">
            <div className="py-12 flex flex-col gap-4">
              <h1 className="text-5xl font-bold">
                Welcome to <span className="text-primary">Setlists</span>
              </h1>
              <p className="text-xl">A place for bands and their mates.</p>
              <Link to="join" kind="primary" size="lg">
                Create your account
              </Link>
            </div>
            <div className="mockup-phone">
              <div className="camera" aria-hidden></div>
              <div className="display">
                <div className="artboard artboard-demo phone-1 block">
                  <img
                    className="h-full"
                    src={photoBackground}
                    alt="setlist example"
                  />
                </div>
              </div>
            </div>
          </div>
          <Divider />

          <h2 className="text-4xl font-bold">Features</h2>

          <AnimateInView>
            <div className="flex gap-4 items-center flex-col md:flex-row-reverse">
              <ItemBox>
                <h2 className="text-2xl font-bold">Bands</h2>
                <p>Users can be invited to or create any number of bands!</p>
                <p>
                  Each band can be customized with a unqiue avatar image or
                  icon. Apart from songs and setlists unique to the band, bands
                  can create custom "feels" or genre tags to add to songs.
                </p>
                <p>
                  Admin members in bands can choose to add or remove members to
                  their band.
                </p>
                <Divider />
                <Title>Band members</Title>
                <p>Bands can assign permissions to its members individually.</p>
                <p>
                  <strong className="text-accent">Admin</strong>: Admins have
                  full read/write/delete permissions for their band as well as
                  its setlists, songs, and feels. Admins are capable of removing
                  and inviting members (as well as deleting the band, if they so
                  choose).
                </p>
                <p>
                  <strong className="text-accent">Member</strong>: Members have
                  read only permissions for band specific settings. However,
                  they have full read/write/delete permissions for setlists,
                  songs, and feels.
                </p>
                <p>
                  <strong className="text-accent">Sub</strong>: Subs have read
                  only permissions throughout the app. This is ideal for new
                  members who need access to the band's setlists and song
                  details, but aren't established enough to start adding songs
                  and setlists to the group.
                </p>
              </ItemBox>
              <img
                className="h-full w-full max-w-xs rounded-lg object-cover shadow-lg"
                src={membersScreen}
                alt="member UI example"
              />
            </div>
          </AnimateInView>

          <Divider />

          <AnimateInView>
            <div className="flex gap-4 items-center flex-col md:flex-row">
              <ItemBox>
                <h2 className="text-2xl font-bold">Setlists</h2>
                <p>
                  Setlists are made up of one or more groups of songs called
                  "sets". Setlists can be auto-generated or manually created.
                </p>
                <p>
                  Using our drag and drop system, editing setlists is a breeze!
                </p>
                <Divider />
                <p>
                  <strong className="text-accent">Data metrics</strong> are
                  avialable for each set so you can keep track of how many
                  covers or originals you've encluded. See if your set is
                  leaning too far country or rock for the show. Even checkout
                  the tempo changes from song to song chronologically!
                </p>
                <p>
                  <strong>
                    Want to share your setlists with fans or a stage tech?
                  </strong>{" "}
                  No problem! Setlists can be shared publically at any time. Now
                  the sound guy at your show knows where you are in the set and
                  can plan for that upcoming ballad or screamer.
                </p>
              </ItemBox>
              <img
                className="h-full w-full max-w-xs rounded-lg object-cover shadow-lg"
                src={dataMetricScreen}
                alt="data metrics example"
              />
            </div>
          </AnimateInView>

          <Divider />

          <AnimateInView>
            <div className="flex gap-4 items-center flex-col md:flex-row-reverse">
              <ItemBox>
                <h2 className="text-2xl font-bold">Songs and Feels</h2>
                <p>
                  <strong className="text-accent">
                    Your songs are the heart of your band.
                  </strong>{" "}
                  We allow you to make them as detailed as you'd like. We can
                  hold on to the lyrics for you, keep track of the key, tempo,
                  and feel of the tune.
                </p>
                <p>
                  Maybe you want to keep your lyrics or notes in an external
                  doc? No problem, we allow you to create a link that will send
                  you right to it.
                </p>
                <Divider />
                <p>
                  Each song can be tagged with any number of "feels". These help
                  you organize your songs when creating setlists or just to keep
                  track of how many swing tunes your band has been learning.
                </p>
              </ItemBox>
              <img
                className="h-full w-full max-w-xs rounded-lg object-cover shadow-lg"
                src={songScreen}
                alt="song example"
              />
            </div>
          </AnimateInView>

          <Divider />

          <h2 className="text-4xl font-bold">FAQs</h2>

          <AnimateInView>
            <ItemBox>
              <h2 className="text-2xl font-bold">Why Setlists?</h2>
              <p>
                <span className="text-secondary">
                  Setlists allows bands to keep all their setlists in one place!
                </span>{" "}
                Easily creatable, editable, and searchable. Simply add your
                songs to your band's library then select which songs should be
                added to your setlists.
              </p>
            </ItemBox>
          </AnimateInView>
          <AnimateInView>
            <ItemBox>
              <h2 className="text-2xl font-bold">
                But I'm too lazy to write my own setlists...
              </h2>
              <p>
                <span className="text-secondary">Let us do it for you!</span>{" "}
                With just a little bit of info about your songs, we can
                programatically create setlists for you. Then adjust the
                setlists to taste until you get the perfect result for your gig.
              </p>
            </ItemBox>
          </AnimateInView>
          <AnimateInView>
            <ItemBox>
              <h2 className="text-2xl font-bold">In multiple bands?</h2>
              <p>
                <span className="text-secondary">Not a problem!</span> Setlists
                allows users to be in as many bands as they want. Users can
                seemlessly switch between band profiles at anytime within the
                app.
              </p>
            </ItemBox>
          </AnimateInView>
          <AnimateInView>
            <ItemBox>
              <h2 className="text-2xl font-bold">How much does it cost?</h2>
              <p>
                <span className="text-secondary">Absolutely nothing!</span> This
                is the beta release of Setlists. At this time access to the app
                is entirely free. However, be aware that you may find some bugs.
                If you do, feel free to report them to us at{" "}
                <a
                  className="link link-accent"
                  href="mailto:support@setlists.pro"
                >
                  support@setlists.pro
                </a>
              </p>
            </ItemBox>
          </AnimateInView>
          <Divider />

          <AnimateInView>
            <ItemBox>
              <h2 className="text-2xl font-bold">Interested?</h2>
              <Link to="join" kind="primary" size="md">
                Create your account today
              </Link>
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
  );
}

const variants = {
  visible: { opacity: 1, translateX: 0, transition: { duration: 1 } },
  hidden: { opacity: 0, translateX: -20 },
};
const AnimateInView = ({ children }: { children: ReactNode }) => {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      variants={variants}
      animate={controls}
    >
      {children}
    </motion.div>
  );
};
