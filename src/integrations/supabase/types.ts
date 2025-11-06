export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      artists: {
        Row: {
          artwork_count: number | null
          audio_story_url: string | null
          avatar_url: string | null
          bio: string | null
          cover_image_url: string | null
          created_at: string
          id: string
          instagram_url: string | null
          is_featured: boolean | null
          name: string
          slug: string
          specialty: string | null
          twitter_url: string | null
          updated_at: string
          user_id: string | null
          website_url: string | null
        }
        Insert: {
          artwork_count?: number | null
          audio_story_url?: string | null
          avatar_url?: string | null
          bio?: string | null
          cover_image_url?: string | null
          created_at?: string
          id?: string
          instagram_url?: string | null
          is_featured?: boolean | null
          name: string
          slug: string
          specialty?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id?: string | null
          website_url?: string | null
        }
        Update: {
          artwork_count?: number | null
          audio_story_url?: string | null
          avatar_url?: string | null
          bio?: string | null
          cover_image_url?: string | null
          created_at?: string
          id?: string
          instagram_url?: string | null
          is_featured?: boolean | null
          name?: string
          slug?: string
          specialty?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      artwork_images: {
        Row: {
          artwork_id: string
          created_at: string
          display_order: number
          id: string
          image_url: string
        }
        Insert: {
          artwork_id: string
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
        }
        Update: {
          artwork_id?: string
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "artwork_images_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
        ]
      }
      artworks: {
        Row: {
          artist_id: string
          audio_story_url: string | null
          chain: string | null
          collection_id: string | null
          contract_address: string | null
          created_at: string
          current_owner_id: string | null
          description: string | null
          dimensions: string | null
          edition_available: number | null
          edition_total: number | null
          id: string
          ipfs_metadata_url: string | null
          is_nft: boolean | null
          is_physical: boolean | null
          medium: string | null
          price_eth: number | null
          price_usd: number | null
          primary_image_url: string | null
          royalty_percentage: number | null
          slug: string
          status: Database["public"]["Enums"]["artwork_status"]
          tags: string[] | null
          title: string
          token_id: string | null
          updated_at: string
          view_count: number | null
          year: number | null
        }
        Insert: {
          artist_id: string
          audio_story_url?: string | null
          chain?: string | null
          collection_id?: string | null
          contract_address?: string | null
          created_at?: string
          current_owner_id?: string | null
          description?: string | null
          dimensions?: string | null
          edition_available?: number | null
          edition_total?: number | null
          id?: string
          ipfs_metadata_url?: string | null
          is_nft?: boolean | null
          is_physical?: boolean | null
          medium?: string | null
          price_eth?: number | null
          price_usd?: number | null
          primary_image_url?: string | null
          royalty_percentage?: number | null
          slug: string
          status?: Database["public"]["Enums"]["artwork_status"]
          tags?: string[] | null
          title: string
          token_id?: string | null
          updated_at?: string
          view_count?: number | null
          year?: number | null
        }
        Update: {
          artist_id?: string
          audio_story_url?: string | null
          chain?: string | null
          collection_id?: string | null
          contract_address?: string | null
          created_at?: string
          current_owner_id?: string | null
          description?: string | null
          dimensions?: string | null
          edition_available?: number | null
          edition_total?: number | null
          id?: string
          ipfs_metadata_url?: string | null
          is_nft?: boolean | null
          is_physical?: boolean | null
          medium?: string | null
          price_eth?: number | null
          price_usd?: number | null
          primary_image_url?: string | null
          royalty_percentage?: number | null
          slug?: string
          status?: Database["public"]["Enums"]["artwork_status"]
          tags?: string[] | null
          title?: string
          token_id?: string | null
          updated_at?: string
          view_count?: number | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "artworks_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artworks_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          cover_image_url: string | null
          created_at: string
          curator_name: string | null
          description: string | null
          id: string
          is_featured: boolean | null
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          curator_name?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          curator_name?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      listings: {
        Row: {
          artwork_id: string
          auction_end_at: string | null
          created_at: string
          id: string
          is_active: boolean
          listing_type: string
          minimum_bid_usd: number | null
          original_owner_id: string | null
          price_eth: number | null
          price_usd: number
          seller_id: string
          updated_at: string
        }
        Insert: {
          artwork_id: string
          auction_end_at?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          listing_type?: string
          minimum_bid_usd?: number | null
          original_owner_id?: string | null
          price_eth?: number | null
          price_usd: number
          seller_id: string
          updated_at?: string
        }
        Update: {
          artwork_id?: string
          auction_end_at?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          listing_type?: string
          minimum_bid_usd?: number | null
          original_owner_id?: string | null
          price_eth?: number | null
          price_usd?: number
          seller_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "listings_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          subscribed_at?: string
        }
        Relationships: []
      }
      offers: {
        Row: {
          artwork_id: string
          buyer_id: string
          created_at: string
          expires_at: string | null
          id: string
          message: string | null
          offer_amount_eth: number | null
          offer_amount_usd: number
          seller_id: string
          status: string
          updated_at: string
        }
        Insert: {
          artwork_id: string
          buyer_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          message?: string | null
          offer_amount_eth?: number | null
          offer_amount_usd: number
          seller_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          artwork_id?: string
          buyer_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          message?: string | null
          offer_amount_eth?: number | null
          offer_amount_usd?: number
          seller_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount_crypto: string | null
          amount_usd: number | null
          artwork_id: string
          buyer_email: string
          buyer_wallet_address: string | null
          created_at: string
          currency: string | null
          id: string
          metadata: Json | null
          order_number: string
          payment_method: string
          payment_status: Database["public"]["Enums"]["order_status"]
          shipping_address: Json | null
          stripe_payment_intent_id: string | null
          transaction_hash: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_crypto?: string | null
          amount_usd?: number | null
          artwork_id: string
          buyer_email: string
          buyer_wallet_address?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          metadata?: Json | null
          order_number: string
          payment_method: string
          payment_status?: Database["public"]["Enums"]["order_status"]
          shipping_address?: Json | null
          stripe_payment_intent_id?: string | null
          transaction_hash?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_crypto?: string | null
          amount_usd?: number | null
          artwork_id?: string
          buyer_email?: string
          buyer_wallet_address?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          metadata?: Json | null
          order_number?: string
          payment_method?: string
          payment_status?: Database["public"]["Enums"]["order_status"]
          shipping_address?: Json | null
          stripe_payment_intent_id?: string | null
          transaction_hash?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          wallet_address: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
          wallet_address?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      sales_history: {
        Row: {
          artwork_id: string
          buyer_id: string
          created_at: string
          id: string
          royalty_amount_usd: number | null
          royalty_paid_to: string | null
          sale_price_eth: number | null
          sale_price_usd: number
          sale_type: string
          seller_id: string
          transaction_hash: string | null
        }
        Insert: {
          artwork_id: string
          buyer_id: string
          created_at?: string
          id?: string
          royalty_amount_usd?: number | null
          royalty_paid_to?: string | null
          sale_price_eth?: number | null
          sale_price_usd: number
          sale_type: string
          seller_id: string
          transaction_hash?: string | null
        }
        Update: {
          artwork_id?: string
          buyer_id?: string
          created_at?: string
          id?: string
          royalty_amount_usd?: number | null
          royalty_paid_to?: string | null
          sale_price_eth?: number | null
          sale_price_usd?: number
          sale_type?: string
          seller_id?: string
          transaction_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_history_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          artwork_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          artwork_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          artwork_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_edition_available: {
        Args: { artwork_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "collector" | "artist"
      artwork_status: "draft" | "published" | "sold" | "archived"
      order_status:
        | "pending"
        | "processing"
        | "completed"
        | "cancelled"
        | "refunded"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "collector", "artist"],
      artwork_status: ["draft", "published", "sold", "archived"],
      order_status: [
        "pending",
        "processing",
        "completed",
        "cancelled",
        "refunded",
      ],
    },
  },
} as const
