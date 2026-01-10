import React, { useState } from 'react';

import Icon from '../../../components/AppIcon';

const SSOOptions = () => {
  const [loadingProvider, setLoadingProvider] = useState(null);

  const ssoProviders = [
    {
      id: 'microsoft',
      name: 'Microsoft Active Directory',
      icon: 'Building2',
      color: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-white'
    },
    {
      id: 'okta',
      name: 'Okta',
      icon: 'Shield',
      color: 'bg-slate-800 hover:bg-slate-900',
      textColor: 'text-white'
    },
    {
      id: 'google',
      name: 'Google Workspace',
      icon: 'Chrome',
      color: 'bg-white hover:bg-gray-50 border border-border',
      textColor: 'text-foreground'
    }
  ];

  const handleSSOLogin = async (providerId) => {
    setLoadingProvider(providerId);
    
    try {
      // Simulate SSO authentication delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock SSO authentication - in real app, this would redirect to provider
      alert(`SSO authentication with ${ssoProviders?.find(p => p?.id === providerId)?.name} would be implemented here.`);
      
    } catch (error) {
      console.error('SSO authentication failed:', error);
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-card text-muted-foreground">Or continue with</span>
        </div>
      </div>
      <div className="space-y-3">
        {ssoProviders?.map((provider) => (
          <button
            key={provider?.id}
            onClick={() => handleSSOLogin(provider?.id)}
            disabled={loadingProvider !== null}
            className={`
              w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-md
              transition-colors duration-200 font-medium text-sm
              ${provider?.color} ${provider?.textColor}
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {loadingProvider === provider?.id ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Icon name={provider?.icon} size={18} />
                <span>Continue with {provider?.name}</span>
              </>
            )}
          </button>
        ))}
      </div>
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          By signing in, you agree to our{' '}
          <button className="text-accent hover:text-accent/80 underline">
            Terms of Service
          </button>{' '}
          and{' '}
          <button className="text-accent hover:text-accent/80 underline">
            Privacy Policy
          </button>
        </p>
      </div>
    </div>
  );
};

export default SSOOptions;