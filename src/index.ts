import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user's skills
    const { data: userSkills } = await supabase
      .from("user_skills")
      .select("skill_id, skills(name)")
      .eq("user_id", user.id);

    // Get all courses
    const { data: allCourses } = await supabase
      .from("courses")
      .select("*, skills(name)")
      .limit(50);

    if (!allCourses || allCourses.length === 0) {
      return new Response(
        JSON.stringify({ recommendations: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare user skill names
    const userSkillNames = userSkills?.map((us: any) => us.skills?.name).filter(Boolean) || [];

    // Use AI to recommend courses
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a course recommendation assistant. Based on user's skills, recommend relevant courses from the provided list. Return JSON array with course IDs and brief reasons.",
          },
          {
            role: "user",
            content: `User has these skills: ${userSkillNames.join(", ") || "No skills yet"}
            
Available courses:
${allCourses.map((c: any) => `ID: ${c.id}, Title: ${c.title}, Skill: ${c.skills?.name}, Description: ${c.description}`).join("\n")}

Return top 5 recommended courses as JSON array with format: [{"course_id": "uuid", "reason": "why this course"}]`,
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      console.error("AI API error:", await aiResponse.text());
      
      // Fallback: Return random courses
      const shuffled = [...allCourses].sort(() => 0.5 - Math.random());
      return new Response(
        JSON.stringify({ 
          recommendations: shuffled.slice(0, 5).map((c: any) => ({
            ...c,
            reason: "Recommended for skill development",
          }))
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const aiText = aiData.choices?.[0]?.message?.content || "[]";
    
    // Extract JSON from AI response
    let recommendedIds: Array<{ course_id: string; reason: string }> = [];
    try {
      const jsonMatch = aiText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        recommendedIds = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("Failed to parse AI response:", e);
    }

    // Match recommendations with full course data
    const recommendations = recommendedIds
      .map((rec: any) => {
        const course = allCourses.find((c: any) => c.id === rec.course_id);
        return course ? { ...course, reason: rec.reason } : null;
      })
      .filter(Boolean)
      .slice(0, 5);

    // If no AI recommendations, return random courses
    if (recommendations.length === 0) {
      const shuffled = [...allCourses].sort(() => 0.5 - Math.random());
      return new Response(
        JSON.stringify({ 
          recommendations: shuffled.slice(0, 5).map((c: any) => ({
            ...c,
            reason: "Recommended for you",
          }))
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ recommendations }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
