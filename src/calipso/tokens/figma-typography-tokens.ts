export type TypographyTokenValue = {
  family: string;
  style: string;
  weight: number;
  size: number;
  lineHeight: number;
  letterSpacing: number;
};

export const figmaTypographyTokens: Record<string, TypographyTokenValue> = {
  "Typography/Display/lg": { family: "Open Sans", style: "Medium", weight: 500, size: 48, lineHeight: 56, letterSpacing: 0 },
  "Typography/Display/lg-emphasized": { family: "Open Sans", style: "Bold", weight: 700, size: 48, lineHeight: 56, letterSpacing: 0 },
  "Typography/Display/md": { family: "Open Sans", style: "Medium", weight: 500, size: 32, lineHeight: 40, letterSpacing: 0 },
  "Typography/Display/md-semiemphasized": { family: "Open Sans", style: "SemiBold", weight: 600, size: 32, lineHeight: 40, letterSpacing: 0 },
  "Typography/Display/md-emphasized": { family: "Open Sans", style: "Bold", weight: 700, size: 32, lineHeight: 40, letterSpacing: 0 },
  "Typography/Display/sm": { family: "Open Sans", style: "Medium", weight: 500, size: 28, lineHeight: 36, letterSpacing: 0 },
  "Typography/Display/sm-emphasized": { family: "Open Sans", style: "Bold", weight: 700, size: 28, lineHeight: 36, letterSpacing: 0 },

  "Typography/Headline/sm": { family: "Open Sans", style: "Medium", weight: 500, size: 24, lineHeight: 32, letterSpacing: 0 },
  "Typography/Headline/sm-semiemphasized": { family: "Open Sans", style: "SemiBold", weight: 600, size: 24, lineHeight: 32, letterSpacing: 0 },
  "Typography/Headline/sm-emphasized": { family: "Open Sans", style: "Bold", weight: 700, size: 24, lineHeight: 32, letterSpacing: 0 },
  "Typography/Headline/xs": { family: "Open Sans", style: "Medium", weight: 500, size: 22, lineHeight: 30, letterSpacing: 0 },
  "Typography/Headline/xs-semiemphasized": { family: "Open Sans", style: "SemiBold", weight: 600, size: 22, lineHeight: 30, letterSpacing: 0 },
  "Typography/Headline/xs-emphasized": { family: "Open Sans", style: "Bold", weight: 700, size: 22, lineHeight: 30, letterSpacing: 0 },

  "Typography/Body/lg": { family: "Open Sans", style: "Medium", weight: 500, size: 16, lineHeight: 24, letterSpacing: 0 },
  "Typography/Body/lg-semiemphasized": { family: "Open Sans", style: "SemiBold", weight: 600, size: 16, lineHeight: 24, letterSpacing: 0 },
  "Typography/Body/lg-emphasized": { family: "Open Sans", style: "Bold", weight: 700, size: 16, lineHeight: 24, letterSpacing: 0 },
  "Typography/Body/lg-link": { family: "Open Sans", style: "Medium", weight: 500, size: 16, lineHeight: 24, letterSpacing: 0 },
  "Typography/Body/md": { family: "Open Sans", style: "Medium", weight: 500, size: 14, lineHeight: 20, letterSpacing: 0 },
  "Typography/Body/md-semiemphasized": { family: "Open Sans", style: "SemiBold", weight: 600, size: 14, lineHeight: 20, letterSpacing: 0 },
  "Typography/Body/md-emphasized": { family: "Open Sans", style: "Bold", weight: 700, size: 14, lineHeight: 20, letterSpacing: 0 },
  "Typography/Body/md-link": { family: "Open Sans", style: "Medium", weight: 500, size: 14, lineHeight: 20, letterSpacing: 0 },
  "Typography/Body/sm": { family: "Open Sans", style: "Medium", weight: 500, size: 12, lineHeight: 17, letterSpacing: 0 },
  "Typography/Body/sm-semiemphasized": { family: "Open Sans", style: "SemiBold", weight: 600, size: 12, lineHeight: 17, letterSpacing: 0 },
  "Typography/Body/sm-emphasized": { family: "Open Sans", style: "Bold", weight: 700, size: 12, lineHeight: 17, letterSpacing: 0 },
  "Typography/Body/sm-link": { family: "Open Sans", style: "Medium", weight: 500, size: 12, lineHeight: 17, letterSpacing: 0 },
  "Typography/Body/xs": { family: "Open Sans", style: "Medium", weight: 500, size: 10, lineHeight: 15, letterSpacing: 0 },
  "Typography/Body/xs-emphasized": { family: "Open Sans", style: "Bold", weight: 700, size: 10, lineHeight: 15, letterSpacing: 0 },

  "Typography/Button/lg": { family: "Open Sans", style: "SemiBold", weight: 600, size: 16, lineHeight: 24, letterSpacing: 0 },
  "Typography/Button/md": { family: "Open Sans", style: "SemiBold", weight: 600, size: 14, lineHeight: 20, letterSpacing: 0 },
  "Typography/Button/sm": { family: "Open Sans", style: "SemiBold", weight: 600, size: 10, lineHeight: 14, letterSpacing: 0 },

  "Typography/Superscript/lg": { family: "Open Sans", style: "Medium", weight: 500, size: 16, lineHeight: 24, letterSpacing: 0 },
  "Typography/Superscript/lg-emphasized": { family: "Open Sans", style: "Bold", weight: 700, size: 16, lineHeight: 24, letterSpacing: 0 },
  "Typography/Superscript/md": { family: "Open Sans", style: "Medium", weight: 500, size: 14, lineHeight: 20, letterSpacing: 0 },
  "Typography/Superscript/md-emphasized": { family: "Open Sans", style: "Bold", weight: 700, size: 14, lineHeight: 20, letterSpacing: 0 },
  "Typography/Superscript/sm": { family: "Open Sans", style: "Medium", weight: 500, size: 12, lineHeight: 16, letterSpacing: 0 },
  "Typography/Superscript/sm-emphasized": { family: "Open Sans", style: "Bold", weight: 700, size: 12, lineHeight: 16, letterSpacing: 0 },
};
