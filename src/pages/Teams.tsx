import { useEffect, useState } from "react";
import { teamsService, Team } from "@/services/teams.service";
import { notificationsService } from "@/services/notifications.service";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Users, Plus } from "lucide-react";
import TeamCard from "@/components/TeamCard";

export default function Teams() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    const { data } = await teamsService.getAllTeams();
    setTeams(data || []);
  };

  const handleCreateTeam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const topic = formData.get("topic") as string;
    const description = formData.get("description") as string;
    const capacity = parseInt(formData.get("capacity") as string);

    try {
      const { data, error } = await teamsService.createTeam({
        name,
        topic,
        description,
        capacity,
      });

      if (error) throw new Error(error);

      toast({
        title: "Team created!",
        description: "Your team has been created successfully.",
      });

      setCreateDialogOpen(false);
      fetchTeams();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleApplyToTeam = async (teamId: string, pitch: string, closeDialog: () => void) => {
    if (!user) return;

    try {
      const { error } = await teamsService.applyToTeam({
        team_id: teamId,
        role_name: "Member",
        pitch,
      });

      if (error) throw new Error(error);

      // Get team details for notification
      const { data: team } = await teamsService.getTeamById(teamId);

      if (team) {
        await notificationsService.createNotification({
          user_id: team.owner_id,
          title: "New Team Application",
          message: `Someone applied to join ${team.name}`,
          link: `/teams/${teamId}`,
        });
      }

      toast({
        title: "Application sent!",
        description: "The team owner will review your application.",
      });

      closeDialog();
      fetchTeams();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"></div>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              Teams
            </h1>
            <p className="text-gray-300 text-lg">
              Join or create teams to collaborate on projects
            </p>
          </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero">
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Team</DialogTitle>
              <DialogDescription>
                Start a team and recruit talented members
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Team Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input id="topic" name="topic" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Team Capacity</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="2"
                  max="20"
                  defaultValue="5"
                  required
                />
              </div>
              <Button type="submit" variant="hero" className="w-full">
                Create Team
              </Button>
            </form>
          </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} onApply={handleApplyToTeam} />
          ))}
        </div>

        {teams.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-white">No active teams</h3>
            <p className="text-gray-300 mb-4">
              Be the first to create a team and start collaborating!
            </p>
            <Button variant="hero" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
