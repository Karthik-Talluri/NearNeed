'use client';

import React from 'react';
import { useNearNeed } from '@/context/NearNeedContext';
import { UserRole } from '@/types';
import { UserCheck, Store, ShieldAlert, Sparkles } from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
  const { currentUser, switchRole } = useNearNeed();

  const roles: { role: UserRole; label: string; icon: React.ReactNode; color: string }[] = [
    {
      role: 'CUSTOMER',
      label: 'Customer View',
      icon: <UserCheck className="w-4 h-4" />,
      color: 'bg-emerald-600 text-white shadow-sm',
    },
    {
      role: 'STORE_OWNER',
      label: 'Store Owner View',
      icon: <Store className="w-4 h-4" />,
      color: 'bg-teal-700 text-white shadow-sm',
    },
    {
      role: 'ADMIN',
      label: 'Admin Portal',
      icon: <ShieldAlert className="w-4 h-4" />,
      color: 'bg-slate-900 text-white shadow-sm',
    },
  ];

  return (
    <div className="bg-emerald-950 text-emerald-100 text-xs py-2 px-4 border-b border-emerald-900">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium">
          <span className="flex items-center gap-1.5 bg-emerald-800/60 text-emerald-200 px-2 py-0.5 rounded-full text-[11px]">
            <Sparkles className="w-3 h-3 text-emerald-400" /> Demo Role Switcher
          </span>
          <span className="hidden md:inline text-emerald-300/80">
            Currently logged in as: <strong className="text-white">{currentUser.name}</strong> ({currentUser.role})
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-emerald-900/60 p-1 rounded-lg border border-emerald-800">
          {roles.map((r) => {
            const isActive = currentUser.role === r.role;
            return (
              <button
                key={r.role}
                onClick={() => switchRole(r.role)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-medium ${
                  isActive
                    ? r.color
                    : 'text-emerald-300 hover:text-white hover:bg-emerald-800/50'
                }`}
              >
                {r.icon}
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
