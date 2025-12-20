import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import ThemeSelector from '@/components/settings/ThemeSelector';
import ChangePasswordForm from '@/components/settings/ChangePasswordForm';
import ProfileNameForm from '@/components/settings/ProfileNameForm';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { User, Palette, Shield } from 'lucide-react';
import CurrencySelector from '@/components/settings/CurrencySelector';

export const metadata: Metadata = {
    title: 'Settings | Velox',
    description: 'Manage your account settings and preferences',
};

export default async function SettingsPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    return (
        <div className="container max-w-5xl mx-auto py-6 md:py-10 px-4 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 md:pb-10">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent w-fit">Settings</h1>
                <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-lg">
                    Manage your account settings and preferences.
                </p>
            </div>

            {/* --- MOBILE VIEW (Single Column) --- */}
            <div className="md:hidden space-y-6">
                {/* Account Section */}
                <div className="space-y-2">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">Account</h2>
                    <Card className="border-border/60 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" /> Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ProfileNameForm />
                        </CardContent>
                    </Card>
                </div>

                {/* Appearance Section */}
                <div className="space-y-2">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">Preferences</h2>
                    <Card className="border-border/60 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Palette className="h-5 w-5 text-primary" /> Appearance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ThemeSelector />
                            <div className="mt-4 pt-4 border-t border-border/50">
                                <CurrencySelector />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Security Section */}
                <div className="space-y-2">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">Security</h2>
                    <Card className="border-border/60 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Shield className="h-5 w-5 text-primary" /> Password
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChangePasswordForm />
                        </CardContent>
                    </Card>
                </div>

                {/* App Info / Support */}
                <div className="pt-4 text-center text-xs text-muted-foreground space-y-1">
                    <p>Velox Finance v1.0.0</p>
                    <div className="flex items-center justify-center gap-3">
                        <button className="hover:text-primary transition-colors">Privacy Policy</button>
                        <span>•</span>
                        <button className="hover:text-primary transition-colors">Terms of Service</button>
                    </div>
                </div>
            </div>

            {/* --- DESKTOP VIEW (Grid Layout) --- */}
            <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Account & Appearance */}
                <div className="space-y-8">
                    <section className="relative z-20">
                        <Card className="border-primary/20 shadow-lg hover:shadow-primary/5 transition-all duration-300">
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2"><User className="h-5 w-5" /> Account Information</CardTitle>
                                <CardDescription>Update your personal details.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ProfileNameForm />
                            </CardContent>
                        </Card>
                    </section>

                    <section className="relative z-10">
                        <Card className="border-primary/20 shadow-lg hover:shadow-primary/5 transition-all duration-300">
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2"><Palette className="h-5 w-5" /> Appearance</CardTitle>
                                <CardDescription>Customize the look and feel.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ThemeSelector />
                                <div className="mt-6 pt-6 border-t border-border/50">
                                    <CurrencySelector />
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                </div>

                {/* Right Column: Security */}
                <div className="space-y-8">
                    <section>
                        <Card className="border-primary/20 shadow-lg hover:shadow-primary/5 transition-all duration-300">
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2"><Shield className="h-5 w-5" /> Security</CardTitle>
                                <CardDescription>Manage your password and security settings.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChangePasswordForm />
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </div>
        </div>
    );
}
