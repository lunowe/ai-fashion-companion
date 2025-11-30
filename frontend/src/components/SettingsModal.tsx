import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import {
    Loader2,
    Save,
    User,
    Settings as SettingsIcon,
    ChevronRight,
    ChevronLeft,
    CreditCard,
    Palette,
    LogOut,
    Moon,
    Sun,
    Laptop,
    Check,
    AlertCircle,
} from "lucide-react";

import { getProfile, updateProfile, type UserProfileUpdate } from "@/services/profile";
import { api, toErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useTheme } from "@/components/theme-provider"; // Ensure this exists from Shadcn setup
import { useAuth } from "@/context/AuthContext"; // Import Auth for mobile logout

// UI Components
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

interface SettingsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultTab?: "profile" | "settings" | null;
}

type TabKey = "profile" | "settings" | "appearance";

export function SettingsModal({ open, onOpenChange, defaultTab = null }: SettingsModalProps) {
    // Cast defaultTab to compatible type or null
    const [activeTab, setActiveTab] = useState<TabKey | null>(defaultTab as TabKey | null);
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const { logout } = useAuth(); // Auth hook for mobile logout

    useEffect(() => {
        if (open) {
            if (isDesktop) {
                // Desktop defaults to profile if opened without specific intent
                setActiveTab((defaultTab as TabKey) || "profile");
            } else {
                // Mobile defaults to the Menu List (null)
                setActiveTab((defaultTab as TabKey) || null);
            }
        }
    }, [open, defaultTab, isDesktop]);

    const getTabTitle = (tab: TabKey | null) => {
        switch (tab) {
            case "profile":
                return "Profile & Style";
            case "settings":
                return "Account & Billing";
            case "appearance":
                return "Appearance";
            default:
                return "Settings";
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case "profile":
                return <ProfileTabContent />;
            case "settings":
                return <SettingsTabContent />;
            case "appearance":
                return <AppearanceTabContent />;
            default:
                return null;
        }
    };

    // --- DESKTOP VIEW (Dialog) ---
    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="h-[80vh] !max-w-[900px] flex flex-col p-0 gap-0 overflow-hidden border-none shadow-2xl">
                    <DialogTitle className="sr-only">Settings</DialogTitle>
                    <DialogDescription className="sr-only">Manage your account</DialogDescription>

                    <div className="flex h-full">
                        {/* Sidebar */}
                        <aside className="w-64 border-r bg-muted/10 flex flex-col">
                            <div className="p-6 border-b">
                                <h2 className="font-semibold text-lg tracking-tight flex items-center gap-2">
                                    <SettingsIcon className="w-5 h-5" /> Settings
                                </h2>
                            </div>
                            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                                <Button
                                    variant={activeTab === "profile" ? "secondary" : "ghost"}
                                    className={cn(
                                        "w-full justify-start gap-3",
                                        activeTab === "profile" && "bg-muted shadow-sm"
                                    )}
                                    onClick={() => setActiveTab("profile")}
                                >
                                    <Palette className="w-4 h-4 text-muted-foreground" />
                                    Profile & Style
                                </Button>
                                <Button
                                    variant={activeTab === "settings" ? "secondary" : "ghost"}
                                    className={cn(
                                        "w-full justify-start gap-3",
                                        activeTab === "settings" && "bg-muted shadow-sm"
                                    )}
                                    onClick={() => setActiveTab("settings")}
                                >
                                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                                    Account & Billing
                                </Button>
                                {/* Note: Desktop Theme/Logout is handled in the Header Dropdown, not here, 
                    but you could add them here if you wanted a unified settings page. */}
                            </nav>
                        </aside>

                        {/* Content Area */}
                        <main className="flex flex-1 flex-col overflow-hidden bg-background">
                            <ScrollArea className="flex-1 h-full">
                                <div className="p-8 max-w-3xl mx-auto space-y-6">
                                    <div>
                                        <h3 className="text-2xl font-semibold tracking-tight">
                                            {getTabTitle(activeTab)}
                                        </h3>
                                        <p className="text-muted-foreground">
                                            {activeTab === "profile"
                                                ? "Customize how the AI generates outfits for you."
                                                : "Manage your subscription and usage limits."}
                                        </p>
                                    </div>
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        {renderContent()}
                                    </div>
                                </div>
                            </ScrollArea>
                        </main>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    // --- MOBILE VIEW (Drawer) ---
    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="h-[80vh] flex flex-col rounded-t-[10px] outline-none">
                {/* Mobile Header */}
                <DrawerHeader className="border-b px-4 py-3 flex items-center justify-between min-h-[60px]">
                    {activeTab ? (
                        <div className="flex items-center w-full">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="-ml-2 mr-2 h-8 w-8 shrink-0"
                                onClick={() => setActiveTab(null)}
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <DrawerTitle className="text-base font-semibold text-center flex-1 pr-8">
                                {getTabTitle(activeTab)}
                            </DrawerTitle>
                        </div>
                    ) : (
                        <div className="w-full text-center relative">
                            {/* <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-4 opacity-50" /> */}
                            <DrawerTitle className="text-lg font-semibold">Settings</DrawerTitle>
                            {/* <DrawerDescription className="text-xs text-muted-foreground mt-1">
                                Manage your preferences
                            </DrawerDescription> */}
                        </div>
                    )}
                </DrawerHeader>

                {/* Mobile Content */}
                <div className="flex-1 overflow-y-auto bg-background/50">
                    {!activeTab ? (
                        // --- Root Menu (iOS List Style) ---
                        <div className="p-4 space-y-6">
                            {/* Group 1: General */}
                            <div className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
                                <div className="divide-y">
                                    <MobileMenuRow
                                        icon={<Palette className="w-5 h-5" />}
                                        iconColor="text-blue-600 dark:text-blue-400"
                                        iconBg="bg-blue-100 dark:bg-blue-900/30"
                                        title="Profile & Style"
                                        subtitle="Colors, fits, and notes"
                                        onClick={() => setActiveTab("profile")}
                                    />
                                    <MobileMenuRow
                                        icon={<CreditCard className="w-5 h-5" />}
                                        iconColor="text-green-600 dark:text-green-400"
                                        iconBg="bg-green-100 dark:bg-green-900/30"
                                        title="Account & Billing"
                                        subtitle="Usage and plans"
                                        onClick={() => setActiveTab("settings")}
                                    />
                                </div>
                            </div>

                            {/* Group 2: App Preferences */}
                            <div className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
                                <div className="divide-y">
                                    <MobileMenuRow
                                        icon={<Sun className="w-5 h-5" />}
                                        iconColor="text-orange-600 dark:text-orange-400"
                                        iconBg="bg-orange-100 dark:bg-orange-900/30"
                                        title="Appearance"
                                        subtitle="Light, Dark, System"
                                        onClick={() => setActiveTab("appearance")}
                                    />
                                </div>
                            </div>

                            {/* Group 3: Danger/Auth */}
                            <Button
                                variant="outline"
                                className="w-full h-12 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                                onClick={() => {
                                    logout();
                                    onOpenChange(false);
                                }}
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Log Out
                            </Button>

                            <div className="text-center text-xs text-muted-foreground pt-4 pb-8">FitFlow v1.0.0</div>
                        </div>
                    ) : (
                        // --- Detail View ---
                        <div className="p-4 h-full animate-in slide-in-from-right-8 fade-in duration-300">
                            {renderContent()}
                        </div>
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    );
}

// --- Helper Components for Mobile List ---

function MobileMenuRow({ icon, iconColor, iconBg, title, subtitle, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors active:bg-muted"
        >
            <div className="flex items-center gap-3">
                <div className={`${iconBg} ${iconColor} p-2 rounded-md`}>{icon}</div>
                <div className="text-left">
                    <div className="font-medium text-sm">{title}</div>
                    {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
                </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
        </button>
    );
}

// --- Appearance Content (Mobile Only mostly, but usable on desktop if needed) ---

function AppearanceTabContent() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="space-y-4">
            <div className="grid gap-4">
                <div
                    onClick={() => setTheme("light")}
                    className={cn(
                        "flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-muted/50",
                        theme === "light" ? "border-primary bg-primary/5" : "bg-card"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <Sun className="w-5 h-5 text-orange-500" />
                        <span>Light Mode</span>
                    </div>
                    {theme === "light" && <Check className="w-4 h-4 text-primary" />}
                </div>

                <div
                    onClick={() => setTheme("dark")}
                    className={cn(
                        "flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-muted/50",
                        theme === "dark" ? "border-primary bg-primary/5" : "bg-card"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <Moon className="w-5 h-5 text-blue-500" />
                        <span>Dark Mode</span>
                    </div>
                    {theme === "dark" && <Check className="w-4 h-4 text-primary" />}
                </div>

                <div
                    onClick={() => setTheme("system")}
                    className={cn(
                        "flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-muted/50",
                        theme === "system" ? "border-primary bg-primary/5" : "bg-card"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <Laptop className="w-5 h-5 text-slate-500" />
                        <span>System Default</span>
                    </div>
                    {theme === "system" && <Check className="w-4 h-4 text-primary" />}
                </div>
            </div>
        </div>
    );
}

// --- Profile Tab Content ---

function ProfileTabContent() {
    const qc = useQueryClient();
    const { data: profile, isLoading } = useQuery({
        queryKey: ["profile"],
        queryFn: getProfile,
    });

    const { control, register, handleSubmit, reset } = useForm<UserProfileUpdate>({
        defaultValues: {
            preferences: {
                preferred_colors: [],
                disliked_colors: [],
                preferred_fits: [],
            },
            style_notes: "",
        },
    });

    useEffect(() => {
        if (profile) {
            reset({
                preferences: {
                    preferred_colors: profile.preferences?.preferred_colors || [],
                    disliked_colors: profile.preferences?.disliked_colors || [],
                    preferred_fits: profile.preferences?.preferred_fits || [],
                },
                style_notes: profile.style_notes || "",
            });
        }
    }, [profile, reset]);

    const updateMut = useMutation({
        mutationFn: updateProfile,
        onSuccess: () => {
            toast.success("Profile updated successfully!");
            qc.invalidateQueries({ queryKey: ["profile"] });
        },
        onError: () => {
            toast.error("Failed to update profile");
        },
    });

    const onSubmit = (data: UserProfileUpdate) => {
        updateMut.mutate(data);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium">Style Preferences</h3>
                        <p className="text-sm text-muted-foreground">Customize how the AI generates outfits for you.</p>
                    </div>
                    <Button type="submit" disabled={updateMut.isPending} className="gap-2">
                        {updateMut.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Save Changes
                    </Button>
                </div>

                <div className="grid gap-6 p-6 border rounded-lg bg-card/50">
                    <div className="space-y-2">
                        <Label>Preferred Colors</Label>
                        <p className="text-xs text-muted-foreground">Comma separated (e.g. Black, Navy, Earth Tones)</p>
                        <Controller
                            name="preferences.preferred_colors"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    value={field.value?.join(", ") || ""}
                                    onChange={(e) =>
                                        field.onChange(
                                            e.target.value
                                                .split(",")
                                                .map((s) => s.trim())
                                                .filter(Boolean)
                                        )
                                    }
                                    placeholder="Black, White, Navy..."
                                />
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Disliked Colors</Label>
                        <p className="text-xs text-muted-foreground">Colors to avoid (e.g. Neon, Orange)</p>
                        <Controller
                            name="preferences.disliked_colors"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    value={field.value?.join(", ") || ""}
                                    onChange={(e) =>
                                        field.onChange(
                                            e.target.value
                                                .split(",")
                                                .map((s) => s.trim())
                                                .filter(Boolean)
                                        )
                                    }
                                    placeholder="Neon Green, Hot Pink..."
                                />
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Preferred Fits</Label>
                        <p className="text-xs text-muted-foreground">
                            How you like your clothes to fit (e.g. Oversized, Slim, Regular)
                        </p>
                        <Controller
                            name="preferences.preferred_fits"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    value={field.value?.join(", ") || ""}
                                    onChange={(e) =>
                                        field.onChange(
                                            e.target.value
                                                .split(",")
                                                .map((s) => s.trim())
                                                .filter(Boolean)
                                        )
                                    }
                                    placeholder="Oversized, Relaxed..."
                                />
                            )}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-medium">Style Notes</h3>
                    <p className="text-sm text-muted-foreground">Additional context for the AI stylist.</p>
                </div>
                <div className="p-6 border rounded-lg bg-card/50">
                    <Textarea
                        {...register("style_notes")}
                        placeholder="I prefer minimalist styles with clean lines. I don't like loud patterns..."
                        className="min-h-[150px]"
                    />
                </div>
            </div>
        </form>
    );
}

// --- Settings Tab Content ---

interface User {
    id: string;
    username: string;
    email: string;
    role: string;
    generation_count: number;
    last_reset_date: string;
    api_key?: string;
}

const LIMITS: Record<string, number> = {
    free: 5,
    premium: 50,
    byok: Infinity,
};

function SettingsTabContent() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const res = await api.get("/api/auth/users/me");
            setUser(res.data);
            if (res.data.api_key) {
                setApiKey(res.data.api_key);
            }
        } catch (err) {
            setError(toErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handlePlanChange = async (newRole: string) => {
        if (user?.role === newRole) return;
        try {
            setSaving(true);
            setError("");
            setSuccess("");
            const res = await api.put("/api/auth/users/me/settings", { role: newRole });
            setUser(res.data);
            setSuccess(`Plan updated to ${newRole.toUpperCase()}`);
        } catch (err) {
            setError(toErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const handleApiKeySave = async () => {
        try {
            setSaving(true);
            setError("");
            setSuccess("");
            const res = await api.put("/api/auth/users/me/settings", { api_key: apiKey });
            setUser(res.data);
            setSuccess("API Key saved successfully");
        } catch (err) {
            setError(toErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-[200px] w-full rounded-xl" />
                <div className="grid md:grid-cols-3 gap-4">
                    <Skeleton className="h-[250px] rounded-xl" />
                    <Skeleton className="h-[250px] rounded-xl" />
                    <Skeleton className="h-[250px] rounded-xl" />
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Failed to load user settings.</AlertDescription>
            </Alert>
        );
    }

    const limit = LIMITS[user.role] || 5;
    const usagePercent = limit === Infinity ? 0 : Math.min(100, (user.generation_count / limit) * 100);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert className="border-primary/50 bg-primary/10 text-primary">
                    <Check className="h-4 w-4" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{success}</AlertDescription>
                </Alert>
            )}

            {/* Usage Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Usage & Limits</CardTitle>
                    <CardDescription>Monitor your daily AI generation usage.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm font-medium">
                            <span>Daily Generations</span>
                            <span className="text-muted-foreground">
                                {user.generation_count} / {limit === Infinity ? "Unlimited" : limit}
                            </span>
                        </div>

                        {limit !== Infinity && <Progress value={usagePercent} className="h-2" />}

                        <p className="text-xs text-muted-foreground">
                            Resets daily at 00:00 UTC. Last reset: {new Date(user.last_reset_date).toLocaleDateString()}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Plan Section */}
            <div>
                <h3 className="text-lg font-medium mb-4">Subscription Plan</h3>
                <div className="grid md:grid-cols-3 gap-4">
                    <PlanCard
                        title="Free"
                        price="$0"
                        limit="5 generations / day"
                        currentRole={user.role}
                        cardRole="free"
                        loading={saving}
                        onSelect={() => handlePlanChange("free")}
                    />
                    <PlanCard
                        title="Premium"
                        price="$10"
                        limit="50 generations / day"
                        currentRole={user.role}
                        cardRole="premium"
                        loading={saving}
                        onSelect={() => handlePlanChange("premium")}
                    />
                    <PlanCard
                        title="BYOK"
                        price="$5"
                        limit="Unlimited (Own Key)"
                        currentRole={user.role}
                        cardRole="byok"
                        loading={saving}
                        onSelect={() => handlePlanChange("byok")}
                    />
                </div>
            </div>

            {/* API Key Section (Only for BYOK) */}
            {user.role === "byok" && (
                <Card>
                    <CardHeader>
                        <CardTitle>Google Gemini API Key</CardTitle>
                        <CardDescription>
                            Enter your Google Gemini API key to enable unlimited generations.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="AIzaSy..."
                                className="flex-1"
                            />
                            <Button onClick={handleApiKeySave} disabled={saving}>
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Key
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function PlanCard({
    title,
    price,
    limit,
    currentRole,
    cardRole,
    loading,
    onSelect,
}: {
    title: string;
    price: string;
    limit: string;
    currentRole: string;
    cardRole: string;
    loading: boolean;
    onSelect: () => void;
}) {
    const isCurrent = currentRole === cardRole;

    return (
        <Card
            className={cn(
                "relative cursor-pointer transition-all hover:shadow-md",
                isCurrent ? "border-primary ring-1 ring-primary bg-primary/5" : "hover:border-primary/50"
            )}
            onClick={!isCurrent ? onSelect : undefined}
        >
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{title}</CardTitle>
                    {isCurrent && (
                        <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/20">
                            Current
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold mb-2">
                    {price}
                    <span className="text-sm font-normal text-muted-foreground">/mo</span>
                </div>
                <p className="text-sm text-muted-foreground">{limit}</p>
            </CardContent>
            {!isCurrent && (
                <CardFooter>
                    <Button className="w-full" variant="outline" disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Select Plan"}
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}
