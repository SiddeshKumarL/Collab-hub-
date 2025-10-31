import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { BookOpen, Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";

export default function Skills() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<any[]>([]);
  const [userSkills, setUserSkills] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<any>(null);
  const [skillType, setSkillType] = useState<"TEACH" | "LEARN">("LEARN");
  const [proficiency, setProficiency] = useState<string>("BEGINNER");

  useEffect(() => {
    fetchSkills();
    fetchUserSkills();
  }, [user]);

  const fetchSkills = async () => {
    const { data } = await supabase
      .from("skills")
      .select("*")
      .order("name", { ascending: true });
    setSkills(data || []);
  };

  const fetchUserSkills = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_skills")
      .select("*, skills(*)")
      .eq("user_id", user.id);
    setUserSkills(data || []);
  };


  const handleAddSkill = async () => {
    if (!user || !selectedSkill) return;

    try {
      const { error } = await supabase.from("user_skills").insert({
        user_id: user.id,
        skill_id: selectedSkill.id,
        skill_type: skillType,
        proficiency: proficiency as any,
      });

      if (error) throw error;

      toast({
        title: "Skill added!",
        description: `${selectedSkill.name} added to your ${skillType.toLowerCase()} skills.`,
      });
      fetchUserSkills();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredSkills = skills.filter((skill) =>
    skill.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "BEGINNER": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "INTERMEDIATE": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "ADVANCED": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "EXPERT": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-secondary";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"></div>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              Skills
            </h1>
            <p className="text-gray-300 text-lg">
              Discover and add skills to your profile
            </p>
          </div>
          <Link to="/courses">
            <Button variant="secondary" size="lg">
              View All Courses
            </Button>
          </Link>
        </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search skills..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

        {/* My Skills */}
        {userSkills.length > 0 && (
          <Card className="bg-slate-900/80 border-slate-700 backdrop-blur-sm shadow-2xl">
            <CardHeader className="border-b border-slate-700">
              <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 mb-4 rounded-full"></div>
              <CardTitle className="text-white text-2xl">My Skills</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userSkills.map((userSkill) => (
                  <div
                    key={userSkill.id}
                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:bg-slate-800 transition-all"
                  >
                    <div>
                      <h3 className="font-semibold text-white">{userSkill.skills.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {userSkill.skill_type}
                        </Badge>
                        <Badge className="text-xs">{userSkill.proficiency}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Skills */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((skill) => (
            <Card
              key={skill.id}
              className="bg-slate-900/80 border-slate-700 backdrop-blur-sm hover:border-purple-500 transition-all group shadow-lg"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <BookOpen className="h-5 w-5 text-cyan-400" />
                  {skill.name}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-gray-400">
                  {skill.description}
                </CardDescription>
              </CardHeader>
            <CardContent className="space-y-4">
              <Badge className={getDifficultyColor(skill.difficulty)}>
                {skill.difficulty}
              </Badge>

              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => setSelectedSkill(skill)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Skill
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add {selectedSkill?.name}</DialogTitle>
                      <DialogDescription>
                        Choose whether you want to teach or learn this skill
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={skillType} onValueChange={(v) => setSkillType(v as any)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TEACH">Teach</SelectItem>
                            <SelectItem value="LEARN">Learn</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Proficiency</Label>
                        <Select value={proficiency} onValueChange={setProficiency}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BEGINNER">Beginner</SelectItem>
                            <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                            <SelectItem value="ADVANCED">Advanced</SelectItem>
                            <SelectItem value="EXPERT">Expert</SelectItem>
                            <SelectItem value="MASTER">Master</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button variant="hero" onClick={handleAddSkill} className="w-full">
                        Add to My Skills
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
