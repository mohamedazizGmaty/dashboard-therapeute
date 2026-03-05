import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import {
  Search, Calendar,
  Home, Users, Settings, FileText, Bell,
  ChevronRight, ChevronLeft, Sun, Moon, Loader2
} from 'lucide-react';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    // 1. Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session && location.pathname !== '/auth') {
        navigate('/auth');
      }
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const getPageTitle = () => {
    if (location.pathname.startsWith('/patients/')) {
      return { title: 'Dossier Patient', subtitle: 'Vue détaillée et suivi du patient' };
    }
    switch (location.pathname) {
      case '/': return { title: 'Tableau de bord', subtitle: 'Aperçu global de votre activité' };
      case '/patients': return { title: 'Liste des Patients', subtitle: 'Gérez tous vos patients et leurs dossiers' };
      case '/agenda': return { title: 'Agenda', subtitle: 'Rendez-vous et plannings' };
      case '/rapports': return { title: 'Rapports', subtitle: 'Analyses et statistiques globales' };
      default: return { title: 'Tableau de bord', subtitle: '' };
    }
  };

  const headerInfo = getPageTitle();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (!session && location.pathname !== '/auth') {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-300">

      {/* Expandable Sidebar */}
      <aside
        className={`relative bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col py-6 shrink-0 transition-all duration-300 ease-in-out z-20 ${isSidebarExpanded ? 'w-64 px-4' : 'w-20 items-center'}`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
          className="absolute -right-3 top-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 w-6 h-6 rounded-full flex items-center justify-center shadow-sm z-30 transition-colors"
        >
          {isSidebarExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        <div className={`flex items-center mb-10 h-12 overflow-hidden transition-all duration-300 ${isSidebarExpanded ? 'px-2 w-full justify-start' : 'w-12 justify-center'}`}>
          <img src="/logo-dark.png" alt="Synapsia" className="dark:hidden h-full max-w-[180px] object-contain object-left" />
          <img src="/logo-white.png" alt="Synapsia" className="hidden dark:block h-full max-w-[180px] object-contain object-left" />
        </div>

        <nav className="flex-1 flex flex-col gap-2 w-full mt-2">
          <SidebarItem to="/" icon={<Home size={22} />} label="Accueil" expanded={isSidebarExpanded} />
          <SidebarItem to="/patients" icon={<Users size={22} />} label="Patients" expanded={isSidebarExpanded} />
          <SidebarItem to="/agenda" icon={<Calendar size={22} />} label="Agenda" expanded={isSidebarExpanded} />
          <SidebarItem to="/rapports" icon={<FileText size={22} />} label="Rapports" expanded={isSidebarExpanded} />
        </nav>

        <div className="mt-auto flex flex-col gap-4 w-full">
          <SidebarItem to="/settings" icon={<Settings size={22} />} label="Paramètres" expanded={isSidebarExpanded} isButton />

          <div
            onClick={handleLogout}
            className={`p-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-3 transition-all duration-300 cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-500/10 group ${isSidebarExpanded ? 'justify-start' : 'justify-center border-transparent bg-transparent dark:bg-transparent dark:border-transparent'}`}
          >
            <div className={`w-10 h-10 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm transition-all group-hover:ring-2 ring-rose-500`}>
              <img src={`https://ui-avatars.com/api/?name=${session?.user?.user_metadata?.full_name || 'User'}&background=0D8ABC&color=fff`} alt="User" className="w-full h-full object-cover" />
            </div>
            <div className={`overflow-hidden transition-all duration-300 ${isSidebarExpanded ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0'}`}>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap group-hover:text-rose-600 transition-colors uppercase tracking-tight">
                {session?.user?.user_metadata?.full_name?.split(' ')[0] || 'Expert'}
              </p>
              <p className="text-[10px] font-black text-rose-500 whitespace-nowrap uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Déconnexion</p>
              <p className={`text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap group-hover:hidden`}>Physiothérapeute</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Header */}
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between shrink-0 transition-colors duration-300">
          <div>
            <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{headerInfo.title}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{headerInfo.subtitle}</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative border border-slate-200 dark:border-slate-700 rounded-full bg-slate-50 dark:bg-slate-800 transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 w-64 focus-within:w-80 overflow-hidden flex items-center">
              <Search className="absolute left-3 text-slate-400 dark:text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Rechercher..."
                className="pl-10 pr-4 py-2 w-full bg-transparent text-sm focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium text-slate-700 dark:text-slate-200"
              />
            </div>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="relative p-2 text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-50 dark:hover:bg-slate-800"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button className="relative p-2 text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-50 dark:hover:bg-slate-800">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900 border-2 border-white dark:border-slate-900"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Dashboard Content from React Router */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

// --- Subcomponents ---

function SidebarItem({ icon, label, to, expanded, isButton = false }: { icon: React.ReactNode, label: string, to: string, expanded: boolean, isButton?: boolean }) {

  const content = (
    <>
      <div className="shrink-0 flex items-center justify-center w-6">{icon}</div>
      <span className={`ml-3 font-medium text-sm whitespace-nowrap transition-all duration-300 ${expanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute pointer-events-none'}`}>
        {label}
      </span>

      {/* Tooltip on hover for collapsed sidebar */}
      {!expanded && (
        <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-800 dark:bg-slate-700 text-white text-xs font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
          {label}
          {/* Tooltip arrow */}
          <span className="absolute right-full top-1/2 -translate-y-1/2 border-[4px] border-transparent border-r-slate-800 dark:border-r-slate-700"></span>
        </span>
      )}
    </>
  );

  const baseClasses = `group relative flex items-center p-3 rounded-xl transition-all duration-200 w-full ${expanded ? 'justify-start px-4' : 'justify-center'}`;

  if (isButton) {
    return (
      <button className={`${baseClasses} text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50`} aria-label={label}>
        {content}
      </button>
    );
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) => `${baseClasses} ${isActive
        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10'
        : 'text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
        }`}
      aria-label={label}
    >
      {content}
    </NavLink>
  );
}
