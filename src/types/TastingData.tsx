export type TastingData = {
    id?: number;
    wineType: "White" | "Red";
    timerEnabled: boolean;
    timerDuration: number | null;
    wineName?: string;
    sight?: Record<string, string>;
    nose?: Record<string, string>;
    palate?: Record<string, string>;
    conclusion?: {
      initial: Record<string, string>;
      final: Record<string, string>;
    };
    notes?: string;
  };
  
  