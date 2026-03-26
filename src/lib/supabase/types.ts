// TODO: Generate database types by running:
// npx supabase gen types typescript --project-id <your-project-id> > src/lib/supabase/types.ts

export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
