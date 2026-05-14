export interface Settings {
  restaurantName: string;
  tagline: string;
  phone: string;
  whatsappPhone: string;
  email: string;
  addressStreet: string;
  addressArea: string;
  addressCity: string;
  addressState: string;
  hoursSummary: string;
  hoursToday: string;
  heroBadge: string;
  heroHeadline: string;
  heroHeadlineAccent: string;
  heroSubheadline: string;
  heroImageUrl: string;
  storyHeading: string;
  storyBody: string;
  storyImageUrl: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankTransferNote: string;
  instagramUrl: string;
  facebookUrl: string;
  twitterUrl: string;
  updatedAt: string;
}

export type SettingsErrorCode = "SETTINGS_INVALID_INPUT";

export class SettingsError extends Error {
  constructor(
    public readonly code: SettingsErrorCode,
    message?: string,
  ) {
    super(message ?? code);
    this.name = "SettingsError";
  }
}
