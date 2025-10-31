import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Users, Send } from "lucide-react";

interface TeamCardProps {
  team: any;
  onApply: (teamId: string, pitch: string, closeDialog: () => void) => void;
}

export default function TeamCard({ team, onApply }: TeamCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card
      className="bg-slate-900/80 border-slate-700 backdrop-blur-sm hover:border-purple-500 transition-all shadow-lg"
    >
      <CardHeader className="border-b border-slate-700">
        <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 mb-4 rounded-full"></div>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl text-white">{team.name}</CardTitle>
            <CardDescription className="mt-1 text-gray-400">
              by {team.profiles?.full_name}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-xs">
            {team.topic}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        <p className="text-sm text-gray-300 line-clamp-3">
          {team.description}
        </p>

        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Users className="h-4 w-4" />
          <span>
            {team.team_members?.[0]?.count || 0} / {team.capacity} members
          </span>
        </div>

        {team.team_roles && team.team_roles.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-400">Open Roles:</p>
            <div className="flex flex-wrap gap-2">
              {team.team_roles.map((role: any) => (
                <Badge key={role.id} variant="outline" className="text-xs">
                  {role.role_name} ({role.required_count})
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Apply
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Apply to {team.name}</DialogTitle>
              <DialogDescription>
                Tell the team why you'd be a great fit
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const pitch = (e.currentTarget.elements.namedItem("pitch") as HTMLTextAreaElement).value;
                onApply(team.id, pitch, () => setIsOpen(false));
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="pitch">Your Pitch</Label>
                <Textarea
                  id="pitch"
                  name="pitch"
                  placeholder="Explain your skills, experience, and why you want to join..."
                  required
                  rows={5}
                />
              </div>
              <Button type="submit" variant="hero" className="w-full">
                Send Application
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
