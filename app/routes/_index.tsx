import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { motion, useAnimation, useInView } from "framer-motion";
import { CircleChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import mobileBandSettings from "~/assets/mobileBandSettings.png";
import mobileMetrics from "~/assets/mobileMetrics.png";
import photoBackground from "~/assets/mobileSetlist.png";
import mobileSong from "~/assets/mobileSong.png";
import { FlexHeader, FlexList, MaxWidth } from "~/components";
import { H1, H2, H4, P } from "~/components/typography";
import { getUserId } from "~/session.server";

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
    <div className="pb-16">
      <div className="fixed top-0 bg-card inset-x-0 z-20 border-b p-2">
        <FlexHeader>
          <H4>Setlists</H4>
          <FlexList direction="row">
            <Button asChild variant="ghost">
              <Link to="login">Log in</Link>
            </Button>
            <Button asChild>
              <Link to="join">Sign up</Link>
            </Button>
          </FlexList>
        </FlexHeader>
      </div>

      <div className="min-h-screen flex flex-col items-center justify-center gap-8">
        <div className="flex gap-4 items-center justify-center flex-col md:flex-row">
          <div className=" flex flex-col gap-4">
            <div>
              <H1>
                Welcome to <span className="text-primary">Setlists</span>
              </H1>
              <P>A place for bands and their mates.</P>
            </div>
            <Button asChild>
              <Link to="join">Create your account</Link>
            </Button>
          </div>
          <div className="overflow-auto max-h-[500px] shadow-lg border rounded-lg">
            <img
              className="h-full w-full max-w-xs rounded-lg object-cover shadow-lg"
              src={photoBackground}
              alt="setlist example"
            />
          </div>
        </div>
        <a href="#features">
          <CircleChevronDown size={40} className="text-primary" />
        </a>
      </div>

      <div id="features" className="pt-16" />
      <Section
        isDark
        title="Fully customizable bands"
        imageSrc={mobileBandSettings}
        imageAlt="member UI example"
      >
        <Card className="dark max-w-lg">
          <CardHeader>
            <CardTitle>Bands</CardTitle>
            <CardDescription>
              Users can be invited to or create any number of bands!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <P>
              Each band can be customized with a unqiue avatar image or icon.
              Apart from songs and setlists unique to the band, bands can create
              custom "feels" or genre tags to add to songs.
            </P>
            <P>
              Admin members in bands can choose to add or remove members to
              their band.
            </P>
            <Separator />
            <H4>Band members</H4>
            <P>Bands can assign permissions to its members individually.</P>
            <P>
              <strong className="text-primary">Admin</strong>: Admins have full
              read/write/delete permissions for their band as well as its
              setlists, songs, and feels. Admins are capable of removing and
              inviting members (as well as deleting the band, if they so
              choose).
            </P>
            <P>
              <strong className="text-primary">Member</strong>: Members have
              read only permissions for band specific settings. However, they
              have full read/write/delete permissions for setlists, songs, and
              feels.
            </P>
            <P>
              <strong className="text-primary">Sub</strong>: Subs have read only
              permissions throughout the app. This is ideal for new members who
              need access to the band's setlists and song details, but aren't
              established enough to start adding songs and setlists to the
              group.
            </P>
          </CardContent>
        </Card>
      </Section>
      <Section
        title="Easily create setlists"
        imageSrc={mobileMetrics}
        imageAlt="data metrics example"
      >
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>Setlists</CardTitle>
            <CardDescription>
              Setlists are made up of one or more groups of songs called "sets".
              Setlists can be auto-generated or manually created.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <P>Using our drag and drop system, editing setlists is a breeze!</P>
            <Separator />
            <P>
              <strong className="text-primary">Data metrics</strong> are
              avialable for each set so you can keep track of how many covers or
              originals you've encluded. See if your set is leaning too far
              country or rock for the show. Even checkout the tempo changes from
              song to song chronologically!
            </P>
            <P>
              <strong>
                Want to share your setlists with fans or a stage tech?
              </strong>{" "}
              No problem! Setlists can be shared publically at any time. Now the
              sound guy at your show knows where you are in the set and can plan
              for that upcoming ballad or screamer.
            </P>
          </CardContent>
        </Card>
      </Section>
      <Section
        isDark
        title="Songs and Feels"
        imageSrc={mobileSong}
        imageAlt="song example"
      >
        <Card className="dark max-w-lg">
          <CardHeader>
            <CardTitle>Songs and Feels</CardTitle>
            <CardDescription>
              <strong className="text-primary">
                Your songs are the heart of your band.
              </strong>{" "}
              We allow you to make them as detailed as you'd like. We can hold
              on to the lyrics for you, keep track of the key, tempo, and feel
              of the tune.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <P>
              Maybe you want to keep your lyrics or notes in an external doc? No
              problem, we allow you to create a link that will send you right to
              it.
            </P>
            <Separator />
            <P>
              Each song can be tagged with any number of "feels". These help you
              organize your songs when creating setlists or just to keep track
              of how many swing tunes your band has been learning.
            </P>
          </CardContent>
        </Card>
      </Section>
      <MaxWidth>
        <FlexList pad={4}>
          <H2>FAQs</H2>
          <div className="max-w-xl m-auto space-y-4">
            <AnimateInView>
              <Card>
                <CardHeader>
                  <CardTitle>Why Setlists?</CardTitle>
                  <CardDescription>
                    <span className="text-primary">
                      Setlists allows bands to keep all their setlists in one
                      place!
                    </span>{" "}
                    Easily creatable, editable, and searchable. Simply add your
                    songs to your band's library then select which songs should
                    be added to your setlists.
                  </CardDescription>
                </CardHeader>
              </Card>
            </AnimateInView>
            <AnimateInView>
              <Card>
                <CardHeader>
                  <CardTitle>
                    But I'm too lazy to write my own setlists...
                  </CardTitle>
                  <CardDescription>
                    <span className="text-primary">Let us do it for you!</span>{" "}
                    With just a little bit of info about your songs, we can
                    programatically create setlists for you. Then adjust the
                    setlists to taste until you get the perfect result for your
                    gig.
                  </CardDescription>
                </CardHeader>
              </Card>
            </AnimateInView>
            <AnimateInView>
              <Card>
                <CardHeader>
                  <CardTitle>In multiple bands?</CardTitle>
                  <CardDescription>
                    <span className="text-primary">Not a problem!</span>{" "}
                    Setlists allows users to be in as many bands as they want.
                    Users can seemlessly switch between band profiles at anytime
                    within the app.
                  </CardDescription>
                </CardHeader>
              </Card>
            </AnimateInView>
            <AnimateInView>
              <Card>
                <CardHeader>
                  <CardTitle>How much does it cost?</CardTitle>
                  <CardDescription>
                    <span className="text-primary">Absolutely nothing!</span>{" "}
                    This is the beta release of Setlists. At this time access to
                    the app is entirely free. However, be aware that you may
                    find some bugs. If you do, feel free to report them to us at{" "}
                    <a
                      className="link link-accent"
                      href="mailto:support@setlists.pro"
                    >
                      support@setlists.pro
                    </a>
                  </CardDescription>
                </CardHeader>
              </Card>
            </AnimateInView>
            <Separator />
            <AnimateInView>
              <Card>
                <CardHeader>
                  <CardTitle>Interested?</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button size="lg" className="w-full" asChild>
                    <Link to="join">Create your account today</Link>
                  </Button>
                </CardContent>
              </Card>
            </AnimateInView>
          </div>
        </FlexList>
      </MaxWidth>
      <div className="fixed bottom-0 inset-x-0 z-10 border-t bg-card p-2">
        <FlexHeader>
          <span>2023 © JATHOM</span>
          <a href="mailto:support@setlists.pro">Contact us</a>
        </FlexHeader>
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

const Section = ({
  title,
  children,
  imageSrc,
  imageAlt,
  isDark = false,
}: {
  title: string;
  children: ReactNode;
  imageSrc: string;
  imageAlt: string;
  isDark?: boolean;
}) => {
  return (
    <section
      id="features"
      className={`pt-16 min-h-screen flex flex-col justify-center ${
        isDark ? "bg-foreground text-background" : ""
      }`}
    >
      <div className="px-4">
        <H2>{title}</H2>
      </div>
      <FlexList pad={4}>
        <AnimateInView>
          <div
            className={`flex gap-4 items-center justify-center flex-col ${
              isDark ? "md:flex-row-reverse" : "md:flex-row"
            }`}
          >
            {children}
            <div className="overflow-auto max-h-[500px] shadow-lg border rounded-lg">
              <img
                className="h-full w-full max-w-xs rounded-lg object-cover shadow-lg"
                src={imageSrc}
                alt={imageAlt}
              />
            </div>
          </div>
        </AnimateInView>
      </FlexList>
    </section>
  );
};
