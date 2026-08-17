import React from 'react'
import {
    User,
    LayoutGrid,
    Calendar,
    FileText,
    DollarSign,
    Settings,
    LogOut
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const Sidebar = () => {
    const { pathname } = useLocation()
    const [mobileOpen, setMobileOpen] = React.useState(false)

    // Close mobile sidebar on route change
    React.useEffect(() => {
        setMobileOpen(false)
    }, [pathname])

    const navigationItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutGrid },
        { name: 'Attendance', path: '/attendance', icon: Calendar },
        { name: 'Leave', path: '/leave', icon: FileText },
        { name: 'Payslips', path: '/payslips', icon: DollarSign },
        { name: 'Settings', path: '/settings', icon: Settings },
    ]

    const sidebarContent = (
        <div className="flex flex-col h-full justify-between p-6">
            <div>
                {/* Brand header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 border border-slate-700/60 rounded-lg text-slate-200">
                        <User className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-slate-100 font-semibold text-base leading-tight">Employee MS</h1>
                        <p className="text-slate-500 text-xs">Management System</p>
                    </div>
                </div>

                {/* User profile card */}
                <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3 flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 font-medium">
                        J
                    </div>
                    <div>
                        <h2 className="text-slate-200 font-medium text-sm">John Doe</h2>
                        <p className="text-slate-500 text-xs">Employee</p>
                    </div>
                </div>

                {/* Section label */}
                <div className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase mb-4 px-1">
                    NAVIGATION
                </div>

                {/* Navigation links */}
                <nav className="space-y-1">
                    {navigationItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.path

                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${isActive
                                        ? 'bg-indigo-950/40 text-slate-100'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                                    }`}
                            >
                                {isActive && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 rounded-r-full" />
                                )}
                                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* Footer / Log out */}
            <button
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 transition-colors w-full text-left mt-auto"
            >
                <LogOut className="w-4 h-4" />
                Log out
            </button>
        </div>
    )

    return (
        <aside className="w-64 bg-[#0B1120] min-h-screen border-r border-slate-800/50 flex flex-col">
            {sidebarContent}
        </aside>
    )
}

export default Sidebar