import { useGetLinks } from "@/services/api/link.api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import type { ILinkBase } from "@/types/links.type";
import {
  AlignVerticalJustifyCenter,
  File,
  Github,
  Linkedin,
  User,
} from "lucide-react";
import LinkDialog from "./LinkDialog";

const iconPack: {
  [key: string]: React.ComponentType<any>;
} = {
  LINKEDIN: Linkedin,
  GITHUB: Github,
  PORTFOLIO: User,
  DOCUMENT: File,
  OTHER: AlignVerticalJustifyCenter,
};

const LinkSection = () => {
  const { data: quickLinksData } = useGetLinks();

  const quickLinksMap =
    quickLinksData?.items?.reduce(
      (acc: Record<string, any>, link: ILinkBase) => {
        if (!acc[link.category]) {
          const Icon = iconPack[link.category] || AlignVerticalJustifyCenter;

          acc[link.category] = {
            name: link.category,
            icon: Icon,
            links: [],
          };
        }

        acc[link.category].links.push(link);
        return acc;
      },
      {}
    ) ?? {};

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Quick Links</CardTitle>
        <CardDescription className="text-muted-foreground">
          Access admin tools and resources
        </CardDescription>
      </CardHeader>

      <CardContent className="grid grid-cols-2 gap-3">
        {Object.values(quickLinksMap || {})?.map((linkGroup: any) => (
          <LinkDialog key={linkGroup.name} linkGroup={linkGroup} />
        ))}
      </CardContent>
    </Card>
  );
};

export default LinkSection;
