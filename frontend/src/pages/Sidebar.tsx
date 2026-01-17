/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  CiSettings, 
  CiDollar
} from "react-icons/ci";
import { RiChatVoiceAiFill } from "react-icons/ri";
import { GoOrganization } from "react-icons/go";
import { TbPresentationAnalyticsFilled } from "react-icons/tb";
import { IoChatbubblesOutline } from "react-icons/io5";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";
import logo from "/logo.png"; 
import { UserIcon, ChevronLeftIcon } from "@heroicons/react/24/solid";
import { Logout } from "../auth/authLogout";
import { useTheme } from "../contexts/ThemeContext";
import ChangelogPopup from "../components/ChangeLog/ChangelogPopUp";
import changelogData from "../components/ChangeLog/ChangeLog";
import { useOnboarding } from '../components/Onboarding/OnboardingManager';
import { useUserPermissions } from '../utils/useUserPermissions'; 
import { getUserInformation } from "../api/user";

const Sidebar: React.FC<{ onChangelogClick: () => void }> = ({ onChangelogClick }) => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const { isDarkMode } = useTheme();
  const currentVersion = changelogData[0]?.version;
  const [showChangelog, setShowChangelog] = useState(false); 
  const { shouldShowOnboarding, startOnboarding, setPageReady } = useOnboarding();
  const { permissions, loading } = useUserPermissions(); 
  
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfo = await getUserInformation();
        if (userInfo && userInfo.email) {
          setUserEmail(userInfo.email);
          console.log("Fetched user info:", userInfo);
          setLogoUrl(userInfo.logo_url || null);
        }
      } catch (err) {
        console.error("Failed to fetch user information", err);
      }
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email) {
      try {
        setUserEmail(email);
      } catch (err) {
        console.error("Failed to parse user from localStorage", err);
        setUserEmail("User");
      }
    }

  }, []);
  
  useEffect(() => {
    setPageReady('sidebar', true);
    if (shouldShowOnboarding('sidebar')) {
      startOnboarding('sidebar');
    }
  }, [setPageReady, shouldShowOnboarding, startOnboarding]);

  const sidebarColors = {
    bg: isDarkMode ? "#263143ff" : "#f8f8f8",
    text: isDarkMode ? "#ffffff" : "#000000",
    textSecondary: isDarkMode ? "#A0AEC0" : "#666666",
    border: isDarkMode ? "#4A5568" : "#e5e5e5",
    hoverBg: isDarkMode ? "#303c4fff" : "#e9ecef",
    activeBg: isDarkMode ? "#374254" : "#e3e6ea",
    icon: isDarkMode ? "#CBD5E0" : "#000000ff",
    button: isDarkMode ? "#647090ff" : "#315be6ff",
    buttonHover: isDarkMode ? "#46516cff" : "#1e44c2ff",
  };

  // Show loading state while checking permissions
  if (loading) {
    return (
      <div 
        className={`${collapsed ? "w-20" : "w-73"} h-screen p-4 flex flex-col justify-between transition-all duration-300 relative`}
        style={{ backgroundColor: sidebarColors.bg }}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-sm" style={{ color: sidebarColors.textSecondary }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar-container">
      <div
        className={`${collapsed ? "w-20" : "w-73"} h-screen p-4 flex flex-col justify-between transition-all duration-300 relative`}
        style={{ backgroundColor: sidebarColors.bg }}
      >
        <div>
          <SidebarHeader 
            collapsed={collapsed} 
            setCollapsed={setCollapsed} 
            colors={sidebarColors}
          />
          <NavLinks 
            collapsed={collapsed} 
            colors={sidebarColors}
            permissions={permissions} // PASS PERMISSIONS PROP
          />
        </div>

        {userEmail && (
          <UserInfo 
            collapsed={collapsed} 
            userEmail={userEmail} 
            colors={sidebarColors}
            onChangelogClick={() => setShowChangelog(true)} 
            logoUrl={logoUrl}
            currentVersion={currentVersion}
          />
        )}

        <ChangelogPopup 
          isOpen={showChangelog}
          changeLogData={changelogData}
          onClose={() => setShowChangelog(false)}
          colors={sidebarColors}
        />

      </div>
    </div>
  );
};

export default Sidebar;

interface HeaderProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  colors: any;
}

const SidebarHeader: React.FC<HeaderProps> = ({ collapsed, setCollapsed, colors }) => (
  <div 
    className="flex items-center justify-between mb-4 pb-4 sidebar-collapse"
    style={{ borderBottom: `1px solid ${colors.border}` }}
  >
    <div className="flex items-center">
      <img
        src={logo}
        alt="Client Logo"
        className={`h-8 ${collapsed ? "mx-auto max-w-[2.5rem]" : "w-auto mr-2"}`}
      />
      {!collapsed && (
        <h2 
          className="font-bold whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out"
          style={{ color: colors.text }}
        >
          Genovation AI
        </h2>
      )}
    </div>
    
    <div
      onClick={() => setCollapsed(!collapsed)}
      className="cursor-pointer transition-transform duration-300 ease-in-out transform hover:scale-110 sidebar-collapse"
    >
      <ChevronLeftIcon
        className={`h-6 w-6 transform transition-transform duration-300 ease-in-out ${
          collapsed ? "rotate-180" : ""
        }`}
        style={{ color: colors.text }}
      />
    </div>
  </div>
);

interface NavProps {
  collapsed: boolean;
  colors: any;
  permissions: any; 
}

const NavLinks: React.FC<NavProps> = ({ collapsed, colors, permissions }) => {
  if (!permissions) {
    return null;
  }

  const { isAdmin, canReadAnalytics, canSeeConversations } = permissions;
  return (
    <nav className="flex flex-col space-y-2 whitespace-nowrap overflow-hidden">
      {(isAdmin || canReadAnalytics) && (
        <SidebarLink 
          to="/" 
          icon={<TbPresentationAnalyticsFilled size={collapsed ? 28 : 25} />}
          label="Analytics" 
          collapsed={collapsed} 
          colors={colors}
          dataOnboarding="analytics-nav"
        />
      )}
      {(isAdmin || canSeeConversations) && (
        <SidebarLink 
          to="/conversations" 
          icon={<IoChatbubblesOutline size={collapsed ? 28 : 25} />}
          label="Conversations" 
          collapsed={collapsed} 
          colors={colors}
          dataOnboarding="conversations-nav"
        />
      )}
      {isAdmin && (
        <SidebarLink 
          to="/billing" 
          icon={<CiDollar size={collapsed ? 30 : 27} />}
          label="Billing" 
          collapsed={collapsed} 
          colors={colors}
          dataOnboarding="billing-nav"
        />
      )}
      {isAdmin && (
        <SidebarLink 
          to="/voiceagents" 
          icon={<RiChatVoiceAiFill size={collapsed ? 27 : 24} />}
          label="Voice Agents" 
          collapsed={collapsed} 
          colors={colors}
          dataOnboarding="voice-agents-nav"
        />
      )}
      {isAdmin && (
        <SidebarLink 
          to="/organization" 
          label="Organization" 
          collapsed={collapsed} 
          icon={<GoOrganization size={collapsed ? 27 : 24} />} 
          colors={colors} 
          dataOnboarding="organization-nav"
        />
      )}
      {isAdmin && (
        <SidebarLink 
          to="/settings" 
          icon={<CiSettings size={collapsed ? 28 : 25} />}
          label="Settings" 
          collapsed={collapsed} 
          colors={colors}
          dataOnboarding="settings-nav"
        />
      )}
    </nav>
  );
};

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  colors: any;
  dataOnboarding: string;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label, collapsed, colors, dataOnboarding }) => (
  <NavLink
    to={to}
    className={({ isActive }) => 
      `flex items-center space-x-3 p-2 rounded-lg transition-colors duration-200 ${
        isActive ? 'font-medium' : ''
      }`
    }
    style={({ isActive }) => ({ 
      backgroundColor: isActive ? colors.activeBg : 'transparent',
      color: colors.text,
    })}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = colors.hoverBg;
    }}
    onMouseLeave={(e) => {
      const currentPath = window.location.pathname;
      const isActive = currentPath === to;
      e.currentTarget.style.backgroundColor = isActive ? colors.activeBg : 'transparent';
    }}
    data-onboarding={dataOnboarding}
  >
    <div style={{ color: colors.icon }}>
      {icon}
    </div>
    {!collapsed && (
      <span className="whitespace-nowrap">
        {label}
      </span>
    )}
  </NavLink>
);

interface UserInfoProps {
  userEmail: string;
  collapsed: boolean;
  colors: any;
  onChangelogClick: () => void; 
  logoUrl: string | null;
  currentVersion: string;
}

const UserInfo: React.FC<UserInfoProps> = ({ userEmail, collapsed, colors, onChangelogClick, logoUrl, currentVersion  }) => {

  return (
    <div 
      className={`flex flex-col pt-4 user-profile-section ${collapsed ? "items-center" : ""}`}
    >
      <div className={`mb-3 ${collapsed ? "text-center" : ""}`}>
        {!collapsed && (
          <div
            className="text-xs font-medium cursor-pointer hover:underline changelog-version"
            style={{ color: colors.textSecondary }}
            onClick={onChangelogClick}
            tabIndex={0}
            role="button"
            title="View Changelog"
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onChangelogClick(); }}
          >
            {currentVersion}
          </div>
        )}
      </div>

      <div style={{ borderTop: `1px solid ${colors.border}` }}></div>

      <div className="flex items-center space-x-2 mt-3">
        <div className="relative">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt="Profile" 
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <UserIcon className="h-6 w-6" style={{ color: colors.textSecondary }} />
          )}
        </div>
        {!collapsed && (
          <div className="text-sm font-medium" style={{ color: colors.text }}>
            {userEmail}
          </div>
        )}
      </div>
      
      {!collapsed && (
        <button 
          onClick={Logout} 
          className="text-xs mt-2 p-2 border rounded-lg transition-colors shadow-md"
          style={{ 
            color: "#ffffff",
            borderColor: colors.border,
            backgroundColor: colors.button,
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = colors.buttonHover; 
            e.currentTarget.style.color = "#ffffff"; 
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = colors.button;
            e.currentTarget.style.color = "#ffffff";
          }}
        >
          Logout
        </button>
      )}
      {collapsed && (
        <button 
          onClick={Logout} 
          className="text-xs mt-2 p-2 border rounded-lg transition-colors shadow-md"
          style={{
            color: colors.text,
            borderColor: colors.border,
            backgroundColor: colors.button,
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = colors.buttonHover; 
            e.currentTarget.style.color = colors.text; 
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = colors.button;
            e.currentTarget.style.color = colors.text;
          }}
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};