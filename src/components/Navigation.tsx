import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Users, 
  BookOpen, 
  Trophy, 
  Bell,
  LogOut,
  User,
  Home,
  Info,
  Sparkles
} from "lucide-react";
import logo from "@/assets/logo.png";

export const Navigation = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  if (!user) return null;

  return (
    <nav className="border-b border-white/5 bg-background/80 backdrop-blur-xl sticky top-0 z-50 animate-fade-in">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src={logo} 
              alt="CollabHub" 
              className="h-10 w-10 object-contain transition-smooth group-hover:scale-110"
            />
            <span className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              COLLAB HUB
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <Button
              variant={isActive("/") ? "default" : "ghost"}
              size="sm"
              asChild
              className="transition-smooth hover:scale-105"
            >
              <Link to="/" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                <span className="hidden lg:inline">Dashboard</span>
              </Link>
            </Button>
            
            <Button
              variant={isActive("/skills") ? "default" : "ghost"}
              size="sm"
              asChild
              className="transition-smooth hover:scale-105"
            >
              <Link to="/skills" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="hidden lg:inline">Skills</span>
              </Link>
            </Button>
            
            <Button
              variant={isActive("/mentors") ? "default" : "ghost"}
              size="sm"
              asChild
              className="transition-smooth hover:scale-105"
            >
              <Link to="/mentors" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden lg:inline">Mentors</span>
              </Link>
            </Button>
            
            <Button
              variant={isActive("/teams") ? "default" : "ghost"}
              size="sm"
              asChild
              className="transition-smooth hover:scale-105"
            >
              <Link to="/teams" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden lg:inline">Teams</span>
              </Link>
            </Button>
            
            <Button
              variant={isActive("/events") ? "default" : "ghost"}
              size="sm"
              asChild
              className="transition-smooth hover:scale-105"
            >
              <Link to="/events" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                <span className="hidden lg:inline">Events</span>
              </Link>
            </Button>
            
            <Button
              variant={isActive("/recommendations") ? "default" : "ghost"}
              size="sm"
              asChild
              className="transition-smooth hover:scale-105"
            >
              <Link to="/recommendations" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="hidden lg:inline">AI Picks</span>
              </Link>
            </Button>
            
            <Button
              variant={isActive("/about") ? "default" : "ghost"}
              size="sm"
              asChild
              className="transition-smooth hover:scale-105"
            >
              <Link to="/about" className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                <span className="hidden lg:inline">About</span>
              </Link>
            </Button>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              asChild
              className="relative transition-smooth hover:scale-110"
            >
              <Link to="/notifications">
                <Bell className="h-4 w-4" />
              </Link>
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              asChild
              className="transition-smooth hover:scale-110"
            >
              <Link to="/profile">
                <User className="h-4 w-4" />
              </Link>
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={signOut}
              className="transition-smooth hover:scale-110 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
