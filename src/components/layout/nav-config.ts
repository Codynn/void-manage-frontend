import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileSignature,
  Award,
  FileStack,
  ClipboardList,
  Flag,
  CalendarDays,
  Clock,
  Camera,
  UserCog,
  ClipboardCheck,
  Building2,
  GraduationCap,
  DoorOpen,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  // an item is "active" when the current path starts with any of these prefixes
  // (defaults to [href] when omitted)
  matchPrefixes?: string[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const ADMIN_NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "People",
    items: [
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Departments", href: "/admin/departments", icon: Building2 },
      { label: "Leave Policies", href: "/admin/leave-policies", icon: CalendarDays },
      { label: "Role Templates", href: "/admin/role-templates", icon: ClipboardCheck },
    ],
  },
  {
    label: "Work",
    items: [
      { label: "Projects", href: "/admin/project", icon: FolderKanban },
      { label: "Milestones", href: "/admin/milestones", icon: Flag },
      { label: "Timesheets", href: "/admin/timesheets", icon: ClipboardList },
      {
        label: "Working Hours Requests",
        href: "/admin/working-hours-requests",
        icon: ClipboardCheck,
      },
      { label: "Leave Requests", href: "/admin/leave", icon: CalendarDays },
      { label: "Marks", href: "/admin/marks", icon: GraduationCap },
      { label: "Spaces", href: "/admin/spaces", icon: DoorOpen },
    ],
  },
  {
    label: "Documents",
    items: [
      {
        label: "Templates",
        href: "/admin/templates",
        icon: FileSignature,
        matchPrefixes: ["/admin/templates", "/admin/contract", "/admin/certificates"],
      },
      { label: "Files", href: "/admin/documents", icon: FileStack },
    ],
  },
];

export const MENTOR_NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/mentor/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Work",
    items: [
      { label: "Time Tracking", href: "/mentor/time-tracking", icon: Clock },
      { label: "Individual Assignment", href: "/mentor/individual-assignment", icon: UserCog },
      { label: "Marks", href: "/mentor/marks", icon: GraduationCap },
      { label: "Leave Requests", href: "/mentor/leave", icon: CalendarDays },
      { label: "Spaces", href: "/mentor/spaces", icon: DoorOpen },
    ],
  },
  {
    label: "Documents",
    items: [
      { label: "Contract", href: "/mentor/contract", icon: FileSignature },
      { label: "Welcome Photos", href: "/mentor/welcome-photos", icon: Camera },
    ],
  },
];

export const INTERN_NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/intern/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Work",
    items: [
      { label: "Time Tracking", href: "/intern/time-tracking", icon: Clock },
      { label: "Milestones", href: "/intern/milestones", icon: Flag },
      { label: "Leave Requests", href: "/intern/leave", icon: CalendarDays },
      { label: "Spaces", href: "/intern/spaces", icon: DoorOpen },
    ],
  },
  {
    label: "Documents",
    items: [
      { label: "Contract", href: "/intern/contract", icon: FileSignature },
      { label: "Certificates", href: "/intern/certificates", icon: Award },
      { label: "Welcome Photos", href: "/intern/welcome-photos", icon: Camera },
    ],
  },
];

export const NAV_BY_ROLE: Record<string, NavGroup[]> = {
  ADMIN: ADMIN_NAV,
  MENTOR: MENTOR_NAV,
  INTERN: INTERN_NAV,
};

export const isNavItemActive = (item: NavItem, pathname: string): boolean => {
  const prefixes = item.matchPrefixes || [item.href];
  return prefixes.some((prefix) => pathname.startsWith(prefix));
};
