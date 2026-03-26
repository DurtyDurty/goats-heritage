// TODO: Generate database types by running:
// npx supabase gen types typescript --project-id lixyenbgoxgggbuvudkg > src/lib/supabase/types.ts

// Permissive placeholder until generated types are available
export type Database = {
  public: {
    Tables: {
      [key: string]: {
        Row: Record<string, any>;
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, any>;
      };
    };
    Functions: Record<string, any>;
    Enums: Record<string, any>;
  };
};
