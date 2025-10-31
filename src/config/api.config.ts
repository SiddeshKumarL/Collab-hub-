// API Configuration
// Update this URL to point to your Java Spring Boot backend
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    RESET_PASSWORD: '/auth/reset-password',
    ME: '/auth/me',
  },
  // Teams
  TEAMS: '/teams',
  TEAM_MEMBERS: '/team-members',
  TEAM_ROLES: '/team-roles',
  // Profiles
  PROFILES: '/profiles',
  // Notifications
  NOTIFICATIONS: '/notifications',
  // Skills
  SKILLS: '/skills',
  USER_SKILLS: '/user-skills',
  // Courses
  COURSES: '/courses',
  // Events
  EVENTS: '/events',
  // Mentors
  MENTORS: '/mentors',
  MENTOR_FOLLOWS: '/mentor-follows',
  // User Roles
  USER_ROLES: '/user-roles',
};
