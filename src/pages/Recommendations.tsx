import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ExternalLink, Sparkles, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CourseRecommendation {
  id: string;
  title: string;
  description: string;
  platform: string;
  link: string;
  estimated_hours: number;
  has_certificate: boolean;
  reason?: string;
  skills?: { name: string };
}

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState<CourseRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("course-recommendations");

      if (error) throw error;

      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      toast({
        title: "Error",
        description: "Failed to load course recommendations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"></div>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 flex items-center gap-2">
              <Sparkles className="h-10 w-10" />
              AI Course Recommendations
            </h1>
            <p className="text-gray-300 text-lg">
              Personalized course suggestions based on your skills and interests
            </p>
          </div>
          <Button onClick={fetchRecommendations} disabled={loading}>
            Refresh Recommendations
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-slate-900/80 border-slate-700 animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
              </Card>
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-white">No recommendations yet</h3>
            <p className="text-gray-300">
              Add some skills to your profile to get personalized course recommendations!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recommendations.map((course) => (
              <Card
                key={course.id}
                className="bg-slate-900/80 border-slate-700 backdrop-blur-sm hover:border-purple-500 transition-all shadow-lg"
              >
                <CardHeader className="border-b border-slate-700">
                  <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 mb-4 rounded-full"></div>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2 text-white">{course.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Badge variant="secondary">{course.platform}</Badge>
                        {course.skills && (
                          <Badge variant="outline">{course.skills.name}</Badge>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-6">
                  {course.reason && (
                    <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                      <p className="text-sm flex items-start gap-2 text-white">
                        <Sparkles className="h-4 w-4 mt-0.5 text-cyan-400 flex-shrink-0" />
                        <span>{course.reason}</span>
                      </p>
                    </div>
                  )}

                  <p className="text-gray-300">{course.description}</p>

                <div className="flex flex-wrap gap-2">
                  {course.estimated_hours && (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {course.estimated_hours}h
                    </Badge>
                  )}
                  {course.has_certificate && (
                    <Badge variant="outline" className="text-xs">
                      Certificate Available
                    </Badge>
                  )}
                </div>

                <Button variant="default" className="w-full" asChild>
                  <a
                    href={course.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Course
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
