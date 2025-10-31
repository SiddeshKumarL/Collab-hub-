import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ExternalLink, BookOpen, Clock, Award } from "lucide-react";

export default function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<string>("all");

  useEffect(() => {
    fetchSkills();
    fetchCourses();
  }, []);

  const fetchSkills = async () => {
    const { data } = await supabase
      .from("skills")
      .select("*")
      .order("name", { ascending: true });
    setSkills(data || []);
  };

  const fetchCourses = async () => {
    const { data } = await supabase
      .from("courses")
      .select("*, skills(*)");
    setCourses(data || []);
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.platform.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSkill = selectedSkill === "all" || course.skill_id === selectedSkill;
    return matchesSearch && matchesSkill;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"></div>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              Courses
            </h1>
            <p className="text-gray-300 text-lg">
              Browse all available courses to enhance your skills
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900/50 border-slate-700 text-white"
            />
          </div>
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="bg-slate-900/50 border border-slate-700 text-white rounded-md px-3 py-2"
          >
            <option value="all">All Skills</option>
            {skills.map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.name}
              </option>
            ))}
          </select>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <Card
                key={course.id}
                className="bg-slate-900/80 border-slate-700 backdrop-blur-sm hover:border-purple-500 transition-all group shadow-lg"
              >
                <CardHeader>
                  <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 mb-4 rounded-full"></div>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <BookOpen className="h-5 w-5 text-cyan-400" />
                    {course.title}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {course.description || "No description available"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                      {course.platform}
                    </Badge>
                    {course.skills && (
                      <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                        {course.skills.name}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    {course.estimated_hours && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-cyan-400" />
                        <span>{course.estimated_hours}h</span>
                      </div>
                    )}
                    {course.has_certificate && (
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4 text-yellow-400" />
                        <span>Certificate</span>
                      </div>
                    )}
                  </div>

                  <a
                    href={course.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="secondary"
                      className="w-full group-hover:bg-purple-600 group-hover:text-white transition-all"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Course
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">No courses found</h3>
              <p className="text-gray-400">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
