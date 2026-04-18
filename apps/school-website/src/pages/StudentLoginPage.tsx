import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SchoolSubPage } from '@/components/school/SchoolSubPage';
import { login, resolveStudentLogin } from '@/lib/api';
import { useBasePath } from '@/hooks/useBasePath';
import { ButtonBarLoader } from '@/components/ui/BookLoader';

export function StudentLoginPage() {
    const [studentId, setStudentId] = useState('');
    const [parentCredential, setParentCredential] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const basePath = useBasePath();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        setError(null);
        try {
            const resolved = await resolveStudentLogin({
                studentId,
                parentCredential,
            });

            await login(resolved.loginEmail, resolved.loginPassword || parentCredential);
            
            // Store basic student info for session
            sessionStorage.setItem('student_id', studentId);
            navigate(`${basePath}/dashboard`);
        } catch (err: any) {
            setError(err.message || "Invalid student ID or parent credential.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <SchoolSubPage 
            title="Student Portal Login" 
            subtitle="Access your academic results and manage school fees payments."
        >
            <div className="max-w-md mx-auto pt-12">
                <Card className="border-none shadow-2xl">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
                        <CardDescription>
                            Enter your Admission Number and Parent's Email/Phone.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-6">
                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="studentId">Admission Number</Label>
                                <Input 
                                    id="studentId" 
                                    placeholder="e.g. SCH/2024/1234" 
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                    required 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="credential">Parent's Email or Phone</Label>
                                <Input 
                                    id="credential" 
                                    type="text" 
                                    placeholder="Registered parent contact" 
                                    value={parentCredential}
                                    onChange={(e) => setParentCredential(e.target.value)}
                                    required 
                                />
                            </div>
                            <Button 
                                type="submit" 
                                className="w-full bg-[var(--school-primary)] text-white py-6 text-lg font-bold"
                                disabled={loading}
                            >
                                {loading ? <ButtonBarLoader /> : "Access Portal"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
                <p className="mt-8 text-center text-sm text-slate-500">
                    Need help? Please contact the school administration office.
                </p>
            </div>
        </SchoolSubPage>
    );
}
