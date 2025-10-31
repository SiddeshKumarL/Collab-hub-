import { apiService } from './api.service';
import { API_ENDPOINTS } from '@/config/api.config';

export interface Team {
  id: string;
  name: string;
  topic: string;
  description?: string;
  capacity: number;
  owner_id: string;
  is_active: boolean;
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role_name: string;
  pitch?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  created_at: string;
}

export interface CreateTeamData {
  name: string;
  topic: string;
  description?: string;
  capacity: number;
}

export interface ApplyToTeamData {
  team_id: string;
  role_name: string;
  pitch?: string;
}

class TeamsService {
  async getAllTeams() {
    return apiService.get<Team[]>(API_ENDPOINTS.TEAMS);
  }

  async getTeamById(id: string) {
    return apiService.get<Team>(`${API_ENDPOINTS.TEAMS}/${id}`);
  }

  async createTeam(data: CreateTeamData) {
    return apiService.post<Team>(API_ENDPOINTS.TEAMS, data);
  }

  async updateTeam(id: string, data: Partial<Team>) {
    return apiService.put<Team>(`${API_ENDPOINTS.TEAMS}/${id}`, data);
  }

  async deleteTeam(id: string) {
    return apiService.delete(`${API_ENDPOINTS.TEAMS}/${id}`);
  }

  async applyToTeam(data: ApplyToTeamData) {
    return apiService.post<TeamMember>(API_ENDPOINTS.TEAM_MEMBERS, data);
  }

  async getTeamMembers(teamId: string) {
    return apiService.get<TeamMember[]>(`${API_ENDPOINTS.TEAM_MEMBERS}?teamId=${teamId}`);
  }

  async updateMemberStatus(memberId: string, status: 'ACCEPTED' | 'REJECTED') {
    return apiService.patch<TeamMember>(`${API_ENDPOINTS.TEAM_MEMBERS}/${memberId}`, { status });
  }
}

export const teamsService = new TeamsService();
