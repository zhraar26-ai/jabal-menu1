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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          name: string
          sort_order: number
          tag: string | null
          visible: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          sort_order?: number
          tag?: string | null
          visible?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          sort_order?: number
          tag?: string | null
          visible?: boolean
        }
        Relationships: []
      }
      delivery_areas: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          price: number
          sort_order: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          price?: number
          sort_order?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          price?: number
          sort_order?: number
        }
        Relationships: []
      }
      dish_ratings: {
        Row: {
          created_at: string
          hidden: boolean
          id: string
          menu_item_id: string
          stars: number
        }
        Insert: {
          created_at?: string
          hidden?: boolean
          id?: string
          menu_item_id: string
          stars: number
        }
        Update: {
          created_at?: string
          hidden?: boolean
          id?: string
          menu_item_id?: string
          stars?: number
        }
        Relationships: [
          {
            foreignKeyName: "dish_ratings_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_item_options: {
        Row: {
          created_at: string
          id: string
          menu_item_id: string
          name: string
          price: number
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          menu_item_id: string
          name: string
          price?: number
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          menu_item_id?: string
          name?: string
          price?: number
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_options_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          available: boolean
          category_id: string
          created_at: string
          description: string | null
          discount_price: number | null
          featured: boolean
          id: string
          image_url: string | null
          name: string
          price: number
          sort_order: number
        }
        Insert: {
          available?: boolean
          category_id: string
          created_at?: string
          description?: string | null
          discount_price?: number | null
          featured?: boolean
          id?: string
          image_url?: string | null
          name: string
          price: number
          sort_order?: number
        }
        Update: {
          available?: boolean
          category_id?: string
          created_at?: string
          description?: string | null
          discount_price?: number | null
          featured?: boolean
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          active: boolean
          badge: string | null
          created_at: string
          description: string | null
          id: string
          sort_order: number
          title: string
        }
        Insert: {
          active?: boolean
          badge?: string | null
          created_at?: string
          description?: string | null
          id?: string
          sort_order?: number
          title: string
        }
        Update: {
          active?: boolean
          badge?: string | null
          created_at?: string
          description?: string | null
          id?: string
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          address: string | null
          created_at: string
          delivery_area: string | null
          delivery_fee: number
          id: string
          items: Json
          phone: string | null
          subtotal: number
          total: number
        }
        Insert: {
          address?: string | null
          created_at?: string
          delivery_area?: string | null
          delivery_fee?: number
          id?: string
          items?: Json
          phone?: string | null
          subtotal?: number
          total?: number
        }
        Update: {
          address?: string | null
          created_at?: string
          delivery_area?: string | null
          delivery_fee?: number
          id?: string
          items?: Json
          phone?: string | null
          subtotal?: number
          total?: number
        }
        Relationships: []
      }
      restaurant_ratings: {
        Row: {
          comment: string | null
          created_at: string
          hidden: boolean
          id: string
          pinned: boolean
          stars: number
        }
        Insert: {
          comment?: string | null
          created_at?: string
          hidden?: boolean
          id?: string
          pinned?: boolean
          stars: number
        }
        Update: {
          comment?: string | null
          created_at?: string
          hidden?: boolean
          id?: string
          pinned?: boolean
          stars?: number
        }
        Relationships: []
      }
      theme_settings: {
        Row: {
          background_style: string
          featured_enabled: boolean
          font_family: string
          footer_text: string
          forest_color: string
          forest_deep_color: string
          gold_color: string
          hero_image_url: string | null
          hero_subtitle: string | null
          hero_title: string | null
          id: number
          location_url: string
        }
        Insert: {
          background_style?: string
          featured_enabled?: boolean
          font_family?: string
          footer_text?: string
          forest_color?: string
          forest_deep_color?: string
          gold_color?: string
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: number
          location_url?: string
        }
        Update: {
          background_style?: string
          featured_enabled?: boolean
          font_family?: string
          footer_text?: string
          forest_color?: string
          forest_deep_color?: string
          gold_color?: string
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: number
          location_url?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
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
      app_role: ["admin"],
    },
  },
} as const
