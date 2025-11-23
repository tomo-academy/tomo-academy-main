import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, MapPin, Verified, Eye, Globe, Mail } from "lucide-react";
import { Instagram } from "lucide-react";
import QRCode from "react-qr-code";

interface ExportableIDCardProps {
  employee: {
    id: string;
    name: string;
    role: string;
    employeeId: string;
    location: string;
    photo?: string;
  };
  side: 'front' | 'back';
}

export function ExportableIDCard({ employee, side }: ExportableIDCardProps) {
  const profileUrl = `https://tomoacademy.site/employee/${employee.id}`;

  const renderAvatar = () => {
    if (employee.photo) {
      return (
        <img
          src={employee.photo}
          alt={employee.name}
          className="w-full h-full object-cover"
          crossOrigin="anonymous"
        />
      );
    }
    
    const initials = employee.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-400 to-purple-500 text-white font-bold text-xl">
        {initials}
      </div>
    );
  };

  if (side === 'front') {
    return (
      <Card className="w-[320px] h-[200px] bg-gradient-to-br from-white via-pink-50/50 to-purple-50/40 border-2 border-pink-200/50 shadow-xl overflow-hidden">
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100/20 via-transparent to-purple-100/20" />
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-pink-400/10 to-transparent rounded-bl-3xl" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-tr-3xl" />

        {/* Header */}
        <div className="relative h-10 bg-gradient-to-r from-pink-600 via-pink-500 to-pink-600 flex items-center justify-between px-2.5">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center p-0.5">
              <img src="/cropped_circle_image (1).png" alt="TOMO Academy" className="w-full h-full object-contain" />
            </div>
            <div className="text-white">
              <p className="font-bold text-[10px] leading-none tracking-wide flex items-center gap-0.5">
                TOMO ACADEMY
                <Verified className="w-2.5 h-2.5" />
              </p>
              <p className="text-[8px] opacity-90 leading-tight">EDUCATION ELEVATED</p>
            </div>
          </div>
          <div className="flex items-center gap-0.5 bg-white/20 backdrop-blur-sm px-1.5 py-0.5 rounded text-white text-[8px] font-bold">
            <Shield className="w-2 h-2" />
            <span>ID</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative h-[calc(200px-40px)] flex items-center px-2.5 py-2 gap-2.5">
          {/* Photo */}
          <div className="flex-shrink-0">
            <div className="relative w-20 h-20 rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 border-2 border-pink-200/50 shadow-md overflow-hidden">
              {renderAvatar()}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
            <div className="space-y-1">
              <div>
                <h2 className="font-black text-base leading-tight bg-gradient-to-r from-pink-600 via-pink-500 to-purple-600 bg-clip-text text-transparent truncate">{employee.name}</h2>
                <p className="text-[10px] text-slate-700 font-bold mt-0.5 truncate">{employee.role}</p>
              </div>
              
              <div className="space-y-0.5">
                <div className="flex items-center gap-1 text-[9px] bg-gradient-to-r from-pink-50 to-pink-100/50 px-1.5 py-0.5 rounded-md border border-pink-300/50">
                  <Shield className="w-2 h-2 text-pink-600 flex-shrink-0" />
                  <span className="font-mono font-bold text-pink-900 truncate">{employee.employeeId}</span>
                </div>
                <div className="flex items-center gap-1 text-[9px] bg-gradient-to-r from-purple-50 to-purple-100/50 px-1.5 py-0.5 rounded-md border border-purple-300/50">
                  <MapPin className="w-2 h-2 text-purple-600 flex-shrink-0" />
                  <span className="font-semibold text-purple-900 truncate">{employee.location || 'Remote'}</span>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex items-center justify-center mt-1">
              <div className="flex flex-col items-center gap-0.5">
                <div className="p-1 bg-white rounded-md shadow-md border-2 border-pink-300/60">
                  <QRCode value={profileUrl} size={36} />
                </div>
                <span className="text-[8px] text-pink-600 font-bold">Scan Profile</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Back side
  return (
    <Card className="w-[320px] h-[200px] bg-gradient-to-br from-white via-pink-50/50 to-purple-50/40 border-2 border-pink-200/50 shadow-xl overflow-hidden">
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100/20 via-transparent to-purple-100/20" />
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-pink-400/10 to-transparent rounded-bl-3xl" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-tr-3xl" />

      {/* Content */}
      <div className="relative flex flex-col h-full p-2.5 justify-between">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center border border-pink-300/50 shadow-md">
              <img src="/cropped_circle_image (1).png" alt="Logo" className="w-5 h-5 object-contain" />
            </div>
            <div>
              <p className="font-black text-[9px] leading-none tracking-wide bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">TOMO ACADEMY</p>
              <p className="text-[6px] font-semibold text-slate-600 mt-0.5">EDUCATION ELEVATED</p>
            </div>
          </div>
          <div className="px-1.5 py-0.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-md shadow-md">
            <p className="text-white text-[7px] font-bold leading-none">MEMBER</p>
            <p className="text-white/90 text-[6px] text-center">2025</p>
          </div>
        </div>

        {/* QR Section */}
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-lg border border-pink-300/30 animate-ping" style={{ animationDuration: '3s' }} />
            </div>
            
            <div className="relative p-1.5 bg-white rounded-lg shadow-xl border-2 border-pink-300/60">
              <QRCode value={profileUrl} size={48} />
            </div>
          </div>
          
          <div className="mt-2 flex items-center gap-1 px-2.5 py-0.5 bg-gradient-to-r from-pink-500/10 to-purple-500/10 backdrop-blur-sm rounded-full border border-pink-300/60">
            <Eye className="w-2.5 h-2.5 text-pink-600" />
            <p className="font-bold text-[7px] bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">SCAN TO VIEW PROFILE</p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="space-y-1">
          <div className="grid grid-cols-2 gap-1">
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gradient-to-r from-pink-50 to-purple-50 rounded-md border border-pink-300/50">
              <Globe className="w-2 h-2 text-pink-600 flex-shrink-0" />
              <span className="text-[6px] font-bold text-pink-900 truncate">tomoacademy.com</span>
            </div>
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-md border border-purple-300/50">
              <Mail className="w-2 h-2 text-purple-600 flex-shrink-0" />
              <span className="text-[6px] font-bold text-purple-900 truncate">support@tomo</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 px-2 py-0.5 bg-gradient-to-r from-pink-50 to-purple-50 rounded-md border border-pink-300/50">
            <span className="text-[6px] font-bold text-slate-700">FOLLOW:</span>
            <div className="w-4 h-4 rounded bg-gradient-to-br from-red-500/10 to-red-600/10 flex items-center justify-center border border-red-300/50">
              <svg className="w-2.5 h-2.5 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <div className="w-4 h-4 rounded bg-gradient-to-br from-pink-500/10 to-purple-600/10 flex items-center justify-center border border-pink-300/50">
              <Instagram className="w-2.5 h-2.5 text-pink-600" />
            </div>
          </div>

          <div className="text-center pt-0.5 border-t border-pink-200/50">
            <p className="text-[6px] font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent leading-tight">OFFICIAL MEMBER CARD</p>
            <p className="text-[5px] text-slate-600 leading-tight">Valid 2025 • Unauthorized use prohibited</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
