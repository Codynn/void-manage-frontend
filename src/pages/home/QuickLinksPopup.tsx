"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ExternalLink } from "lucide-react"

interface QuickLinksPopupProps {
  linkGroup: {
    name: string
    icon: any
    links: { name: string; url: string }[]
    color: string
  }
}

export function QuickLinksPopup({ linkGroup }: QuickLinksPopupProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-border text-foreground hover:bg-muted bg-card h-16 flex-col gap-2">
          <linkGroup.icon className="w-6 h-6" />
          <span className="text-sm font-medium">{linkGroup.name}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <linkGroup.icon className="w-5 h-5" />
            {linkGroup.name} Links
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Access your {linkGroup.name.toLowerCase()} resources and tools
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {linkGroup.links.map((link, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-between border-border text-foreground hover:bg-muted bg-transparent"
              asChild
            >
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                <span>{link.name}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
