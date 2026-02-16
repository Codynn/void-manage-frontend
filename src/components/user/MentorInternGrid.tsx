// components/user/MentorInternGrid.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserCheck, Users, Mail, ChevronDown } from "lucide-react";
import type { IUserData } from "@/types/user.type";
import { Skeleton } from "@/components/ui/skeleton";

interface MentorInternGridProps {
  mentorInternPairs: Array<{
    mentor: IUserData;
    interns: IUserData[];
  }>;
  isLoading: boolean;
  onRemoveIntern?: (mentorId: string, internId: string) => void;
}

const getUserInitials = (username: string) => {
  return username
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const MentorCard = ({
  mentor,
  interns,
}: {
  mentor: IUserData;
  interns: IUserData[];
  onRemoveIntern?: (mentorId: string, internId: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Sort interns: active first, then archived
  const sortedInterns = [...interns].sort((a, b) => {
    if (a.archived === b.archived) return 0;
    return a.archived ? 1 : -1;
  });

  const activeCount = interns.filter(i => !i.archived).length;
  const archivedCount = interns.filter(i => i.archived).length;
  const totalCount = interns.length;

  const handleInternClick = (internId: string) => {
    navigate(`/admin/users/${internId}`);
  };

  return (
    <Card
      className="flex flex-col transition-shadow hover:shadow-lg"
      style={{ alignSelf: "start" }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarFallback className="bg-(--color-primary) text-white">
              {getUserInitials(mentor.username)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-lg">{mentor.username}</CardTitle>
            <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <Mail className="h-3 w-3 shrink-0" />
              <span className="truncate">{mentor.email}</span>
            </div>
            <Badge variant="secondary" className="bg-(--role-mentor) mt-2 text-white">
              Mentor
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-medium">
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              Assigned Interns
            </span>
            <div className="flex items-center gap-2">
              {/* Count Badge */}
              {totalCount === 0 ? (
                <Badge variant="outline" className="font-semibold">
                  0
                </Badge>
              ) : archivedCount === 0 ? (
                <Badge
                  variant="outline"
                  className="font-semibold"
                  style={{ color: "var(--role-intern)" }}
                >
                  {activeCount}
                </Badge>
              ) : (
                <div className="flex items-center gap-1">
                  <Badge
                    variant="outline"
                    className="font-semibold"
                    style={{ color: "var(--role-intern)" }}
                  >
                    {activeCount}
                  </Badge>
                  <span className="text-xs text-muted-foreground">+</span>
                  <Badge
                    variant="outline"
                    className="font-semibold"
                    style={{ color: "var(--destructive)" }}
                  >
                    {archivedCount}
                  </Badge>
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 transition-transform duration-200 hover:bg-accent"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-label={`${isOpen ? "Hide" : "Show"} ${totalCount} assigned intern${totalCount !== 1 ? "s" : ""}`}
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                />
              </Button>
            </div>
          </div>

          {isOpen && (
            <div
              className="duration-300 animate-in fade-in-50 slide-in-from-top-2"
              style={{ maxHeight: "400px", overflow: "hidden" }}
            >
              {sortedInterns.length > 0 ? (
                <div className="scrollbar-thin scrollbar-thumb-muted scrollbar-track-muted/20 max-h-80 space-y-2 overflow-y-auto rounded-md pr-1">
                  {sortedInterns.map(intern => {
                    const isArchived = intern.archived === true;

                    return (
                      <div
                        key={intern._id}
                        onClick={() => handleInternClick(intern._id)}
                        className={`group relative flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-all duration-200 focus-within:ring-2 focus-within:ring-ring hover:shadow-sm ${
                          isArchived ? "" : "border-border bg-card hover:bg-accent"
                        }`}
                        style={
                          isArchived
                            ? {
                                borderColor: "var(--destructive)",
                                backgroundColor: "var(--destructive-hover)",
                              }
                            : {}
                        }
                        tabIndex={0}
                        role="button"
                        onKeyDown={e => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleInternClick(intern._id);
                          }
                        }}
                      >
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback
                            className="text-xs text-white"
                            style={
                              isArchived
                                ? { backgroundColor: "var(--destructive)" }
                                : { backgroundColor: "var(--role-intern)" }
                            }
                          >
                            {getUserInitials(intern.username)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                          <p
                            className="truncate text-sm font-medium"
                            style={isArchived ? { color: "var(--destructive)" } : {}}
                          >
                            {intern.username}
                          </p>
                          <p
                            className={`truncate text-xs ${
                              !isArchived ? "text-muted-foreground" : ""
                            }`}
                            style={isArchived ? { color: "var(--destructive)", opacity: 0.8 } : {}}
                          >
                            {intern.email}
                          </p>
                        </div>

                        <Badge
                          className="h-5 shrink-0 px-2 py-0 text-[10px] font-semibold text-white"
                          style={
                            isArchived
                              ? { backgroundColor: "var(--destructive)" }
                              : { backgroundColor: "var(--role-intern)" }
                          }
                        >
                          {isArchived ? "Left" : "Active"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center text-muted-foreground">
                  <Users className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  <p className="text-xs">No interns assigned yet</p>
                </div>
              )}
            </div>
          )}

          {!isOpen && <div style={{ height: "0", overflow: "hidden", visibility: "hidden" }} />}
        </div>
      </CardContent>
    </Card>
  );
};

const MentorInternGrid = ({
  mentorInternPairs,
  isLoading,
  onRemoveIntern,
}: MentorInternGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  if (mentorInternPairs.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">No mentors found</p>
      </Card>
    );
  }

  return (
    <div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      style={{ gridAutoRows: "auto" }}
    >
      {mentorInternPairs.map(({ mentor, interns }, index) => (
        <MentorCard
          key={`${mentor._id}-${index}`}
          mentor={mentor}
          interns={interns}
          onRemoveIntern={onRemoveIntern}
        />
      ))}
    </div>
  );
};

export default MentorInternGrid;
