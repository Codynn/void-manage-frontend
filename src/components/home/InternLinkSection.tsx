import { useGetVisibleLinks } from '@/services/api/link.api';
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

const InternLinkSection = () => {
  const { data: quickLinksData } = useGetVisibleLinks();

  // Transform the response data to match the LinkSection format
  const quickLinksMap = quickLinksData?.items ? Object.entries(quickLinksData.items).reduce(
    (acc: Record<string, any>, [category, links]) => {
      const Icon = iconPack[category] || AlignVerticalJustifyCenter;

      acc[category] = {
        name: category,
        icon: Icon,
        links: links as ILinkBase[],
      };

      return acc;
    },
    {} as Record<string, any>
  ) : {};

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Quick Links</CardTitle>
        <CardDescription className="text-muted-foreground">
          Access available resources and tools
        </CardDescription>
      </CardHeader>

      <CardContent className="grid grid-cols-2 gap-3">
        {Object.values(quickLinksMap || {})?.map((linkGroup: any) => (
          <LinkDialog key={linkGroup.name} linkGroup={linkGroup} />
        ))}
      </CardContent>
    </Card>
  );
}

export default InternLinkSection