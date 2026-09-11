import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import VoidLogo from "@/assets/void_manage_logo.png";
import { NAV_BY_ROLE, isNavItemActive } from "./nav-config";

interface AppSidebarProps {
  role?: string;
}

const AppSidebar = ({ role }: AppSidebarProps) => {
  const location = useLocation();
  const groups = (role && NAV_BY_ROLE[role]) || [];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/" className="flex items-center gap-2 px-2 py-1.5">
          <img
            src={VoidLogo}
            alt="Void Manage"
            className="h-8 w-auto object-contain shrink-0"
          />
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            {role && (
              <Badge
                variant="outline"
                className="mt-0.5 w-fit px-1.5 py-0 text-[10px] capitalize"
              >
                {role.toLowerCase()}
              </Badge>
            )}
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = isNavItemActive(item, location.pathname);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.label}
                      >
                        <Link to={item.href}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
