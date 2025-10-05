import apiService from './api'
import { Movie, CreateMovieData, Genre, Person, ProductionCompany } from './types'
import CryptoJS from 'crypto-js' // Used in generateSignature method

export class MovieApiService {
  // Get all movies (admin - including inactive)
  async getAllMovies(params?: any) {
    return apiService.get<{ movies: Movie[]; pagination: any }>('/movies/admin/all', params)
  }

  // Get all movies (public - active only)
  async getPublicMovies(params?: any) {
    return apiService.get<{ movies: Movie[]; pagination: any }>('/movies', params)
  }

  // Get movie by ID
  async getMovieById(id: string) {
    return apiService.get<Movie>(`/movies/${id}`)
  }

  // Create movie
  async createMovie(movieData: CreateMovieData) {
    return apiService.post<Movie>('/movies', movieData)
  }

  // Update movie
  async updateMovie(id: string, movieData: Partial<CreateMovieData>) {
    return apiService.put<Movie>(`/movies/${id}`, movieData)
  }

  // Update movie featured status
  async updateMovieFeaturedStatus(id: string, isFeatured: boolean) {
    return apiService.patch<Movie>(`/movies/${id}/featured`, { isFeatured })
  }

  // Delete movie
  async deleteMovie(id: string) {
    return apiService.delete(`/movies/${id}`)
  }

  // Get movie analytics
  async getMovieAnalytics(id: string) {
    return apiService.get(`/movies/${id}/analytics`)
  }

  // Get featured movies
  async getFeaturedMovies(limit?: number) {
    return apiService.get<Movie[]>('/movies/featured', { limit })
  }

  // Get promoted movies
  async getPromotedMovies(limit?: number) {
    return apiService.get<Movie[]>('/movies/promoted', { limit })
  }

  // Track movie view
  async trackMovieView(id: string) {
    return apiService.post(`/movies/${id}/view`)
  }

  // Search APIs
  async searchGenres(name: string, limit?: number) {
    return apiService.get<Genre[]>(`/genres/search/${name}`, { limit })
  }

  async searchPersons(name: string, limit?: number) {
    return apiService.get<Person[]>(`/persons/search/${name}`, { limit })
  }

  async searchProductionCompanies(name: string, limit?: number) {
    return apiService.get<ProductionCompany[]>(`/production-companies/search/${name}`, { limit })
  }

  // Get all genres
  async getAllGenres() {
    return apiService.get<Genre[]>('/genres')
  }

  // Get all persons
  async getAllPersons(params?: any) {
    return apiService.get<Person[]>('/persons', params)
  }

  // Get all production companies
  async getAllProductionCompanies(params?: any) {
    return apiService.get<ProductionCompany[]>('/production-companies', params)
  }

  // Direct Cloudinary upload with signed upload
  async uploadToCloudinary(file: File): Promise<string> {
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size must be less than 10MB')
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image')
    }

    try {
      console.log('Uploading to Cloudinary:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      })

      // Generate signature for signed upload
      const timestamp = Math.round(new Date().getTime() / 1000)
      const publicId = `compas_movies/${Date.now()}_${Math.random().toString(36).substring(7)}`
      
      // Create signature string (Cloudinary format - parameters in alphabetical order)
      const signatureString = `folder=compas_movies&public_id=${publicId}&timestamp=${timestamp}ry9aYk_7RSnM5ngBwIPJX71slaE`
      
      // Generate SHA-1 signature
      const signature = this.generateSignature(signatureString)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('public_id', publicId)
      formData.append('timestamp', timestamp.toString())
      formData.append('signature', signature)
      formData.append('api_key', '481997276558441')
      formData.append('folder', 'compas_movies')

      const response = await fetch('https://api.cloudinary.com/v1_1/dqvrul2uy/image/upload', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Cloudinary upload error response:', errorData)
        throw new Error(`Upload failed: ${errorData.error?.message || 'Unknown error'}`)
      }
      
      const data = await response.json()
      console.log('Cloudinary upload success:', data)
      return data.secure_url
    } catch (error) {
      console.error('Cloudinary upload error:', error)
      throw error
    }
  }

  // SHA-1 hash function for Cloudinary signature using crypto-js
  private generateSignature(str: string): string {
    return CryptoJS.SHA1(str).toString()
  }

  // Alternative: Convert to base64 for backend upload
  async convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Upload via backend
  async uploadImageViaBackend(file: File): Promise<string> {
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size must be less than 10MB')
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image')
    }

    try {
      const base64Data = await this.convertToBase64(file)
      
      const response = await apiService.post('/movies/upload-image', {
        imageData: base64Data,
        folder: 'compas_movies'
      })

      return response.data.url
    } catch (error) {
      console.error('Backend upload error:', error)
      throw error
    }
  }
}

export const movieApiService = new MovieApiService()
export default movieApiService
