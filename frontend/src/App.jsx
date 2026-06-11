import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useDashboardStats, useMe, useLogin, useLogout } from './hooks/useApi';
import { useTranslation, formatCurrency } from './i18n/translations';
import StockPage from './pages/StockPage';
import SellPage from './pages/SellPage';
import InvoicePage from './pages/InvoicePage';
import ProvidersPage from './pages/ProvidersPage';
import InvoicesPage from './pages/InvoicesPage';

// Theme Toggle Component
function ThemeToggle({ theme, toggleTheme, className = "" }) {
  return (
    <button
      onClick={toggleTheme}
      className={`w-10 h-10 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${className}`}
      title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {theme === 'dark' ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}

// Language Toggle Component
function LanguageToggle({ className = "", short = false }) {
  const { lang, toggleLanguage } = useTranslation();
  return (
    <button
      onClick={toggleLanguage}
      className={`px-2.5 py-1.5 flex items-center justify-center rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 select-none ${className}`}
      title={lang === 'en' ? "ប្តូរទៅភាសាខ្មែរ" : "Switch to English"}
    >
      <span>{short ? (lang === 'en' ? 'KH' : 'EN') : (lang === 'en' ? 'Khmer' : 'English')}</span>
    </button>
  );
}

// 1. Sidebar Nav Link Helper
function SidebarLink({ to, icon, label, onClick, isExpanded = true }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`group relative flex items-center transition-all duration-200 ${
        isExpanded 
          ? 'w-full gap-3 px-4 py-3 border-l-2 text-sm font-medium rounded-lg' 
          : 'w-12 h-12 justify-center mx-auto border-l-0 rounded-lg'
      } ${
        isActive
          ? 'bg-teal-50 text-teal-600 font-semibold border-teal-500 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-500'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-transparent'
      }`}
    >
      <div className="shrink-0">{icon}</div>
      {isExpanded ? (
        <span className="animate-fade-in truncate">{label}</span>
      ) : (
        <span className="md:hidden lg:hidden">{label}</span>
      )}
      
      {/* Tooltip for md breakpoint (collapsed sidebar) */}
      {!isExpanded && (
        <span className="absolute left-full ml-3 px-2.5 py-1 bg-teal-600 dark:bg-teal-500 text-white text-xs font-normal rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-md">
          {label}
        </span>
      )}
    </Link>
  );
}

// 2. Home View: Interactive Dashboard
function HomeView() {
  const { data: stats, isLoading, isError } = useDashboardStats();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('dashboard.subtitle')}</p>
        </div>
        
        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 h-32 animate-pulse shadow-sm" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-3">⚠️</div>
        <p className="text-sm text-rose-500 font-medium">{t('dashboard.failedLoad')}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('dashboard.checkServer')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{t('dashboard.title')}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('dashboard.subtitle')}</p>
      </div>

      {/* 2x2 Grid of stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Total Inventory Value */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md rounded-xl p-6 transition-all flex items-center gap-5">
          <div className="w-14 h-14 rounded-xl bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center shrink-0">
            <svg className="w-7 h-7 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t('dashboard.inventoryValue')}</span>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">{formatCurrency(stats.total_inventory_value || 0)}</h2>
          </div>
        </div>

        {/* Card 2: Total Products with low stock badge */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md rounded-xl p-6 transition-all flex items-center gap-5">
          <div className="w-14 h-14 rounded-xl bg-green-50 dark:bg-green-950/40 flex items-center justify-center shrink-0">
            <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <div className="flex-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t('dashboard.totalProducts')}</span>
            <div className="flex items-center mt-0.5">
              <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{stats.total_products_count}</h2>
              {stats.low_stock_count > 0 && (
                <span className="ml-3 px-2 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400 animate-pulse">
                  {stats.low_stock_count} {t('dashboard.lowStock')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Today's Sales & Invoices count */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md rounded-xl p-6 transition-all flex items-center gap-5">
          <div className="w-14 h-14 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 flex items-center justify-center shrink-0">
            <svg className="w-7 h-7 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t('dashboard.todaySales')}</span>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">{formatCurrency(stats.today_sales_amount || 0)}</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {t(stats.today_invoices_count === 1 ? 'dashboard.transactionsCount' : 'dashboard.transactionsCountPlural', { count: stats.today_invoices_count })}
            </p>
          </div>
        </div>

        {/* Card 4: Total Providers */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md rounded-xl p-6 transition-all flex items-center gap-5">
          <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
            <svg className="w-7 h-7 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t('dashboard.suppliers')}</span>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">{stats.total_providers_count}</h2>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">{t('dashboard.quickOps')}</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => navigate('/sell')}
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 active:scale-[0.98] transition-all cursor-pointer shadow-sm shadow-teal-600/10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5" />
            </svg>
            {t('dashboard.newSale')}
          </button>
          <button
            onClick={() => navigate('/stock')}
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 active:scale-[0.98] transition-all cursor-pointer shadow-sm shadow-teal-600/10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('dashboard.addStockItem')}
          </button>
        </div>
      </div>
    </div>
  );
}

// 3. Mock Login Screen
function LoginView({ loginMutation }) {
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('Admin112233');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-md mt-12 animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-teal-600 flex items-center justify-center font-bold text-white text-2xl mx-auto shadow-md shadow-teal-500/20 mb-4">
          P
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Portal Login</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Access the Pharmacy Administration Dashboard</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@gmail.com"
            className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-3 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-3 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-lg py-3 font-semibold text-sm active:scale-[0.99] transition-all cursor-pointer shadow-md shadow-teal-500/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loginMutation.isPending ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Signing In...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>
      <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-4 text-center">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Demo email: <code className="text-teal-600 dark:text-teal-400 font-semibold bg-teal-50 dark:bg-teal-950/30 px-1 py-0.5 rounded">admin@gmail.com</code>
          <br />Password: <code className="text-teal-600 dark:text-teal-400 font-semibold bg-teal-50 dark:bg-teal-950/30 px-1 py-0.5 rounded">Admin112233</code>
        </p>
      </div>
    </div>
  );
}

// 4. Main App Layout Wrapper
function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const { data: user, isLoading: isAuthLoading } = useMe();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Prevent scroll and arrow keys from altering number inputs globally
  useEffect(() => {
    const handleWheel = () => {
      if (document.activeElement && document.activeElement.type === 'number') {
        document.activeElement.blur();
      }
    };
    const handleKeyDown = (e) => {
      if (document.activeElement && document.activeElement.type === 'number' && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
      }
    };

    document.addEventListener('wheel', handleWheel, { passive: true });
    document.addEventListener('keydown', handleKeyDown, { passive: false });

    return () => {
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Redirect handling
  useEffect(() => {
    if (!isAuthLoading && !user && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    }
  }, [user, isAuthLoading, location.pathname, navigate]);

  useEffect(() => {
    if (!isAuthLoading && user && location.pathname === '/login') {
      navigate('/', { replace: true });
    }
  }, [user, isAuthLoading, location.pathname, navigate]);

  const handleLogout = (e) => {
    if (e) e.preventDefault();
    logoutMutation.mutate();
    setDrawerOpen(false);
  };

  const navigationLinks = [
    {
      to: '/',
      label: t('nav.dashboard'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      to: '/stock',
      label: t('nav.stock'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m-8-10l8 4m-8-4v10l8 4m0-10v10" />
        </svg>
      ),
    },
    {
      to: '/sell',
      label: t('nav.sell'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
      ),
    },
    {
      to: '/invoices',
      label: t('nav.invoices'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      to: '/providers',
      label: t('nav.providers'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
  ];

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Verifying session...</p>
      </div>
    );
  }

  // Guest flow
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 transition-colors duration-200">
        <Toaster position="top-right" />
        <main className="w-full max-w-md">
          <Routes>
            <Route path="/login" element={<LoginView loginMutation={loginMutation} />} />
            <Route path="*" element={<LoginView loginMutation={loginMutation} />} />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Toaster position="top-right" />

      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. Mobile Top Nav Bar & Burger (hidden on md+) */}
      {/* ────────────────────────────────────────────────────────── */}
      <header className="md:hidden flex items-center justify-between px-4 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-45 sticky top-0 no-print">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center font-bold text-white shadow-sm shadow-teal-500/10 text-sm">
            P
          </div>
          <span className="font-semibold text-base tracking-tight text-slate-800 dark:text-slate-100">
            PharmSystem
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <LanguageToggle />
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden no-print">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer Container */}
          <div className="absolute inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 shadow-2xl p-5 flex flex-col gap-6 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center font-bold text-white text-xs">
                  P
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-100">PharmSystem</span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>
            <nav className="flex flex-col gap-1.5 flex-1">
              {navigationLinks.map((link) => (
                <SidebarLink
                  key={link.to}
                  to={link.to}
                  icon={link.icon}
                  label={link.label}
                  isExpanded={true}
                  onClick={() => setDrawerOpen(false)}
                />
              ))}
            </nav>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between px-4 py-2 text-sm text-slate-500 dark:text-slate-400">
                <span>{t('common.theme')}</span>
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} className="w-8 h-8" />
              </div>
              <div className="flex items-center justify-between px-4 py-2 text-sm text-slate-500 dark:text-slate-400">
                <span>Language</span>
                <LanguageToggle className="w-24" />
              </div>
              <button
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 active:scale-[0.98] transition-all cursor-pointer text-left disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                {logoutMutation.isPending ? t('common.loading') : t('common.signOut')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. Persistent Left Sidebar (md+ visible) */}
      {/* ────────────────────────────────────────────────────────── */}
      <aside
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
        className={`no-print hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-35 transition-all duration-300 ease-in-out shadow-sm hover:shadow-xl ${
          sidebarHovered ? 'w-64' : 'w-20'
        }`}
      >
        <div className={`h-16 flex items-center ${sidebarHovered ? 'px-6' : 'justify-center'} border-b border-slate-100 dark:border-slate-800 shrink-0`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center font-bold text-white shrink-0 shadow-sm shadow-teal-600/10">
              P
            </div>
            {sidebarHovered && (
              <div className="flex flex-col overflow-hidden animate-fade-in">
                <span className="font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
                  PharmSystem
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation list */}
        <nav className={`flex-1 ${sidebarHovered ? 'px-4 overflow-y-auto overflow-x-hidden' : 'px-3 overflow-visible'} py-6 flex flex-col gap-2`}>
          {navigationLinks.map((link) => (
            <SidebarLink
              key={link.to}
              to={link.to}
              icon={link.icon}
              label={link.label}
              isExpanded={sidebarHovered}
            />
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className={`p-4 border-t border-slate-100 dark:border-slate-800 shrink-0 flex flex-col gap-2 ${sidebarHovered ? '' : 'items-center'}`}>
          {/* Theme switcher */}
          <div className={`w-full flex items-center ${sidebarHovered ? 'justify-between px-2.5' : 'justify-center'}`}>
            {sidebarHovered && (
              <span className="text-xs text-slate-400 dark:text-slate-500 animate-fade-in">{t('common.theme')}</span>
            )}
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </div>

          {/* Language switcher */}
          <div className={`w-full flex items-center ${sidebarHovered ? 'justify-between px-2.5' : 'justify-center'}`}>
            {sidebarHovered && (
              <span className="text-xs text-slate-400 dark:text-slate-500 animate-fade-in">Language</span>
            )}
            <LanguageToggle className={sidebarHovered ? "w-24" : "w-12"} short={!sidebarHovered} />
          </div>

          <button
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className={`group relative flex items-center transition-all duration-200 disabled:opacity-50 cursor-pointer text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 ${
              sidebarHovered 
                ? 'w-full gap-3 px-4 py-3 rounded-lg border-l-2 border-transparent text-sm font-medium text-left' 
                : 'w-12 h-12 justify-center mx-auto rounded-lg'
            }`}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            {sidebarHovered && (
              <span className="animate-fade-in text-sm font-medium">{logoutMutation.isPending ? t('common.loading') : t('common.signOut')}</span>
            )}
            {!sidebarHovered && (
              <span className="absolute left-full ml-3 px-2 py-1 bg-red-600 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-md">
                {t('common.signOut')}
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. Main Content Container */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="md:pl-20 flex flex-col min-h-screen">
        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/stock" element={<StockPage />} />
            <Route path="/sell" element={<SellPage />} />
            <Route path="/providers" element={<ProvidersPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/invoice/:id" element={<InvoicePage />} />
            <Route path="*" element={<HomeView />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;

