import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LinkIcon, ExternalLink } from "lucide-react";

interface UserQuickLinksProps {
  linksList: {
    items: Array<{
      _id: string;
      url: string;
      title: string;
      category: string;
    }>;
  };
}

const UserQuickLinks = ({ linksList }: UserQuickLinksProps) => {
  return (
    <Card className="border-0 shadow-sm gap-0">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <LinkIcon className="h-4 w-4 text-gray-600" />
          Quick Links
          {linksList?.items?.length > 0 && (
            <Badge variant="secondary" className="ml-auto text-xs">
              {linksList?.items?.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {linksList && linksList?.items.length > 0 ? (
          <div className="space-y-1">
            {linksList.items.map((link: any, index: number) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="w-full justify-between h-auto p-2 text-xs"
                asChild
              >
                <Link to={link?.url} target="_blank" rel="noopener noreferrer">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                      <ExternalLink className="w-3 h-3 text-gray-600" />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {link?.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize truncate">
                        {link?.category?.toLowerCase()}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
                </Link>
              </Button>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            <LinkIcon className="w-6 h-6 mx-auto mb-1" />
            <p className="text-xs">No links available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserQuickLinks;
