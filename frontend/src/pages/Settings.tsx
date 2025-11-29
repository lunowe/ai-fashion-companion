import { useState, useEffect } from "react";
import { Check, AlertCircle, Loader2 } from "lucide-react";
import { api, toErrorMessage } from "../lib/api";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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

export default function Settings() {
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
            <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
                <Skeleton className="h-10 w-48" />
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
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>Failed to load user settings. Please refresh the page.</AlertDescription>
                </Alert>
            </div>
        );
    }

    const limit = LIMITS[user.role] || 5;
    const usagePercent = limit === Infinity ? 0 : Math.min(100, (user.generation_count / limit) * 100);

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold mb-8 text-foreground tracking-tight">Settings</h1>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert className="mb-6 border-primary/50 bg-primary/10 text-primary">
                    <Check className="h-4 w-4" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{success}</AlertDescription>
                </Alert>
            )}

            {/* Usage Section */}
            <Card className="mb-8">
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
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-6 px-1">Subscription Plan</h2>
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
                            Enter your Google Gemini API key to enable unlimited generations. Your key is stored
                            securely.
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

// Sub-component for Cleaner Layout
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
