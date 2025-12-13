'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { User, Mail, Save, X, Edit2, Camera } from 'lucide-react';

export default function ProfileForm() {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Mock initial data - in a real app this would come from props or a hook
    const [formData, setFormData] = useState({
        name: 'Alex Johnson',
        email: 'alex@example.com',
        bio: 'Crypto enthusiast and day trader. Always looking for the next moonshot.',
        location: 'New York, USA',
        website: 'https://velox.finance'
    });

    const handleSave = async () => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsEditing(false);
        setIsLoading(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset form data if needed (requires keeping initial state)
    };

    return (
        <div className="max-w-4xl mx-auto">
            <Card className="glass-card border-border/50 bg-background/60 backdrop-blur-xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                    <div className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-foreground">Profile Settings</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Manage your public profile and account details.
                        </CardDescription>
                    </div>
                    {!isEditing && (
                        <Button 
                            variant="neon" 
                            onClick={() => setIsEditing(true)}
                            className="gap-2"
                        >
                            <Edit2 className="h-4 w-4" />
                            Edit Profile
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Avatar Section */}
                    <div className="flex items-center gap-6 pb-6 border-b border-border/40">
                        <div className="relative group">
                            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                                <span className="text-3xl font-bold text-primary">
                                    {formData.name.split(' ').map(n => n[0]).join('')}
                                </span>
                            </div>
                            {isEditing && (
                                <button className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera className="h-6 w-6 text-white" />
                                </button>
                            )}
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-medium text-foreground">Profile Picture</h3>
                            <p className="text-sm text-muted-foreground">
                                PNG, JPG or GIF. Max 1MB.
                            </p>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                <User className="h-4 w-4 text-primary" />
                                Full Name
                            </label>
                            <input
                                type="text"
                                disabled={!isEditing}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2.5 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60 disabled:cursor-not-allowed transition-all text-foreground"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                <Mail className="h-4 w-4 text-primary" />
                                Email Address
                            </label>
                            <input
                                type="email"
                                disabled={true} // Always disabled
                                value={formData.email}
                                className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-muted-foreground cursor-not-allowed"
                            />
                            {isEditing && (
                                <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                            )}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-foreground">Bio</label>
                            <textarea
                                disabled={!isEditing}
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-2.5 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60 disabled:cursor-not-allowed transition-all text-foreground resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Location</label>
                            <input
                                type="text"
                                disabled={!isEditing}
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full px-4 py-2.5 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60 disabled:cursor-not-allowed transition-all text-foreground"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Website</label>
                            <input
                                type="url"
                                disabled={!isEditing}
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                className="w-full px-4 py-2.5 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60 disabled:cursor-not-allowed transition-all text-foreground"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {isEditing && (
                        <div className="flex items-center justify-end gap-4 pt-6 border-t border-border/40 animate-in fade-in slide-in-from-bottom-4">
                            <Button 
                                variant="ghost" 
                                onClick={handleCancel}
                                disabled={isLoading}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleSave}
                                disabled={isLoading}
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
