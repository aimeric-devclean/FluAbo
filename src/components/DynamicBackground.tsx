import React from 'react';

export const DynamicBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-violet-50/30 to-pink-50/20 dark:from-slate-950 dark:via-violet-950/20 dark:to-slate-950" />

      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-violet-400/20 via-blue-400/20 to-pink-400/15 dark:from-violet-500/10 dark:via-blue-500/10 dark:to-pink-500/8 rounded-full blur-3xl animate-float"
           style={{ animationDuration: '8s' }} />

      <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-tr from-blue-400/15 via-violet-400/15 to-blue-400/10 dark:from-blue-500/8 dark:via-violet-500/8 dark:to-blue-500/5 rounded-full blur-3xl animate-float"
           style={{ animationDuration: '10s', animationDelay: '2s' }} />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-pink-400/12 via-violet-400/12 to-blue-400/12 dark:from-pink-500/6 dark:via-violet-500/6 dark:to-blue-500/6 rounded-full blur-3xl animate-float"
           style={{ animationDuration: '12s', animationDelay: '4s' }} />

      <div className="absolute top-20 left-20 w-[300px] h-[300px] bg-gradient-to-br from-violet-500/10 to-transparent rounded-full blur-2xl animate-pulse"
           style={{ animationDuration: '6s' }} />

      <div className="absolute bottom-20 right-20 w-[350px] h-[350px] bg-gradient-to-tl from-pink-500/10 to-transparent rounded-full blur-2xl animate-pulse"
           style={{ animationDuration: '7s', animationDelay: '1s' }} />

      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDAsIDAsIDAsIDAuMDIpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20 dark:opacity-10" />
    </div>
  );
};
