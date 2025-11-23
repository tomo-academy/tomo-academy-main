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
    <div className="w-full max-w-[320px] mx-auto perspective-1000 group/card">
      <div 
        className={cn(
          "relative w-full h-[200px] transition-all duration-700 transform-style-preserve-3d cursor-pointer",
          isFlipped && "rotate-y-180"
        )}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* FRONT SIDE - Stylish Pink Design */}
        <Card 
          data-card-id={employee.id}
          data-side="front"
          className={cn(
            "absolute inset-0 backface-hidden overflow-hidden",
            "bg-gradient-to-br from-white via-pink-50/50 to-purple-50/40 dark:from-slate-900 dark:via-pink-950/20 dark:to-slate-900",
            "border-2 border-pink-200/50 dark:border-pink-800/50 shadow-xl hover:shadow-2xl hover:shadow-pink-500/20 transition-all duration-500"
          )}>
          {/* Stylish gradient overlay with decorative corners */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-100/20 via-transparent to-purple-100/20 dark:from-pink-950/10 dark:via-transparent dark:to-purple-950/10" />
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-pink-400/10 to-transparent rounded-bl-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-tr-3xl" />

          {/* Compact Pink Header */}
          <div className="relative h-10 bg-gradient-to-r from-pink-600 via-pink-500 to-pink-600 flex items-center justify-between px-2.5 overflow-hidden">
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ animationDuration: '3s' }} />
            
            <div className="flex items-center gap-1.5 relative z-10">
              <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center overflow-hidden shadow-md p-0.5">
                <img src="/cropped_circle_image (1).png" alt="TOMO Academy" className="w-full h-full object-contain" onError={(e) => {
                  e.currentTarget.src = '/logo.png';
                }} />
              </div>
              <div className="text-white">
                <p className="font-bold text-[10px] leading-none tracking-wide flex items-center gap-0.5">
                  TOMO ACADEMY
                  <Verified className="w-2.5 h-2.5 drop-shadow-md" />
                </p>
                <p className="text-[8px] opacity-90 leading-tight">EDUCATION ELEVATED</p>
              </div>
            </div>
            <div className="flex items-center gap-0.5 bg-white/20 backdrop-blur-sm px-1.5 py-0.5 rounded text-white text-[8px] font-bold shadow-md relative z-10">
              <Shield className="w-2 h-2" />
              <span>ID</span>
            </div>
          </div>

          {/* Main Content - Compact Organized Layout */}
          <div className="relative h-[calc(200px-40px)] flex items-center px-2.5 py-2 gap-2.5">
            {/* Left Side - Compact Photo */}
            <div className="flex-shrink-0">
              <div className="relative group/photo">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400/30 to-purple-500/30 rounded-xl blur-lg opacity-0 group-hover/photo:opacity-100 transition-opacity duration-300" />
                
                <div className="relative w-20 h-20 rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-950/30 dark:to-purple-950/30 flex items-center justify-center text-white font-bold text-lg border-2 border-pink-200/50 dark:border-pink-800/50 shadow-md overflow-hidden hover:shadow-lg hover:border-pink-300 dark:hover:border-pink-700 transition-all duration-300">
                  {renderAvatar()}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
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
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-all shadow-md hover:scale-110 border-2 border-white"
                  >
                    <Camera className="w-3 h-3 text-white" />
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

            {/* Right Side - Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
              {/* Member Info - Compact */}
              <div className="space-y-1">
                <div>
                  <h2 className="font-black text-base leading-tight bg-gradient-to-r from-pink-600 via-pink-500 to-purple-600 bg-clip-text text-transparent truncate">{employee.name}</h2>
                  <p className="text-[10px] text-slate-700 dark:text-slate-300 font-bold mt-0.5 truncate">{employee.role}</p>
                </div>
                
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 text-[9px] bg-gradient-to-r from-pink-50 to-pink-100/50 dark:from-pink-950/30 dark:to-pink-900/20 px-1.5 py-0.5 rounded-md border border-pink-300/50 dark:border-pink-700/50">
                    <Shield className="w-2 h-2 text-pink-600 dark:text-pink-400 flex-shrink-0" />
                    <span className="font-mono font-bold text-pink-900 dark:text-pink-200 truncate">{employee.employeeId}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 px-1.5 py-0.5 rounded-md border border-purple-300/50 dark:border-purple-700/50">
                    <MapPin className="w-2 h-2 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    <span className="font-semibold text-purple-900 dark:text-purple-200 truncate">{employee.location || 'Remote'}</span>
                  </div>
                </div>
              </div>

              {/* Bottom - QR Code Only */}
              <div className="flex items-center justify-center mt-1">
                {/* QR Code */}
                <div className="flex flex-col items-center gap-0.5">
                  <div className="p-1 bg-white dark:bg-slate-800 rounded-md shadow-md border-2 border-pink-300/60 dark:border-pink-700/60 hover:border-pink-400 dark:hover:border-pink-600 transition-all">
                    <QRCode value={profileUrl} size={36} />
                  </div>
                  <span className="text-[8px] text-pink-600 dark:text-pink-400 font-bold">Scan Profile</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* BACK SIDE - Premium White with Pink Accents */}
        <Card 
          data-card-id={employee.id}
          data-side="back"
          className={cn(
            "absolute inset-0 backface-hidden rotate-y-180 overflow-hidden",
            "bg-gradient-to-br from-white via-pink-50/50 to-purple-50/40 dark:from-slate-900 dark:via-pink-950/20 dark:to-slate-900",
            "border-2 border-pink-200/50 dark:border-pink-800/50 shadow-xl"
          )}>
          {/* Premium gradient overlay with decorative corners */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-100/20 via-transparent to-purple-100/20 dark:from-pink-950/10 dark:via-transparent dark:to-purple-950/10" />
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-pink-400/10 to-transparent rounded-bl-3xl" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-tr-3xl" />

          {/* Main Content - Perfectly Fitted */}
          <div className="relative flex flex-col h-full p-2.5 justify-between">
            {/* Top - Premium Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 rounded-lg flex items-center justify-center border border-pink-300/50 dark:border-pink-700/50 shadow-md">
                  <img 
                    src="/cropped_circle_image (1).png" 
                    alt="Logo" 
                    className="w-5 h-5 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/logo.png';
                    }}
                  />
                </div>
                <div>
                  <p className="font-black text-[9px] leading-none tracking-wide bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">TOMO ACADEMY</p>
                  <p className="text-[6px] font-semibold text-slate-600 dark:text-slate-400 mt-0.5">EDUCATION ELEVATED</p>
                </div>
              </div>
              <div className="px-1.5 py-0.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-md shadow-md">
                <p className="text-white text-[7px] font-bold leading-none">MEMBER</p>
                <p className="text-white/90 text-[6px] text-center">2025</p>
              </div>
            </div>

            {/* Center - QR Code Section */}
            <div className="flex flex-col items-center justify-center flex-1">
              <div className="relative">
                {/* Subtle animated rings */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-lg border border-pink-300/30 dark:border-pink-700/30 animate-ping" style={{ animationDuration: '3s' }} />
                </div>
                
                {/* QR Code with premium frame */}
                <div className="relative p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-xl border-2 border-pink-300/60 dark:border-pink-700/60">
                  <QRCode value={profileUrl} size={48} />
                </div>
              </div>
              
              {/* Scan instruction */}
              <div className="mt-2 flex items-center gap-1 px-2.5 py-0.5 bg-gradient-to-r from-pink-500/10 to-purple-500/10 backdrop-blur-sm rounded-full border border-pink-300/60 dark:border-pink-700/60">
                <Eye className="w-2.5 h-2.5 text-pink-600 dark:text-pink-400" />
                <p className="font-bold text-[7px] bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">SCAN TO VIEW PROFILE</p>
              </div>
            </div>

            {/* Bottom - Contact Section */}
            <div className="space-y-1">
              {/* Contact Grid */}
              <div className="grid grid-cols-2 gap-1">
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30 rounded-md border border-pink-300/50 dark:border-pink-700/50">
                  <Globe className="w-2 h-2 text-pink-600 dark:text-pink-400 flex-shrink-0" />
                  <span className="text-[6px] font-bold text-pink-900 dark:text-pink-200 truncate">tomoacademy.com</span>
                </div>
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-md border border-purple-300/50 dark:border-purple-700/50">
                  <Mail className="w-2 h-2 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <span className="text-[6px] font-bold text-purple-900 dark:text-purple-200 truncate">support@tomo</span>
                </div>
              </div>

              {/* Social Media Bar */}
              <div className="flex items-center justify-center gap-2 px-2 py-0.5 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 rounded-md border border-pink-300/50 dark:border-pink-700/50">
                <span className="text-[6px] font-bold text-slate-700 dark:text-slate-300">FOLLOW:</span>
                <a href="https://youtube.com/@tomoacademy" target="_blank" rel="noopener noreferrer" 
                   onClick={(e) => e.stopPropagation()}
                   className="w-4 h-4 rounded bg-gradient-to-br from-red-500/10 to-red-600/10 flex items-center justify-center hover:from-red-500/20 hover:to-red-600/20 transition-all border border-red-300/50 dark:border-red-700/50 hover:scale-110">
                  <svg className="w-2.5 h-2.5 text-red-600 dark:text-red-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a href="https://instagram.com/tomoacademy" target="_blank" rel="noopener noreferrer"
                   onClick={(e) => e.stopPropagation()}
                   className="w-4 h-4 rounded bg-gradient-to-br from-pink-500/10 to-purple-600/10 flex items-center justify-center hover:from-pink-500/20 hover:to-purple-600/20 transition-all border border-pink-300/50 dark:border-pink-700/50 hover:scale-110">
                  <Instagram className="w-2.5 h-2.5 text-pink-600 dark:text-pink-500" />
                </a>
              </div>

              {/* Footer */}
              <div className="text-center pt-0.5 border-t border-pink-200/50 dark:border-pink-800/50">
                <p className="text-[6px] font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent leading-tight">OFFICIAL MEMBER CARD</p>
                <p className="text-[5px] text-slate-600 dark:text-slate-400 leading-tight">Valid 2025 • Unauthorized use prohibited</p>
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
