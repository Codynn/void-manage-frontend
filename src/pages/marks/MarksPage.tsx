import { useState } from "react";
import TitleHeader from "@/components/layout/TitleHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GraduationCap, LoaderCircle, Info } from "lucide-react";
import { useGetMyInternsMarks, useUpsertMark } from "@/services/api/mark.api";
import { MARK_CATEGORIES, MARK_CATEGORY_LABELS } from "@/types/mark.type";
import type { MarkCategory } from "@/types/mark.type";

const scoreColor = (score: number | null) => {
  if (score === null) return "text-muted-foreground";
  if (score >= 8) return "text-green-600";
  if (score >= 5) return "text-amber-600";
  return "text-red-600";
};

const MarksPage = () => {
  const { data: interns, isLoading } = useGetMyInternsMarks();
  const { mutate: saveMark } = useUpsertMark();
  const [pendingCell, setPendingCell] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const cellKey = (internId: string, category: MarkCategory) => `${internId}:${category}`;

  const handleCommit = (internId: string, category: MarkCategory, rawValue: string) => {
    const key = cellKey(internId, category);
    if (rawValue === "") return;

    const score = Number(rawValue);
    if (Number.isNaN(score) || score < 0 || score > 10) return;

    setPendingCell(key);
    saveMark(
      { internId, category, score },
      {
        onSettled: () => setPendingCell(null),
      }
    );
  };

  return (
    <main className="p-6 space-y-6">
      <TitleHeader
        title="Marks"
        description="Score your interns across the evaluation categories (0-10)"
        link="/mentor/dashboard"
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !interns?.length ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <GraduationCap className="h-10 w-10 mx-auto mb-3" />
            No interns assigned to you yet.
          </CardContent>
        </Card>
      ) : (
        <TooltipProvider>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[160px]">Intern</TableHead>
                      {MARK_CATEGORIES.map((category) => (
                        <TableHead key={category} className="text-center min-w-[130px]">
                          {MARK_CATEGORY_LABELS[category]}
                        </TableHead>
                      ))}
                      <TableHead className="text-center min-w-[90px]">Average</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {interns.map(({ intern, categories, average }) => (
                      <TableRow key={intern._id}>
                        <TableCell className="font-medium">
                          <div>{intern.username}</div>
                          <div className="text-xs text-muted-foreground">{intern.email}</div>
                        </TableCell>

                        {categories.map(({ category, mark }) => {
                          const key = cellKey(intern._id, category);
                          const isSaving = pendingCell === key;
                          const value = drafts[key] ?? (mark ? String(mark.score) : "");

                          return (
                            <TableCell key={category} className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Input
                                  type="number"
                                  min={0}
                                  max={10}
                                  step={0.5}
                                  value={value}
                                  disabled={isSaving}
                                  onChange={(e) =>
                                    setDrafts((prev) => ({ ...prev, [key]: e.target.value }))
                                  }
                                  onBlur={(e) => handleCommit(intern._id, category, e.target.value)}
                                  className={`h-8 w-16 text-center ${scoreColor(mark?.score ?? null)}`}
                                  placeholder="-"
                                />
                                {isSaving && (
                                  <LoaderCircle className="h-3 w-3 animate-spin text-muted-foreground" />
                                )}
                                {mark && !isSaving && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      Marked by {mark.markedBy?.username} on{" "}
                                      {new Date(mark.markedAt).toLocaleDateString()}
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </TableCell>
                          );
                        })}

                        <TableCell className="text-center">
                          {average !== null ? (
                            <Badge variant="outline" className={scoreColor(average)}>
                              {average}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TooltipProvider>
      )}
    </main>
  );
};

export default MarksPage;
