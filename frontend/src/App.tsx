import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { TechnicianFieldPage } from './pages/TechnicianFieldPage';
import { CustomerPortalPage } from './pages/CustomerPortalPage';
import { CustomerManagementPage } from './pages/CustomerManagementPage';
import { InventoryManagementPage } from './pages/InventoryManagementPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { ReportsPage } from './pages/ReportsPage';
import { CreateWorkOrderModal } from './components/CreateWorkOrderModal';
import { WorkOrderDetailModal } from './components/WorkOrderDetailModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { Footer } from './components/Footer';
import { WorkOrder } from './types';

const MainLayout: React.FC = () => {
    const { user, loading, hasRole } = useAuth();
    const [authView, setAuthView] = useState<'login' | 'forgot' | 'reset'>('login');
    const [resetToken, setResetToken] = useState<string>('');

    const [currentTab, setCurrentTab] = useState<string>('dashboard');
    const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    // Global Cmd+K / Ctrl+K keyboard shortcut listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsSearchOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Check URL parameters for password reset token
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (token) {
            setResetToken(token);
            setAuthView('reset');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    // Set default tab based on user role when user logs in
    useEffect(() => {
        if (user) {
            if (hasRole('TECHNICIAN')) setCurrentTab('field');
            else if (hasRole('CUSTOMER')) setCurrentTab('portal');
            else setCurrentTab('dashboard');
        }
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-3 text-slate-600 text-sm">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="font-medium text-slate-600">Initializing KEYSTONE session...</span>
            </div>
        );
    }

    if (!user) {
        if (authView === 'forgot') {
            return <ForgotPasswordPage onBack={() => setAuthView('login')} />;
        }
        if (authView === 'reset') {
            return (
                <ResetPasswordPage
                    token={resetToken}
                    onSuccess={() => setAuthView('login')}
                />
            );
        }
        return <LoginPage onNavigateForgot={() => setAuthView('forgot')} />;
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
            <Navbar
                currentTab={currentTab}
                setCurrentTab={setCurrentTab}
                onOpenSearch={() => setIsSearchOpen(true)}
                onSelectWorkOrder={wo => setSelectedWorkOrder(wo)}
            />

            <div className="flex flex-1 overflow-hidden">
                <Sidebar
                    currentTab={currentTab}
                    setCurrentTab={setCurrentTab}
                    onOpenCreateModal={() => setIsCreateModalOpen(true)}
                />

                <main className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-57px)]">
                    <div key={refreshKey} className="h-full">
                        {currentTab === 'dashboard' && (
                            <DashboardPage onSelectWorkOrder={wo => setSelectedWorkOrder(wo)} />
                        )}

                        {currentTab === 'kanban' && (
                            <DashboardPage onSelectWorkOrder={wo => setSelectedWorkOrder(wo)} />
                        )}

                        {currentTab === 'field' && (
                            <TechnicianFieldPage onSelectWorkOrder={wo => setSelectedWorkOrder(wo)} />
                        )}

                        {currentTab === 'portal' && (
                            <CustomerPortalPage
                                onSelectWorkOrder={wo => setSelectedWorkOrder(wo)}
                                onOpenCreateModal={() => setIsCreateModalOpen(true)}
                            />
                        )}

                        {currentTab === 'customers' && <CustomerManagementPage viewMode="customers" />}

                        {currentTab === 'sites' && <CustomerManagementPage viewMode="sites" />}

                        {currentTab === 'reports' && <ReportsPage />}

                        {currentTab === 'inventory' && <InventoryManagementPage />}

                        {currentTab === 'users' && <UserManagementPage />}

                        {!['dashboard', 'kanban', 'field', 'portal', 'customers', 'sites', 'reports', 'inventory', 'users'].includes(currentTab) && (
                            <div className="flex flex-col items-center justify-center h-64 text-center space-y-2">
                                <h3 className="text-lg font-bold text-slate-700">Page Not Found</h3>
                                <p className="text-xs text-slate-500">The selected tab could not be loaded.</p>
                                <button
                                    onClick={() => setCurrentTab('dashboard')}
                                    className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                                >
                                    Return to Dashboard
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Modals */}
            <CreateWorkOrderModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    setRefreshKey(prev => prev + 1);
                }}
            />

            <WorkOrderDetailModal
                workOrder={selectedWorkOrder}
                onClose={() => setSelectedWorkOrder(null)}
                onRefresh={() => {
                    setRefreshKey(prev => prev + 1);
                }}
            />

            <GlobalSearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onSelectWorkOrder={wo => setSelectedWorkOrder(wo)}
                onNavigateTab={tab => setCurrentTab(tab)}
            />
        </div>
    );
};

export function App() {
    return (
        <AuthProvider>
            <MainLayout />
        </AuthProvider>
    );
}

export default App;