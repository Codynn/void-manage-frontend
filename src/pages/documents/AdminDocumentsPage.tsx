import { useState } from "react";
import TitleHeader from "@/components/layout/TitleHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, ExternalLink, LoaderCircle } from "lucide-react";
import {
  useGetAllFiles,
  useDeleteFile,
  type IFileRecord,
} from "@/services/api/documents.api";

const formatSize = (bytes?: number) => {
  if (!bytes && bytes !== 0) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FilesTable = ({
  files,
  onDelete,
  deletingId,
}: {
  files: IFileRecord[];
  onDelete: (id: string) => void;
  deletingId?: string;
}) => {
  if (files.length === 0) {
    return (
      <p className="py-10 text-center text-muted-foreground">No files found.</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Uploaded By</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Uploaded At</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {files.map((file) => (
          <TableRow key={file._id}>
            <TableCell className="max-w-xs truncate font-medium">
              {file.originalName}
            </TableCell>
            <TableCell>{file.uploadedBy?.name || file.uploadedBy?.email || "-"}</TableCell>
            <TableCell>{formatSize(file.size)}</TableCell>
            <TableCell className="text-muted-foreground">{file.mimeType || "-"}</TableCell>
            <TableCell>
              {file.isDeleted ? (
                <Badge variant="destructive">Deleted</Badge>
              ) : (
                <Badge variant="secondary">Active</Badge>
              )}
            </TableCell>
            <TableCell>{new Date(file.createdAt).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="icon" asChild>
                  <a href={file.url} target="_blank" rel="noopener noreferrer" aria-label="Open file">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                {!file.isDeleted && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete file"
                    disabled={deletingId === file._id}
                    onClick={() => onDelete(file._id)}
                  >
                    {deletingId === file._id ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-destructive" />
                    )}
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const AdminDocumentsPage = () => {
  const [activeTab, setActiveTab] = useState("active");
  const { data: files, isLoading } = useGetAllFiles();
  const { mutate: deleteFile, variables: deletingId, isPending } = useDeleteFile();

  const activeFiles = (files || []).filter((f) => !f.isDeleted);
  const deletedFiles = (files || []).filter((f) => f.isDeleted);

  return (
    <div className="mx-auto min-h-screen max-w-7xl space-y-6 p-6">
      <TitleHeader title="Documents" description="All uploaded files across the platform" link="/admin/dashboard" />
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="active">Active ({activeFiles.length})</TabsTrigger>
              <TabsTrigger value="deleted">Deleted ({deletedFiles.length})</TabsTrigger>
            </TabsList>
            {isLoading ? (
              <div className="flex justify-center py-10">
                <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <TabsContent value="active">
                  <FilesTable
                    files={activeFiles}
                    onDelete={deleteFile}
                    deletingId={isPending ? deletingId : undefined}
                  />
                </TabsContent>
                <TabsContent value="deleted">
                  <FilesTable
                    files={deletedFiles}
                    onDelete={deleteFile}
                    deletingId={isPending ? deletingId : undefined}
                  />
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDocumentsPage;
