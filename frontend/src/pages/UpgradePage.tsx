import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowLeft,
  Crown,
  Key,
  Zap,
} from "lucide-react";
import { api, toErrorMessage } from "../lib/api";
import type { User, BillingInterval } from "@/types";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Plan definitions with pricing
const PLANS = {
  free: {
    name: "Free",
    description: "Perfect for getting started",
    icon: Sparkles,
    features: [
      "5 outfit generations / day",
      "3 visualizations / day",
      "75 wardrobe items",
      "15 saved outfits",
      "1 custom style",
    ],
    pricing: {
      monthly: 0,
      yearly: 0,
    },
    popular: false,
  },
  premium: {
    name: "Premium",
    description: "For the fashion-forward",
    icon: Crown,
    features: [
      "50 outfit generations / day",
      "10 suitcase generations / day",
      "15 visualizations / day",
      "250 wardrobe items",
      "Unlimited saved outfits",
      "10 custom styles",
      "Priority support",
    ],
    pricing: {
      monthly: 1000, // $10.00 in cents
      yearly: 9600, // $96.00 in cents ($8/month)
    },
    popular: true,
  },
  byok: {
    name: "BYOK",
    description: "Bring your own API key",
    icon: Key,
    features: [
      "Unlimited generations",
      "Unlimited storage",
      "Use your own API key",
      "Full API access",
      "Priority support",
    ],
    pricing: {
      monthly: 500, // $5.00 in cents
      yearly: 4800, // $48.00 in cents ($4/month)
    },
    popular: false,
  },
};

type PlanKey = keyof typeof PLANS;

export default function UpgradePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>("monthly");
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  useEffect(() => {
    fetchUser();
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

  const handleSelectPlan = async (plan: PlanKey) => {
    if (!user) return;

    // If selecting current plan, do nothing
    if (user.role === plan) return;

    // If downgrading to free, just update the role
    if (plan === "free") {
      try {
        setProcessingPlan(plan);
        setError("");
        setSuccess("");
        const res = await api.put("/api/auth/users/me/settings", {
          role: "free",
        });
        setUser(res.data);
        setSuccess("You've been moved to the Free plan.");
      } catch (err) {
        setError(toErrorMessage(err));
      } finally {
        setProcessingPlan(null);
      }
      return;
    }

    // For paid plans, this is where Stripe checkout would be initiated
    // For now, we'll just update the role directly (dev mode)
    try {
      setProcessingPlan(plan);
      setError("");
      setSuccess("");

      // TODO: Replace with Stripe checkout
      // const res = await api.post("/api/billing/create-checkout-session", {
      //   plan,
      //   billing_interval: billingInterval,
      // });
      // window.location.href = res.data.checkout_url;

      // Dev mode: directly update role
      const res = await api.put("/api/auth/users/me/settings", {
        role: plan,
      });
      setUser(res.data);
      setSuccess(
        `Upgraded to ${PLANS[plan].name}! (Dev mode - no payment required)`
      );
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setProcessingPlan(null);
    }
  };

  const formatPrice = (cents: number) => {
    if (cents === 0) return "Free";
    return `$${(cents / 100).toFixed(0)}`;
  };

  const getYearlySavings = (plan: PlanKey) => {
    const monthlyTotal = PLANS[plan].pricing.monthly * 12;
    const yearlyTotal = PLANS[plan].pricing.yearly;
    if (monthlyTotal === 0) return 0;
    return Math.round(((monthlyTotal - yearlyTotal) / monthlyTotal) * 100);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-6 w-96" />
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Skeleton className="h-[450px] rounded-xl" />
          <Skeleton className="h-[450px] rounded-xl" />
          <Skeleton className="h-[450px] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          {user?.role === "free" ? "Upgrade Your Plan" : "Manage Your Plan"}
        </h1>
        <p className="text-muted-foreground mt-2">
          Choose the plan that best fits your fashion needs
        </p>
      </div>

      {/* Alerts */}
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

      {/* Billing Interval Toggle */}
      <div className="flex items-center justify-center gap-4 mb-8 p-4 rounded-lg bg-muted/50">
        <Label
          htmlFor="billing-toggle"
          className={cn(
            "cursor-pointer transition-colors",
            billingInterval === "monthly"
              ? "text-foreground font-medium"
              : "text-muted-foreground"
          )}
        >
          Monthly
        </Label>
        <Switch
          id="billing-toggle"
          checked={billingInterval === "yearly"}
          onCheckedChange={(checked: boolean) =>
            setBillingInterval(checked ? "yearly" : "monthly")
          }
        />
        <Label
          htmlFor="billing-toggle"
          className={cn(
            "cursor-pointer transition-colors flex items-center gap-2",
            billingInterval === "yearly"
              ? "text-foreground font-medium"
              : "text-muted-foreground"
          )}
        >
          Yearly
          <Badge variant="secondary" className="bg-green-500/20 text-green-600">
            Save up to 20%
          </Badge>
        </Label>
      </div>

      {/* Plan Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {(Object.keys(PLANS) as PlanKey[]).map((planKey) => {
          const plan = PLANS[planKey];
          const Icon = plan.icon;
          const isCurrent = user?.role === planKey;
          const price = plan.pricing[billingInterval];
          const savings =
            billingInterval === "yearly" ? getYearlySavings(planKey) : 0;

          return (
            <Card
              key={planKey}
              className={cn(
                "relative transition-all",
                plan.popular && "border-primary shadow-lg scale-[1.02]",
                isCurrent && "ring-2 ring-primary bg-primary/5"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Zap className="mr-1 h-3 w-3" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        plan.popular ? "bg-primary/20" : "bg-muted"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5",
                          plan.popular
                            ? "text-primary"
                            : "text-muted-foreground"
                        )}
                      />
                    </div>
                    <CardTitle>{plan.name}</CardTitle>
                  </div>
                  {isCurrent && (
                    <Badge
                      variant="secondary"
                      className="bg-primary/20 text-primary"
                    >
                      Current
                    </Badge>
                  )}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Pricing */}
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">
                      {formatPrice(price)}
                    </span>
                    {price > 0 && (
                      <span className="text-muted-foreground">
                        /{billingInterval === "yearly" ? "year" : "month"}
                      </span>
                    )}
                  </div>
                  {billingInterval === "yearly" && savings > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      Save {savings}% compared to monthly
                    </p>
                  )}
                  {billingInterval === "yearly" && price > 0 && (
                    <p className="text-sm text-muted-foreground">
                      ${(price / 100 / 12).toFixed(0)}/month billed annually
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  disabled={isCurrent || processingPlan !== null}
                  onClick={() => handleSelectPlan(planKey)}
                >
                  {processingPlan === planKey ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {isCurrent
                    ? "Current Plan"
                    : user?.role === "free" ||
                      (user?.role &&
                        planKey !== "free" &&
                        PLANS[planKey].pricing.monthly >
                          PLANS[user.role as PlanKey]?.pricing.monthly)
                    ? `Upgrade to ${plan.name}`
                    : planKey === "free"
                    ? "Downgrade to Free"
                    : `Switch to ${plan.name}`}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* FAQ or Additional Info */}
      <div className="mt-12 text-center text-muted-foreground">
        <p className="text-sm">
          All plans include a 7-day free trial. Cancel anytime.
        </p>
        <p className="text-sm mt-2">
          Need help choosing?{" "}
          <a
            href="mailto:support@fitflow.app"
            className="text-primary hover:underline"
          >
            Contact our team
          </a>
        </p>
      </div>
    </div>
  );
}
