// components/LogoUploadComponent.tsx
import React, { useState } from 'react';
import { uploadLogo, deleteLogo } from '../../api/user';
import { UserIcon } from '@heroicons/react/24/solid';
import { useTheme } from "../../contexts/ThemeContext";
import { CameraIcon, Trash, TrashIcon } from 'lucide-react';

interface LogoUploadComponentProps {
  currentLogoUrl?: string;
  onLogoUpdated: (logoUrl: string) => void;
  userId: string;
}

const LogoUploadComponent: React.FC<LogoUploadComponentProps> = ({
  currentLogoUrl,
  onLogoUpdated,
  userId
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
    const { isDarkMode } = useTheme();
  
  // Color variables
  const colors = {
    bg: isDarkMode ? "#1E2939" : "#ffffff",
    cardBg: isDarkMode ? "#2A3648" : "#f8f8f8",
    text: isDarkMode ? "#ffffff" : "#000000",
    textSecondary: isDarkMode ? "#A0AEC0" : "#666666",
    border: isDarkMode ? "#4A5568" : "#e5e5e5",
    icon: isDarkMode ? "#CBD5E0" : "#cccccc",
    sectionBg: isDarkMode ? "#333d4eff" : "#f0f0f0",
    inputBg: isDarkMode ? "#374254ff" : "#ffffff",
    profileBg: isDarkMode ? "#4A5568" : "#e5e5e5",
    hoverBg: isDarkMode ? "#4A5568" : "#e5e5e5",
    status: isDarkMode ? "#68D391" : "#166534",
    statusBg: isDarkMode ? "rgba(72, 187, 120, 0.2)" : "#dafbe4ff"
  };
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image (JPEG, PNG, GIF, or WebP)');
      return;
    }
    
    if (file.size > maxSize) {
      setError('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadLogo(file);
      onLogoUpdated(result.logo_url);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload logo');
      console.error('Logo upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteLogo = async () => {
    if (!confirm('Are you sure you want to delete your logo?')) return;

    try {
      await deleteLogo();
      onLogoUpdated('');
    } catch (err: any) {
      setError('Failed to delete logo');
      console.error('Logo deletion error:', err);
    }
  };

  return (
    <div className="logo-upload-section">
      <div className="flex items-center gap-6">
        <div className="relative group">
          <div className="relative w-18 h-18 border-2 border-gray-400 rounded-full overflow-hidden">
            {currentLogoUrl ? (
              <img
                src={currentLogoUrl}
                alt="User Logo"
                className="w-full h-full object-cover border-gray-300 group-hover:opacity-50 transition-opacity duration-200"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center  border-gray-300 group-hover:opacity-50 transition-opacity duration-200">
                <UserIcon className="h-12 w-12" style={{ color: colors.textSecondary }} />
              </div>
            )}
            
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/30 rounded-full">
              <div className="bg-white/90 p-2 rounded-full shadow-lg">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <label className="absolute inset-0 cursor-pointer rounded-full">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>
          
          {/* Uploading spinner - shows on top when uploading */}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
              <div className="bg-white p-3 rounded-full shadow-lg">
                <svg className="w-6 h-6 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </div>
          )}
        </div>
          
        {/* <div className="flex flex-col gap-2">
          {currentLogoUrl && (
            <button
              onClick={handleDeleteLogo}
              className="px-2 py-2 rounded-4xl text-red-600 rounded text-sm hover:bg-gray-600 transition-colors"
            >
              <TrashIcon className="w-6 h-6" />
            </button>
          )}
        </div> */}

      </div>

    </div>
  );
};

export default LogoUploadComponent;