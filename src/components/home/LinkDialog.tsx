
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { ExternalLink } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import type { ILinkBase } from "@/types/links.type";

const   LinkDialog = ({ linkGroup }: any) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-border text-foreground flex items-center  hover:bg-muted bg-card  gap-2"
        >
          <linkGroup.icon className="w-6 h-6" />
          <span className="text-sm font-medium">{linkGroup?.name}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex flex-row items-center gap-2 text-foreground ">
            <linkGroup.icon className="w-5 h-5" />
            {linkGroup?.name} Links
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Access your {linkGroup?.name?.toLowerCase()} resources and tools
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {linkGroup?.links?.map((link: ILinkBase, index: string) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-between border-border gap-2 text-foreground hover:bg-muted bg-transparent"
              asChild
            >
              <Link to={link?.url} target="_blank" rel="noopener noreferrer">
                <span>{link?.title}</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LinkDialog;
