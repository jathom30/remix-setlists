import { useLoaderData } from "@remix-run/react";
import { Check, ExternalLink } from "lucide-react";
import { useState } from "react";
import { QRCode } from "react-qrcode-logo";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { FlexList } from "../FlexList";

import { CreatePublicLinkForm } from "./create-public-link-form";
import { setlistLoader } from "./loader.server";
import { RemovePublicLinkForm } from "./remove-public-link-form";

export const PublicLink = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const loaderData = useLoaderData<typeof setlistLoader>();
  const publicLink = loaderData.setlistPublicUrl;
  const [showSuccess, setShowSuccess] = useState(false);

  const title = publicLink ? "Public Link" : "Create Public Link";
  const description = publicLink
    ? "Copy the link below to share"
    : "Creating a public link will allow anyone with the link to view a read-only version of the setlist.";

  const onCopy = (textToCopy: string) =>
    navigator.clipboard.writeText(textToCopy).then(() => setShowSuccess(true));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {publicLink ? (
          <FlexList gap={2}>
            <Button
              variant="outline"
              onClick={() => onCopy(publicLink)}
              onMouseLeave={() => setShowSuccess(false)}
            >
              {showSuccess ? (
                "Copied!"
              ) : (
                <span className="truncate max-w-[200px]">{publicLink}</span>
              )}
              {showSuccess ? (
                <Check className="w-4 h-4 ml-2" />
              ) : (
                <ExternalLink className="w-4 h-4 ml-2" />
              )}
            </Button>
            <FlexList items="center" gap={0}>
              <QRCode value={publicLink} />
            </FlexList>
          </FlexList>
        ) : null}
        {publicLink ? (
          <RemovePublicLinkForm>
            <DialogFooter>
              <Button type="submit" variant="secondary">
                Remove Public Link
              </Button>
            </DialogFooter>
          </RemovePublicLinkForm>
        ) : (
          <CreatePublicLinkForm>
            <DialogFooter>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </CreatePublicLinkForm>
        )}
      </DialogContent>
    </Dialog>
  );
};
