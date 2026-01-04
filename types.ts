export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    __InternalSupabase: {
        PostgrestVersion: "13.0.5"
    }
    public: {
        Tables: {
            alerts: {
                Row: {
                    alert_type: Database["public"]["Enums"]["alert_type"]
                    audio_url: string | null
                    created_at: string | null
                    description: string | null
                    id: string
                    is_false_alarm: boolean | null
                    location: unknown
                    location_name: string | null
                    status: Database["public"]["Enums"]["incident_status"] | null
                    user_id: string
                    video_url: string | null
                }
                Insert: {
                    alert_type: Database["public"]["Enums"]["alert_type"]
                    audio_url?: string | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    is_false_alarm?: boolean | null
                    location: unknown
                    location_name?: string | null
                    status?: Database["public"]["Enums"]["incident_status"] | null
                    user_id: string
                    video_url?: string | null
                }
                Update: {
                    alert_type?: Database["public"]["Enums"]["alert_type"]
                    audio_url?: string | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    is_false_alarm?: boolean | null
                    location?: unknown
                    location_name?: string | null
                    status?: Database["public"]["Enums"]["incident_status"] | null
                    user_id?: string
                    video_url?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "alerts_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            comments: {
                Row: {
                    id: string
                    post_id: string
                    user_id: string
                    parent_comment_id: string | null
                    content: string
                    likes_count: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    post_id: string
                    user_id: string
                    parent_comment_id?: string | null
                    content: string
                    likes_count?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    post_id?: string
                    user_id?: string
                    parent_comment_id?: string | null
                    content?: string
                    likes_count?: number
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "comments_post_id_fkey"
                        columns: ["post_id"]
                        isOneToOne: false
                        referencedRelation: "posts"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "comments_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            comment_likes: {
                Row: {
                    id: string
                    comment_id: string
                    user_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    comment_id: string
                    user_id: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    comment_id?: string
                    user_id?: string
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "comment_likes_comment_id_fkey"
                        columns: ["comment_id"]
                        isOneToOne: false
                        referencedRelation: "comments"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "comment_likes_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            incidents: {
                Row: {
                    created_at: string | null
                    description: string
                    id: string
                    image_url: string | null
                    incident_type: Database["public"]["Enums"]["alert_type"]
                    is_public: boolean | null
                    location: unknown
                    location_name: string | null
                    status: Database["public"]["Enums"]["incident_status"] | null
                    updated_at: string | null
                    user_id: string
                    video_url: string | null
                }
                Insert: {
                    created_at?: string | null
                    description: string
                    id?: string
                    image_url?: string | null
                    incident_type: Database["public"]["Enums"]["alert_type"]
                    is_public?: boolean | null
                    location: unknown
                    location_name?: string | null
                    status?: Database["public"]["Enums"]["incident_status"] | null
                    updated_at?: string | null
                    user_id: string
                    video_url?: string | null
                }
                Update: {
                    created_at?: string | null
                    description?: string
                    id?: string
                    image_url?: string | null
                    incident_type?: Database["public"]["Enums"]["alert_type"]
                    is_public?: boolean | null
                    location?: unknown
                    location_name?: string | null
                    status?: Database["public"]["Enums"]["incident_status"] | null
                    updated_at?: string | null
                    user_id?: string
                    video_url?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "incidents_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            messages: {
                Row: {
                    content: string
                    created_at: string | null
                    id: string
                    is_read: boolean | null
                    receiver_id: string
                    sender_id: string
                }
                Insert: {
                    content: string
                    created_at?: string | null
                    id?: string
                    is_read?: boolean | null
                    receiver_id: string
                    sender_id: string
                }
                Update: {
                    content?: string
                    created_at?: string | null
                    id?: string
                    is_read?: boolean | null
                    receiver_id?: string
                    sender_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "messages_receiver_id_fkey"
                        columns: ["receiver_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "messages_sender_id_fkey"
                        columns: ["sender_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            posts: {
                Row: {
                    id: string
                    user_id: string
                    content: string
                    photo_urls: string[]
                    location: unknown | null
                    location_name: string | null
                    likes_count: number
                    comments_count: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    content: string
                    photo_urls?: string[]
                    location?: unknown | null
                    location_name?: string | null
                    likes_count?: number
                    comments_count?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    content?: string
                    photo_urls?: string[]
                    location?: unknown | null
                    location_name?: string | null
                    likes_count?: number
                    comments_count?: number
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "posts_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            post_likes: {
                Row: {
                    id: string
                    post_id: string
                    user_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    post_id: string
                    user_id: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    post_id?: string
                    user_id?: string
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "post_likes_post_id_fkey"
                        columns: ["post_id"]
                        isOneToOne: false
                        referencedRelation: "posts"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "post_likes_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            profiles: {
                Row: {
                    avatar_url: string | null
                    created_at: string | null
                    display_name: string | null
                    full_name: string | null
                    id: string
                    phone_number: string | null
                    updated_at: string | null
                }
                Insert: {
                    avatar_url?: string | null
                    created_at?: string | null
                    display_name?: string | null
                    full_name?: string | null
                    id: string
                    phone_number?: string | null
                    updated_at?: string | null
                }
                Update: {
                    avatar_url?: string | null
                    created_at?: string | null
                    display_name?: string | null
                    full_name?: string | null
                    id?: string
                    phone_number?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            tracking_sessions: {
                Row: {
                    check_in_time: string | null
                    companions: Json | null
                    created_at: string | null
                    destination: string
                    destination_location: unknown
                    end_time: string | null
                    id: string
                    might_be_late: boolean | null
                    outfit_description: string | null
                    outfit_photo_url: string | null
                    start_time: string
                    status: Database["public"]["Enums"]["tracking_status"]
                    staying_overnight: boolean | null
                    updated_at: string | null
                    user_id: string
                    vehicle_color: string | null
                    vehicle_make: string | null
                    vehicle_model: string | null
                    vehicle_plate: string | null
                }
                Insert: {
                    check_in_time?: string | null
                    companions?: Json | null
                    created_at?: string | null
                    destination: string
                    destination_location: unknown
                    end_time?: string | null
                    id?: string
                    might_be_late?: boolean | null
                    outfit_description?: string | null
                    outfit_photo_url?: string | null
                    start_time: string
                    status?: Database["public"]["Enums"]["tracking_status"]
                    staying_overnight?: boolean | null
                    updated_at?: string | null
                    user_id: string
                    vehicle_color?: string | null
                    vehicle_make?: string | null
                    vehicle_model?: string | null
                    vehicle_plate?: string | null
                }
                Update: {
                    check_in_time?: string | null
                    companions?: Json | null
                    created_at?: string | null
                    destination?: string
                    destination_location?: unknown
                    end_time?: string | null
                    id?: string
                    might_be_late?: boolean | null
                    outfit_description?: string | null
                    outfit_photo_url?: string | null
                    start_time?: string
                    status?: Database["public"]["Enums"]["tracking_status"]
                    staying_overnight?: boolean | null
                    updated_at?: string | null
                    user_id?: string
                    vehicle_color?: string | null
                    vehicle_make?: string | null
                    vehicle_model?: string | null
                    vehicle_plate?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "tracking_sessions_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            public_profiles: {
                Row: {
                    full_name: string | null
                    display_name: string | null
                    id: string | null
                    profile_photo_url: string | null
                }
                Relationships: []
            }
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            alert_type:
            | "panic"
            | "robbery"
            | "assault"
            | "suspicious"
            | "house_breaking"
            | "other"
            | "amber"
            | "accident"
            | "kidnapping"
            | "fire"
            | "medical"
            | "unsafe_area"
            incident_status: "active" | "resolved" | "false_alarm"
            tracking_status: "active" | "completed" | "overdue" | "cancelled"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
