import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfile, updateProfile, type UserProfileUpdate } from "@/services/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { useEffect } from "react";

export default function ProfilePage() {
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

    // Reset form when data loads
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
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 px-2">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Your Style Profile</h1>
                <p className="text-muted-foreground">
                    Manage your preferences to help the AI generate better outfits for you.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Preferences Section */}
                <div className="p-6 space-y-6 border rounded-lg bg-card">
                    <h2 className="text-xl font-semibold">Preferences</h2>

                    {/* Preferred Colors */}
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

                    {/* Disliked Colors */}
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

                    {/* Preferred Fits */}
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

                {/* Style Notes Section */}
                <div className="p-6 space-y-6 border rounded-lg bg-card">
                    <h2 className="text-xl font-semibold">Style Notes</h2>
                    <div className="space-y-2">
                        <Label>General Style Notes</Label>
                        <Textarea
                            {...register("style_notes")}
                            placeholder="I prefer minimalist styles with clean lines. I don't like loud patterns..."
                            className="min-h-[150px]"
                        />
                        <p className="text-xs text-muted-foreground">
                            Any other details about your style that the AI should know.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button type="submit" disabled={updateMut.isPending} className="gap-2">
                        {updateMut.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Save Profile
                    </Button>
                </div>
            </form>
        </div>
    );
}
