import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react";
import { useGetSpaceAuditLog } from "@/services/api/space.api";
import type { ISpaceAuditLog } from "@/types/space.type";

const SpaceAuditLogPanel = () => {
  const { data: logs, isLoading } = useGetSpaceAuditLog();

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading...</p>;
  if (!logs?.length) {
    return (
      <Card>
        <CardContent className="p-10 text-center text-muted-foreground">
          <History className="mx-auto mb-3 h-10 w-10" />
          No activity recorded yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {logs.map((log: ISpaceAuditLog) => (
        <Card key={log._id}>
          <CardContent className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{log.action}</Badge>
              <span className="text-muted-foreground">{log.entityType}</span>
              {log.space && <span className="font-medium">{log.space.name}</span>}
              {log.message && <span className="text-muted-foreground">- {log.message}</span>}
            </div>
            <div className="text-xs text-muted-foreground">
              {log.performedBy?.username || "system"} - {new Date(log.createdAt).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SpaceAuditLogPanel;
