"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdatePersonalDetails } from "@/services/api/user.api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { User, LogOut, LoaderCircle } from "lucide-react";
import { useLogout } from "@/services/api/auth.api";
import type { IUserData } from "@/types/user.type";

interface ProfilePopupProps {
  user: IUserData; // Assuming IUserData is the type for user data
}

export function ProfilePopup({ user }: ProfilePopupProps) {
  const [open, setOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  //   API CALLS

  const { mutate: logout, isPending } = useLogout(); // Assuming you have a logout function in your API service
  //   const { theme, setTheme } = useTheme()

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        setOpen(false);
        setLogoutOpen(false);
      },
      onError: (error: any) => {
        console.error("Logout failed:", error);
      },
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="border-border text-foreground bg-transparent"
          >
            <User className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Your account details and settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Profile Info */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-foreground text-sm">Name</label>
                  <p className="text-foreground font-medium">{user?.username}</p>
                </div>
                <div>
                  <label className="text-foreground text-sm">Email</label>
                  <p className="text-foreground font-medium text-sm">
                    {user?.email}
                  </p>
                </div>
                <div>
                  <label className="text-foreground text-sm">Role</label>
                  <Badge className="bg-primary text-primary-foreground block">
                    {user?.role.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <label className="text-foreground text-sm">Join Date</label>
                  <p className="text-foreground font-medium text-sm">
                    {new Date(user?.startDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {user?.role === "INTERN" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-foreground text-sm">
                      Current Phase
                    </label>
                    <Badge
                      variant="outline"
                      className="border-border text-foreground"
                    >
                      {(user?.currentPhase as any[])?.find((p: any) => !p?.isCompleted)?.name ||
                        (user?.currentPhase as any[])?.[0]?.name ||
                        "Not started"}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-foreground text-sm">
                      Hours Completed
                    </label>
                    <p className="text-foreground font-medium text-sm">
                      {user?.totalWorkedHours}/540
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Personal details used in contracts & certificates */}
            <PersonalDetailsForm user={user} />

            {/* Theme Toggle */}
            {/* <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="space-y-0.5">
                <label className="text-foreground">Theme</label>
                <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-foreground" />
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
                <Moon className="w-4 h-4 text-foreground" />
              </div>
            </div> */}

            {/* Logout */}
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                setOpen(false);
                setLogoutOpen(true);
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation */}
      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Confirm Logout
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to logout? You'll need to sign in again to
              access your account.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setLogoutOpen(false)}
              className="border-border text-foreground"
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Logout
              {isPending && (
                <LoaderCircle className="animate-spin ml-2 w-4 h-4" />
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PersonalDetailsForm({ user }: { user: IUserData }) {
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [address, setAddress] = useState(user?.address || "");
  const { mutate: save, isPending } = useUpdatePersonalDetails();

  useEffect(() => {
    setFullName(user?.fullName || "");
    setAddress(user?.address || "");
  }, [user?.fullName, user?.address]);

  const dirty = fullName !== (user?.fullName || "") || address !== (user?.address || "");

  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <p className="text-sm font-medium text-foreground">Personal details</p>
      <p className="text-xs text-muted-foreground">
        Used to fill your name and address in contracts and certificates.
      </p>
      <div className="space-y-1">
        <Label htmlFor="fullName" className="text-xs">Full name</Label>
        <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={user?.username} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="address" className="text-xs">Address</Label>
        <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, city, district" />
      </div>
      <Button
        size="sm"
        className="w-full"
        disabled={!dirty || isPending}
        onClick={() => save({ fullName, address })}
      >
        {isPending ? "Saving..." : "Save details"}
      </Button>
    </div>
  );
}
