import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';

const UserProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(45); // minutes
  const dropdownRef = useRef(null);

  // Mock user data - in real app, this would come from auth context
  const currentUser = {
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@company.com',
    role: 'Compliance Officer',
    avatar: null,
    lastLogin: '2025-10-07 07:30:00'
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef?.current && !dropdownRef?.current?.contains(event?.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Session timeout countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTimeLeft(prev => Math.max(0, prev - 1));
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    // In real app, this would call auth logout
    console.log('Logging out...');
    setIsOpen(false);
  };

  const handleProfileSettings = () => {
    console.log('Opening profile settings...');
    setIsOpen(false);
  };

  const handleSecuritySettings = () => {
    console.log('Opening security settings...');
    setIsOpen(false);
  };

  const getInitials = (name) => {
    return name?.split(' ')?.map(n => n?.[0])?.join('')?.toUpperCase();
  };

  const getSessionStatus = () => {
    if (sessionTimeLeft > 30) return { color: 'text-success', status: 'Active' };
    if (sessionTimeLeft > 10) return { color: 'text-warning', status: 'Warning' };
    return { color: 'text-error', status: 'Expiring' };
  };

  const sessionStatus = getSessionStatus();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted transition-colors duration-200 ease-out"
        aria-label="User profile menu"
      >
        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
          {getInitials(currentUser?.name)}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-foreground">{currentUser?.name}</div>
          <div className="text-xs text-muted-foreground">{currentUser?.role}</div>
        </div>
        <Icon 
          name="ChevronDown" 
          size={16} 
          className={`text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-popover border border-border rounded-lg shadow-elevation z-200 animate-fade-in">
          {/* User Info Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-medium">
                {getInitials(currentUser?.name)}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-popover-foreground">{currentUser?.name}</div>
                <div className="text-xs text-muted-foreground">{currentUser?.email}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  <span className="font-medium">{currentUser?.role}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Session Status */}
          <div className="p-3 bg-muted/50 border-b border-border">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Session Status:</span>
              <span className={`font-medium ${sessionStatus?.color}`}>
                {sessionStatus?.status} ({sessionTimeLeft}m left)
              </span>
            </div>
            <div className="mt-2 w-full bg-border rounded-full h-1">
              <div 
                className={`h-1 rounded-full transition-all duration-300 ${
                  sessionTimeLeft > 30 ? 'bg-success' : 
                  sessionTimeLeft > 10 ? 'bg-warning' : 'bg-error'
                }`}
                style={{ width: `${(sessionTimeLeft / 60) * 100}%` }}
              />
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <button
              onClick={handleProfileSettings}
              className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-popover-foreground hover:bg-muted rounded-md transition-colors duration-200"
            >
              <Icon name="User" size={16} />
              <span>Profile Settings</span>
            </button>
            
            <button
              onClick={handleSecuritySettings}
              className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-popover-foreground hover:bg-muted rounded-md transition-colors duration-200"
            >
              <Icon name="Shield" size={16} />
              <span>Security Settings</span>
            </button>

            <div className="border-t border-border my-2" />

            <div className="px-3 py-2">
              <div className="text-xs text-muted-foreground mb-1">Last Login</div>
              <div className="text-xs font-mono text-popover-foreground">
                {new Date(currentUser.lastLogin)?.toLocaleString()}
              </div>
            </div>

            <div className="border-t border-border my-2" />

            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-error hover:bg-error/10 rounded-md transition-colors duration-200"
            >
              <Icon name="LogOut" size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;