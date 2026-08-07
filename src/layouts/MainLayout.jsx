import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Map, Settings, Bell, LayoutDashboard, FileText, HardDrive, AlertTriangle, Check, Trash2, Moon, Sun, Mail, X } from 'lucide-react';
import { cn } from '../utils/cn';
import { notificationService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import logoImage from '../assets/WildGuardLogo.png';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Records', href: '/records', icon: FileText },
  { name: 'Edge Devices', href: '/edge-devices', icon: HardDrive },
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
      case '/': return 'Live Monitoring';
      case '/records': return 'Records Management';
      case '/edge-devices': return 'Edge Devices';
      default: return 'WildGuard';
    }
  };

  useEffect(() => {
    // 1. Run maintenance check once when app loads
    const initNotifications = async () => {
      try {
        await notificationService.checkMaintenance();
        fetchNotifications();
      } catch (error) {
        console.error('Error during initial notification check', error);
      }
    };
    initNotifications();

    // Setup polling or just refresh when dropdown opens
    const interval = setInterval(fetchNotifications, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Handle click outside to close dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    // Initialize theme from local storage or default
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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-20">
        <div className="p-6 flex items-center space-x-3">
          <img 
            src={logoImage} 
            alt="WildGuard Logo" 
            className="h-10 w-auto object-contain cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => setIsLogoEnlarged(true)}
          />
          <span className="text-xl font-bold text-gray-800 tracking-tight">WildGuard</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                  isActive
                    ? 'bg-green-50 text-green-700 shadow-sm border border-green-100'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                )
              }
            >
              <item.icon className={cn("w-5 h-5 transition-colors", "text-current")} />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-colors group"
          >
            <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform" />
            <span className="font-medium">Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen relative">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-[2000] absolute top-0 w-full">
          <h1 className="text-xl font-extrabold text-black">{getTitle()}</h1>
          
          {/* Notification Center */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) fetchNotifications();
              }}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-6 h-6 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
                </span>
              )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 flex flex-col max-h-[80vh]"
                >
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center sticky top-0">
                    <h3 className="font-bold text-gray-800">Notifications</h3>
                    <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-1 rounded-full">{unreadCount} New</span>
                  </div>
                  
                  <div className="overflow-y-auto p-2">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">You're all caught up!</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {notifications.map((notif) => {
                          const isWildlife = notif.type === 'WILDLIFE_ALERT';
                          return (
                            <div 
                              key={notif.id} 
                              className={`p-3 rounded-xl transition-colors ${notif.read_status ? 'bg-white opacity-70 hover:opacity-100' : 'bg-blue-50/50'}`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex space-x-3 items-start">
                                  <div className={`p-2 rounded-lg ${isWildlife ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                    <AlertTriangle className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-800">{isWildlife ? 'Wildlife Alert' : 'Maintenance Alert'}</h4>
                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notif.message}</p>
                                    <div className="text-[10px] text-gray-400 mt-2 font-medium">
                                      {notif.received_date} • {notif.received_time?.substring(0,5)}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100">
                                  {!notif.read_status && (
                                    <button onClick={(e) => handleMarkAsRead(notif.id, e)} title="Mark as read" className="text-blue-500 hover:text-blue-700 bg-blue-50 p-1.5 rounded-md transition-colors">
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <button onClick={(e) => handleDelete(notif.id, e)} title="Delete" className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-colors">
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
        </header>
        <div className="flex-1 pt-16 relative">
          <Outlet />
        </div>
      </main>

      {/* Enlarged Logo Overlay */}
      <AnimatePresence>
        {isLogoEnlarged && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
              onClick={() => setIsLogoEnlarged(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative z-10 p-4 bg-white/10 rounded-3xl backdrop-blur-md cursor-pointer"
              onClick={() => setIsLogoEnlarged(false)}
            >
              <img 
                src={logoImage} 
                alt="WildGuard Logo Enlarged" 
                className="max-w-[90vw] max-h-[80vh] object-contain drop-shadow-2xl" 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowSettings(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="bg-slate-800 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-slate-300 hover:text-white transition-colors p-1 hover:bg-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                
                {/* Theme Setting */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Appearance</h3>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center space-x-3">
                      {isDarkMode ? <Moon className="w-5 h-5 text-indigo-500" /> : <Sun className="w-5 h-5 text-orange-500" />}
                      <span className="font-medium text-gray-800">Website Theme</span>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isDarkMode ? 'bg-indigo-500' : 'bg-gray-300'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 ml-1">Switch between light and dark mode.</p>
                </div>

                {/* Support Setting */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Support</h3>
                  <a 
                    href="mailto:yeshwanthraj006@gmail.com?subject=WildGuard Support Request"
                    className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-100 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Contact Support</span>
                    </div>
                    <span className="text-xs font-semibold text-blue-600 bg-white px-2 py-1 rounded-full group-hover:bg-blue-50 transition-colors">yeshwanthraj006@gmail.com</span>
                  </a>
                  <p className="text-xs text-gray-500 mt-2 ml-1">Have queries or problems? Write directly to the admin.</p>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainLayout;
