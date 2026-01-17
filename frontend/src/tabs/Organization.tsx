/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useMemo, useState } from "react";
import { 
  getOrgUserData, 
  getOrganizationDetails,
  permissionCheck,
  permissionToggle,
  type OrgUser as ApiOrgUser,
} from '../api/organization';
import { subuserCreate } from '../auth/authSubusercreate';
import { subuserDelete } from '../auth/authSubuserdelete';
import { useTheme } from "../contexts/ThemeContext";
import { useOnboarding } from '../components/Onboarding/OnboardingManager';

import { XMarkIcon, UserPlusIcon, TrashIcon, CheckIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

type SubscriptionTier = 'free' | 'pro' | 'enterprise';

type OrganizationDetails = {
	name: string;
	subscription: SubscriptionTier;
	memberCount: number;
	maxMembers: number;
};

type OrgUser = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
};

type UserPermissions = {
	canReadAnalytics: boolean;
	canSeeConversations: boolean;
};

// eslint-disable-next-line react-refresh/only-export-components
export async function fetchOrganizationDetails(): Promise<OrganizationDetails> {
  try {
    const orgData = await getOrganizationDetails();
    
    return {
      name: orgData.name || 'Your Organization',
      subscription: (orgData.subscription || 'free') as SubscriptionTier,
      memberCount: orgData.memberCount || 0,
      maxMembers: orgData.maxMembers || 0
    };
  } catch (error) {
    console.error('Error fetching organization details:', error);
    return {
      name: 'Organization',
      subscription: 'free',
      memberCount: 0,
      maxMembers: 0
    };
  }
}

export async function fetchUsers(): Promise<OrgUser[]> {
  try {
    const usersData = await getOrgUserData();
    
    if (!usersData || !usersData.orgUsers) {
      return [];
    }

    return usersData.orgUsers.map((user: ApiOrgUser) => ({
      id: user.email,
      firstName: user.firstname || '',
      lastName: user.lastname || '',
      email: user.email
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export async function fetchUserPermissions(userId: string): Promise<UserPermissions> {
  try {
    const userEmail = userId;
	// perm 1 is analytics, perm 2 is conversations
    const [canReadAnalytics, canSeeConversations] = await Promise.all([
      permissionCheck({
		email: userEmail, 
		permission: 1 << 1}),
      permissionCheck({
		email: userEmail, 
		permission: 1 << 2}),
    ]);

    return {
      canReadAnalytics,
      canSeeConversations
    };
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return {
      canReadAnalytics: false,
      canSeeConversations: false
    };
  }
}

export async function updateUserPermissions(
  userId: string, 
  newPermissions: UserPermissions, 
  originalPermissions: UserPermissions
): Promise<void> {
  try {
    const userEmail = userId;
    
    // Check which permissions actually changed
    if (newPermissions.canReadAnalytics !== originalPermissions.canReadAnalytics) {
      await permissionToggle({
        email: userEmail, 
        permissions: 1 << 1
      });
    }
    
    if (newPermissions.canSeeConversations !== originalPermissions.canSeeConversations) {
      await permissionToggle({
        email: userEmail, 
        permissions: 1 << 2
      });
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  } catch (error) {
    console.error('Error updating user permissions:', error);
    throw error;
  }
}

export async function addUser(newUser: { firstName: string; lastName: string; email: string; password: string }): Promise<OrgUser> {
  try {
    await subuserCreate({
      firstname: newUser.firstName,
      lastname: newUser.lastName,
      email: newUser.email,
      password: newUser.password,
      permissions: 1 << 1
    });

    // If we get here, the user was created successfully
    return {
      id: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email
    };
  } catch (error: any) {
    console.error('Error adding user:', error);
    throw new Error(error.message || 'Failed to add user');
  }
}

export async function removeUser(userId: string): Promise<void> {
  try {
    await subuserDelete({
      email: userId
    });
    
    // If we get here, the user was deleted successfully
    return;
  } catch (error: any) {
    console.error('Error removing user:', error);
    throw new Error(error.message || 'Failed to remove user');
  }
}

// ---- Component ----

const Organization: React.FC = () => {
	// Display state
	const { isDarkMode } = useTheme();
	const [org, setOrg] = useState<OrganizationDetails | null>(null);
	const [users, setUsers] = useState<OrgUser[]>([]);
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
	const [showAddForm, setShowAddForm] = useState(false);
	const [userPerms, setUserPerms] = useState<Record<string, UserPermissions>>({});
	const [removeConfirmFor, setRemoveConfirmFor] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [formError, setFormError] = useState<string | null>(null);
  	const [formSuccess, setFormSuccess] = useState<string | null>(null);
	const [originalUserPerms, setOriginalUserPerms] = useState<Record<string, UserPermissions>>({});
  	const { shouldShowOnboarding, startOnboarding, setPageReady } = useOnboarding();

	// Add user form state
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);

	const colors = {
		bg: isDarkMode ? "#1E2939" : "#ffffff",
		text: isDarkMode ? "#ffffff" : "#000000",
		textSecondary: isDarkMode ? "#A0AEC0" : "#666666",
		border: isDarkMode ? "#4A5568" : "#e5e5e5",
		cardBg: isDarkMode ? "#2A3648" : "#ffffff",
		sidebarBg: isDarkMode ? "#2A3648" : "#f8f9fa",
		hoverBg: isDarkMode ? "#374254" : "#f1f5f9",
		activeBg: isDarkMode ? "#3A4658" : "#e3f2fd",
		inputBg: isDarkMode ? "#374254" : "#ffffff",
		accent: isDarkMode ? "#3b82f6" : "#2563eb",
		danger: isDarkMode ? "#ef4444" : "#dc2626",
		success: isDarkMode ? "#10b981" : "#059669"
	};

	useEffect(() => {
		setPageReady('organization', true);
		if (shouldShowOnboarding('organization')) {
		  startOnboarding('organization');
		}
	}, [setPageReady, shouldShowOnboarding, startOnboarding]);

	useEffect(() => {
		(async () => {
			try {
				setLoading(true);
				setError(null);
				const [details, fetchedUsers] = await Promise.all([
					fetchOrganizationDetails(),
					fetchUsers()
				]);
				setOrg(details);
				setUsers(fetchedUsers);
			} catch (err) {
				console.error('Failed to load organization data:', err);
				setError('Failed to load organization data');
				setOrg({
					name: 'Your Organization',
					subscription: 'free',
					memberCount: 0,
					maxMembers: 0
				});
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	useEffect(() => {
		(async () => {
		if (!selectedUserId) return;
		if (userPerms[selectedUserId]) return;
		try {
			const perms = await fetchUserPermissions(selectedUserId);
			setUserPerms(prev => ({ ...prev, [selectedUserId]: perms }));
			setOriginalUserPerms(prev => ({ ...prev, [selectedUserId]: perms }));
		} catch {}
		})();
	}, [selectedUserId]);

	const memberCount = useMemo(() => users.length, [users]);
	const selectedUser = useMemo(() => users.find(u => u.id === selectedUserId) || null, [users, selectedUserId]);

	useEffect(() => {
		(async () => {
			if (!selectedUserId) return;
			if (userPerms[selectedUserId]) return;
			try {
				const perms = await fetchUserPermissions(selectedUserId);
				setUserPerms(prev => ({ ...prev, [selectedUserId]: perms }));
			} catch {}
		})();
	}, [selectedUserId]);

	const handleToggleAddUser = () => {
		setShowAddForm(true);
		setSelectedUserId(null);
		setShowPassword(false);
		setFormError(null);
		setFormSuccess(null);
	};

	const handleCloseAddForm = () => {
		setShowAddForm(false);
		setFirstName('');
		setLastName('');
		setEmail('');
		setPassword('');
		setShowPassword(false);
		setFormError(null);
		setFormSuccess(null);
	};

	const handleCloseUserPanel = () => {
		setSelectedUserId(null);
		setRemoveConfirmFor(null);
		setFormError(null);
		setFormSuccess(null);
	};

	const handleSelectUser = (id: string) => {
		setSelectedUserId(id);
		setShowAddForm(false);
		setRemoveConfirmFor(null);
	};

	const handlePermissionChange = (key: keyof UserPermissions, checked: boolean) => {
		if (!selectedUserId) return;
		setUserPerms(prev => ({
		...prev,
		[selectedUserId]: {
			...(prev[selectedUserId] || { canReadAnalytics: false, canSeeConversations: false }),
			[key]: checked
		}
		}));
	};


	const handleSavePermissions = async () => {
		if (!selectedUserId) return;
		const newPerms = userPerms[selectedUserId] || { canReadAnalytics: false, canSeeConversations: false };
		const originalPerms = originalUserPerms[selectedUserId] || { canReadAnalytics: false, canSeeConversations: false };
		
		try {
			await updateUserPermissions(selectedUserId, newPerms, originalPerms);
			
			// Update the original permissions to match the new ones after successful save
			setOriginalUserPerms(prev => ({
			...prev,
			[selectedUserId]: newPerms
			}));
			
			// Show success message
			setFormSuccess('Permissions updated successfully');
			
		} catch (err: any) {
			console.error('Failed to save permissions:', err);
			setFormError(err.message || 'Failed to save permissions');
			
			// Revert to original permissions on error
			setUserPerms(prev => ({
			...prev,
			[selectedUserId]: originalPerms
			}));
		}
	};
	

	const handleAddUser = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!firstName || !lastName || !email || !password) {
		setFormError('All fields are required');
		return;
		}
		
		// Clear previous messages
		setFormError(null);
		setFormSuccess(null);
		
		try {
		const created = await addUser({ firstName, lastName, email, password });
		setUsers(prev => [...prev, created]);
		
		// Show success message
		setFormSuccess(`Successfully added ${firstName} ${lastName} to the organization`);
		
		// Clear form and close after delay
		setTimeout(() => {
			setFirstName('');
			setLastName('');
			setEmail('');
			setPassword('');
			setShowAddForm(false);
			setShowPassword(false);
			setFormSuccess(null);
		}, 2000);
		
		} catch (err: any) {
		console.error('Failed to add user:', err);
		setFormError(err.message || 'Failed to add user');
		}
	};

	const handleRemoveUser = async (userId: string) => {
		if (removeConfirmFor !== userId) {
		setRemoveConfirmFor(userId);
		return;
		}
		
		try {
		await removeUser(userId);
		setUsers(prev => prev.filter(u => u.id !== userId));
		setSelectedUserId(null);
		setRemoveConfirmFor(null);
		setError(null);
		} catch (err: any) {
		console.error('Failed to remove user:', err);
		setFormError(err.message || 'Failed to remove user');
		setRemoveConfirmFor(null);
		}
	};

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	if (loading) {
		return (
			<div 
				className="p-6 w-full h-screen flex items-center justify-center"
				style={{ backgroundColor: colors.bg }}
			>
				<div className="text-lg" style={{ color: colors.text }}>Loading organization data...</div>
			</div>
		);
	}

	

	return (
		<div 
			className="h-screen flex flex-col w-full overflow-hidden p-3"
			style={{ backgroundColor: colors.bg, color: colors.text }}
		>
			{/* Header */}
			<div className="flex-shrink-0 px-6 py-4 border-b" style={{ borderColor: colors.border }}>
				<h1 
					className="text-2xl font-bold capitalize" 
					style={{ color: colors.text }} 
					data-onboarding="organization"
				>
					Organization
				</h1>
			</div>

			{/* Error Display */}
			{error && (
				<div className="flex-shrink-0 px-3 py-3">
					<div className="max-w-4xl mx-auto">
						<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
							<div className="flex items-center">
								<div className="flex-shrink-0">
									<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
									</svg>
								</div>
								<div className="ml-3">
									<p className="text-sm">{error}</p>
								</div>
								<div className="ml-auto pl-3">
									<button
										onClick={() => setError(null)}
										className="text-red-700 hover:text-red-900"
									>
										<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
											<path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
										</svg>
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
			{/* Organization Details Bar - Centered */}
			<div className="flex-shrink-0 px-6 py-4">
				<div 
					className=" mx-auto rounded-xl border p-6"
					style={{ 
						backgroundColor: colors.cardBg, 
						borderColor: colors.border 
					}}
				>
					<div className="text-center mb-4">
						<h2 className="text-lg font-semibold capitalize" style={{ color: colors.text }}>
							Organization Details
						</h2>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
						<div>
							<div className="text-sm" style={{ color: colors.textSecondary }}>Organization Name</div>
							<div className="text-lg font-semibold" style={{ color: colors.text }}>
								{org?.name || ''}
							</div>
						</div>
						<div>
							<div className="text-sm" style={{ color: colors.textSecondary }}>Subscription</div>
							<div className="text-lg font-semibold capitalize" style={{ color: colors.accent }}>
								{org?.subscription || ''}
							</div>
						</div>
						<div>
							<div className="text-sm" style={{ color: colors.textSecondary }}>Members</div>
							<div className="text-lg font-semibold" style={{ color: colors.text }}>
								{org?.memberCount} / {org?.maxMembers || 0}
							</div>
						</div>
					</div>
				</div>
			</div>

			

			{/* Main Content */}
			<div className="flex-1 flex overflow-hidden px-6 pb-6 gap-6">
				{/* Members List - Left Sidebar */}
				<div 
					className="w-80 flex flex-col rounded-xl border overflow-hidden"
					style={{ 
						backgroundColor: colors.sidebarBg, 
						borderColor: colors.border 
					}}
				>
					{/* List Header */}
					<div 
						className="flex items-center justify-between p-4 border-b"
						style={{ 
							backgroundColor: colors.cardBg,
							borderColor: colors.border 
						}}
					>
						<div className="font-semibold" style={{ color: colors.text }}>
							Team Members
						</div>
						<div className="text-sm px-3 py-1 rounded-full" style={{ backgroundColor: colors.hoverBg, color: colors.textSecondary }}>
							{memberCount} members
						</div>
					</div>

					{/* Members List */}
					<div className="flex-1 overflow-y-auto">
						{users.length === 0 ? (
							<div className="p-8 text-center">
								<div className="text-sm" style={{ color: colors.textSecondary }}>
									No team members yet
								</div>
								<div className="text-xs mt-1" style={{ color: colors.textSecondary }}>
									Add your first team member to get started
								</div>
							</div>
						) : (
							<div className="">
								{users.map((u) => {
									const isSelected = selectedUserId === u.id && !showAddForm;
									return (
										<div
											key={u.id}
											className="relative p-3 cursor-pointer group"
											onClick={() => handleSelectUser(u.id)}
										>
											{/* Enhanced Blue left bar with Conversations-style animations */}
											<div
												className={`absolute left-0 top-0 h-full w-1 bg-blue-500 transition-all duration-300 transform
													${isSelected ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}
													group-hover:opacity-100 group-hover:translate-x-0`}
											/>

											{/* Enhanced Card with Conversations-style animations */}
											<div
												className={`relative p-3 rounded-md transition-all duration-200 transform origin-left border
													${isSelected ? 'bg-blue-50 border-blue-200 scale-[0.98]' : 'bg-white border-gray-200'}
													group-hover:bg-gray-50 group-hover:scale-[0.98]`}
												style={{
													backgroundColor: isSelected ? colors.activeBg : colors.cardBg,
													borderColor: isSelected ? colors.accent : colors.border,
													marginLeft: '8px'
												}}
											>
												<div className="flex items-center justify-between">
													<div className="flex items-center space-x-3 min-w-0 flex-1">
														{/* Avatar */}
														<div 
															className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
															style={{ backgroundColor: colors.accent }}
														>
															<span className="text-white font-medium text-sm">
																{u.firstName.charAt(0)}{u.lastName.charAt(0)}
															</span>
														</div>
														
														{/* User Info */}
														<div className="min-w-0 flex-1">
															<div className="font-semibold truncate" style={{ color: colors.text }}>
																{u.firstName} {u.lastName || ''}
															</div>
															<div className="text-sm truncate" style={{ color: colors.textSecondary }}>
																{u.email}
															</div>
														</div>
													</div>
													
													{/* Role Badge */}
													<div className="flex-shrink-0 ml-2">
														<span 
															className="inline-block px-2 py-1 rounded-full text-xs font-medium"
															style={{ 
																backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe',
																color: colors.accent
															}}
														>
															Member
														</span>
													</div>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>

					{/* Add User Button - Fixed at bottom */}
					<div className="p-4 border-t" style={{ borderColor: colors.border }}>
						<button
							onClick={handleToggleAddUser}
							className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-[1.02]"
							style={{
								backgroundColor: colors.accent,
								color: 'white'
							}}
						>
							<UserPlusIcon className="w-5 h-5" />
							Add Team Member
						</button>
					</div>
				</div>

				{/* Right Panel */}
				<div className="flex-1 flex flex-col">
					{/* User Card */}
					{selectedUser && !showAddForm && (
						<div 
							className="flex-1 rounded-xl border p-6 flex flex-col"
							style={{ 
							backgroundColor: colors.cardBg, 
							borderColor: colors.border 
							}}
						>
							{/* Header with Close Button */}
							<div className="flex items-center justify-between mb-6">
							<div>
								<h2 className="text-xl font-semibold" style={{ color: colors.text }}>
								{selectedUser.firstName} {selectedUser.lastName || ''}
								</h2>
								<p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
								{selectedUser.email}
								</p>
							</div>
							<button
								onClick={handleCloseUserPanel}
								className="p-2 rounded-lg transition-colors"
								style={{ 
								color: colors.textSecondary,
								backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
								}}
								aria-label="Close user panel"
							>
								<XMarkIcon className="w-5 h-5" />
							</button>
							</div>

							{/* Error Message for Remove User */}
							{formError && (
							<div className="mb-6 p-4 rounded-lg border bg-red-50 border-red-200 text-red-700">
								<div className="flex items-center">
								<div className="flex-shrink-0">
									<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
									</svg>
								</div>
								<div className="ml-3">
									<p className="text-sm font-medium">{formError}</p>
								</div>
								<div className="ml-auto pl-3">
									<button
									onClick={() => setFormError(null)}
									className="inline-flex rounded-md p-1.5 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
									>
									<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
									</svg>
									</button>
								</div>
								</div>
							</div>
							)}

							{/* Permissions Section */}
							<div className="flex-1">
								<h3 className="font-semibold mb-4" style={{ color: colors.text }}>
									Permissions
								</h3>
								<div className="space-y-3 mb-6">
									<label className="flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer" 
										style={{ backgroundColor: colors.hoverBg }}>
										<input
											type="checkbox"
											checked={(userPerms[selectedUser.id]?.canReadAnalytics) || false}
											onChange={(e) => handlePermissionChange('canReadAnalytics', e.target.checked)}
											className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
										/>
										<span style={{ color: colors.text }}>Can read Analytics</span>
									</label>
									<label className="flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer" 
										style={{ backgroundColor: colors.hoverBg }}>
										<input
											type="checkbox"
											checked={(userPerms[selectedUser.id]?.canSeeConversations) || false}
											onChange={(e) => handlePermissionChange('canSeeConversations', e.target.checked)}
											className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
										/>
										<span style={{ color: colors.text }}>Can see Conversations</span>
									</label>
								</div>

								{/* Actions */}
								<div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: colors.border }}>
									<button 
										onClick={handleSavePermissions} 
										className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
									>
										<CheckIcon className="w-4 h-4" />
										Save Permissions
									</button>
									<button
										onClick={() => handleRemoveUser(selectedUser.id)}
										className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
											removeConfirmFor === selectedUser.id 
												? 'bg-red-600 text-white hover:bg-red-700' 
												: 'border text-red-600 hover:bg-red-50'
										}`}
										style={{
											borderColor: removeConfirmFor === selectedUser.id ? 'transparent' : colors.danger
										}}
									>
										<TrashIcon className="w-4 h-4" />
										{removeConfirmFor === selectedUser.id ? 'Click to Confirm' : 'Remove User'}
									</button>
								</div>
							</div>
						</div>
					)}

					{/* Add User Form */}
					{showAddForm && (
						<div 
							className="flex-1 rounded-xl border p-6 flex flex-col"
							style={{ 
							backgroundColor: colors.cardBg, 
							borderColor: colors.border 
							}}
						>
							{/* Header with Close Button */}
							<div className="flex items-center justify-between mb-6">
							<h2 className="text-xl font-semibold" style={{ color: colors.text }}>
								Add Team Member
							</h2>
							<button
								onClick={handleCloseAddForm}
								className="p-2 rounded-lg transition-colors"
								style={{ 
								color: colors.textSecondary,
								backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
								}}
								aria-label="Close add user form"
							>
								<XMarkIcon className="w-5 h-5" />
							</button>
							</div>

							{/* Error/Success Messages */}
							{(formError || formSuccess) && (
							<div className={`mb-6 p-4 rounded-lg border ${
								formError 
								? 'bg-red-50 border-red-200 text-red-700' 
								: 'bg-green-50 border-green-200 text-green-700'
							}`}>
								<div className="flex items-center">
								<div className="flex-shrink-0">
									{formError ? (
									<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
									</svg>
									) : (
									<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
									</svg>
									)}
								</div>
								<div className="ml-3">
									<p className="text-sm font-medium">
									{formError || formSuccess}
									</p>
								</div>
								<div className="ml-auto pl-3">
									<button
									onClick={() => {
										setFormError(null);
										setFormSuccess(null);
									}}
									className="inline-flex rounded-md p-1.5 hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2"
									>
									<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
									</svg>
									</button>
								</div>
								</div>
							</div>
							)}

							{/* Form */}
							<form onSubmit={handleAddUser} className="flex-1 flex flex-col">
							<div className="space-y-4 flex-1">
								<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<label className="text-sm font-medium" style={{ color: colors.textSecondary }}>
									First Name *
									</label>
									<input 
									value={firstName} 
									onChange={(e) => {
										setFirstName(e.target.value);
										setFormError(null); // Clear error when user starts typing
									}} 
									className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
									style={{ 
										backgroundColor: colors.inputBg, 
										borderColor: formError ? colors.danger : colors.border,
										color: colors.text
									}}
									placeholder="Enter first name"
									required
									/>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium" style={{ color: colors.textSecondary }}>
									Last Name *
									</label>
									<input 
									value={lastName} 
									onChange={(e) => {
										setLastName(e.target.value);
										setFormError(null);
									}} 
									className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
									style={{ 
										backgroundColor: colors.inputBg, 
										borderColor: formError ? colors.danger : colors.border,
										color: colors.text
									}}
									placeholder="Enter last name"
									required
									/>
								</div>
								</div>
								<div className="space-y-2">
								<label className="text-sm font-medium" style={{ color: colors.textSecondary }}>
									Email *
								</label>
								<input 
									type="email" 
									value={email} 
									onChange={(e) => {
									setEmail(e.target.value);
									setFormError(null);
									}} 
									className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
									style={{ 
									backgroundColor: colors.inputBg, 
									borderColor: formError ? colors.danger : colors.border,
									color: colors.text
									}}
									placeholder="Enter email address"
									required
								/>
								</div>
								<div className="space-y-2">
								<label className="text-sm font-medium" style={{ color: colors.textSecondary }}>
									Password *
								</label>
								<div className="relative">
									<input 
									type={showPassword ? "text" : "password"}
									value={password} 
									onChange={(e) => {
										setPassword(e.target.value);
										setFormError(null);
									}} 
									className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors pr-10"
									style={{ 
										backgroundColor: colors.inputBg, 
										borderColor: formError ? colors.danger : colors.border,
										color: colors.text
									}}
									placeholder="Set temporary password"
									required
									minLength={6}
									/>
									<button
									type="button"
									onClick={togglePasswordVisibility}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded transition-colors"
									style={{ 
										color: colors.textSecondary,
										backgroundColor: 'transparent'
									}}
									aria-label={showPassword ? "Hide password" : "Show password"}
									>
									{showPassword ? (
										<EyeSlashIcon className="w-4 h-4" />
									) : (
										<EyeIcon className="w-4 h-4" />
									)}
									</button>
								</div>
								<p className="text-xs" style={{ color: colors.textSecondary }}>
									Set a temporary password for the new user (minimum 6 characters)
								</p>
								</div>
							</div>

							{/* Form Actions */}
							<div className="flex gap-3 pt-6 border-t" style={{ borderColor: colors.border }}>
								<button 
								type="submit" 
								className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
								disabled={!firstName || !lastName || !email || !password}
								>
								<UserPlusIcon className="w-4 h-4" />
								{formSuccess ? 'Success!' : 'Add Team Member'}
								</button>
								<button
								type="button"
								onClick={handleCloseAddForm}
								className="px-6 py-3 border rounded-lg transition-colors font-medium"
								style={{ 
									backgroundColor: colors.inputBg,
									borderColor: colors.border,
									color: colors.text
								}}
								>
								Cancel
								</button>
							</div>
							</form>
						</div>
						)}

					{/* Empty State */}
					{!selectedUser && !showAddForm && (
						<div 
							className="flex-1 rounded-xl border flex items-center justify-center"
							style={{ 
								backgroundColor: colors.cardBg, 
								borderColor: colors.border 
							}}
						>
							<div className="text-center p-8">
								<div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" 
									style={{ backgroundColor: colors.hoverBg }}>
									<UserPlusIcon className="w-8 h-8" style={{ color: colors.textSecondary }} />
								</div>
								<h3 className="text-lg font-semibold mb-2" style={{ color: colors.text }}>
									No Member Selected
								</h3>
								<p className="text-sm max-w-sm" style={{ color: colors.textSecondary }}>
									Select a team member from the list to view and manage their permissions, or add a new team member to get started.
								</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Organization;