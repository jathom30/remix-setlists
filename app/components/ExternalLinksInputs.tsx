import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Link } from "@prisma/client";
import type { SerializeFrom } from "@remix-run/node";
import { useState } from "react";

import { Button, ErrorMessage, FlexList, Input } from "~/components";

export const ExternalLinksInputs = ({
  links,
  errors,
}: {
  links?: SerializeFrom<Link>[];
  errors?: string[];
}) => {
  const mappedLinks =
    links?.map((link) => ({ id: link.id, href: link.href })) || [];
  const [currentLinks, setCurrentLinks] = useState([
    ...mappedLinks,
    { id: `tempId-${Math.random().toString()}`, href: "" },
  ]);
  const [deletedLinks, setDeletedLinks] = useState<string[]>([]);

  const handleDeleteLink = (linkId: string) => {
    setCurrentLinks((prevLinks) => {
      return prevLinks.filter((link) => link.id !== linkId);
    });
    if (!linkId.includes("tempId-")) {
      setDeletedLinks((prevDeleted) => [...prevDeleted, linkId]);
    }
  };
  const createNewLink = () => {
    setCurrentLinks((prevLinks) => {
      return [
        ...prevLinks,
        { id: `tempId-${Math.random().toString()}`, href: "" },
      ];
    });
  };

  const hasError = (id: string) => !!errors?.find((error) => error === id);
  return (
    <FlexList pad={0}>
      {currentLinks.map((link) => (
        <FlexList key={link.id} gap={0}>
          <FlexList direction="row" gap={2} items="center">
            <label className="input-group">
              <span>https://</span>
              <Input
                name={`links/${link.id}`}
                defaultValue={link.href}
                placeholder="website.com"
              />
            </label>
            {currentLinks.length > 1 ? (
              <Button onClick={() => handleDeleteLink(link.id)}>
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            ) : null}
          </FlexList>
          {hasError(link.id) ? <ErrorMessage message="Invalid URL" /> : ""}
        </FlexList>
      ))}
      {deletedLinks.map((deletedLink) => (
        <input
          type="hidden"
          hidden
          key={deletedLink}
          name="deletedLinks"
          defaultValue={deletedLink}
        />
      ))}
      <Button isOutline onClick={createNewLink} type="button">
        New link
      </Button>
    </FlexList>
  );
};
