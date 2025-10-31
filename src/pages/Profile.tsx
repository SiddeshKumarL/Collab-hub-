import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { User, Save, Award } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isMentor, setIsMentor] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      checkMentorStatus();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*, user_skills(*, skills(*))")
      .eq("id", user.id)
      .single();

    setProfile(data);
  };

  const checkMentorStatus = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", user.id)
      .eq("role", "MENTOR")
      .single();

    setIsMentor(!!data);
  };

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.get("full_name") as string,
          bio: formData.get("bio") as string,
          linkedin_url: formData.get("linkedin_url") as string,
          github_url: formData.get("github_url") as string,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile updated!",
        description: "Your profile has been saved successfully.",
      });

      fetchProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMentorToggle = async (checked: boolean) => {
    if (!user) return;

    try {
      if (checked) {
        await supabase.from("user_roles").insert({
          user_id: user.id,
          role: "MENTOR",
        });
        toast({
          title: "Mentor mode activated!",
          description: "You're now visible in the mentor directory.",
        });
      } else {
        await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", user.id)
          .eq("role", "MENTOR");
        toast({
          title: "Mentor mode deactivated",
          description: "You've been removed from the mentor directory.",
        });
      }
      setIsMentor(checked);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!profile) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const teachingSkills = profile.user_skills?.filter((s: any) => s.skill_type === "TEACH") || [];
  const learningSkills = profile.user_skills?.filter((s: any) => s.skill_type === "LEARN") || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"></div>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            My Profile
          </h1>
          <p className="text-gray-300 text-lg">Manage your profile and settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="bg-slate-900/80 border-slate-700 backdrop-blur-sm shadow-lg lg:col-span-1">
            <CardHeader className="text-center border-b border-slate-700">
              <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 mb-4 rounded-full"></div>
              <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-purple-500">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-cyan-500 text-white text-2xl">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-white">{profile.full_name}</CardTitle>
              <CardDescription className="text-gray-400">{user?.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-cyan-400" />
                  <Label htmlFor="mentor-toggle" className="text-white">Mentor Mode</Label>
                </div>
                <Switch id="mentor-toggle" checked={isMentor} onCheckedChange={handleMentorToggle} />
              </div>
              <p className="text-xs text-gray-400">
                Enable mentor mode to appear in the mentor directory
              </p>
            </CardContent>
          </Card>

          {/* Edit Profile Form */}
          <Card className="bg-slate-900/80 border-slate-700 backdrop-blur-sm shadow-lg lg:col-span-2">
            <CardHeader className="border-b border-slate-700">
              <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 mb-4 rounded-full"></div>
              <CardTitle className="text-white">Edit Profile</CardTitle>
              <CardDescription className="text-gray-400">Update your public profile information</CardDescription>
            </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  defaultValue={profile.full_name}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  defaultValue={profile.bio || ""}
                  placeholder="Tell others about yourself..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                <Input
                  id="linkedin_url"
                  name="linkedin_url"
                  type="url"
                  defaultValue={profile.linkedin_url || ""}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="github_url">GitHub URL</Label>
                <Input
                  id="github_url"
                  name="github_url"
                  type="url"
                  defaultValue={profile.github_url || ""}
                  placeholder="https://github.com/username"
                />
              </div>

              <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save Profile"}
              </Button>
            </form>
            </CardContent>
          </Card>
        </div>

        {/* Skills Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-900/80 border-slate-700 backdrop-blur-sm shadow-lg">
            <CardHeader className="border-b border-slate-700">
              <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 mb-4 rounded-full"></div>
              <CardTitle className="text-white">Teaching Skills</CardTitle>
              <CardDescription className="text-gray-400">Skills you can teach others</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                {teachingSkills.length > 0 ? (
                  teachingSkills.map((userSkill: any) => (
                    <Badge key={userSkill.id} variant="secondary">
                      {userSkill.skills?.name} • {userSkill.proficiency}
                    </Badge>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No teaching skills yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border-slate-700 backdrop-blur-sm shadow-lg">
            <CardHeader className="border-b border-slate-700">
              <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 mb-4 rounded-full"></div>
              <CardTitle className="text-white">Learning Skills</CardTitle>
              <CardDescription className="text-gray-400">Skills you're currently learning</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                {learningSkills.length > 0 ? (
                  learningSkills.map((userSkill: any) => (
                    <Badge key={userSkill.id} variant="secondary">
                      {userSkill.skills?.name} • {userSkill.proficiency}
                    </Badge>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No learning skills yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
