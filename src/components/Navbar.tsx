import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationDropdown } from "@/components/ui/notifications";
import UserSessionStatus from "./UserSessionStatus";
import HeaderClock from "./HeaderClock";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, Youtube, Shield, LogOut, User, Monitor } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAdmin } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center overflow-hidden shadow-lg ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all p-1">
              <img 
                src="/logo.png" 
                alt="TOMO Academy" 
                className="w-full h-full object-cover rounded-full" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="w-6 h-6 text-primary"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg></div>';
                  }
                }} 
              />
            </div>
            <span className="text-xl font-bold">TOMO Academy</span>
          </Link>

          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            {isAdmin && (
              <>
                <Link to="/admin" className="text-primary hover:text-primary/80 transition-colors font-semibold flex items-center gap-1 px-2 py-1 rounded-md hover:bg-primary/10">
                  <Shield className="w-4 h-4" />
                  <span className="hidden lg:inline">Admin</span>
                </Link>
                <Link to="/admin/site-monitoring" className="text-primary hover:text-primary/80 transition-colors font-semibold flex items-center gap-1 px-2 py-1 rounded-md hover:bg-primary/10">
                  <Monitor className="w-4 h-4" />
                  <span className="hidden lg:inline">Site Visitors</span>
                </Link>
                <Link to="/admin/monitoring" className="text-primary hover:text-primary/80 transition-colors font-semibold flex items-center gap-1 px-2 py-1 rounded-md hover:bg-primary/10">
                  <Shield className="w-4 h-4" />
                  <span className="hidden lg:inline">Admin Security</span>
                </Link>
              </>
            )}
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-fast">
              Dashboard
            </Link>
            <Link to="/team" className="text-muted-foreground hover:text-foreground transition-fast">
              Team
            </Link>
            <Link to="/videos" className="text-muted-foreground hover:text-foreground transition-fast">
              Videos
            </Link>
            <Link to="/creator-pulse" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 px-2 py-1 rounded-md hover:bg-primary/10">
              <Youtube className="w-4 h-4" />
              <span className="hidden lg:inline">Creator Pulse</span>
              <Badge variant="secondary" className="text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">AI</Badge>
            </Link>
            <Link to="/tasks" className="text-muted-foreground hover:text-foreground transition-fast">
              Tasks
            </Link>
            <Link to="/resources" className="text-muted-foreground hover:text-foreground transition-fast">
              Resources
            </Link>
            <HeaderClock className="flex-shrink-0" />
            <NotificationDropdown />
            <ThemeToggle />
            <UserSessionStatus />
          </div>

          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              className="p-2 touch-manipulation active:bg-muted rounded-md transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-border bg-background/95 backdrop-blur-lg">
            {isAdmin && (
              <>
                <Link
                  to="/admin"
                  className="block px-4 py-3 text-primary hover:text-primary/80 hover:bg-muted rounded-lg transition-colors flex items-center gap-2 font-semibold touch-manipulation"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Shield className="w-5 h-5" />
                  Admin
                </Link>
                <Link
                  to="/admin/site-monitoring"
                  className="block px-4 py-3 text-primary hover:text-primary/80 hover:bg-muted rounded-lg transition-colors flex items-center gap-2 font-semibold touch-manipulation"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Monitor className="w-4 h-4" />
                  Site Visitors
                </Link>
                <Link
                  to="/admin/monitoring"
                  className="block px-4 py-2 text-primary hover:text-primary/80 hover:bg-muted rounded-lg transition-fast flex items-center gap-2 font-semibold"
                >
                  <Shield className="w-4 h-4" />
                  Admin Security
              </Link>
            </>
            )}
            <Link
              to="/dashboard"
              className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-fast"
            >
              Dashboard
            </Link>
            <Link
              to="/team"
              className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-fast"
            >
              Team
            </Link>
            <Link
              to="/videos"
              className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-fast"
            >
              Videos
            </Link>
            <Link
              to="/creator-pulse"
              className="block px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors flex items-center gap-2 touch-manipulation"
            >
              <Youtube className="w-5 h-5" />
              Creator Pulse
              <Badge variant="secondary" className="text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">AI</Badge>
            </Link>
            <Link
              to="/tasks"
              className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-fast"
            >
              Tasks
            </Link>
            <Link
              to="/resources"
              className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-fast"
            >
              Resources
            </Link>
            <div className="px-4 py-2 border-t border-border mt-2 pt-3 flex justify-center">
              <HeaderClock />
            </div>
            <div className="px-4 space-y-2">
              <UserSessionStatus />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
