export type WineColorEntry = {
  name: string;
  hex: string;
  desc: string;
};

export type WineColorGroup = {
  spectrum: WineColorEntry[];
  hue: WineColorEntry[];
};

export const wineColors: Record<string, WineColorGroup> = {
  red: {
    spectrum: [
      {
        name: "Purple",
        hex: "#4E0D3A",
        desc: "Deep blue-red, youthful wines. Malbec, young Syrah, Petite Sirah.",
      },
      {
        name: "Ruby",
        hex: "#9B1B30",
        desc: "Bright clear red, most common red wine color. Young Cabernet, Merlot, Sangiovese.",
      },
      {
        name: "Garnet",
        hex: "#6E2B3A",
        desc: "Red with brownish-orange hints, indicates age. Aged Pinot Noir, Nebbiolo, older Rioja.",
      },
    ],
    hue: [
      {
        name: "Blue",
        hex: "#5C2D6E",
        desc: "Cool blue-purple tint at rim. Indicates youth, low pH, high acidity.",
      },
      {
        name: "Pink",
        hex: "#B8566E",
        desc: "Pinkish-red rim. Mid-age wine, moderate development.",
      },
      {
        name: "Garnet",
        hex: "#8B4A3A",
        desc: "Orange-brown rim. Indicates significant age and evolution.",
      },
    ],
  },
  white: {
    spectrum: [
      {
        name: "Straw",
        hex: "#E8D8A0",
        desc: "Very pale yellow, almost watery. Young Pinot Grigio, Muscadet, Albariño.",
      },
      {
        name: "Yellow",
        hex: "#E0C840",
        desc: "Medium yellow. Classic white wines in their prime drinking window. Chardonnay, Pinot Gris.",
      },
      {
        name: "Gold",
        hex: "#DAA520",
        desc: "Rich golden yellow. Oaked Chardonnay, aged Riesling, Viognier.",
      },
    ],
    hue: [
      {
        name: "Silver",
        hex: "#D0D0C4",
        desc: "Neutral silvery tint. Young, cool-climate whites. Muscadet, Pinot Grigio.",
      },
      {
        name: "Green",
        hex: "#A8C878",
        desc: "Green tint at rim. Very young, high acidity. Sauvignon Blanc, Grüner Veltliner.",
      },
      {
        name: "Orange",
        hex: "#D4903A",
        desc: "Orange/amber tint. Aged whites, oxidative styles, some skin-contact wines.",
      },
    ],
  },
};
