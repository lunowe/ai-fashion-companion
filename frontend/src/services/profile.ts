import { api } from "@/lib/api";

export type UserProfile = {
    user_id: string;
    preferences: {
        preferred_colors?: string[];
        disliked_colors?: string[];
        preferred_fits?: string[];
    };
    style_notes?: string;
    sizes?: Record<string, string>;
};

export type UserProfileUpdate = {
    preferences?: {
        preferred_colors?: string[];
        disliked_colors?: string[];
        preferred_fits?: string[];
    };
    style_notes?: string;
    sizes?: Record<string, string>;
};

export async function getProfile(): Promise<UserProfile> {
    const { data } = await api.get("/api/profile/");
    return data;
}

export async function updateProfile(payload: UserProfileUpdate): Promise<UserProfile> {
    const { data } = await api.put("/api/profile/", payload);
    return data;
}
