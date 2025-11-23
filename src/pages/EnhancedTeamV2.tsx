// src/pages/EnhancedTeamV2.tsx
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AnimatedCard, GlowCard } from "@/components/ui/animated-card";
import { StatsCard } from "@/components/ui/stats-card";
import { PremiumLandscapeGrid } from "@/components/ui/premium-landscape-card";
import { CompactIDCardGrid } from "@/components/ui/compact-id-card";
import { LoadingSpinnerOverlay } from "@/components/ui/loading-spinner";
import { AddEmployeeModal } from "@/components/ui/add-employee-modal";
import { EditEmployeeModal } from "@/components/ui/edit-employee-modal";
import { AdminOnly } from "@/components/ui/admin-only";
import { SEO } from "@/components/SEO";
import Navbar from "@/components/Navbar";
import { ExportIdCardsButton } from "@/components/ExportIdCardsButton";
import { employees, departments } from "@/data/employees";
import { db } from "@/lib/db";
import { githubPhotoService } from "@/services/githubPhotoService";
import { 
  Users, Search, Filter, Award, MapPin, Calendar, Video,
  Star, Plus, Grid, List, Building2, UserCheck, TrendingUp,
  Eye, MessageSquare, Briefcase, Activity, RefreshCw, Upload, Edit
} from "lucide-react";
import { cn } from "@/lib/utils";

const EnhancedTeamV2 = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [teamMembers, setTeamMembers] = useState(employees);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  // Load from database
  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Loading team members from database...');
      
      // For now, let's use the static employees data to test photo display
      console.log('✅ Using static employees data for testing');
      setTeamMembers(employees);
      
      /* Commented out database loading for debugging
      const dbEmployees = await db.employees.getAll();
      console.log('✅ Loaded employees:', dbEmployees.length);
      
      if (dbEmployees && dbEmployees.length > 0) {
        const mappedEmployees = dbEmployees.map(emp => {
          // Use the GitHub photo service for consistent photo handling
          const avatarUrl = emp.avatar_url || emp.avatar;
          
          return {
            ...emp,
            employeeId: emp.employee_id,
            joinDate: emp.join_date,
            avatar: avatarUrl,
            avatar_url: avatarUrl,
            cardColor: emp.card_color
          };
        });
        console.log('📋 Mapped employees:', mappedEmployees.length);
        setTeamMembers(mappedEmployees);
      } else {
        console.log('⚠️ No employees in database, using fallback data');
        setTeamMembers(employees);
      }
      */
    } catch (error) {
      console.error('❌ Error loading team members:', error);
      // Fallback to static data
      setTeamMembers(employees);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadTeamMembers();
    setIsRefreshing(false);
  };

  const handlePhotoUpdate = async (employeeId: string, file: File) => {
    try {
      console.log('📸 Uploading photo for employee:', employeeId);
      const result = await photoUploadService.uploadPhoto(employeeId, file);
      
      if (result.success && result.url) {
        console.log('✅ Photo uploaded successfully:', result.url);
        
        // Update local state immediately
        setTeamMembers(prev => prev.map(emp => 
          emp.id === employeeId ? { 
            ...emp, 
            avatar: result.url, 
            avatar_url: result.url 
          } : emp
        ));
        
        // Update database
        await db.employees.update(employeeId, { 
          avatar_url: result.url 
        });
        
        // Reload from database to ensure consistency
        await loadTeamMembers();
      } else {
        console.error('❌ Photo upload failed:', result);
      }
    } catch (error) {
      console.error('❌ Photo update error:', error);
    }
  };

  const handleEditEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setShowEditModal(true);
  };

  const handleSaveEmployee = async (updatedEmployee: any) => {
    try {
      console.log('💾 Saving employee:', updatedEmployee);
      const result = await db.employees.update(updatedEmployee.id, updatedEmployee);
      console.log('✅ Update result:', result);
      
      // Add cache busting to the avatar URL for immediate display
      let avatarUrl = updatedEmployee.avatar || updatedEmployee.avatar_url;
      if (avatarUrl && avatarUrl.includes('cloudinary.com')) {
        const timestamp = Date.now();
        avatarUrl = avatarUrl.includes('?') 
          ? `${avatarUrl}&t=${timestamp}` 
          : `${avatarUrl}?t=${timestamp}`;
      }
      
      // Immediately update local state for instant UI feedback
      setTeamMembers(prev => prev.map(emp => 
        emp.id === updatedEmployee.id ? {
          ...emp,
          ...updatedEmployee,
          employeeId: updatedEmployee.employeeId || emp.employeeId,
          joinDate: updatedEmployee.joinDate || emp.joinDate,
          avatar: avatarUrl,
          avatar_url: avatarUrl
        } : emp
      ));
      
      // Close modal first for better UX
      setShowEditModal(false);
      setSelectedEmployee(null);
      
      // Force immediate re-render by updating state
      setTeamMembers(prev => [...prev]);
      
      // Reload from database in background to ensure consistency
      setTimeout(() => {
        loadTeamMembers();
      }, 100);
    } catch (error) {
      console.error('❌ Error updating employee:', error);
      throw error;
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      await db.employees.delete(id);
      await loadTeamMembers();
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  };

  // Filter team members
  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = 
      selectedDepartment === "all" || member.department === selectedDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  // Calculate stats
  const stats = {
    total: teamMembers.length,
    available: teamMembers.filter(m => m.availability === 'available').length,
    totalVideos: teamMembers.reduce((sum, m) => sum + m.stats.videos, 0),
    avgRating: (teamMembers.reduce((sum, m) => sum + m.stats.rating, 0) / teamMembers.length).toFixed(1)
  };

  // Function to render avatar with GitHub photo service
  const renderAvatar = (member: any) => {
    const avatarProps = githubPhotoService.getAvatarProps(member);
    
    if (avatarProps.src) {
      return (
        <img 
          key={avatarProps.src}
          src={avatarProps.src}
          alt={avatarProps.alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.warn(`❌ Failed to load image: ${avatarProps.src}`);
            // Fallback to initials if image fails to load
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling!.style.display = 'flex';
          }}
        />
      );
    } else {
      // Fallback to initials
      return null;
    }
  };

  return (
    <>
      <SEO 
        title="Our Team"
        description="Meet the talented team behind TOMO Academy. Experienced developers, designers, and content creators."
        keywords={['team', 'staff', 'employees', 'about us', 'meet the team']}
        url="/team"
      />
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <LoadingSpinnerOverlay isLoading={isLoading}>
          <div className="pt-24 px-4 pb-12 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Team Directory
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Meet our talented team of creators and developers
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                    Refresh
                  </Button>
                  <ExportIdCardsButton employees={filteredMembers} />
                  <Button 
                    className="bg-primary hover:bg-primary-hover shadow-glow gap-2"
                    onClick={() => setShowAddModal(true)}
                  >
                    <Plus className="w-4 h-4" />
                    Add Member
                  </Button>
                </div>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                  title="Total Members"
                  value={stats.total}
                  icon={Users}
                  iconColor="text-primary"
                  iconBgColor="bg-primary/10"
                />
                <StatsCard
                  title="Available Now"
                  value={stats.available}
                  icon={UserCheck}
                  iconColor="text-success"
                  iconBgColor="bg-success/10"
                />
                <StatsCard
                  title="Total Videos"
                  value={stats.totalVideos}
                  icon={Video}
                  iconColor="text-accent"
                  iconBgColor="bg-accent/10"
                />
                <StatsCard
                  title="Avg Rating"
                  value={stats.avgRating}
                  icon={Star}
                  iconColor="text-warning"
                  iconBgColor="bg-warning/10"
                  suffix="/5"
                />
              </div>

              {/* Filters & Search */}
              <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, role, or email..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Department Filter */}
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={selectedDepartment === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDepartment("all")}
                    >
                      All
                    </Button>
                    {Object.keys(departments).map((dept) => (
                      <Button
                        key={dept}
                        variant={selectedDepartment === dept ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedDepartment(dept)}
                      >
                        {dept}
                      </Button>
                    ))}
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex gap-1 border rounded-lg p-1">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="h-8 w-8 p-0"
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="h-8 w-8 p-0"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Results Count */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredMembers.length} of {teamMembers.length} members
                </p>
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery("")}
                  >
                    Clear search
                  </Button>
                )}
              </div>

              {/* Team Members Display */}
              {viewMode === 'grid' ? (
                <CompactIDCardGrid 
                  employees={filteredMembers}
                  onPhotoUpdate={handlePhotoUpdate}
                  onEdit={handleEditEmployee}
                />
              ) : (
                <div className="space-y-4">
                  {filteredMembers.map((member) => (
                    <AnimatedCard key={member.id} hoverEffect="lift">
                      <div className="p-6 flex items-center gap-6">
                        {/* Avatar */}
                        <div className="relative group">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl border-4 border-white shadow-lg overflow-hidden">
                            {renderAvatar(member)}
                            <span className={!githubPhotoService.getEmployeePhotoUrl(member) ? '' : 'hidden'}>
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className={cn(
                            "absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white",
                            member.availability === 'available' && "bg-success",
                            member.availability === 'busy' && "bg-warning",
                            member.availability === 'offline' && "bg-muted"
                          )} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg">{member.name}</h3>
                            <Badge variant="outline">{member.employeeId}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{member.role}</p>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {member.department}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {member.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Since {new Date(member.joinDate).getFullYear()}
                            </span>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="hidden md:flex gap-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">{member.stats.videos}</div>
                            <div className="text-xs text-muted-foreground">Videos</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-accent">{member.stats.tasks}</div>
                            <div className="text-xs text-muted-foreground">Tasks</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-warning">{member.stats.rating}</div>
                            <div className="text-xs text-muted-foreground">Rating</div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/profile/${member.id}`, '_blank')}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </AnimatedCard>
                  ))}
                </div>
              )}

              {/* No Results */}
              {filteredMembers.length === 0 && (
                <Card className="p-12 text-center">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-bold mb-2">No team members found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search or filters
                  </p>
                  <Button onClick={() => {
                    setSearchQuery("");
                    setSelectedDepartment("all");
                  }}>
                    Clear Filters
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </LoadingSpinnerOverlay>

        {/* Add Employee Modal */}
        <AddEmployeeModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onEmployeeAdded={(newEmployee) => {
            setTeamMembers(prev => [newEmployee, ...prev]);
            loadTeamMembers(); // Refresh from database
          }}
        />

        {/* Edit Employee Modal */}
        {selectedEmployee && (
          <EditEmployeeModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedEmployee(null);
            }}
            employee={selectedEmployee}
            onSave={handleSaveEmployee}
            onDelete={handleDeleteEmployee}
          />
        )}
      </div>
    </>
  );
};

export default EnhancedTeamV2;
