import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/node"
import { FlexList, Label, RestrictedAlert } from "~/components";
import { requireUserId } from "~/session.server";
import invariant from "tiny-invariant";
import { getBand } from "~/models/band.server";
import { roleEnums } from "~/utils/enums";
import { useCatch, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request)

  const bandId = params.bandId
  invariant(bandId, 'bandId not found')

  const band = await getBand(bandId)
  const isAdmin = band?.members.find(m => m.userId === userId)?.role === roleEnums.admin

  if (!isAdmin) {
    throw new Response('Access denied', { status: 403 })
  }

  return json({ band })
}

export default function NewMember() {
  const { band } = useLoaderData<typeof loader>()
  const [showSuccess, setShowSuccess] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(band.code).then(() => setShowSuccess(true))
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (showSuccess) {
        setShowSuccess(false)
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [showSuccess])

  return (
    <FlexList pad={4}>
      <FlexList gap={0}>
        <h5 className="text-xl font-bold">Invite new member</h5>
        <span className="text-text-subdued text-sm">Invite new members with the band code below.</span>
      </FlexList>

      <FlexList gap={0}>
        <Label>Band code</Label>
        <div className="relative">
          <button onClick={handleCopy} className=" rounded border flex justify-between items-center p-2 w-full">
            <span className="font-bold">{band.code}</span>
            <FontAwesomeIcon icon={faCopy} />
          </button>
          <AnimatePresence>
            {showSuccess ? (
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ opacity: .2 }}
                className="absolute top-full right-0 text-primary"
              >
                Band code copied!
              </motion.span>
            ) : null}
          </AnimatePresence>
        </div>
      </FlexList>

      <div>
        <Label>NOTE:</Label>
        <p className="text-sm">All invited members will automatically be added as <b>SUB</b>s. They will be able to see your setlists and songs, but will not be able to make any changes.</p>
        <p className="text-sm">If you wish to upgrade their role, you can do so by clicking on their name in the members list after they join this band.</p>
      </div>
    </FlexList>
  )
}

export function CatchBoundary() {
  const caught = useCatch()

  if (caught.status === 403) {
    return <RestrictedAlert dismissTo={`..`} />
  }
  return (
    <FlexList pad={4}>
      Caught
    </FlexList>
  )
}