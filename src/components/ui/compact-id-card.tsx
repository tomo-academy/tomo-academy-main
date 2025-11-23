// src/components/ui/compact-id-card.tsx
import { useState } from "react";
import QRCode from "react-qr-code";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AdminOnly } from "@/components/ui/admin-only";
import { githubPhotoService } from "@/services/githubPhotoService";
import { generateProfileUrl } from "@/config/constants";
import { 
  Download, Share2, Mail, Phone, MapPin, Calendar, Star, Shield,
  Verified, Eye, Camera, Sparkles, Video, Briefcase, Globe,
  Linkedin, Twitter, Github, Instagram, ExternalLink, Edit
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CompactIDCardProps {
  employee: {
    id: string;
    name: string;
    role: string;
    department: string;
    email: string;
    phone?: string;
    employeeId: string;
    joinDate: string;
    avatar?: string;
    avatar_url?: string;
    location?: string;
    availability: 'available' | 'busy' | 'offline';
    bio?: string;
    skills?: string[];
    stats: {
      videos: number;
      tasks: number;
      rating: number;
      projects: number;
    };
    social?: {
      linkedin?: string;
      twitter?: string;
      github?: string;
      instagram?: string;
    };
  };
  onPhotoUpdate?: (file: File) => Promise<void>;
}

export function CompactIDCard({ employee, onPhotoUpdate }: CompactIDCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { toast } = useToast();

  const profileUrl = generateProfileUrl(employee.id);

  // Function to get the correct image path using GitHub photo service
  const getImagePath = (avatar?: string, avatar_url?: string) => {
    return githubPhotoService.getEmployeePhotoUrl({ avatar, avatar_url, name: employee.name });
  };

  // Function to render avatar with fallback
  const renderAvatar = () => {
    const avatarProps = githubPhotoService.getAvatarProps(employee);
    
    if (avatarProps.src && !imageError) {
      return (
        <img 
          key={avatarProps.src}
          src={avatarProps.src}
          alt={avatarProps.alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.warn(`❌ Failed to load image: ${avatarProps.src}`);
            setImageError(true);
          }}
        />
      );
    } else {
      // Fallback to initials
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-accent text-white font-bold text-2xl">
          {avatarProps.fallback}
        </div>
      );
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setImageError(false);
    
    try {
      // Validate the image
      const validation = githubPhotoService.validateImage(file);
      if (!validation.valid) {
        toast({
          title: "❌ Invalid Image",
          description: validation.error,
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      if (onPhotoUpdate) {
        await onPhotoUpdate(file);
        toast({
          title: "✅ Photo Updated",
          description: "Profile photo updated successfully!",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      toast({
        title: "❌ Upload Failed",
        description: "Failed to update photo. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadVCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${employee.name}
ORG:TOMO Academy
TITLE:${employee.role}
EMAIL:${employee.email}
 ${employee.phone ? `TEL:${employee.phone}` : ''}
 ${employee.location ? `ADR:;;${employee.location};;;;` : ''}
URL:${profileUrl}
NOTE:${employee.bio || ''}
END:VCARD`;

    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${employee.name.replace(/\s+/g, '_')}_TOMO.vcf`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "📥 Contact Downloaded",
      description: "vCard saved successfully!",
      duration: 2000,
    });
  };

  const shareProfile = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${employee.name} - TOMO Academy`,
          text: `Check out ${employee.name}'s profile`,
          url: profileUrl
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(profileUrl);
      toast({
        title: "🔗 Link Copied",
        description: "Profile link copied to clipboard!",
        duration: 2000,
      });
    }
  };

  const getAvailabilityColor = () => {
    switch (employee.availability) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const yearsSince = new Date().getFullYear() - new Date(employee.joinDate).getFullYear();

  return (
    <div className="w-full max-w-sm mx-auto perspective-1000 group/card">
      <div 
        className={cn(
          "relative w-full h-[260px] transition-all duration-700 transform-style-preserve-3d cursor-pointer",
          isFlipped && "rotate-y-180"
        )}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* FRONT SIDE - Compact Design */}
        <Card className={cn(
          "absolute inset-0 backface-hidden overflow-hidden",
          "bg-gradient-to-br from-white via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900",
          "border-2 shadow-xl hover:shadow-2xl transition-all duration-300",
          "border-primary/20"
        )}>
          {/* Decorative Elements */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent rounded-full blur-3xl" />
          </div>

          {/* Compact Header */}
          <div className="relative h-12 bg-gradient-to-r from-pink-600 via-pink-500 to-pink-600 flex items-center justify-between px-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-md p-1 ring-2 ring-white/50">
                <img src="/logo.png" alt="TOMO Academy" className="w-full h-full object-cover rounded-full" onError={(e) => {
                  e.currentTarget.src = '/TOMO.jpg';
                }} />
              </div>
              <div className="text-white">
                <p className="font-bold text-xs leading-none flex items-center gap-1">
                  TOMO ACADEMY
                  <Verified className="w-3 h-3" />
                </p>
                <p className="text-[9px] opacity-90 leading-tight">EDUCATION ELEVATED</p>
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 text-[10px] px-1.5 py-0">
              <Shield className="w-2.5 h-2.5 mr-0.5" />
              ID
            </Badge>
          </div>

          {/* Main Content - Horizontal Layout (Photo Left, Info Right) */}
          <div className="relative h-[calc(260px-48px)] flex items-center px-4 py-4 gap-4">
            {/* Left Side - Photo */}
            <div className="flex-shrink-0">
              <div className="relative group/photo">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-white font-bold text-3xl border-2 border-white dark:border-slate-600 shadow-xl overflow-hidden relative ring-2 ring-primary/30 hover:ring-primary/50 transition-all">
                  {renderAvatar()}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                {onPhotoUpdate && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById(`photo-${employee.id}`)?.click();
                    }}
                    disabled={isUploading}
                    className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-all shadow-md hover:scale-110"
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                )}
                <input
                  id={`photo-${employee.id}`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                  disabled={isUploading}
                />
              </div>
            </div>

            {/* Right Side - Info and Actions */}
            <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-2">
              {/* Top - Member Info */}
              <div className="space-y-2">
                <div>
                  <h2 className="font-black text-xl leading-tight">{employee.name}</h2>
                  <p className="text-sm text-muted-foreground font-semibold mt-0.5">{employee.role}</p>
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span className="text-xs font-mono font-bold">{employee.employeeId}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    <span className="text-xs truncate">{employee.location || 'Remote'}</span>
                  </div>
                </div>
              </div>

              {/* Bottom - QR Code and NFC Tap */}
              <div className="flex items-end justify-between gap-3 mt-2">
                {/* QR Code */}
                <div className="flex flex-col items-center gap-1">
                  <div className="p-1.5 bg-white rounded-lg shadow-md border border-primary/10">
                    <QRCode value={profileUrl} size={50} />
                  </div>
                  <p className="text-[9px] text-muted-foreground text-center leading-tight font-medium">
                    Scan Me
                  </p>
                </div>

                {/* NFC Tap Icon */}
                <div className="flex flex-col items-center gap-1">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative overflow-hidden group/nfc">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 animate-pulse" />
                    <div className="relative">
                      <svg className="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 8.32a7.43 7.43 0 0 1 0 7.36" />
                        <path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58" />
                        <path d="M12.91 4.1a15.91 15.91 0 0 1 0 15.8" />
                        <path d="M16.37 2a20.16 20.16 0 0 1 0 20" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-[9px] text-muted-foreground text-center leading-tight font-medium">
                    Tap Here
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* BACK SIDE - Clean Info Layout */}
        <Card className={cn(
          "absolute inset-0 backface-hidden rotate-y-180 overflow-hidden",
          "bg-gradient-to-br from-white via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900",
          "border-2 border-primary/20 shadow-xl"
        )}>
          {/* Decorative Elements */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent rounded-full blur-3xl" />
          </div>

          {/* Main Content */}
          <div className="relative flex flex-col h-full p-6 justify-between">
            {/* Top Section - Instruction */}
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
                <Eye className="w-4 h-4 text-primary" />
                <p className="font-bold text-sm text-primary">Tap or Scan to View Profile</p>
              </div>
            </div>

            {/* Center Section - NFC Tap Icon (Large) */}
            <div className="flex flex-col items-center justify-center flex-1">
              <div className="relative">
                {/* Pulsing background circles */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: '2s' }} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full bg-primary/20 animate-pulse" />
                </div>
                
                {/* Main NFC Icon */}
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl">
                  <svg className="w-14 h-14 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 8.32a7.43 7.43 0 0 1 0 7.36" />
                    <path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58" />
                    <path d="M12.91 4.1a15.91 15.91 0 0 1 0 15.8" />
                    <path d="M16.37 2a20.16 20.16 0 0 1 0 20" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 font-medium">Tap your device here</p>
            </div>

            {/* Bottom Section - Contact & Social */}
            <div className="space-y-3">
              {/* Website & Email */}
              <div className="flex flex-col gap-1.5 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs">
                  <Globe className="w-3.5 h-3.5 text-primary" />
                  <span className="font-medium">www.tomoacademy.com</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-xs">
                  <Mail className="w-3.5 h-3.5 text-accent" />
                  <span className="font-medium">support@tomoacademy.com</span>
                </div>
              </div>

              {/* Social Icons */}
              <div className="flex justify-center items-center gap-2">
                <a href="https://youtube.com/@tomoacademy" target="_blank" rel="noopener noreferrer" 
                   onClick={(e) => e.stopPropagation()}
                   className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-colors">
                  <svg className="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a href="https://instagram.com/tomoacademy" target="_blank" rel="noopener noreferrer"
                   onClick={(e) => e.stopPropagation()}
                   className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center hover:bg-pink-500/20 transition-colors">
                  <Instagram className="w-4 h-4 text-pink-600" />
                </a>
              </div>

              {/* Disclaimer */}
              <div className="text-center pt-2 border-t border-border/50">
                <p className="text-[9px] text-muted-foreground leading-relaxed">
                  <span className="font-semibold">Official member identity card.</span><br />
                  Unauthorized use prohibited.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Flip Hint */}
      <div className="text-center mt-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
        <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
          <Sparkles className="w-2.5 h-2.5" />
          Click to flip
        </p>
      </div>
    </div>
  );
}

// Grid Component for Compact Cards
export function CompactIDCardGrid({ 
  employees,
  onPhotoUpdate,
  onEdit
}: { 
  employees: CompactIDCardProps['employee'][];
  onPhotoUpdate?: (employeeId: string, file: File) => Promise<void>;
  onEdit?: (employee: CompactIDCardProps['employee']) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
      {employees.map((employee) => (
        <div key={employee.id} className="relative group/container">
          <CompactIDCard
            employee={employee}
            onPhotoUpdate={onPhotoUpdate ? (file) => onPhotoUpdate(employee.id, file) : undefined}
          />
          {onEdit && (
            <AdminOnly>
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2 opacity-0 group-hover/container:opacity-100 transition-all shadow-lg z-10 gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(employee);
                }}
              >
                <Edit className="w-3 h-3" />
                Edit
              </Button>
            </AdminOnly>
          )}
        </div>
      ))}
    </div>
  );
}
