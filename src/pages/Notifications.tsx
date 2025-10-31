import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setNotifications(data || []);
  };

  const markAsRead = async (id: string) => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    fetchNotifications();
  };

  const markAllAsRead = async () => {
    if (!user) return;

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    fetchNotifications();
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"></div>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              Notifications
            </h1>
            <p className="text-gray-300 text-lg">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : "You're all caught up!"}
            </p>
          </div>

          {unreadCount > 0 && (
            <Button variant="secondary" onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`bg-slate-900/80 border-slate-700 backdrop-blur-sm shadow-lg transition-all hover:border-purple-500 ${
                !notification.is_read ? "border-purple-500/50" : ""
              }`}
            >
              <CardHeader>
                <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 mb-4 rounded-full"></div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg text-white">{notification.title}</CardTitle>
                      {!notification.is_read && (
                        <Badge className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/30">
                          New
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-gray-400">
                      {format(new Date(notification.created_at), "MMM dd, yyyy 'at' hh:mm a")}
                    </CardDescription>
                  </div>
                  {!notification.is_read && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => markAsRead(notification.id)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">{notification.message}</p>
                {notification.link && (
                  <Button size="sm" variant="secondary" asChild>
                    <Link to={notification.link}>
                      <ExternalLink className="h-3 w-3 mr-2" />
                      View Details
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-white">No notifications yet</h3>
            <p className="text-gray-400">
              We'll notify you when there's something new
            </p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
