import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { KeyRound } from "lucide-react";
import { useResetUserPassword } from "@/services/api/user.api";
import type { IUserData } from "@/types/user.type";

interface UserAccountActionsProps {
  userData: IUserData;
  currentUserRole?: string;
}

export const UserAccountActions = ({ userData, currentUserRole }: UserAccountActionsProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { mutate: resetPassword, isPending } = useResetUserPassword();

  if (currentUserRole !== "ADMIN") return null;

  const handleConfirm = () => {
    resetPassword(userData._id, {
      onSuccess: () => setConfirmOpen(false),
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <KeyRound className="w-5 h-5" />
            Account
          </CardTitle>
          <CardDescription>Manage this user's account credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            size="sm"
            variant="outline"
            className="w-full gap-2"
            onClick={() => setConfirmOpen(true)}
          >
            <KeyRound className="w-4 h-4" />
            Reset Password
          </Button>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              This will generate a new temporary password for {userData.username} and email it to{" "}
              {userData.email}. They'll be required to set a new password on their next login.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={isPending}>
              {isPending ? "Resetting..." : "Reset Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
