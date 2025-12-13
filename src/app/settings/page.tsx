import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import ThemeSelector from '@/components/settings/ThemeSelector';
import ChangePasswordForm from '@/components/settings/ChangePasswordForm';
import ProfileNameForm from '@/components/settings/ProfileNameForm';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';

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
        <div className="container max-w-5xl mx-auto py-10 px-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent w-fit">Settings</h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    Manage your account settings and application preferences.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Account & Appearance */}
                <div className="space-y-8">
                    <section className="relative z-20">
                        <Card className="border-primary/20 shadow-lg hover:shadow-primary/5 transition-all duration-300">
                            <CardHeader>
                                <CardTitle className="text-xl">Account Information</CardTitle>
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
                                <CardTitle className="text-xl">Appearance</CardTitle>
                                <CardDescription>Customize the look and feel.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ThemeSelector />
                            </CardContent>
                        </Card>
                    </section>
                </div>

                {/* Right Column: Security */}
                <div className="space-y-8">
                    <section>
                        <Card className="border-primary/20 shadow-lg hover:shadow-primary/5 transition-all duration-300">
                            <CardHeader>
                                <CardTitle className="text-xl">Security</CardTitle>
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
