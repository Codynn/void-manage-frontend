import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useGetUserData } from "@/services/api/user.api";
import AppSidebar from "./AppSidebar";
import ChangePasswordGate from "./ChangePasswordGate";
import { NAV_BY_ROLE, isNavItemActive } from "./nav-config";
import { NotificationsPopup } from "@/components/header/notification-popup";
import { ProfilePopup } from "@/components/header/profile-popup";

const ROLE_HOME: Record<string, string> = {
  ADMIN: "/admin/dashboard",
  MENTOR: "/mentor/dashboard",
  INTERN: "/intern/dashboard",
};

interface DashboardLayoutProps {
  allowedRoles: string[];
}

const useCurrentSectionLabel = (role?: string) => {
  const location = useLocation();
  const groups = (role && NAV_BY_ROLE[role]) || [];
  const allItems = groups.flatMap((g) => g.items);

  // longest matching prefix wins (so /admin/users/123 matches "Users", not "Dashboard")
  const longestPrefix = (item: (typeof allItems)[number]) =>
    Math.max(...(item.matchPrefixes || [item.href]).map((p) => p.length));

  const match = allItems
    .filter((item) => isNavItemActive(item, location.pathname))
    .sort((a, b) => longestPrefix(b) - longestPrefix(a))[0];

  return match?.label;
};

const DashboardLayout = ({ allowedRoles }: DashboardLayoutProps) => {
  const { data: userData, isLoading, error } = useGetUserData();
  const sectionLabel = useCurrentSectionLabel(userData?.role);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center">
          <LoaderCircle className="h-16 w-16 animate-spin text-primary" />
          <p className="mt-4 text-xl text-muted-foreground">Loading, please wait...</p>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!allowedRoles.includes(userData.role)) {
    return <Navigate to={ROLE_HOME[userData.role] || "/auth/login"} replace />;
  }

  if (userData.mustChangePassword) {
    return <ChangePasswordGate />;
  }

  return (
    <SidebarProvider>
      <AppSidebar role={userData.role} />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={ROLE_HOME[userData.role]}>Home</BreadcrumbLink>
              </BreadcrumbItem>
              {sectionLabel && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{sectionLabel}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>

          <div className="ml-auto flex items-center gap-2">
            <NotificationsPopup />
            <ProfilePopup user={userData} />
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
