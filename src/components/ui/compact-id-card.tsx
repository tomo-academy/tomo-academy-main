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
        {/* FRONT SIDE - Modern Aesthetic Design */}
        <Card className={cn(
          "absolute inset-0 backface-hidden overflow-hidden",
          "bg-white dark:bg-slate-900",
          "border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all duration-300"
        )}>
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-transparent to-slate-50/50 dark:from-slate-800/30 dark:via-transparent dark:to-slate-800/30" />

          {/* Minimalist Header */}
          <div className="relative h-12 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 flex items-center justify-between px-4">
            <div className="flex items-center gap-2 relative z-10">
              <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center overflow-hidden shadow-sm p-1">
                <img src="/logo.png" alt="TOMO Academy" className="w-full h-full object-cover" onError={(e) => {
                  e.currentTarget.src = '/TOMO.jpg';
                }} />
              </div>
              <div className="text-white">
                <p className="font-semibold text-xs leading-none tracking-wide">TOMO ACADEMY</p>
                <p className="text-[9px] opacity-75 leading-tight">Education Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-white/80 text-[10px] font-medium">
              <Shield className="w-3 h-3" />
              <span>ID</span>
            </div>
          </div>

          {/* Main Content - Clean Organized Layout */}
          <div className="relative h-[calc(260px-48px)] flex items-center px-4 py-4 gap-4">
            {/* Left Side - Photo */}
            <div className="flex-shrink-0">
              <div className="relative group/photo">
                <div className="relative w-28 h-28 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-white font-bold text-2xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
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
                    className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-slate-900 dark:bg-slate-700 rounded-full flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-all shadow-lg hover:scale-110 border-2 border-white"
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
              {/* Member Info */}
              <div className="space-y-2">
                <div>
                  <h2 className="font-bold text-lg leading-tight text-slate-900 dark:text-white truncate">{employee.name}</h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5 truncate">{employee.role}</p>
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs">
                    <div className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                    </div>
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 truncate">{employee.employeeId}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <div className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                    </div>
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate">{employee.location || 'Remote'}</span>
                  </div>
                </div>
              </div>

              {/* Bottom - QR and NFC */}
              <div className="flex items-end justify-between gap-3 mt-2">
                {/* QR Code */}
                <div className="flex flex-col items-center gap-1">
                  <div className="p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                    <QRCode value={profileUrl} size={48} />
                  </div>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">Scan</span>
                </div>

                {/* NFC Icon */}
                <div className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-full bg-slate-900 dark:bg-slate-700 flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
                    <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 8.32a7.43 7.43 0 0 1 0 7.36" />
                      <path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58" />
                      <path d="M12.91 4.1a15.91 15.91 0 0 1 0 15.8" />
                      <path d="M16.37 2a20.16 20.16 0 0 1 0 20" />
                    </svg>
                  </div>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">Tap</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* BACK SIDE - Modern Clean Layout */}
        <Card className={cn(
          "absolute inset-0 backface-hidden rotate-y-180 overflow-hidden",
          "bg-white dark:bg-slate-900",
          "border border-slate-200 dark:border-slate-800 shadow-lg"
        )}>
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-transparent to-slate-50/50 dark:from-slate-800/30 dark:via-transparent dark:to-slate-800/30" />

          {/* Main Content - Clean Organized Layout */}
          <div className="relative flex flex-col h-full p-5 justify-between">
            {/* Top Section - Simple Instruction */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <Eye className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                <p className="font-semibold text-xs text-slate-700 dark:text-slate-300">Tap or Scan to View Profile</p>
              </div>
            </div>

            {/* Center Section - Large Clean NFC Icon */}
            <div className="flex flex-col items-center justify-center flex-1 py-4">
              <div className="relative">
                {/* Single subtle ring */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full bg-slate-200/50 dark:bg-slate-700/50 animate-pulse" />
                </div>
                
                {/* Main NFC Icon */}
                <div className="relative w-24 h-24 rounded-full bg-slate-900 dark:bg-slate-700 flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer">
                  <svg className="w-14 h-14 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 8.32a7.43 7.43 0 0 1 0 7.36" />
                    <path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58" />
                    <path d="M12.91 4.1a15.91 15.91 0 0 1 0 15.8" />
                    <path d="M16.37 2a20.16 20.16 0 0 1 0 20" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-3">Tap your device here</p>
            </div>

            {/* Bottom Section - Contact & Social */}
            <div className="space-y-3">
              {/* Website & Email */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <Globe className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400 flex-shrink-0" />
                  <span className="font-semibold text-xs text-slate-700 dark:text-slate-300 truncate">www.tomoacademy.com</span>
                </div>
                <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <Mail className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400 flex-shrink-0" />
                  <span className="font-semibold text-xs text-slate-700 dark:text-slate-300 truncate">support@tomoacademy.com</span>
                </div>
              </div>

              {/* Social Icons */}
              <div className="flex justify-center items-center gap-2.5">
                <a href="https://youtube.com/@tomoacademy" target="_blank" rel="noopener noreferrer" 
                   onClick={(e) => e.stopPropagation()}
                   className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-950/50 transition-all border border-red-200/50 dark:border-red-900/50 hover:scale-105">
                  <svg className="w-4.5 h-4.5 text-red-600 dark:text-red-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a href="https://instagram.com/tomoacademy" target="_blank" rel="noopener noreferrer"
                   onClick={(e) => e.stopPropagation()}
                   className="w-9 h-9 rounded-lg bg-pink-50 dark:bg-pink-950/30 flex items-center justify-center hover:bg-pink-100 dark:hover:bg-pink-950/50 transition-all border border-pink-200/50 dark:border-pink-900/50 hover:scale-105">
                  <Instagram className="w-4.5 h-4.5 text-pink-600 dark:text-pink-500" />
                </a>
              </div>

              {/* Disclaimer */}
              <div className="text-center pt-2.5 border-t border-slate-200 dark:border-slate-700">
                <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  <span className="font-semibold">Official Member Identity Card</span><br />
                  <span className="text-[9px]">Unauthorized use prohibited</span>
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
