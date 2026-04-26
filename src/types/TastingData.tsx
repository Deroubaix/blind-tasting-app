export type TastingData = {
    id?: number;
    wineType: "White" | "Red";
    timerEnabled: boolean;
    timerDuration: number | null;
    soundEnabled?: boolean;
    wineName?: string;
    sight?: Record<string, string>;
    nose?: Record<string, string[]>;
    confirmNose?: string;
    palate?: Record<string, string>;
    conclusion?: {
      initial?: {
        worldOrigin?: string | null;
        climate?: string | null;
        ageRange?: string | null;
        grapeVarieties?: string[];
        possibleCountries?: string[];
      };
      final?: Record<string, string | null>;
    };
    notes?: string;
  };
  
  