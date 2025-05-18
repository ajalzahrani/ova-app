"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Notification, NotificationType } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/actions/notifications";

export function NotificationsView() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const result = await getUserNotifications(50); // Get more notifications on the full page
      if (result.success) {
        setNotifications(result.notifications || []);
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
  }, []);

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">
          {unreadCount > 0 && `You have ${unreadCount} unread notifications`}
        </p>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          No notifications found
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`cursor-pointer transition-colors ${
                !notification.read ? "bg-muted/50" : ""
              }`}
              onClick={() => handleNotificationClick(notification)}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base flex items-center gap-2">
                    {getNotificationIcon(notification.type)}{" "}
                    {notification.title}
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">
                    {formatNotificationTime(notification.createdAt)}
                  </span>
                </div>
                <CardDescription>{notification.type}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{notification.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
