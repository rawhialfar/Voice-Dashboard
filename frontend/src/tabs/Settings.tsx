import React, { useState, useEffect } from "react";
import { UserIcon, CameraIcon, SunIcon, MoonIcon, PencilIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { getUserInformation, updateUserInformation, uploadLogo } from "../api/user";
import { getOrganizationDetails, updateOrganizationDetails, type UpdateOrganizationPayload } from "../api/organization"; // Add this import
import { useTheme } from "../contexts/ThemeContext";
import LogoUploadComponent from '../components/PageComponents/LogoUploadComponent';

const Settings = () => {
  const [userData, setUserData] = useState<any>(null);
  const [orgData, setOrgData] = useState<any>(null); // New state for organization data
  const [loading, setLoading] = useState(true);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [useCase, setUseCase] = useState('');

  const useCaseOptions = [  
    { value: '', label: 'Select use case' },
    { value: 'customer-service', label: 'Customer Service' },
    { value: 'sales', label: 'Sales & Lead Generation' },
    { value: 'appointments', label: 'Appointment Scheduling' },
    { value: 'support', label: 'Technical Support' },
    { value: 'education', label: 'Education & Training' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'real-estate', label: 'Real Estate' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      try {
        // Load both user data and organization data in parallel
        const [userInfo, orgInfo] = await Promise.all([
          getUserInformation(),
          getOrganizationDetails()
        ]);
        setUserData(userInfo);
        setOrgData(orgInfo);
        
        // Set useCase from user data
        if (userInfo?.useCase) {
          setUseCase(userInfo.useCase);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const handleLogoUpdated = (logoUrl: string) => {
    setUserData((prev: any) => prev ? { ...prev, logo_url: logoUrl } : null);
    localStorage.setItem('profilePhoto', logoUrl);
    window.dispatchEvent(new Event('profilePhotoUpdated'));
  };

  const startEditing = (field: string, currentValue: string = "") => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditValue("");
  };

  const saveEdit = async () => {
    if (!editingField || !userData) return;

    setSaveLoading(true);
    try {
      if (editingField === 'businessName') {
        const payload: UpdateOrganizationPayload = {
          businessName: editValue
        };
      
        // Update organization business name
        await updateOrganizationDetails(payload);
        // Update local org data
        setOrgData((prev: any) => ({ ...prev, name: editValue }));
        setSaveMessage({ type: 'success', message: 'Business name updated successfully!' });
      } else {
        // Update user information
        const updateData = {
          ...userData, 
          [editingField]: editValue 
        };

        // Remove any undefined or null values that might cause issues
        const cleanedUpdateData = Object.fromEntries(
          Object.entries(updateData).filter(([_, value]) => value !== undefined && value !== null)
        );

        // Call your update API with the full object
        await updateUserInformation(cleanedUpdateData);
        
        // Update local state with the new data
        setUserData(cleanedUpdateData);
        setSaveMessage({ type: 'success', message: 'Information updated successfully!' });
      }
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
      
    } catch (error) {
      console.error("Error updating information:", error);
      setSaveMessage({ type: 'error', message: 'Failed to update information. Please try again.' });
    } finally {
      setSaveLoading(false);
      setEditingField(null);
      setEditValue("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

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

  if (loading) {
    return (
      <div className="w-full p-6" style={{ backgroundColor: colors.bg }}>
        <div style={{ color: colors.textSecondary }}>Loading user information...</div>
      </div>
    );
  }

  // Reusable styled components
  const Section = ({ children, className = "" }) => (
    <div className={`pb-6 ${className}`} style={{ borderColor: colors.border }}>
      {children}
    </div>
  );

  const Card = ({ children, className = "" }) => (
    <div 
      className={`p-2 rounded ${className}`}
      style={{ backgroundColor: colors.inputBg, color: colors.text }}
    >
      {children}
    </div>
  );

  const Label = ({ children }) => (
    <label className="block text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>
      {children}
    </label>
  );

  // Editable fields configuration
  const userEditableFields = [
    { key: 'firstname', label: 'First Name', value: userData?.firstname || '' },
    { key: 'lastname', label: 'Last Name', value: userData?.lastname || '' },
    { key: 'email', label: 'Email', value: userData?.email || '' },
  ];

  const orgEditableFields = [
    { key: 'businessName', label: 'Business Name', value: orgData?.name || '' },
  ];
  
  return (
    <div className="w-full p-8 h-[calc(100vh)] overflow-y-auto" style={{ backgroundColor: colors.bg }}>
      <h1 className="text-2xl font-bold mb-6" style={{ color: colors.text }}>User Settings</h1>

      {saveMessage && (
        <div className={`mb-6 p-4 rounded-lg ${
          saveMessage.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {saveMessage.message}
        </div>
      )}
      
      <div className="rounded-lg border p-6" style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>
        {/* Profile Header */}
        <div className="flex items-center mb-8">
          <div className="relative">
              <LogoUploadComponent
                currentLogoUrl={userData?.logo_url}
                onLogoUpdated={handleLogoUpdated}
                userId={userData?.userId}
              />
          </div>
          <div className="ml-6">
            <h2 className="text-lg font-semibold" style={{ color: colors.text }}>{orgData?.name || 'Your Business'}</h2>
            <p style={{ color: colors.textSecondary }}>{localStorage.getItem('userEmail')}</p>
          </div>
        </div>

        {/* Dark Mode Toggle */}
        <div className="mb-8 p-4 rounded-lg" style={{ backgroundColor: colors.sectionBg }}>
          <h3 className="text-lg font-medium mb-4" style={{ color: colors.text }}>Appearance</h3>
          
          <div className="flex items-center justify-between p-3 rounded border" style={{ backgroundColor: colors.inputBg, borderColor: colors.border }}>
            <div className="flex items-center">
              {isDarkMode ? (
                <MoonIcon className="w-5 h-5 mr-3" style={{ color: colors.textSecondary }} />
              ) : (
                <SunIcon className="w-5 h-5 mr-3" style={{ color: colors.textSecondary }} />
              )}
              <div>
                <p className="font-medium" style={{ color: colors.text }}>Dark Mode</p>
                <p className="text-sm" style={{ color: colors.textSecondary }}>{isDarkMode ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative inline-flex h-6 w-15 items-center rounded-full transition-colors ${
                isDarkMode ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 ml-5 transform rounded-full bg-white transition-transform ${
                isDarkMode ? 'translate-x-5' : 'translate-x-[-15px]'
              }`} />
            </button>
          </div>
        </div>

        {/* User Information Display */}
        <div className="space-y-4">
          {/* Organization Information Section */}
          <Section className="border-b">
            <h3 className="text-lg font-medium mb-6" style={{ color: colors.text }}>Organization Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Organization Editable Fields */}
              {orgEditableFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label>{field.label}</Label>
                  <div className="flex items-center gap-2">
                    {editingField === field.key ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editValue}
                          onChange={handleInputChange}
                          onKeyDown={handleKeyPress}
                          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                          style={{ 
                            backgroundColor: colors.inputBg,
                            borderColor: colors.border,
                            color: colors.text
                          }}
                          autoFocus
                        />
                        <div className="flex gap-1">
                          <button
                            onClick={saveEdit}
                            disabled={saveLoading}
                            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                            style={{ backgroundColor: isDarkMode ? 'rgba(34, 197, 94, 0.1)' : 'transparent' }}
                          >
                            <CheckIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            style={{ backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Card className="flex-1 min-h-[42px] flex items-center px-3 py-2 transition-colors hover:bg-opacity-80">
                          {field.value || <span style={{ color: colors.textSecondary }}>Not set</span>}
                        </Card>
                        <button
                          onClick={() => startEditing(field.key, field.value)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          style={{ 
                            color: colors.textSecondary,
                            backgroundColor: isDarkMode ? colors.hoverBg : 'transparent'
                          }}
                          title={`Edit ${field.label}`}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Organization Non-editable fields */}
              <div className="space-y-2">
                <Label>Subscription Tier</Label>
                <Card className="min-h-[42px] flex items-center px-3 py-2">
                  {orgData?.subscription || <span style={{ color: colors.textSecondary }}>N/A</span>}
                </Card>
              </div>
              <div className="space-y-2">
                <Label>Organization Members</Label>
                <Card className="min-h-[42px] flex items-center px-3 py-2">
                  {orgData?.memberCount || '0'} / {orgData?.maxMembers || '0'}
                </Card>
              </div>
            </div>
          </Section>

          {/* User Information Section */}
          <Section>
            <h3 className="text-lg font-medium mb-6" style={{ color: colors.text }}>Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Editable Fields */}
              {userEditableFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label>{field.label}</Label>
                  <div className="flex items-center gap-2">
                    {editingField === field.key ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editValue}
                          onChange={handleInputChange}
                          onKeyDown={handleKeyPress}
                          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                          style={{ 
                            backgroundColor: colors.inputBg,
                            borderColor: colors.border,
                            color: colors.text
                          }}
                          autoFocus
                        />
                        <div className="flex gap-1">
                          <button
                            onClick={saveEdit}
                            disabled={saveLoading}
                            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                            style={{ backgroundColor: isDarkMode ? 'rgba(34, 197, 94, 0.1)' : 'transparent' }}
                          >
                            <CheckIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            style={{ backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Card className="flex-1 min-h-[42px] flex items-center px-3 py-2 transition-colors hover:bg-opacity-80">
                          {field.value || <span style={{ color: colors.textSecondary }}>Not set</span>}
                        </Card>
                        <button
                          onClick={() => startEditing(field.key, field.value)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          style={{ 
                            color: colors.textSecondary,
                            backgroundColor: isDarkMode ? colors.hoverBg : 'transparent'
                          }}
                          title={`Edit ${field.label}`}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              
              {/* User Non-editable fields */}
              <div className="space-y-2">
                <Label>User ID</Label>
                <Card className="min-h-[42px] flex items-center px-3 py-2">
                  {userData?.userId || <span style={{ color: colors.textSecondary }}>N/A</span>}
                </Card>
              </div>
            </div>
          </Section>

        </div>

        
      </div>
    </div>
  );
};

export default Settings;