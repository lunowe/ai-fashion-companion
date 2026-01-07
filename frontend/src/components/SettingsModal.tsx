import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import {
  Loader2,
  Save,
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
  Sparkles,
  Luggage,
  Image,
  Shirt,
  Bookmark,
  ExternalLink,
  Calendar,
  Receipt,
  BarChart3,
} from "lucide-react";

import {
  getProfile,
  updateProfile,
  type UserProfileUpdate,
} from "@/services/profile";
import { api, toErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useTheme } from "@/components/theme-provider"; // Ensure this exists from Shadcn setup
import { useAuth } from "@/context/AuthContext"; // Import Auth for mobile logout
import type {
  User as UserType,
  FeatureType,
  ResourceType,
  PaymentHistoryItem,
} from "@/types";
import { FEATURE_LIMITS, RESOURCE_LIMITS } from "@/types";

// UI Components
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "profile" | "settings" | null;
}

type TabKey = "profile" | "settings" | "usage" | "appearance";

export function SettingsModal({
  open,
  onOpenChange,
  defaultTab = null,
}: SettingsModalProps) {
  // Cast defaultTab to compatible type or null
  const [activeTab, setActiveTab] = useState<TabKey | null>(
    defaultTab as TabKey | null
  );
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
      case "usage":
        return "Usage & Limits";
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
      case "usage":
        return <UsageTabContent />;
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
          <DialogDescription className="sr-only">
            Manage your account
          </DialogDescription>

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
                <Button
                  variant={activeTab === "usage" ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    activeTab === "usage" && "bg-muted shadow-sm"
                  )}
                  onClick={() => setActiveTab("usage")}
                >
                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                  Usage & Limits
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
                        : activeTab === "settings"
                        ? "Manage your subscription and billing."
                        : activeTab === "usage"
                        ? "Monitor your daily AI usage and resource limits."
                        : "Customize the app appearance."}
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
              <DrawerTitle className="text-lg font-semibold">
                Settings
              </DrawerTitle>
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
                    subtitle="Subscription and payments"
                    onClick={() => setActiveTab("settings")}
                  />
                  <MobileMenuRow
                    icon={<BarChart3 className="w-5 h-5" />}
                    iconColor="text-purple-600 dark:text-purple-400"
                    iconBg="bg-purple-100 dark:bg-purple-900/30"
                    title="Usage & Limits"
                    subtitle="Daily usage and storage"
                    onClick={() => setActiveTab("usage")}
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

              <div className="text-center text-xs text-muted-foreground pt-4 pb-8">
                FitFlow v1.0.0
              </div>
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

function TagInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [text, setText] = useState(value?.join(", ") || "");

  useEffect(() => {
    setText(value?.join(", ") || "");
  }, [value]);

  return (
    <Input
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={() =>
        onChange(
          text
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        )
      }
      placeholder={placeholder}
    />
  );
}

function MobileMenuRow({
  icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  onClick,
}: any) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors active:bg-muted"
    >
      <div className="flex items-center gap-3">
        <div className={`${iconBg} ${iconColor} p-2 rounded-md`}>{icon}</div>
        <div className="text-left">
          <div className="font-medium text-sm">{title}</div>
          {subtitle && (
            <div className="text-xs text-muted-foreground">{subtitle}</div>
          )}
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

  const { control, register, handleSubmit, reset } = useForm<UserProfileUpdate>(
    {
      defaultValues: {
        preferences: {
          preferred_colors: [],
          disliked_colors: [],
          preferred_fits: [],
        },
        style_notes: "",
      },
    }
  );

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
            <p className="text-sm text-muted-foreground">
              Customize how the AI generates outfits for you.
            </p>
          </div>
          <Button
            type="submit"
            disabled={updateMut.isPending}
            className="gap-2"
          >
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
            <p className="text-xs text-muted-foreground">
              Comma separated (e.g. Black, Navy, Earth Tones)
            </p>
            <Controller
              name="preferences.preferred_colors"
              control={control}
              render={({ field }) => (
                <TagInput
                  value={field.value || []}
                  onChange={field.onChange}
                  placeholder="Black, White, Navy..."
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Disliked Colors</Label>
            <p className="text-xs text-muted-foreground">
              Colors to avoid (e.g. Neon, Orange)
            </p>
            <Controller
              name="preferences.disliked_colors"
              control={control}
              render={({ field }) => (
                <TagInput
                  value={field.value || []}
                  onChange={field.onChange}
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
                <TagInput
                  value={field.value || []}
                  onChange={field.onChange}
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
          <p className="text-sm text-muted-foreground">
            Additional context for the AI stylist.
          </p>
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

const FEATURE_INFO: Record<
  FeatureType,
  { label: string; icon: typeof Sparkles }
> = {
  outfit_generation: { label: "Outfit Generation", icon: Sparkles },
  suitcase_generation: { label: "Suitcase Generation", icon: Luggage },
  visualization: { label: "Outfit Visualization", icon: Image },
};

const RESOURCE_INFO: Record<
  ResourceType,
  { label: string; icon: typeof Shirt }
> = {
  wardrobe_size: { label: "Wardrobe Items", icon: Shirt },
  saved_outfits: { label: "Saved Outfits", icon: Bookmark },
  custom_styles: { label: "Custom Styles", icon: Palette },
};

// Plan display info
const PLAN_INFO: Record<
  string,
  { name: string; price: string; description: string }
> = {
  free: {
    name: "Free",
    price: "$0/month",
    description: "Basic features for getting started",
  },
  premium: {
    name: "Premium",
    price: "$10/month",
    description: "Full access with higher limits",
  },
  byok: {
    name: "BYOK",
    price: "$5/month",
    description: "Unlimited usage with your own API key",
  },
};

// Mock payment history for now (will come from backend later)
const MOCK_PAYMENT_HISTORY: PaymentHistoryItem[] = [];

type ResourceCounts = Record<ResourceType, number>;

function SettingsTabContent() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>(
    []
  );
  const [paymentHistoryLoading, setPaymentHistoryLoading] = useState(true);

  useEffect(() => {
    fetchUser();
    fetchPaymentHistory();
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

  const fetchPaymentHistory = async () => {
    try {
      setPaymentHistoryLoading(true);
      // For now, use mock data. When Stripe is integrated, this will call the API
      setPaymentHistory(MOCK_PAYMENT_HISTORY);
    } catch (err) {
      console.error("Failed to fetch payment history:", err);
    } finally {
      setPaymentHistoryLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user || user.role === "free") return;
    try {
      setCancelLoading(true);
      setError("");
      setSuccess("");
      const res = await api.put("/api/auth/users/me/settings", {
        role: "free",
      });
      setUser(res.data);
      setSuccess("Subscription canceled. You've been moved to the Free plan.");
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setCancelLoading(false);
    }
  };

  const handleApiKeySave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      const res = await api.put("/api/auth/users/me/settings", {
        api_key: apiKey,
      });
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
        <Skeleton className="h-[150px] w-full rounded-xl" />
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

  const planInfo = PLAN_INFO[user.role] || PLAN_INFO.free;
  const isFreePlan = user.role === "free";

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

      {/* Current Subscription Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription
          </CardTitle>
          <CardDescription>
            Manage your subscription and billing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Current Plan Display */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border bg-muted/30 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{planInfo.name}</h3>
                  <Badge
                    variant="secondary"
                    className="bg-primary/20 text-primary"
                  >
                    Current Plan
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {planInfo.description}
                </p>
                <p className="text-2xl font-bold mt-2">{planInfo.price}</p>
              </div>
              <div className="flex flex-col gap-2">
                {isFreePlan ? (
                  <Button onClick={() => navigate("/upgrade")}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Upgrade Plan
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/upgrade")}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Manage Plan
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={handleCancelSubscription}
                      disabled={cancelLoading}
                    >
                      {cancelLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Cancel Subscription
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Subscription Details (for paid plans) */}
            {!isFreePlan && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Billing Period
                  </p>
                  <p className="font-medium">Monthly</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Next Billing Date
                  </p>
                  <p className="font-medium">Not available yet</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment History Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Payment History
          </CardTitle>
          <CardDescription>
            View your past payments and invoices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paymentHistoryLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : paymentHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No payment history yet</p>
              <p className="text-sm">
                Your payment history will appear here once you upgrade.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentHistory.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full",
                        payment.status === "succeeded" && "bg-green-500",
                        payment.status === "pending" && "bg-yellow-500",
                        payment.status === "failed" && "bg-red-500",
                        payment.status === "refunded" && "bg-gray-500"
                      )}
                    />
                    <div>
                      <p className="font-medium">{payment.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">
                      ${(payment.amount / 100).toFixed(2)}{" "}
                      {payment.currency.toUpperCase()}
                    </span>
                    {payment.invoice_url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={payment.invoice_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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

// --- Usage Tab Content ---

function UsageTabContent() {
  const [user, setUser] = useState<UserType | null>(null);
  const [resourceCounts, setResourceCounts] = useState<ResourceCounts | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUser();
    fetchResources();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await api.get("/api/auth/users/me");
      setUser(res.data);
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async () => {
    try {
      const res = await api.get("/api/auth/users/me/resources");
      setResourceCounts(res.data);
    } catch (err) {
      console.error("Failed to fetch resources:", err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <Skeleton className="h-[200px] w-full rounded-xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load usage data.</AlertDescription>
      </Alert>
    );
  }

  // Helper to get usage percent for a feature
  const getUsagePercent = (feature: FeatureType) => {
    const limit = FEATURE_LIMITS[feature][user.role] ?? 0;
    const count = user.usage_counts[feature] ?? 0;
    if (limit === Infinity || limit === 0) return 0;
    return Math.min(100, (count / limit) * 100);
  };

  // Helper to format limit display
  const formatLimit = (limit: number) => {
    if (limit === Infinity) return "Unlimited";
    if (limit === 0) return "Not available";
    return limit.toString();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Daily Usage Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Daily Usage
          </CardTitle>
          <CardDescription>
            Monitor your daily AI feature usage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {(Object.keys(FEATURE_INFO) as FeatureType[]).map((feature) => {
              const { label, icon: Icon } = FEATURE_INFO[feature];
              const limit = FEATURE_LIMITS[feature][user.role] ?? 0;
              const count = user.usage_counts[feature] ?? 0;
              const usagePercent = getUsagePercent(feature);
              const isDisabled = limit === 0;

              return (
                <div
                  key={feature}
                  className={cn("space-y-2", isDisabled && "opacity-50")}
                >
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {label}
                    </span>
                    <span className="text-muted-foreground">
                      {isDisabled ? (
                        <Badge variant="secondary" className="text-xs">
                          Premium only
                        </Badge>
                      ) : (
                        `${count} / ${formatLimit(limit)}`
                      )}
                    </span>
                  </div>
                  {!isDisabled && limit !== Infinity && (
                    <Progress value={usagePercent} className="h-2" />
                  )}
                </div>
              );
            })}
            <p className="text-xs text-muted-foreground pt-2 border-t">
              Resets daily at 00:00 UTC. Last reset:{" "}
              {new Date(user.last_reset_date).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Resource Limits Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shirt className="h-5 w-5" />
            Resource Limits
          </CardTitle>
          <CardDescription>Your account storage capacity.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {(Object.keys(RESOURCE_INFO) as ResourceType[]).map((resource) => {
              const { label, icon: Icon } = RESOURCE_INFO[resource];
              const limit = RESOURCE_LIMITS[resource][user.role] ?? 0;
              const count = resourceCounts?.[resource] ?? 0;
              const usagePercent =
                limit === Infinity || limit === 0
                  ? 0
                  : Math.min(100, (count / limit) * 100);

              return (
                <div key={resource} className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {label}
                    </span>
                    <span className="text-muted-foreground">
                      {resourceCounts ? (
                        `${count} / ${formatLimit(limit)}`
                      ) : (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      )}
                    </span>
                  </div>
                  {limit !== Infinity && (
                    <Progress value={usagePercent} className="h-2" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
