import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SchoolSubPage } from '@/components/school/SchoolSubPage';
import { useBasePath } from '@/hooks/useBasePath';
import { BookOpen, CreditCard, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSchoolSite } from '@/context/SchoolSiteContext';
import { ResultsPage } from './ResultsPage';
import { FeesPage } from './FeesPage';

export function StudentDashboardPage() {
    const basePath = useBasePath();
    const navigate = useNavigate();
    const location = useLocation();
    const { school } = useSchoolSite();
    const studentId = sessionStorage.getItem('student_id');

    if (!studentId) {
        // Redirect to login if no student info in session
        navigate(`${basePath}/login`);
        return null;
    }

    function handleLogout() {
        sessionStorage.removeItem('student_id');
        navigate(`${basePath}/login`);
    }

    const isResults = location.pathname.endsWith('/results');
    const isFees = location.pathname.endsWith('/fees');
    const isDashboard = !isResults && !isFees;

    return (
        <SchoolSubPage 
            title={isResults ? "Academic Results" : isFees ? "School Fees Portal" : "Student Dashboard"} 
            subtitle={isResults ? "View and download your termly performance reports." : isFees ? "Manage your academic payments securely." : "Welcome to your personal academic portal."}
        >
            <div className="max-w-6xl mx-auto pt-8">
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm mb-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-[var(--school-primary)] text-white rounded-full flex items-center justify-center">
                                    <User size={24} />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-bold truncate">Student Portal</p>
                                    <p className="text-xs text-slate-500 truncate">ID: {studentId}</p>
                                </div>
                            </div>
                            
                            <nav className="space-y-2">
                                <Link 
                                    to={`${basePath}/dashboard`}
                                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isDashboard ? 'bg-[var(--school-primary)] text-white' : 'hover:bg-slate-50 text-slate-600'}`}
                                >
                                    <LayoutDashboard size={18} />
                                    <span className="font-medium">Overview</span>
                                </Link>
                                <Link 
                                    to={`${basePath}/results`}
                                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isResults ? 'bg-[var(--school-primary)] text-white' : 'hover:bg-slate-50 text-slate-600'}`}
                                >
                                    <BookOpen size={18} />
                                    <span className="font-medium">Academic Results</span>
                                </Link>
                                <Link 
                                    to={`${basePath}/fees`}
                                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isFees ? 'bg-[var(--school-primary)] text-white' : 'hover:bg-slate-50 text-slate-600'}`}
                                >
                                    <CreditCard size={18} />
                                    <span className="font-medium">School Fees</span>
                                </Link>
                            </nav>

                            <div className="mt-8 pt-6 border-t border-slate-100">
                                <Button 
                                    variant="ghost" 
                                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3">
                        {isDashboard && (
                            <div className="grid md:grid-cols-2 gap-8">
                                <Card className="border-none shadow-xl hover:shadow-2xl transition-all group overflow-hidden">
                                    <div className="h-2 bg-blue-500" />
                                    <CardHeader>
                                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <BookOpen size={24} />
                                        </div>
                                        <CardTitle>Academic Results</CardTitle>
                                        <CardDescription>View and download your termly performance reports.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button asChild className="w-full bg-[var(--school-primary)] text-white">
                                            <Link to={`${basePath}/results`}>Check Results</Link>
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card className="border-none shadow-xl hover:shadow-2xl transition-all group overflow-hidden">
                                    <div className="h-2 bg-green-500" />
                                    <CardHeader>
                                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <CreditCard size={24} />
                                        </div>
                                        <CardTitle>School Fees</CardTitle>
                                        <CardDescription>Track payments and settle your school fees online.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button asChild className="w-full bg-[var(--school-primary)] text-white">
                                            <Link to={`${basePath}/fees`}>Manage Payments</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {isResults && <ResultsPage isEmbedded />}
                        {isFees && <FeesPage isEmbedded />}
                    </div>
                </div>
            </div>
        </SchoolSubPage>
    );
}
