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
  name: string
  avatar?: string
  roles: string[]
  isActive: boolean
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
