import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { UserPlus, UserCheck, Github, Linkedin, Mail } from "lucide-react";

export default function Mentors() {
  const { user } = useAuth();
  const [mentors, setMentors] = useState<any[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchMentors();
    fetchFollowing();
  }, [user]);

  const fetchMentors = async () => {
    // Get users with MENTOR role
    const { data: mentorRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "MENTOR");

    if (!mentorRoles) return;

    const mentorIds = mentorRoles.map((r) => r.user_id);

    // Get profiles and their teaching skills
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*, user_skills(*, skills(*))")
      .in("id", mentorIds);

    setMentors(profiles || []);
  };

  const fetchFollowing = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("mentor_follows")
      .select("mentor_id")
      .eq("follower_id", user.id);

    setFollowing(new Set(data?.map((f) => f.mentor_id) || []));
  };

  const handleFollow = async (mentorId: string) => {
    if (!user) return;

    try {
      if (following.has(mentorId)) {
        await supabase
          .from("mentor_follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("mentor_id", mentorId);

        setFollowing((prev) => {
          const next = new Set(prev);
          next.delete(mentorId);
          return next;
        });

        toast({ title: "Unfollowed mentor" });
      } else {
        await supabase.from("mentor_follows").insert({
          follower_id: user.id,
          mentor_id: mentorId,
        });

        setFollowing((prev) => new Set(prev).add(mentorId));

        // Create notification for mentor
        await supabase.from("notifications").insert({
          user_id: mentorId,
          title: "New Follower",
          message: "Someone started following you!",
          link: `/profile/${user.id}`,
        });

        toast({ title: "Following mentor!" });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"></div>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            Find Mentors
          </h1>
          <p className="text-gray-300 text-lg">
            Connect with experienced mentors to accelerate your learning
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((mentor) => {
            const teachingSkills = mentor.user_skills?.filter(
              (s: any) => s.skill_type === "TEACH"
            ) || [];

            return (
              <Card
                key={mentor.id}
                className="bg-slate-900/80 border-slate-700 backdrop-blur-sm hover:border-purple-500 transition-all shadow-lg"
              >
                <CardHeader className="border-b border-slate-700">
                  <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 mb-4 rounded-full"></div>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-2 border-purple-500">
                      <AvatarImage src={mentor.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-cyan-500 text-white">
                        {getInitials(mentor.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-xl text-white">{mentor.full_name}</CardTitle>
                      <CardDescription className="mt-1 text-gray-400">
                        {teachingSkills.length} skills taught
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-6">
                  {mentor.bio && (
                    <p className="text-sm text-gray-300 line-clamp-3">
                      {mentor.bio}
                    </p>
                  )}

                <div className="flex flex-wrap gap-2">
                  {teachingSkills.slice(0, 3).map((userSkill: any) => (
                    <Badge key={userSkill.id} variant="secondary" className="text-xs">
                      {userSkill.skills?.name}
                    </Badge>
                  ))}
                  {teachingSkills.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{teachingSkills.length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {mentor.linkedin_url && (
                    <Button size="icon" variant="ghost" asChild>
                      <a href={mentor.linkedin_url} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {mentor.github_url && (
                    <Button size="icon" variant="ghost" asChild>
                      <a href={mentor.github_url} target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>

                <Button
                  variant={following.has(mentor.id) ? "secondary" : "hero"}
                  className="w-full"
                  onClick={() => handleFollow(mentor.id)}
                >
                  {following.has(mentor.id) ? (
                    <>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Follow
                    </>
                  )}
                </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {mentors.length === 0 && (
          <div className="text-center py-12">
            <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-white">No mentors yet</h3>
            <p className="text-gray-300">
              Check back later or become a mentor yourself!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
