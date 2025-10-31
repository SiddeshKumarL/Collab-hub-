import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Trophy, TrendingUp, Target, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    teachingSkills: 0,
    learningSkills: 0,
    teams: 0,
    upcomingEvents: 0,
  });
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    setProfile(profileData);

    // Fetch user skills
    const { data: userSkills } = await supabase
      .from("user_skills")
      .select("*, skills(*)")
      .eq("user_id", user.id);

    const teachCount = userSkills?.filter((s) => s.skill_type === "TEACH").length || 0;
    const learnCount = userSkills?.filter((s) => s.skill_type === "LEARN").length || 0;

    // Fetch user teams
    const { data: teamMembers } = await supabase
      .from("team_members")
      .select("*")
      .eq("user_id", user.id);

    // Fetch upcoming events
    const { data: events } = await supabase
      .from("events")
      .select("*")
      .gte("start_date", new Date().toISOString())
      .order("start_date", { ascending: true })
      .limit(3);

    setStats({
      teachingSkills: teachCount,
      learningSkills: learnCount,
      teams: teamMembers?.length || 0,
      upcomingEvents: events?.length || 0,
    });

    // Get course recommendations based on learning skills
    const learningSkillIds = userSkills
      ?.filter((s) => s.skill_type === "LEARN")
      .map((s) => s.skill_id) || [];

    if (learningSkillIds.length > 0) {
      const { data: courses } = await supabase
        .from("courses")
        .select("*, skills(*)")
        .in("skill_id", learningSkillIds)
        .limit(4);
      setRecommendations(courses || []);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <div className="gradient-hero rounded-2xl p-8 shadow-glow relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
        <div className="relative">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {profile?.full_name || "Student"}! 👋
          </h1>
          <p className="text-white/80 text-lg">
            Ready to continue your learning journey?
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="gradient-card border-white/10 transition-smooth hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Teaching Skills
            </CardTitle>
            <Target className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">{stats.teachingSkills}</div>
          </CardContent>
        </Card>

        <Card className="gradient-card border-white/10 transition-smooth hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Learning Skills
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.learningSkills}</div>
          </CardContent>
        </Card>

        <Card className="gradient-card border-white/10 transition-smooth hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Teams
            </CardTitle>
            <Users className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{stats.teams}</div>
          </CardContent>
        </Card>

        <Card className="gradient-card border-white/10 transition-smooth hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming Events
            </CardTitle>
            <Trophy className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">{stats.upcomingEvents}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Courses */}
      <Card className="bg-slate-900/80 border-slate-700 backdrop-blur-sm shadow-2xl">
        <CardHeader className="border-b border-slate-700">
          <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 mb-4 rounded-full"></div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            <CardTitle className="text-white">Recommended for You</CardTitle>
          </div>
          <CardDescription className="text-gray-300">Courses matching your learning goals</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((course) => (
                <Card key={course.id} className="bg-slate-800/50 border-slate-700 hover:border-purple-500 transition-all">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">{course.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Badge variant="secondary">{course.skills?.name}</Badge>
                      <span className="text-xs text-gray-400">{course.platform}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-gray-300">{course.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {course.estimated_hours}h • {course.has_certificate ? "Certificate" : "No certificate"}
                      </span>
                      <Button size="sm" variant="secondary" asChild>
                        <a href={course.link} target="_blank" rel="noopener noreferrer">
                          Enroll
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 space-y-6">
              <BookOpen className="h-16 w-16 text-cyan-400 mx-auto" />
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-white">
                  Discover New Skills
                </h3>
                <p className="text-gray-300 text-lg max-w-md mx-auto">
                  Add learning skills to your profile and unlock personalized course recommendations powered by AI
                </p>
              </div>
              <Button 
                variant="default" 
                size="lg" 
                asChild 
                className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white border-0"
              >
                <Link to="/skills" className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Browse Skills
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900/80 border-slate-700 backdrop-blur-sm hover:border-purple-500 transition-all shadow-lg group cursor-pointer">
          <Link to="/skills">
            <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="p-4 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/20 group-hover:from-purple-500/30 group-hover:to-purple-600/30 transition-all">
                <BookOpen className="h-8 w-8 text-purple-400" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg text-white">Explore Skills</h3>
                <p className="text-sm text-gray-300">Discover new skills to learn</p>
              </div>
            </CardContent>
          </Link>
        </Card>
        
        <Card className="bg-slate-900/80 border-slate-700 backdrop-blur-sm hover:border-cyan-500 transition-all shadow-lg group cursor-pointer">
          <Link to="/mentors">
            <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="p-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 group-hover:from-cyan-500/30 group-hover:to-cyan-600/30 transition-all">
                <Users className="h-8 w-8 text-cyan-400" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg text-white">Find Mentors</h3>
                <p className="text-sm text-gray-300">Connect with experienced mentors</p>
              </div>
            </CardContent>
          </Link>
        </Card>
        
        <Card className="bg-slate-900/80 border-slate-700 backdrop-blur-sm hover:border-pink-500 transition-all shadow-lg group cursor-pointer">
          <Link to="/teams">
            <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="p-4 rounded-full bg-gradient-to-br from-pink-500/20 to-pink-600/20 group-hover:from-pink-500/30 group-hover:to-pink-600/30 transition-all">
                <Trophy className="h-8 w-8 text-pink-400" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg text-white">Join Teams</h3>
                <p className="text-sm text-gray-300">Collaborate on projects</p>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
