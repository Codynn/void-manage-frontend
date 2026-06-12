"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Timer, Play, Square, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import {
  useCheckIn,
  useCheckOut,
  useGetCheckInHistory,
} from "@/services/api/time.api";
import { useGetUserData } from "@/services/api/user.api";
import { useQueryClient } from "@tanstack/react-query";

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const CheckInOut = () => {
  const queryClient = useQueryClient();

  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [currentSession, setCurrentSession] = useState<Date | null>(null);
  const [sessionTime, setSessionTime] = useState(0);
  const [lastCheckOutTime, setLastCheckOutTime] = useState<Date | null>(null);

  // Persist state to localStorage to avoid "disappearing" on navigation and provide instant UI
  useEffect(() => {
    const savedStatus = localStorage.getItem("is_checked_in") === "true";
    const savedStart = localStorage.getItem("session_start");
    const savedLastOut = localStorage.getItem("last_check_out");

    if (savedStatus && savedStart) {
      const startTime = new Date(savedStart);
      setIsCheckedIn(true);
      setCurrentSession(startTime);
      setSessionTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }
    if (savedLastOut) {
      setLastCheckOutTime(new Date(savedLastOut));
    }
  }, []);

  // API CALLS
  const { data: userData } = useGetUserData();
  const { mutate: checkIn, isPending: isCheckingIn } = useCheckIn();
  const { mutate: checkOut, isPending: isCheckingOut } = useCheckOut();
  const { data: checkInHistory, isLoading: isHistoryLoading } = useGetCheckInHistory(userData?.username);

  useEffect(() => {
    if (!checkInHistory) return;

    const activeSession = checkInHistory?.items?.find(item => !item.checkOutTime);
    
    if (activeSession) {
      setIsCheckedIn(true);
      const startTime = new Date(activeSession.checkInTime);
      setCurrentSession(startTime);
      // Immediately calculate the elapsed time so the timer doesn't jump from 0
      setSessionTime(Math.floor((Date.now() - startTime.getTime()) / 1000));

      localStorage.setItem("is_checked_in", "true");
      localStorage.setItem("session_start", startTime.toISOString());
    } else {
      setIsCheckedIn(false);
      setCurrentSession(null);
      setSessionTime(0);

      // Find the last completed session to show the checkout time
      const lastSession = checkInHistory?.items?.find(item => item.checkOutTime);
      if (lastSession) {
        const outDate = new Date(lastSession.checkOutTime);
        setLastCheckOutTime(outDate);
        localStorage.setItem("last_check_out", outDate.toISOString());
      }

      localStorage.removeItem("is_checked_in");
      localStorage.removeItem("session_start");
    }
  }, [checkInHistory]);

  const handleCheckIn = () => {
    checkIn(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["checkInHistory", userData?.username],
        });
      },
    });
    const now = new Date();
    setIsCheckedIn(true);
    setCurrentSession(now);
    setSessionTime(0);
    localStorage.setItem("is_checked_in", "true");
    localStorage.setItem("session_start", now.toISOString());
  };

  // Timer for current session
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCheckedIn && currentSession) {
      interval = setInterval(() => {
        setSessionTime(
          Math.floor((Date.now() - currentSession.getTime()) / 1000)
        );
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCheckedIn, currentSession]);
  const handleCheckOut = () => {
    if (currentSession) {
      const now = new Date();
      checkOut(undefined, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["checkInHistory", userData?.username],
          });
        },
      });

      setIsCheckedIn(false);
      setCurrentSession(null);
      setSessionTime(0);
      setLastCheckOutTime(now);
      localStorage.setItem("last_check_out", now.toISOString());
      localStorage.removeItem("is_checked_in");
      localStorage.removeItem("session_start");
    }
  };

  return (
    <Card className="bg-white border border-gray-300 shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-800 flex items-center gap-2">
          <Timer className="w-5 h-5" />
          Current Session
          {isHistoryLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400 ml-auto" />}
        </CardTitle>
        <CardDescription className="text-gray-600">
          {isCheckedIn
            ? "You are currently checked in"
            : `You are currently checked out${
                lastCheckOutTime
                  ? ` at ${lastCheckOutTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                  : ""
              }`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge
                className={
                  isCheckedIn
                    ? "bg-green-500 text-white"
                    : "bg-gray-400 text-white"
                }
              >
                {isCheckedIn ? "CHECKED IN" : "CHECKED OUT"}
              </Badge>
              {isCheckedIn && (
                <span className="text-gray-600 text-sm">
                  Since{" "}
                  {currentSession?.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
            {isCheckedIn && (
              <div className="text-3xl font-mono text-gray-800">
                {formatTime(sessionTime)}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {!isCheckedIn ? (
              <Button
                disabled={isCheckingIn}
                onClick={handleCheckIn}
                className="bg-green-500 hover:bg-green-600 text-white font-bold"
              >
                <Play className="w-4 h-4 mr-2" />
                {isCheckingIn ? "Checking In..." : "Check In"}
              </Button>
            ) : (
              <Button
                disabled={isCheckingOut}
                onClick={handleCheckOut}
                className="bg-red-500 hover:bg-red-600 text-white font-bold"
              >
                <Square className="w-4 h-4 mr-2" />
                {isCheckingOut ? "Checking Out..." : "Check Out"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CheckInOut;
