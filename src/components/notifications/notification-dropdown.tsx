"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Notification, NotificationType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  getUserNotifications,
  markNotificationAsRead,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
} from "@/actions/notifications";

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch notifications and unread count
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const notificationsResult = await getUserNotifications(10);

      if (notificationsResult.success) {
        setNotifications(notificationsResult.notifications || []);
        setUnreadCount(notificationsResult.count || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mark a notification as read and navigate to its reference
  const handleNotificationClick = async (notification: Notification) => {
    try {
      await markNotificationAsRead(notification.id);

      // Refresh notifications
      await fetchNotifications();

      // Navigate based on notification type
      if (notification.referenceIds.length > 0) {
        switch (notification.type) {
          case NotificationType.OCCURRENCE_CREATED:
          case NotificationType.OCCURRENCE_UPDATED:
          case NotificationType.REFERRAL:
            router.push(`/occurrences/${notification.referenceIds[0]}`);
            break;
          default:
            // For other notifications - can add more cases as needed
            break;
        }
      }
    } catch (error) {
      console.error("Error handling notification click:", error);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      await fetchNotifications();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.OCCURRENCE_CREATED:
        return "🆕";
      case NotificationType.OCCURRENCE_UPDATED:
        return "🔄";
      case NotificationType.HIGH_SEVERITY:
        return "⚠️";
      case NotificationType.REFERRAL:
        return "👉";
      case NotificationType.ASSIGNMENT:
        return "📋";
      case NotificationType.FEEDBACK:
        return "💬";
      default:
        return "📣";
    }
  };

  // Format notification time
  const formatNotificationTime = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  // Initial fetch
  useEffect(() => {
    fetchNotifications();

    // Refresh notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs">
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {loading ? (
          <div className="py-4 text-center text-muted-foreground">
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-4 text-center text-muted-foreground">
            No notifications
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`flex flex-col items-start cursor-pointer p-3 gap-1 ${
                  !notification.read ? "bg-muted/50" : ""
                }`}>
                <div className="flex w-full justify-between">
                  <span className="font-medium flex items-center gap-1">
                    {getNotificationIcon(notification.type)}{" "}
                    {notification.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatNotificationTime(notification.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {notification.message}
                </p>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="justify-center text-sm font-medium"
              onClick={() => router.push("/notifications")}>
              View all
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
