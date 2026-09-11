import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, LoaderCircle, FileSpreadsheet, CheckCircle2, XCircle } from "lucide-react";
import { useBulkCreateUsers } from "@/services/api/user.api";

interface UploadResult {
  created: { row: number; username: string; email: string; role: string }[];
  failed: { row: number; reason: string }[];
  totalRows: number;
}

const BulkUploadUsersDialog = () => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate: uploadUsers, isPending } = useBulkCreateUsers();

  const reset = () => {
    setFile(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleUpload = () => {
    if (!file) return;
    uploadUsers(file, {
      onSuccess: (data) => setResult(data.data),
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Bulk Upload Users</DialogTitle>
          <DialogDescription>
            Upload an Excel/CSV file with columns: <b>username</b>, <b>email</b>, <b>role</b>{" "}
            (ADMIN/MENTOR/INTERN), and optionally <b>designation</b>. Each user gets a
            temporary password emailed to them automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center hover:border-primary"
            onClick={() => inputRef.current?.click()}
          >
            <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">{file ? file.name : "Click to select a file"}</p>
            <p className="text-xs text-muted-foreground">.xlsx, .xls, or .csv</p>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                setResult(null);
                setFile(e.target.files?.[0] || null);
              }}
            />
          </div>

          {result && (
            <div className="max-h-64 space-y-2 overflow-y-auto rounded-md border p-3 text-sm">
              <p className="font-medium">
                {result.created.length} created, {result.failed.length} failed out of{" "}
                {result.totalRows} row(s)
              </p>
              {result.created.map((u) => (
                <div key={u.row} className="flex items-center gap-2 text-xs text-green-700">
                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                  Row {u.row}: {u.username} ({u.email})
                  <Badge variant="outline" className="text-[10px]">
                    {u.role}
                  </Badge>
                </div>
              ))}
              {result.failed.map((f) => (
                <div key={f.row} className="flex items-center gap-2 text-xs text-destructive">
                  <XCircle className="h-3 w-3 shrink-0" />
                  Row {f.row}: {f.reason}
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {result ? "Close" : "Cancel"}
          </Button>
          <Button onClick={handleUpload} disabled={!file || isPending}>
            {isPending ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkUploadUsersDialog;
