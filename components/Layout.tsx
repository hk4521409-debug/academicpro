import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Bell, Search, Menu, LogOut, User as UserIcon, Shield, RotateCcw, LayoutDashboard, Users, BookOpen, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const { user, logout, stopImpersonation, isAuthenticated } = useAuth();
  const { state, dispatch, undo } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  // Global Search
  const searchResults = searchQuery.length > 1 ? [
      ...state.students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) && !s.isDeleted).map(s => ({ ...s, type: 'Student' })),
      ...state.faculty.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()) && !f.isDeleted).map(f => ({ ...f, type: 'Faculty' }))
  ] : [];

  if (!isAuthenticated) return <>{children}</>;

  const NavItem = ({ page, icon: Icon, label }: any) => (
    <button
      onClick={() => onNavigate(page)}
      className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors ${
        currentPage === page ? 'bg-brand-50 text-brand-700 border-r-4 border-brand-600' : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-5 h-5 mr-3" />
      {label}
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center mr-3">
             <span className="text-white font-bold">AP</span>
          </div>
          <span className="font-bold text-gray-800 text-lg">AcademiaPro</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <NavItem page="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem page="students" icon={Users} label="Students" />
          <NavItem page="faculty" icon={BookOpen} label="Faculty" />
          {user?.role === 'SUPER_ADMIN' && (
             <NavItem page="admin" icon={Shield} label="Administration" />
          )}
        </nav>

        <div className="p-4 border-t border-gray-200">
            {user?.name.startsWith('Impersonated') && (
                <button onClick={stopImpersonation} className="w-full mb-2 bg-yellow-100 text-yellow-800 px-3 py-2 rounded text-xs font-bold">
                    Stop Impersonating
                </button>
            )}
          <div className="flex items-center">
             <img src={user?.avatar} alt="User" className="w-8 h-8 rounded-full bg-gray-300" />
             <div className="ml-3">
                 <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                 <p className="text-xs text-gray-500 capitalize">{user?.role.toLowerCase().replace('_', ' ')}</p>
             </div>
             <button onClick={logout} className="ml-auto text-gray-400 hover:text-red-500">
                 <LogOut className="w-4 h-4" />
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10 relative">
          <div className="flex items-center flex-1 max-w-xl">
             <div className="relative w-full">
                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                 <input 
                    type="text" 
                    placeholder="Global Search (CMD+K)..." 
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                 />
                 {/* Search Dropdown */}
                 {searchQuery.length > 1 && (
                     <div className="absolute top-full left-0 w-full bg-white shadow-xl rounded-md mt-1 border border-gray-200 overflow-hidden z-50">
                        {searchResults.length === 0 ? (
                            <div className="p-3 text-sm text-gray-500">No results found.</div>
                        ) : (
                            searchResults.map((res: any) => (
                                <div key={res.id} className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-0 flex justify-between items-center">
                                    <span className="font-medium text-gray-800">{res.name}</span>
                                    <span className="text-xs text-gray-400 uppercase tracking-wide">{res.type}</span>
                                </div>
                            ))
                        )}
                     </div>
                 )}
             </div>
          </div>

          <div className="flex items-center space-x-4">
             {state.lastAction && (
                 <button onClick={undo} className="flex items-center text-sm text-brand-600 hover:text-brand-800 bg-brand-50 px-3 py-1 rounded-full transition-colors">
                     <RotateCcw className="w-3 h-3 mr-1" />
                     Undo Last
                 </button>
             )}
             
             <div className="relative">
                 <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 text-gray-400 hover:text-gray-600">
                     <Bell className="w-6 h-6" />
                     {state.notifications.filter(n => !n.read).length > 0 && (
                         <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
                     )}
                 </button>
                 {showNotifications && (
                     <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 shadow-xl rounded-lg overflow-hidden z-50">
                        <div className="p-3 border-b bg-gray-50 font-medium text-gray-700">Notifications</div>
                        <div className="max-h-64 overflow-y-auto">
                            {state.notifications.length === 0 ? <p className="p-4 text-sm text-gray-500">All caught up!</p> :
                             state.notifications.map(n => (
                                 <div key={n.id} className="p-3 border-b last:border-0 hover:bg-gray-50 relative group">
                                     <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                                     <p className="text-xs text-gray-500 mt-1">{n.message}</p>
                                     <button 
                                        onClick={(e) => { e.stopPropagation(); dispatch({type: 'DISMISS_NOTIFICATION', payload: n.id}); }}
                                        className="absolute top-2 right-2 text-gray-300 hover:text-gray-500 hidden group-hover:block"
                                     >
                                         &times;
                                     </button>
                                 </div>
                             ))
                            }
                        </div>
                     </div>
                 )}
             </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
           {children}
        </main>
      </div>
    </div>
  );
};
