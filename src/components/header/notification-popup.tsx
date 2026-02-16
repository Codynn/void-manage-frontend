"use client";

import { useState, useEffect } from "react";
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
import { Bell, CheckCircle, AlertTriangle, MessageSquare } from "lucide-react";

import { getSocket } from "@/services/socket"; // your socket helper
import {
  getNotifications,
  markAllNotificationsRead,
} from "@/services/api/notifications.api";

export function NotificationsPopup() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]); // dynamic notifications

  // Fetch notifications from backend on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };
    fetchNotifications();
  }, []);

  // Socket.IO real-time notifications
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("newNotification", (notification: any) => {
      setNotifications((prev) => [notification, ...prev]); // add new notification at top
    });

    return () => {
      socket.off("newNotification");
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "feedback":
        return MessageSquare;
      case "task":
        return AlertTriangle;
      case "milestone":
        return CheckCircle;
      default:
        return Bell;
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark notifications read", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="bg-green-600 text-white text-xs">
                {unreadCount} new
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Your recent notifications and updates
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notifications.map((notification) => {
            const Icon = getIcon(notification.type);
            return (
              <div
                key={notification._id || notification.id}
                className={`p-3 rounded-lg border ${
                  !notification.read
                    ? "border-primary bg-primary/5"
                    : "border-border bg-muted/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon
                    className={`w-4 h-4 mt-1 ${
                      !notification.read
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-sm font-medium ${
                          !notification.read
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 mt-2">
          <Button
            onClick={handleMarkAllRead}
            variant="outline"
            className="flex-1"
          >
            Mark All Read
          </Button>
          <Button variant="outline" className="flex-1">
            View All
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
