import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { Map, Settings, Bell, LayoutDashboard, FileText, HardDrive, AlertTriangle, Check, Trash2, Moon, Sun, Mail, X, MessageSquare, BookOpen, UserCircle, LogOut } from 'lucide-react';
import { cn } from '../utils/cn';
import { notificationService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import logoImage from '../assets/WildGuardLogoTransparent.png';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import { loadingStore } from '../utils/loadingStore';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, subtitle: 'Real-time wildlife hotspots & conflict map', end: true },
  { name: 'Incident Records', href: '/dashboard/records', icon: FileText, subtitle: 'Incident history and case management' },
  { name: 'Edge Devices', href: '/dashboard/edge-devices', icon: HardDrive, subtitle: 'Edge AI nodes and maintenance' },
  { name: 'Community Directory', href: '/dashboard/directory', icon: BookOpen, subtitle: 'Manage alert zones & resident contacts' },
  { name: 'SMS Broadcasts', href: '/dashboard/notify-alerts', icon: MessageSquare, subtitle: 'SMS broadcasts and region alerts' },
];

const MainLayout = () => {
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLogoEnlarged, setIsLogoEnlarged] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const dropdownRef = useRef(null);
  
  const getTitle = () => {
    switch (location.pathname) {
      case '/dashboard': return 'Dashboard';
      case '/dashboard/records': return 'Incident Records';
      case '/dashboard/edge-devices': return 'Sensor Network';
      case '/dashboard/notify-alerts': return 'SMS Broadcasts';
      case '/dashboard/directory': return 'Community Directory';
      default: return 'WildGuard';
    }
  };
  const currentNav = navItems.find((item) => item.href === location.pathname);

  // Brief centered loader whenever the user navigates to another page
  useEffect(() => {
    loadingStore.start();
    const timer = setTimeout(() => loadingStore.stop(), 400);
    return () => {
      clearTimeout(timer);
      loadingStore.stop();
    };
  }, [location.pathname]);

  useEffect(() => {
    const initNotifications = async () => {
      try {
        await notificationService.checkMaintenance();
        fetchNotifications();
      } catch (error) {
        console.error('Error during initial notification check', error);
      }
    };
    initNotifications();

    const interval = setInterval(fetchNotifications, 30000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark-theme');
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
      }
      return newMode;
    });
  };

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to delete notification', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read_status).length;

  return (
    <div className="flex h-screen bg-slate-50/50 overflow-hidden selection:bg-emerald-200 selection:text-emerald-900 font-sans">
      
      {/* Sleek Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200/60 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-30">
        <div className="p-6 flex items-center gap-3">
          <img 
            src={logoImage} 
            alt="WildGuard Logo" 
            className="h-9 w-auto object-contain cursor-pointer transition-transform hover:scale-105 drop-shadow-sm" 
            onClick={() => setIsLogoEnlarged(true)}
          />
          <Link to="/" className="text-xl font-black tracking-tight text-slate-900 transition-colors">
            Wild<span className="text-emerald-600">Guard</span>
          </Link>
        </div>

        <div className="px-6 pb-2 text-xs font-bold tracking-wider text-slate-400 uppercase">
          Dashboard
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'relative flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-300 group overflow-hidden',
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 shadow-[0_2px_10px_rgba(16,185,129,0.05)]'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div layoutId="activeNavIndicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-emerald-500 rounded-r-full" />
                  )}
                  <item.icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-emerald-600" : "text-slate-400")} />
                  <span className={cn("font-medium text-sm tracking-wide", isActive ? "font-semibold" : "")}>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 mt-auto">
          <button 
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-slate-500 hover:text-slate-800 hover:bg-white hover:shadow-sm rounded-xl transition-all group border border-transparent hover:border-slate-200"
          >
            <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500 text-slate-400 group-hover:text-slate-600" />
            <span className="font-semibold tracking-wide">Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen relative bg-slate-50/50">
        
        {/* Premium Header */}
        <header className="h-18 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-8 z-20 sticky top-0 supports-backdrop-filter:bg-white/60">
          <div className="flex items-center gap-4">
            {currentNav && (
              <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
                <currentNav.icon className="w-5 h-5" />
              </div>
            )}
            <div className="leading-tight">
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900">{getTitle()}</h2>
              <p className="text-sm font-medium text-slate-500 hidden sm:block">{currentNav?.subtitle}</p>
            </div>
            
            <div className="ml-6 hidden lg:flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              System Live
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            
            {/* Notification Center */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) fetchNotifications();
                }}
                className="relative p-2.5 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
              >
                <Bell className="w-5 h-5 text-slate-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-2 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white"></span>
                  </span>
                )}
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden z-50 flex flex-col max-h-[80vh]"
                  >
                    <div className="bg-slate-50/80 backdrop-blur-md px-5 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
                      <h3 className="font-extrabold text-slate-800">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">{unreadCount} New</span>
                      )}
                    </div>
                    
                    <div className="overflow-y-auto p-3 bg-white">
                      {notifications.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 flex flex-col items-center">
                          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 border border-slate-100">
                            <Check className="w-6 h-6 text-emerald-400" />
                          </div>
                          <p className="text-sm font-medium">You're all caught up!</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {notifications.map((notif) => {
                            const isWildlife = notif.type === 'WILDLIFE_ALERT';
                            return (
                              <div 
                                key={notif.id} 
                                className={cn(
                                  "p-4 rounded-2xl transition-all duration-300 border",
                                  notif.read_status 
                                    ? "bg-white border-transparent hover:border-slate-100 hover:bg-slate-50" 
                                    : "bg-blue-50/50 border-blue-100 shadow-sm"
                                )}
                              >
                                <div className="flex justify-between items-start gap-3">
                                  <div className="flex space-x-3 items-start flex-1">
                                    <div className={cn("p-2 rounded-xl shrink-0 mt-0.5", isWildlife ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600")}>
                                      <AlertTriangle className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <h4 className={cn("text-sm font-bold", notif.read_status ? "text-slate-700" : "text-slate-900")}>
                                        {isWildlife ? 'Wildlife Alert' : 'Maintenance Alert'}
                                      </h4>
                                      <p className={cn("text-sm mt-1 line-clamp-2 leading-snug", notif.read_status ? "text-slate-500" : "text-slate-600")}>{notif.message}</p>
                                      <div className="text-[11px] text-slate-400 mt-2 font-semibold tracking-wide uppercase">
                                        {notif.received_date} • {notif.received_time?.substring(0,5)}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-col space-y-1.5 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100 shrink-0">
                                    {!notif.read_status && (
                                      <button onClick={(e) => handleMarkAsRead(notif.id, e)} title="Mark as read" className="text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-500 p-2 rounded-lg transition-colors">
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    <button onClick={(e) => handleDelete(notif.id, e)} title="Delete" className="text-slate-400 hover:text-white hover:bg-red-500 p-2 rounded-lg transition-colors">
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="flex-1 relative overflow-y-auto overflow-x-hidden p-6 md:p-8">
          <div className="mx-auto max-w-7xl h-full">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Global centered loading animation */}
      <LoadingOverlay />

      {/* Enlarged Logo Overlay */}
      <AnimatePresence>
        {isLogoEnlarged && (
          <div className="fixed inset-0 z-3000 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl cursor-pointer"
              onClick={() => setIsLogoEnlarged(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="relative z-10 p-8 bg-white/5 rounded-[3rem] backdrop-blur-2xl cursor-pointer shadow-2xl border border-white/10"
              onClick={() => setIsLogoEnlarged(false)}
            >
              <img 
                src={logoImage} 
                alt="WildGuard Logo Enlarged" 
                className="max-w-[80vw] max-h-[70vh] object-contain drop-shadow-[0_0_60px_rgba(16,185,129,0.3)]" 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-4000 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
              onClick={() => setShowSettings(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-md overflow-hidden flex flex-col border border-slate-100"
            >
              <div className="bg-slate-900 px-8 py-6 flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-white flex items-center space-x-3">
                  <Settings className="w-5 h-5 text-emerald-400" />
                  <span>Preferences</span>
                </h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 space-y-8">
                
                {/* Theme Setting */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Appearance</h3>
                  <div className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/50 transition-colors rounded-2xl border border-slate-200">
                    <div className="flex items-center space-x-4">
                      <div className={cn("p-2 rounded-xl", isDarkMode ? "bg-indigo-100 text-indigo-600" : "bg-orange-100 text-orange-600")}>
                        {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                      </div>
                      <span className="font-bold text-slate-800">Interface Theme</span>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${isDarkMode ? 'bg-indigo-500' : 'bg-slate-300'}`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-3 font-medium px-1">Switch between light and dark mode across the application.</p>
                </div>

                {/* Support Setting */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Support & Contact</h3>
                  <a 
                    href="mailto:yeshwanthraj006@gmail.com?subject=WildGuard Support Request"
                    className="flex flex-col p-5 bg-emerald-50 hover:bg-emerald-100/80 rounded-2xl border border-emerald-100 transition-colors group relative overflow-hidden"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <Mail className="w-5 h-5 text-emerald-600" />
                      <span className="font-bold text-emerald-900">Technical Support</span>
                    </div>
                    <span className="text-sm font-semibold text-emerald-700">yeshwanthraj006@gmail.com</span>
                    
                    <ArrowRight className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </a>
                  <p className="text-xs text-slate-500 mt-3 font-medium px-1">Reach out to the engineering team for bug reports or feature requests.</p>
                </div>

              </div>
              
              <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-center">
                <button className="flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainLayout;
