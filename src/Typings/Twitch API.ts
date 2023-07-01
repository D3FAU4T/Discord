export interface TwitchUser {
    data: TwitchUserData[];
}

export interface TwitchUserData {
    id: string;
    login: string;
    display_name: string;
    type: "";
    broadcaster_type: "partner";
    description: string;
    profile_image_url: string;
    offline_image_url: string;
    view_count: number;
    email?: string;
    created_at: string;
}