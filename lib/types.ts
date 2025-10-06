// Movie Types
export interface Movie {
  id: string
  title: string
  originalTitle?: string
  overview?: string
  adult: boolean
  backdropPath?: string
  posterPath?: string
  releaseDate: string
  runtime?: number
  originalLanguage: string
  spokenLanguages: string[]
  voteAverage: number
  voteCount: number
  popularity: number
  censorship: 'U' | 'U/A' | 'U/A 7+' | 'U/A 13+' | 'U/A 16+' | 'A' | 'S'
  genres: Genre[]
  cast: CastMember[]
  crew: CrewMember[]
  productionCompanies: ProductionCompany[]
  trailerUrl?: string
  images: string[]
  isPromoted: boolean
  isFeatured: boolean
  promotionPriority?: number
  imdbId?: string
  tmdbId?: number
  isActive: boolean
  analytics: {
    totalViews: number
    totalCouponsGenerated: number
    totalRevenue: number
  }
  createdAt: string
  updatedAt: string
}

export interface Genre {
  id: string
  name: string
  emoji?: string
  isActive: boolean
}

export interface Person {
  id: string
  _id?: string  // MongoDB ObjectId
  name: string
  avatar?: string
  biography?: string
  birthDate?: string
  birthPlace?: string
  nationality?: string
  roles: string[]
  isActive: boolean
  analytics: {
    totalMovies: number
    totalViews: number
    totalCouponsGenerated: number
  }
  createdAt: string
  updatedAt: string
}

export interface CastMember {
  person: Person
  character: string
  order: number
}

export interface CrewMember {
  person: Person
  job: 'DIRECTOR' | 'PRODUCER' | 'WRITER' | 'MUSIC_DIRECTOR' | 'CINEMATOGRAPHER' | 'EDITOR' | 'ART_DIRECTOR' | 'COSTUME_DESIGNER' | 'MAKEUP_ARTIST' | 'SOUND_DESIGNER' | 'VISUAL_EFFECTS' | 'STUNT_COORDINATOR'
}

export interface ProductionCompany {
  id: string
  name: string
  description?: string
  foundedYear?: number
  country?: string
  headquarters?: string
  website?: string
  isActive: boolean
  logoPath?: string
}

export interface CreateMovieData {
  title: string
  originalTitle?: string
  overview?: string
  adult: boolean
  backdropPath?: string
  posterPath?: string
  releaseDate: string
  runtime?: number
  originalLanguage: string
  spokenLanguages: string[]
  voteAverage: number
  voteCount: number
  popularity: number
  censorship: 'U' | 'U/A' | 'U/A 7+' | 'U/A 13+' | 'U/A 16+' | 'A' | 'S'
  genres: string[]
  cast: {
    person: string
    character: string
    order: number
  }[]
  crew: {
    person: string
    job: string
  }[]
  productionCompanies: string[]
  trailerUrl?: string
  images: string[]
  isPromoted: boolean
  isFeatured: boolean
  promotionPriority?: number
  imdbId?: string
  tmdbId?: number
  isActive: boolean
}

// Existing types
export interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  venue: string
  city: string
  state: string
  totalSeats: number
  price: number
  category: string
  imageUrl?: string
  status: 'active' | 'inactive' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateUserData {
  name: string
  email: string
  phone?: string
  password: string
}

export interface Booking {
  id: string
  eventId: string
  userId: string
  seats: number
  totalAmount: number
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: string
}

export interface Payment {
  id: string
  bookingId: string
  amount: number
  status: 'pending' | 'completed' | 'failed'
  method: string
  createdAt: string
}

// Subscription Plan Types
export interface SubscriptionPlan {
  id: string
  planId: string
  name: string
  displayName: string
  description: string
  detailedInfo: {
    benefits: string[]
    validity: string[]
    usage: string[]
    restrictions: string[]
  }
  howToUse: string[]
  importantNotes: string[]
  displayConfig: {
    showKeyFeatures: boolean
    showDetailedInfo: boolean
    showHowToUse: boolean
    showImportantNotes: boolean
    defaultView: 'summary' | 'detailed'
  }
  availability: {
    region?: string
    expansion?: string
    announcementChannel?: string
  }
  supportInfo: {
    email?: string
    whatsapp?: string
    responseTime?: string
    reportingDeadline?: string
  }
  pricing: {
    basePrice?: number
    couponPrice: number
    couponCount?: number
    totalCouponValue?: number
    pvrDiscountPerCoupon?: number
    pvrCouponValue: number
    currency: string
    convenienceFeePercentage: number
    convenienceFee?: {
      percentage?: number
      applicableFor?: string
      reducedPercentage?: number
      reducedApplicableFor?: string
    }
    convenienceFeeTiers?: {
      tierName: 'BASIC' | 'PREMIUM'
      minCoupons: number
      maxCoupons: number
      percentage: number
      description?: string
    }[]
  }
  purchaseRules: {
    minimumCouponCount: number
    maximumCouponCount?: number
  }
  usageRules: {
    validDays: string[]
    invalidDays?: string[]
    passValidityDays?: number
    passcodeValidityHours?: number
    couponValidityDays: number
    minimumPurchaseRequirement: number
    refundPolicy: 'refundable' | 'non-refundable' | 'partial-refundable'
  }
  isActive: boolean
  sortOrder: number
  soldOut: boolean
  soldOutReason?: 'INSUFFICIENT_COUPONS' | 'NO_VALID_BATCHES' | 'EXPIRING_SOON' | 'MANUAL_DISABLE'
  soldOutAt?: string
  soldOutBy?: string
  availabilityRequirements: {
    region?: string
    partnerTheatres?: string
    minimumValidHours: number
    minimumAvailableCoupons: number
    checkInterval: number
  }
  analytics: {
    totalBundlesSold: number
    totalCouponsIssued: number
    totalRevenue: number
    averageCouponsPerBundle: number
    monthlyStats: {
      year: number
      month: number
      bundlesSold: number
      couponsIssued: number
      revenue: number
      averageBundleSize: number
    }[]
  }
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface CreateSubscriptionPlanData {
  planId: string
  name: string
  displayName: string
  description: string
  detailedInfo: {
    benefits: string[]
    validity: string[]
    usage: string[]
    restrictions: string[]
  }
  howToUse: string[]
  importantNotes: string[]
  displayConfig: {
    showKeyFeatures: boolean
    showDetailedInfo: boolean
    showHowToUse: boolean
    showImportantNotes: boolean
    defaultView: 'summary' | 'detailed'
  }
  availability: {
    region?: string
    expansion?: string
    announcementChannel?: string
  }
  supportInfo: {
    email?: string
    whatsapp?: string
    responseTime?: string
    reportingDeadline?: string
  }
  pricing: {
    basePrice?: number
    couponPrice: number
    couponCount?: number
    totalCouponValue?: number
    pvrDiscountPerCoupon?: number
    pvrCouponValue: number
    currency: string
    convenienceFeePercentage: number
    convenienceFee?: {
      percentage?: number
      applicableFor?: string
      reducedPercentage?: number
      reducedApplicableFor?: string
    }
    convenienceFeeTiers?: {
      tierName: 'BASIC' | 'PREMIUM'
      minCoupons: number
      maxCoupons: number
      percentage: number
      description?: string
    }[]
  }
  purchaseRules: {
    minimumCouponCount: number
    maximumCouponCount?: number
  }
  usageRules: {
    validDays: string[]
    invalidDays?: string[]
    passValidityDays?: number
    passcodeValidityHours?: number
    couponValidityDays: number
    minimumPurchaseRequirement: number
    refundPolicy: 'refundable' | 'non-refundable' | 'partial-refundable'
  }
  isActive: boolean
  sortOrder: number
  availabilityRequirements: {
    region?: string
    partnerTheatres?: string
    minimumValidHours: number
    minimumAvailableCoupons: number
    checkInterval: number
  }
}

// Field descriptions for tooltips
export interface FieldDescription {
  field: string
  description: string
  format: string
  example: string
}

export const SUBSCRIPTION_PLAN_FIELD_DESCRIPTIONS: FieldDescription[] = [
  {
    field: 'planId',
    description: 'Unique identifier for the subscription plan',
    format: 'String (SILVER or GOLD)',
    example: 'SILVER'
  },
  {
    field: 'name',
    description: 'Internal name of the plan',
    format: 'String (SILVER or GOLD)',
    example: 'SILVER'
  },
  {
    field: 'displayName',
    description: 'User-friendly display name shown to customers',
    format: 'String',
    example: 'Silver Movie Pass'
  },
  {
    field: 'description',
    description: 'Brief description of the subscription plan',
    format: 'String (max 500 characters)',
    example: 'Premium monthly subscription with 30 movie passes'
  },
  {
    field: 'detailedInfo.benefits',
    description: 'List of benefits offered by this plan',
    format: 'Array of strings (max 200 chars each)',
    example: 'Priority booking, Exclusive movies, Premium seats'
  },
  {
    field: 'detailedInfo.validity',
    description: 'Validity rules and terms for the plan',
    format: 'Array of strings (max 200 chars each)',
    example: 'Valid for 60 days from purchase, Non-refundable'
  },
  {
    field: 'detailedInfo.usage',
    description: 'Usage rules and restrictions',
    format: 'Array of strings (max 200 chars each)',
    example: 'Minimum 2 tickets per booking, Valid on all days'
  },
  {
    field: 'detailedInfo.restrictions',
    description: 'Restrictions and limitations',
    format: 'Array of strings (max 200 chars each)',
    example: 'Cannot be used during festivals, Subject to availability'
  },
  {
    field: 'howToUse',
    description: 'Step-by-step instructions for using the plan',
    format: 'Array of strings (max 200 chars each)',
    example: '1. Select movie and showtime, 2. Choose seats, 3. Apply coupon'
  },
  {
    field: 'importantNotes',
    description: 'Important terms and conditions',
    format: 'Array of strings (max 200 chars each)',
    example: 'Coupons expire in 60 days, No refunds after use'
  },
  {
    field: 'pricing.couponPrice',
    description: 'Price per coupon in the plan',
    format: 'Number (minimum 1)',
    example: '125'
  },
  {
    field: 'pricing.pvrCouponValue',
    description: 'Value of coupon at PVR theaters',
    format: 'Number (minimum 0)',
    example: '200'
  },
  {
    field: 'pricing.convenienceFeePercentage',
    description: 'Convenience fee percentage on total amount',
    format: 'Number (0-50)',
    example: '5'
  },
  {
    field: 'purchaseRules.minimumCouponCount',
    description: 'Minimum number of coupons required per purchase',
    format: 'Number (minimum 1)',
    example: '2'
  },
  {
    field: 'purchaseRules.maximumCouponCount',
    description: 'Maximum number of coupons allowed per purchase',
    format: 'Number (minimum 1)',
    example: '50'
  },
  {
    field: 'usageRules.validDays',
    description: 'Days when coupons can be used',
    format: 'Array of day names',
    example: '["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]'
  },
  {
    field: 'usageRules.couponValidityDays',
    description: 'Number of days coupons remain valid',
    format: 'Number (minimum 1)',
    example: '60'
  },
  {
    field: 'usageRules.minimumPurchaseRequirement',
    description: 'Minimum tickets to purchase with each coupon',
    format: 'Number (minimum 1)',
    example: '2'
  },
  {
    field: 'usageRules.refundPolicy',
    description: 'Refund policy for the plan',
    format: 'String (refundable/non-refundable/partial-refundable)',
    example: 'non-refundable'
  },
  {
    field: 'isActive',
    description: 'Whether the plan is currently active',
    format: 'Boolean',
    example: 'true'
  },
  {
    field: 'sortOrder',
    description: 'Display order for the plan (lower numbers first)',
    format: 'Number (minimum 0)',
    example: '1'
  }
]
