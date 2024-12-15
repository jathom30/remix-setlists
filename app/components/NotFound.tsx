import { Link } from "react-router";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { FlexList } from "./FlexList";
import { MaxWidth } from "./MaxWidth";

export const NotFound = ({
  dismissTo,
  message,
}: {
  dismissTo: string;
  message: ReactNode;
}) => {
  return (
    <MaxWidth className="p-2">
      <Card>
        <CardHeader>
          <CardTitle>404 Not Found</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          <FlexList gap={2}>
            <Button asChild variant="secondary">
              <Link to={dismissTo}>Go back</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/">Go home</Link>
            </Button>
          </FlexList>
        </CardContent>
      </Card>
    </MaxWidth>
  );
};
