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
        {/* FRONT SIDE - Stylish Pink Design */}
        <Card className={cn(
          "absolute inset-0 backface-hidden overflow-hidden",
          "bg-gradient-to-br from-white via-pink-50/50 to-purple-50/40 dark:from-slate-900 dark:via-pink-950/20 dark:to-slate-900",
          "border-2 border-pink-200/50 dark:border-pink-800/50 shadow-xl hover:shadow-2xl hover:shadow-pink-500/20 transition-all duration-500"
        )}>
          {/* Stylish gradient overlay with decorative corners */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-100/20 via-transparent to-purple-100/20 dark:from-pink-950/10 dark:via-transparent dark:to-purple-950/10" />
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-pink-400/10 to-transparent rounded-bl-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-tr-3xl" />

          {/* Stylish Pink Header with Animation */}
          <div className="relative h-14 bg-gradient-to-r from-pink-600 via-pink-500 to-pink-600 flex items-center justify-between px-4 overflow-hidden">
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ animationDuration: '3s' }} />
            
            <div className="flex items-center gap-2.5 relative z-10">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center overflow-hidden shadow-lg p-1 hover:scale-105 transition-transform">
                <img src="/cropped_circle_image (1).png" alt="TOMO Academy" className="w-full h-full object-contain" onError={(e) => {
                  e.currentTarget.src = '/logo.png';
                }} />
              </div>
              <div className="text-white">
                <p className="font-bold text-sm leading-none tracking-wide flex items-center gap-1">
                  TOMO ACADEMY
                  <Verified className="w-3.5 h-3.5 drop-shadow-md" />
                </p>
                <p className="text-[10px] opacity-90 leading-tight font-medium">EDUCATION ELEVATED</p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-md text-white text-[10px] font-bold shadow-md relative z-10">
              <Shield className="w-3 h-3" />
              <span>ID</span>
            </div>
          </div>

          {/* Main Content - Clean Organized Layout */}
          <div className="relative h-[calc(260px-48px)] flex items-center px-4 py-4 gap-4">
            {/* Left Side - Stylish Photo with Glow */}
            <div className="flex-shrink-0">
              <div className="relative group/photo">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400/40 to-purple-500/40 rounded-2xl blur-xl opacity-0 group-hover/photo:opacity-100 transition-opacity duration-500" />
                
                <div className="relative w-28 h-28 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-950/30 dark:to-purple-950/30 flex items-center justify-center text-white font-bold text-2xl border-2 border-pink-200/60 dark:border-pink-800/60 shadow-lg overflow-hidden hover:shadow-2xl hover:border-pink-300 dark:hover:border-pink-700 transition-all duration-300 hover:scale-[1.03]">
                  {renderAvatar()}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
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
                    className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-all shadow-lg hover:scale-110 border-2 border-white"
                  >
                    <Camera className="w-3.5 h-3.5 text-white" />
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
              {/* Member Info with Gradient */}
              <div className="space-y-2">
                <div>
                  <h2 className="font-black text-xl leading-tight bg-gradient-to-r from-pink-600 via-pink-500 to-purple-600 bg-clip-text text-transparent truncate drop-shadow-sm">{employee.name}</h2>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-bold mt-1 truncate">{employee.role}</p>
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-pink-50 to-pink-100/50 dark:from-pink-950/30 dark:to-pink-900/20 px-2.5 py-1.5 rounded-lg border border-pink-300/50 dark:border-pink-700/50">
                    <div className="w-4 h-4 rounded bg-pink-200/50 dark:bg-pink-800/30 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-3 h-3 text-pink-600 dark:text-pink-400" />
                    </div>
                    <span className="font-mono font-bold text-pink-900 dark:text-pink-200 truncate">{employee.employeeId}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 px-2.5 py-1.5 rounded-lg border border-purple-300/50 dark:border-purple-700/50">
                    <div className="w-4 h-4 rounded bg-purple-200/50 dark:bg-purple-800/30 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="font-semibold text-purple-900 dark:text-purple-200 truncate">{employee.location || 'Remote'}</span>
                  </div>
                </div>
              </div>

              {/* Bottom - Stylish QR and NFC */}
              <div className="flex items-end justify-between gap-3 mt-2">
                {/* QR Code with Pink Border */}
                <div className="flex flex-col items-center gap-1 group/qr">
                  <div className="relative p-2 bg-white dark:bg-slate-800 rounded-xl shadow-md border-2 border-pink-300/60 dark:border-pink-700/60 hover:border-pink-400 dark:hover:border-pink-600 transition-all hover:shadow-lg hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-400/10 to-purple-400/10 rounded-xl opacity-0 group-hover/qr:opacity-100 transition-opacity" />
                    <QRCode value={profileUrl} size={48} />
                  </div>
                  <span className="text-[9px] text-pink-600 dark:text-pink-400 font-bold flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" />
                    Scan
                  </span>
                </div>

                {/* NFC Icon with Gradient */}
                <div className="flex flex-col items-center gap-1 group/nfc">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full blur-md opacity-60 group-hover/nfc:opacity-100 transition-opacity" />
                    <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 via-pink-600 to-purple-600 flex items-center justify-center shadow-lg hover:shadow-xl hover:shadow-pink-500/50 transition-all hover:scale-110 cursor-pointer">
                      <svg className="w-7 h-7 text-white drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 8.32a7.43 7.43 0 0 1 0 7.36" />
                        <path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58" />
                        <path d="M12.91 4.1a15.91 15.91 0 0 1 0 15.8" />
                        <path d="M16.37 2a20.16 20.16 0 0 1 0 20" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-[9px] text-purple-600 dark:text-purple-400 font-bold flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" />
                    Tap
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* BACK SIDE - Stylish Pink Layout */}
        <Card className={cn(
          "absolute inset-0 backface-hidden rotate-y-180 overflow-hidden",
          "bg-gradient-to-br from-pink-50 via-purple-50/40 to-white dark:from-slate-900 dark:via-pink-950/10 dark:to-slate-900",
          "border-2 border-pink-200/50 dark:border-pink-800/50 shadow-xl"
        )}>
          {/* Stylish gradient overlay with decorative corners */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-100/20 via-transparent to-purple-100/20 dark:from-pink-950/10 dark:via-transparent dark:to-purple-950/10" />
          <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-pink-400/10 to-transparent rounded-bl-3xl" />
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-tr-3xl" />

          {/* Main Content - Stylish Organized Layout */}
          <div className="relative flex flex-col h-full p-5 justify-between">
            {/* Top Section - Stylish Instruction */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500/10 to-purple-500/10 backdrop-blur-sm rounded-full border border-pink-300/60 dark:border-pink-700/60 shadow-md">
                <Eye className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                <p className="font-bold text-xs bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Tap or Scan to View Profile</p>
              </div>
            </div>

            {/* Center Section - Large Stylish NFC Icon */}
            <div className="flex flex-col items-center justify-center flex-1 py-4">
              <div className="relative group/nfc-back">
                {/* Animated Pink Rings */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-pink-400/20 animate-ping" style={{ animationDuration: '2s' }} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full bg-purple-400/20 animate-pulse" />
                </div>
                
                {/* Main NFC Icon with Pink Gradient */}
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 via-pink-600 to-purple-600 flex items-center justify-center shadow-xl hover:shadow-2xl hover:shadow-pink-500/40 transition-all hover:scale-110 cursor-pointer">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
                  <svg className="w-14 h-14 text-white drop-shadow-lg relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 8.32a7.43 7.43 0 0 1 0 7.36" />
                    <path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58" />
                    <path d="M12.91 4.1a15.91 15.91 0 0 1 0 15.8" />
                    <path d="M16.37 2a20.16 20.16 0 0 1 0 20" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                <Sparkles className="w-3 h-3 text-pink-500 animate-pulse" />
                <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Tap your device here</p>
                <Sparkles className="w-3 h-3 text-purple-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
            </div>

            {/* Bottom Section - Stylish Contact & Social */}
            <div className="space-y-3">
              {/* Website & Email with Gradients */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30 rounded-lg border border-pink-300/50 dark:border-pink-700/50 hover:border-pink-400 dark:hover:border-pink-600 transition-all">
                  <Globe className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400 flex-shrink-0" />
                  <span className="font-bold text-xs text-pink-900 dark:text-pink-200 truncate">www.tomoacademy.com</span>
                </div>
                <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg border border-purple-300/50 dark:border-purple-700/50 hover:border-purple-400 dark:hover:border-purple-600 transition-all">
                  <Mail className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <span className="font-bold text-xs text-purple-900 dark:text-purple-200 truncate">support@tomoacademy.com</span>
                </div>
              </div>

              {/* Social Icons with Stylish Buttons */}
              <div className="flex justify-center items-center gap-3">
                <a href="https://youtube.com/@tomoacademy" target="_blank" rel="noopener noreferrer" 
                   onClick={(e) => e.stopPropagation()}
                   className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/10 to-red-600/10 flex items-center justify-center hover:from-red-500/20 hover:to-red-600/20 transition-all border-2 border-red-300/50 dark:border-red-700/50 hover:border-red-400 hover:scale-110 shadow-md hover:shadow-lg hover:shadow-red-500/30">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a href="https://instagram.com/tomoacademy" target="_blank" rel="noopener noreferrer"
                   onClick={(e) => e.stopPropagation()}
                   className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/10 to-purple-600/10 flex items-center justify-center hover:from-pink-500/20 hover:to-purple-600/20 transition-all border-2 border-pink-300/50 dark:border-pink-700/50 hover:border-pink-400 hover:scale-110 shadow-md hover:shadow-lg hover:shadow-pink-500/30">
                  <Instagram className="w-5 h-5 text-pink-600 dark:text-pink-500" />
                </a>
              </div>

              {/* Disclaimer with Gradient */}
              <div className="text-center pt-2.5 border-t-2 border-gradient-to-r from-pink-200 via-purple-200 to-pink-200 dark:from-pink-800 dark:via-purple-800 dark:to-pink-800">
                <p className="text-[10px] leading-relaxed">
                  <span className="font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Official Member Identity Card</span><br />
                  <span className="text-[9px] text-slate-600 dark:text-slate-400">Unauthorized use prohibited</span>
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
