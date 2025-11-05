'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Movie, CreateMovieData, Genre, Person, ProductionCompany } from '@/lib/types'
import movieApiService from '@/lib/movieApi'

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActive, setFilterActive] = useState<boolean | undefined>(true) // Default to showing only active movies
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalMovies, setTotalMovies] = useState(0)
  const [limit] = useState(20)

  // Fetch movies
  const fetchMovies = async () => {
    try {
      setLoading(true)
      const params: any = {
        page: currentPage,
        limit: limit
      }
      if (searchTerm) params.search = searchTerm
      if (filterActive !== undefined) params.isActive = filterActive
      
      const response = await movieApiService.getAllMovies(params)
      // Backend returns data array, not movies array
      const moviesData = (response as any).data || response.movies || []
      const pagination = (response as any).pagination || {}
      
      setMovies(moviesData)
      setTotalPages(pagination.pages || 1)
      setTotalMovies(pagination.total || 0)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch movies')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMovies()
  }, [searchTerm, filterActive, currentPage])

  // Create new movie
  const handleCreateMovie = async (movieData: CreateMovieData) => {
    try {
      
      const response = await movieApiService.createMovie(movieData)
      
      if (response) {
        toast.success('Movie created successfully!')
        setShowCreateModal(false)
        setCurrentPage(1) // Reset to first page
        fetchMovies()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to create movie')
    }
  }

  // Update movie
  const handleUpdateMovie = async (movieId: string, movieData: Partial<CreateMovieData>) => {
    try {
      // LOG: Check what data is being sent to API
      console.log('🔍 [MoviesPage] handleUpdateMovie called:', {
        movieId,
        movieData,
        releaseDate: movieData.releaseDate,
        releaseDateType: typeof movieData.releaseDate,
        genres: movieData.genres,
        cast: movieData.cast,
        crew: movieData.crew,
        productionCompanies: movieData.productionCompanies
      })
      
      const response = await movieApiService.updateMovie(movieId, movieData)
      
      if (response) {
        toast.success('Movie updated successfully!')
        setShowEditModal(false)
        setSelectedMovie(null)
        fetchMovies()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to update movie')
    }
  }

  // Delete movie
  const handleDeleteMovie = async (movieId: string) => {
    if (!confirm('Are you sure you want to delete this movie?')) return
    
    try {
      await movieApiService.deleteMovie(movieId)
      toast.success('Movie deleted successfully!')
      
      // Remove deleted movie from local state immediately (soft delete sets isActive: false)
      setMovies(prevMovies => prevMovies.filter(movie => movie.id !== movieId))
      
      // If we deleted the last item on current page, go to previous page
      if (movies.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1)
      } else {
        // Refetch to update pagination and ensure list is correct
        fetchMovies()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete movie')
    }
  }

  // Toggle movie active status
  const handleToggleActive = async (movie: Movie) => {
    try {
      await movieApiService.updateMovie(movie.id, { isActive: !movie.isActive })
      toast.success(`Movie ${!movie.isActive ? 'activated' : 'deactivated'} successfully!`)
      fetchMovies()
    } catch (error: any) {
      toast.error('Failed to update movie status')
    }
  }

  // Toggle featured status
  const handleToggleFeatured = async (movie: Movie) => {
    try {
      await movieApiService.updateMovieFeaturedStatus(movie.id, !movie.isFeatured)
      toast.success(`Movie ${!movie.isFeatured ? 'featured' : 'unfeatured'} successfully!`)
      fetchMovies()
    } catch (error: any) {
      toast.error('Failed to update featured status')
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Movies Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          Add New Movie
        </button>
      </div>

      {/* Filters */}
      <div className="flex justify-between items-center gap-4 mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search movies..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1) // Reset to first page on search
            }}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
          />
          <select
            value={filterActive === undefined ? 'all' : filterActive.toString()}
            onChange={(e) => {
              setFilterActive(e.target.value === 'all' ? undefined : e.target.value === 'true')
              setCurrentPage(1) // Reset to first page on filter
            }}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded text-white"
          >
            <option value="all">All Movies</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>
        </div>
        
        {/* Total count */}
        <div className="text-white text-sm">
          Total: {totalMovies} movies
        </div>
      </div>

      {/* Movies Table */}
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Movie</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Release Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Featured</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Views</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-400">Loading...</td>
              </tr>
            ) : movies.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-400">No movies found</td>
              </tr>
            ) : (
              movies.map((movie) => (
                <tr key={movie.id} className="hover:bg-gray-800">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {movie.posterPath && (
                        <img
                          src={movie.posterPath}
                          alt={movie.title}
                          className="w-12 h-16 object-cover rounded mr-4"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-white">{movie.title}</div>
                        <div className="text-sm text-gray-400">{movie.originalTitle}</div>
                        <div className="text-xs text-gray-500">{movie.genres?.map(g => g.name).join(', ')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {new Date(movie.releaseDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(movie)}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        movie.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {movie.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleFeatured(movie)}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        movie.isFeatured
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {movie.isFeatured ? 'Featured' : 'Not Featured'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {movie.analytics?.totalViews || 0}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          // LOG: Check what movie is being set for edit
                          console.log('🔍 [MoviesPage] Setting movie for edit:', {
                            movie,
                            releaseDate: movie.releaseDate,
                            releaseDateType: typeof movie.releaseDate,
                            genres: movie.genres,
                            cast: movie.cast,
                            crew: movie.crew,
                            productionCompanies: movie.productionCompanies,
                            allFields: Object.keys(movie)
                          })
                          setSelectedMovie(movie)
                          setShowEditModal(true)
                        }}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMovie(movie.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-white text-sm">
            Page {currentPage} of {totalPages} (Showing {movies.length} of {totalMovies})
          </div>
          
          <div className="flex gap-2">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
            >
              Previous
            </button>
            
            {/* Page Numbers */}
            <div className="flex gap-1">
              {(() => {
                const pages = []
                const maxVisible = 5
                let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
                let endPage = Math.min(totalPages, startPage + maxVisible - 1)
                
                if (endPage - startPage < maxVisible - 1) {
                  startPage = Math.max(1, endPage - maxVisible + 1)
                }
                
                if (startPage > 1) {
                  pages.push(
                    <button
                      key={1}
                      onClick={() => setCurrentPage(1)}
                      className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white hover:bg-white/20 transition-colors"
                    >
                      1
                    </button>
                  )
                  if (startPage > 2) {
                    pages.push(<span key="dots1" className="px-2 py-2 text-white">...</span>)
                  }
                }
                
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`px-3 py-2 border rounded transition-colors ${
                        currentPage === i
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                      }`}
                    >
                      {i}
                    </button>
                  )
                }
                
                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) {
                    pages.push(<span key="dots2" className="px-2 py-2 text-white">...</span>)
                  }
                  pages.push(
                    <button
                      key={totalPages}
                      onClick={() => setCurrentPage(totalPages)}
                      className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white hover:bg-white/20 transition-colors"
                    >
                      {totalPages}
                    </button>
                  )
                }
                
                return pages
              })()}
            </div>
            
            {/* Next Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create Movie Modal */}
      {showCreateModal && (
        <CreateMovieModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateMovie}
        />
      )}

      {/* Edit Movie Modal */}
      {showEditModal && selectedMovie && (
        <EditMovieModal
          movie={selectedMovie}
          onClose={() => {
            setShowEditModal(false)
            setSelectedMovie(null)
          }}
          onSubmit={(data) => handleUpdateMovie(selectedMovie.id, data)}
        />
      )}
    </div>
  )
}

// Create Movie Modal Component
function CreateMovieModal({ onClose, onSubmit }: { onClose: () => void, onSubmit: (data: CreateMovieData) => void }) {
  const [formData, setFormData] = useState<CreateMovieData>({
    title: '',
    originalTitle: '',
    overview: '',
    adult: false,
    backdropPath: '',
    posterPath: '',
    releaseDate: '',
    runtime: 0,
    originalLanguage: 'en',
    spokenLanguages: ['en'],
    voteAverage: 0,
    voteCount: 0,
    popularity: 0,
    censorship: 'U',
    genres: [],
    cast: [],
    crew: [],
    productionCompanies: [],
    trailerUrl: '',
    images: [],
    isPromoted: false,
    isFeatured: false,
    promotionPriority: 0,
    imdbId: '',
    tmdbId: 0,
    isActive: false
  })

  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [localPosterPreview, setLocalPosterPreview] = useState<string | null>(null)
  const [localBackdropPreview, setLocalBackdropPreview] = useState<string | null>(null)
  const [posterUploadSuccess, setPosterUploadSuccess] = useState(false)
  const [backdropUploadSuccess, setBackdropUploadSuccess] = useState(false)
  const [posterInputMode, setPosterInputMode] = useState<'upload' | 'url'>('upload')
  const [backdropInputMode, setBackdropInputMode] = useState<'upload' | 'url'>('upload')
  const [posterUrlInput, setPosterUrlInput] = useState('')
  const [backdropUrlInput, setBackdropUrlInput] = useState('')
  const [persons, setPersons] = useState<Person[]>([])
  const [loadingPersons, setLoadingPersons] = useState(false)

  // Load persons on component mount
  useEffect(() => {
    const loadPersons = async () => {
      setLoadingPersons(true)
      try {
        const response = await movieApiService.getAllPersons({ limit: 100 })
        // Backend returns { status: 'success', data: persons[], pagination: {} }
        setPersons((response as any)?.data || [])
      } catch (error) {
        toast.error('Failed to load persons')
        setPersons([])
      } finally {
        setLoadingPersons(false)
      }
    }
    loadPersons()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Clean up data before sending
      const cleanedData = {
        ...formData,
        cast: formData.cast?.filter(member => member.person && member.character).map(member => ({
          ...member,
          person: persons.find(p => p.name === member.person)?._id || persons.find(p => p.name === member.person)?.id || member.person
        })) || [],
        crew: formData.crew?.filter(member => member.person && member.job).map(member => ({
          ...member,
          person: persons.find(p => p.name === member.person)?._id || persons.find(p => p.name === member.person)?.id || member.person
        })) || []
      }
      await onSubmit(cleanedData)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file: File, field: 'posterPath' | 'backdropPath') => {
    // Show local preview immediately
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (field === 'posterPath') {
        setLocalPosterPreview(result)
      } else {
        setLocalBackdropPreview(result)
      }
    }
    reader.readAsDataURL(file)

    setUploadingImage(true)
    try {
      // Convert to base64 and pass to backend (backend will handle S3 upload)
      const base64Data = await movieApiService.convertToBase64(file)
      
      // Set base64 data directly in formData (backend will upload to S3)
      setFormData(prev => ({ ...prev, [field]: base64Data }))
      toast.success('Image ready! Will upload to S3 when you save the movie.')
      
      // Set upload success state
      if (field === 'posterPath') {
        setPosterUploadSuccess(true)
      } else {
        setBackdropUploadSuccess(true)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process image'
      toast.error(`Upload failed: ${errorMessage}`)
      
      // Clear local preview on error
      if (field === 'posterPath') {
        setLocalPosterPreview(null)
        setPosterUploadSuccess(false)
      } else {
        setLocalBackdropPreview(null)
        setBackdropUploadSuccess(false)
      }
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = (field: 'posterPath' | 'backdropPath') => {
    setFormData(prev => ({ ...prev, [field]: '' }))
    if (field === 'posterPath') {
      setLocalPosterPreview(null)
      setPosterUploadSuccess(false)
      setPosterUrlInput('')
    } else {
      setLocalBackdropPreview(null)
      setBackdropUploadSuccess(false)
      setBackdropUrlInput('')
    }
    toast.success('Image removed successfully!')
  }

  const handleUrlInput = (url: string, field: 'posterPath' | 'backdropPath') => {
    // Validate URL
    try {
      new URL(url)
      setFormData(prev => ({ ...prev, [field]: url }))
      if (field === 'posterPath') {
        setPosterUrlInput(url)
        toast.success('Poster URL set successfully!')
      } else {
        setBackdropUrlInput(url)
        toast.success('Backdrop URL set successfully!')
      }
    } catch (error) {
      toast.error('Please enter a valid URL')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">Create New Movie</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
                required
              />
            </div>

            {/* Original Title */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Original Title
              </label>
              <input
                type="text"
                value={formData.originalTitle}
                onChange={(e) => setFormData({...formData, originalTitle: e.target.value})}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
              />
            </div>

            {/* Overview */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white mb-1">
                Overview
              </label>
              <textarea
                value={formData.overview}
                onChange={(e) => setFormData({...formData, overview: e.target.value})}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
                rows={3}
              />
            </div>

            {/* Release Date */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Release Date
              </label>
              <input
                type="date"
                value={formData.releaseDate}
                onChange={(e) => setFormData({...formData, releaseDate: e.target.value})}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
              />
            </div>

            {/* Runtime */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Runtime (minutes)
              </label>
              <input
                type="number"
                value={formData.runtime}
                onChange={(e) => setFormData({...formData, runtime: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
                min="1"
                max="600"
              />
            </div>

            {/* Original Language */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Original Language <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.originalLanguage}
                onChange={(e) => setFormData({...formData, originalLanguage: e.target.value})}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                required
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="ml">Malayalam</option>
                <option value="ta">Tamil</option>
                <option value="te">Telugu</option>
                <option value="bn">Bengali</option>
                <option value="kn">Kannada</option>
                <option value="gu">Gujarati</option>
                <option value="mr">Marathi</option>
                <option value="pa">Punjabi</option>
              </select>
            </div>

            {/* Spoken Languages */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white mb-1">
                Spoken Languages
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { code: 'en', name: 'English' },
                  { code: 'hi', name: 'Hindi' },
                  { code: 'ml', name: 'Malayalam' },
                  { code: 'ta', name: 'Tamil' },
                  { code: 'te', name: 'Telugu' },
                  { code: 'bn', name: 'Bengali' },
                  { code: 'kn', name: 'Kannada' },
                  { code: 'gu', name: 'Gujarati' },
                  { code: 'mr', name: 'Marathi' },
                  { code: 'pa', name: 'Punjabi' }
                ].map((lang) => (
                  <label key={lang.code} className="flex items-center space-x-2 text-white">
                    <input
                      type="checkbox"
                      checked={formData.spokenLanguages?.includes(lang.code) || false}
                      onChange={(e) => {
                        const currentLanguages = formData.spokenLanguages || []
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            spokenLanguages: [...currentLanguages, lang.code]
                          })
                        } else {
                          setFormData({
                            ...formData,
                            spokenLanguages: currentLanguages.filter(l => l !== lang.code)
                          })
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{lang.name}</span>
                  </label>
                ))}
              </div>
              <p className="text-gray-400 text-xs mt-1">
                Selected: {formData.spokenLanguages?.join(', ') || 'None'}
              </p>
            </div>

            {/* Censorship */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Censorship
              </label>
              <select
                value={formData.censorship}
                onChange={(e) => setFormData({...formData, censorship: e.target.value as any})}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
              >
                <option value="U">U</option>
                <option value="U/A">U/A</option>
                <option value="U/A 7+">U/A 7+</option>
                <option value="U/A 13+">U/A 13+</option>
                <option value="U/A 16+">U/A 16+</option>
                <option value="A">A</option>
                <option value="S">S</option>
              </select>
            </div>

            {/* Adult */}
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.adult}
                onChange={(e) => setFormData({...formData, adult: e.target.checked})}
                className="mr-2"
              />
              <label className="text-white">Adult Content</label>
            </div>

            {/* Active */}
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="mr-2"
              />
              <label className="text-white">Active</label>
            </div>

            {/* Featured */}
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                className="mr-2"
              />
              <label className="text-white">Featured</label>
            </div>

            {/* Promoted */}
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isPromoted}
                onChange={(e) => setFormData({...formData, isPromoted: e.target.checked})}
                className="mr-2"
              />
              <label className="text-white">Promoted</label>
            </div>

            {/* Poster Upload */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Poster Image
              </label>
              {(formData.posterPath || localPosterPreview) && (
                <div className="mb-3">
                  <div className="relative inline-block">
                    <img 
                      src={localPosterPreview || formData.posterPath} 
                      alt="Poster preview" 
                      className="w-24 h-32 object-cover rounded border border-white/20"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage('posterPath')}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      title="Remove poster"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-green-400 text-xs mt-1">
                    {localPosterPreview ? '📤 Uploading...' : posterUploadSuccess ? '✅ Poster uploaded successfully!' : '✓ Poster uploaded'}
                  </p>
                </div>
              )}
              {/* Toggle between Upload and URL */}
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setPosterInputMode('upload')}
                  className={`flex-1 py-1.5 px-3 text-sm rounded transition-colors ${
                    posterInputMode === 'upload'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setPosterInputMode('url')}
                  className={`flex-1 py-1.5 px-3 text-sm rounded transition-colors ${
                    posterInputMode === 'url'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  Use URL
                </button>
              </div>
              <div className="space-y-2">
                {posterInputMode === 'upload' ? (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file, 'posterPath')
                      }}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      disabled={uploadingImage}
                    />
                    {!formData.posterPath && !localPosterPreview && (
                      <button
                        type="button"
                        onClick={() => {
                          const fileInput = document.querySelectorAll('input[type="file"]')[0] as HTMLInputElement
                          fileInput?.click()
                        }}
                        className="w-full py-2 border border-dashed border-white/30 rounded text-white/60 hover:text-white hover:border-white/50 transition-colors"
                      >
                        + Add Poster Image
                      </button>
                    )}
                    {uploadingImage && <p className="text-yellow-400 text-sm">Uploading...</p>}
                  </>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={posterUrlInput || formData.posterPath || ''}
                      onChange={(e) => setPosterUrlInput(e.target.value)}
                      onBlur={(e) => {
                        if (e.target.value) {
                          handleUrlInput(e.target.value, 'posterPath')
                        }
                      }}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (posterUrlInput || formData.posterPath) {
                          handleUrlInput(posterUrlInput || formData.posterPath || '', 'posterPath')
                        }
                      }}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    >
                      Set URL
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Backdrop Upload */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Backdrop Image
              </label>
              {(formData.backdropPath || localBackdropPreview) && (
                <div className="mb-3">
                  <div className="relative inline-block">
                    <img 
                      src={localBackdropPreview || formData.backdropPath} 
                      alt="Backdrop preview" 
                      className="w-32 h-18 object-cover rounded border border-white/20"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage('backdropPath')}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      title="Remove backdrop"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-green-400 text-xs mt-1">
                    {localBackdropPreview ? '📤 Uploading...' : backdropUploadSuccess ? '✅ Backdrop uploaded successfully!' : '✓ Backdrop uploaded'}
                  </p>
                </div>
              )}
              {/* Toggle between Upload and URL */}
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setBackdropInputMode('upload')}
                  className={`flex-1 py-1.5 px-3 text-sm rounded transition-colors ${
                    backdropInputMode === 'upload'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setBackdropInputMode('url')}
                  className={`flex-1 py-1.5 px-3 text-sm rounded transition-colors ${
                    backdropInputMode === 'url'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  Use URL
                </button>
              </div>
              <div className="space-y-2">
                {backdropInputMode === 'upload' ? (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file, 'backdropPath')
                      }}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      disabled={uploadingImage}
                    />
                    {!formData.backdropPath && !localBackdropPreview && (
                      <button
                        type="button"
                        onClick={() => {
                          const fileInput = document.querySelectorAll('input[type="file"]')[1] as HTMLInputElement
                          fileInput?.click()
                        }}
                        className="w-full py-2 border border-dashed border-white/30 rounded text-white/60 hover:text-white hover:border-white/50 transition-colors"
                      >
                        + Add Backdrop Image
                      </button>
                    )}
                    {uploadingImage && <p className="text-yellow-400 text-sm">Uploading...</p>}
                  </>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={backdropUrlInput || formData.backdropPath || ''}
                      onChange={(e) => setBackdropUrlInput(e.target.value)}
                      onBlur={(e) => {
                        if (e.target.value) {
                          handleUrlInput(e.target.value, 'backdropPath')
                        }
                      }}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (backdropUrlInput || formData.backdropPath) {
                          handleUrlInput(backdropUrlInput || formData.backdropPath || '', 'backdropPath')
                        }
                      }}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    >
                      Set URL
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Trailer URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white mb-1">
                Trailer URL
              </label>
              <input
                type="url"
                value={formData.trailerUrl}
                onChange={(e) => setFormData({...formData, trailerUrl: e.target.value})}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            {/* IMDB ID */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                IMDB ID
              </label>
              <input
                type="text"
                value={formData.imdbId}
                onChange={(e) => setFormData({...formData, imdbId: e.target.value})}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
                placeholder="tt1234567"
              />
            </div>

            {/* TMDB ID */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                TMDB ID
              </label>
              <input
                type="number"
                value={formData.tmdbId}
                onChange={(e) => setFormData({...formData, tmdbId: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
                placeholder="123456"
              />
            </div>

            {/* Cast Section */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white mb-2">
                Cast Members
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-white/20 rounded p-3">
                {formData.cast?.map((castMember, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-white/5 p-2 rounded">
                    <select
                      value={castMember.person}
                      onChange={(e) => {
                        const newCast = [...(formData.cast || [])]
                        newCast[index].person = e.target.value
                        setFormData({...formData, cast: newCast})
                      }}
                      className="flex-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                    >
                      <option value="">Select Person</option>
                      {loadingPersons ? (
                        <option value="" disabled>Loading persons...</option>
                      ) : persons && persons.length > 0 ? persons.map((person) => (
                        <option key={person.id} value={person.id}>
                          {person.name}
                        </option>
                      )) : (
                        <option value="" disabled>No persons found</option>
                      )}
                    </select>
                    <input
                      type="text"
                      placeholder="Character"
                      value={castMember.character}
                      onChange={(e) => {
                        const newCast = [...(formData.cast || [])]
                        newCast[index].character = e.target.value
                        setFormData({...formData, cast: newCast})
                      }}
                      className="flex-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm placeholder-white/50"
                    />
                    <input
                      type="number"
                      placeholder="Order"
                      value={castMember.order}
                      onChange={(e) => {
                        const newCast = [...(formData.cast || [])]
                        newCast[index].order = parseInt(e.target.value) || 0
                        setFormData({...formData, cast: newCast})
                      }}
                      className="w-16 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                      min="0"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newCast = formData.cast?.filter((_, i) => i !== index) || []
                        setFormData({...formData, cast: newCast})
                      }}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const newCast = [...(formData.cast || []), { person: '', character: '', order: 0 }]
                    setFormData({...formData, cast: newCast})
                  }}
                  className="w-full py-2 border border-dashed border-white/30 rounded text-white/60 hover:text-white hover:border-white/50 transition-colors"
                >
                  + Add Cast Member
                </button>
              </div>
            </div>

            {/* Crew Section */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white mb-2">
                Crew Members
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-white/20 rounded p-3">
                {formData.crew?.map((crewMember, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-white/5 p-2 rounded">
                    <select
                      value={crewMember.person}
                      onChange={(e) => {
                        const newCrew = [...(formData.crew || [])]
                        newCrew[index].person = e.target.value
                        setFormData({...formData, crew: newCrew})
                      }}
                      className="flex-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                    >
                      <option value="">Select Person</option>
                      {loadingPersons ? (
                        <option value="" disabled>Loading persons...</option>
                      ) : persons && persons.length > 0 ? persons.map((person) => (
                        <option key={person.id} value={person.id}>
                          {person.name}
                        </option>
                      )) : (
                        <option value="" disabled>No persons found</option>
                      )}
                    </select>
                    <select
                      value={crewMember.job}
                      onChange={(e) => {
                        const newCrew = [...(formData.crew || [])]
                        newCrew[index].job = e.target.value
                        setFormData({...formData, crew: newCrew})
                      }}
                      className="flex-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                    >
                      <option value="">Select Job</option>
                      <option value="DIRECTOR">Director</option>
                      <option value="PRODUCER">Producer</option>
                      <option value="WRITER">Writer</option>
                      <option value="MUSIC_DIRECTOR">Music Director</option>
                      <option value="CINEMATOGRAPHER">Cinematographer</option>
                      <option value="EDITOR">Editor</option>
                      <option value="ART_DIRECTOR">Art Director</option>
                      <option value="COSTUME_DESIGNER">Costume Designer</option>
                      <option value="MAKEUP_ARTIST">Makeup Artist</option>
                      <option value="SOUND_DESIGNER">Sound Designer</option>
                      <option value="VISUAL_EFFECTS">Visual Effects</option>
                      <option value="STUNT_COORDINATOR">Stunt Coordinator</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        const newCrew = formData.crew?.filter((_, i) => i !== index) || []
                        setFormData({...formData, crew: newCrew})
                      }}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const newCrew = [...(formData.crew || []), { person: '', job: '' }]
                    setFormData({...formData, crew: newCrew})
                  }}
                  className="w-full py-2 border border-dashed border-white/30 rounded text-white/60 hover:text-white hover:border-white/50 transition-colors"
                >
                  + Add Crew Member
                </button>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary py-2 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Movie'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary py-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Edit Movie Modal Component
function EditMovieModal({ movie, onClose, onSubmit }: { movie: Movie, onClose: () => void, onSubmit: (data: Partial<CreateMovieData>) => void }) {
  // LOG: Check what movie data is received
  console.log('🔍 [EditMovieModal] Movie data received:', {
    movie,
    releaseDate: movie.releaseDate,
    releaseDateType: typeof movie.releaseDate,
    genres: movie.genres,
    cast: movie.cast,
    crew: movie.crew,
    productionCompanies: movie.productionCompanies,
    images: movie.images,
    allFields: Object.keys(movie)
  })

  // Format releaseDate for date input (YYYY-MM-DD)
  const formatDateForInput = (date: string | Date | undefined): string => {
    if (!date) return ''
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      const year = dateObj.getFullYear()
      const month = String(dateObj.getMonth() + 1).padStart(2, '0')
      const day = String(dateObj.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    } catch (error) {
      console.error('❌ [EditMovieModal] Error formatting date:', error, date)
      return ''
    }
  }

  const [formData, setFormData] = useState<Partial<CreateMovieData>>({
    title: movie.title,
    originalTitle: movie.originalTitle,
    overview: movie.overview,
    adult: movie.adult,
    backdropPath: movie.backdropPath,
    posterPath: movie.posterPath,
    releaseDate: formatDateForInput(movie.releaseDate),
    runtime: movie.runtime,
    originalLanguage: movie.originalLanguage,
    spokenLanguages: movie.spokenLanguages,
    voteAverage: movie.voteAverage,
    voteCount: movie.voteCount,
    popularity: movie.popularity,
    censorship: movie.censorship,
    genres: movie.genres?.map(g => {
      if (typeof g === 'string') return g
      // Handle both _id (MongoDB) and id (entity)
      return (g as any)?._id || (g as any)?.id || ''
    }).filter(Boolean) || [],
    cast: movie.cast?.map(c => ({
      person: typeof c.person === 'string' ? c.person : (c.person?.name || c.person?.id || ''),
      character: c.character,
      order: c.order
    })).filter(c => c.person) || [],
    crew: movie.crew?.map(c => ({
      person: typeof c.person === 'string' ? c.person : (c.person?.name || c.person?.id || ''),
      job: c.job
    })).filter(c => c.person) || [],
    productionCompanies: movie.productionCompanies?.map(pc => {
      if (typeof pc === 'string') return pc
      // Handle both _id (MongoDB) and id (entity)
      return (pc as any)?._id || (pc as any)?.id || ''
    }).filter(Boolean) || [],
    trailerUrl: movie.trailerUrl,
    images: movie.images,
    isPromoted: movie.isPromoted,
    isFeatured: movie.isFeatured,
    promotionPriority: movie.promotionPriority,
    imdbId: movie.imdbId,
    tmdbId: movie.tmdbId,
    isActive: movie.isActive
  })

  // LOG: Check what formData is initialized with
  console.log('🔍 [EditMovieModal] FormData initialized:', {
    formData,
    releaseDate: formData.releaseDate,
    genres: formData.genres,
    cast: formData.cast,
    crew: formData.crew,
    productionCompanies: formData.productionCompanies,
    images: formData.images
  })

  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [localPosterPreview, setLocalPosterPreview] = useState<string | null>(null)
  const [localBackdropPreview, setLocalBackdropPreview] = useState<string | null>(null)
  const [posterUploadSuccess, setPosterUploadSuccess] = useState(false)
  const [backdropUploadSuccess, setBackdropUploadSuccess] = useState(false)
  const [posterInputMode, setPosterInputMode] = useState<'upload' | 'url'>('upload')
  const [backdropInputMode, setBackdropInputMode] = useState<'upload' | 'url'>('upload')
  const [posterUrlInput, setPosterUrlInput] = useState('')
  const [backdropUrlInput, setBackdropUrlInput] = useState('')
  const [persons, setPersons] = useState<Person[]>([])
  const [loadingPersons, setLoadingPersons] = useState(false)

  // Load persons on component mount
  useEffect(() => {
    const loadPersons = async () => {
      setLoadingPersons(true)
      try {
        const response = await movieApiService.getAllPersons({ limit: 100 })
        // Backend returns { status: 'success', data: persons[], pagination: {} }
        setPersons((response as any)?.data || [])
      } catch (error) {
        toast.error('Failed to load persons')
        setPersons([])
      } finally {
        setLoadingPersons(false)
      }
    }
    loadPersons()
  }, [])

  // Initialize URL inputs when formData changes
  useEffect(() => {
    if (formData.posterPath && !posterUrlInput) {
      setPosterUrlInput(formData.posterPath)
    }
    if (formData.backdropPath && !backdropUrlInput) {
      setBackdropUrlInput(formData.backdropPath)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.posterPath, formData.backdropPath])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // LOG: Check what data is being submitted
      console.log('🔍 [EditMovieModal] Submitting formData:', {
        formData,
        releaseDate: formData.releaseDate,
        genres: formData.genres,
        cast: formData.cast,
        crew: formData.crew,
        productionCompanies: formData.productionCompanies
      })

      // Clean up data before sending
      const cleanedData = {
        ...formData,
        cast: formData.cast?.filter(member => member.person && member.character).map(member => ({
          ...member,
          person: persons.find(p => p.name === member.person)?._id || persons.find(p => p.name === member.person)?.id || member.person
        })) || [],
        crew: formData.crew?.filter(member => member.person && member.job).map(member => ({
          ...member,
          person: persons.find(p => p.name === member.person)?._id || persons.find(p => p.name === member.person)?.id || member.person
        })) || []
      }

      // LOG: Check cleaned data before sending
      console.log('🔍 [EditMovieModal] Cleaned data to submit:', {
        cleanedData,
        releaseDate: cleanedData.releaseDate,
        genres: cleanedData.genres,
        cast: cleanedData.cast,
        crew: cleanedData.crew,
        productionCompanies: cleanedData.productionCompanies
      })

      await onSubmit(cleanedData)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file: File, field: 'posterPath' | 'backdropPath') => {
    // Show local preview immediately
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (field === 'posterPath') {
        setLocalPosterPreview(result)
      } else {
        setLocalBackdropPreview(result)
      }
    }
    reader.readAsDataURL(file)

    setUploadingImage(true)
    try {
      // Convert to base64 and pass to backend (backend will handle S3 upload)
      const base64Data = await movieApiService.convertToBase64(file)
      
      // Set base64 data directly in formData (backend will upload to S3)
      setFormData(prev => ({ ...prev, [field]: base64Data }))
      toast.success('Image ready! Will upload to S3 when you save the movie.')
      
      // Set upload success state
      if (field === 'posterPath') {
        setPosterUploadSuccess(true)
        setPosterUrlInput('')
      } else {
        setBackdropUploadSuccess(true)
        setBackdropUrlInput('')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process image'
      toast.error(`Upload failed: ${errorMessage}`)
      
      // Clear local preview on error
      if (field === 'posterPath') {
        setLocalPosterPreview(null)
        setPosterUploadSuccess(false)
      } else {
        setLocalBackdropPreview(null)
        setBackdropUploadSuccess(false)
      }
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = (field: 'posterPath' | 'backdropPath') => {
    setFormData(prev => ({ ...prev, [field]: '' }))
    if (field === 'posterPath') {
      setLocalPosterPreview(null)
      setPosterUploadSuccess(false)
      setPosterUrlInput('')
    } else {
      setLocalBackdropPreview(null)
      setBackdropUploadSuccess(false)
      setBackdropUrlInput('')
    }
    toast.success('Image removed successfully!')
  }

  const handleUrlInput = (url: string, field: 'posterPath' | 'backdropPath') => {
    // Validate URL
    try {
      new URL(url)
      setFormData(prev => ({ ...prev, [field]: url }))
      if (field === 'posterPath') {
        setPosterUrlInput(url)
        toast.success('Poster URL set successfully!')
      } else {
        setBackdropUrlInput(url)
        toast.success('Backdrop URL set successfully!')
      }
    } catch (error) {
      toast.error('Please enter a valid URL')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">Edit Movie</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
                required
              />
            </div>

            {/* Original Title */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Original Title
              </label>
              <input
                type="text"
                value={formData.originalTitle}
                onChange={(e) => setFormData({...formData, originalTitle: e.target.value})}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
              />
            </div>

            {/* Overview */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white mb-1">
                Overview
              </label>
              <textarea
                value={formData.overview}
                onChange={(e) => setFormData({...formData, overview: e.target.value})}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
                rows={3}
              />
            </div>

            {/* Release Date */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Release Date
              </label>
              <input
                type="date"
                value={formData.releaseDate}
                onChange={(e) => setFormData({...formData, releaseDate: e.target.value})}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
              />
            </div>

            {/* Runtime */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Runtime (minutes)
              </label>
              <input
                type="number"
                value={formData.runtime}
                onChange={(e) => setFormData({...formData, runtime: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
                min="1"
                max="600"
              />
            </div>

            {/* Original Language */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Original Language <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.originalLanguage}
                onChange={(e) => setFormData({...formData, originalLanguage: e.target.value})}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                required
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="ml">Malayalam</option>
                <option value="ta">Tamil</option>
                <option value="te">Telugu</option>
                <option value="bn">Bengali</option>
                <option value="kn">Kannada</option>
                <option value="gu">Gujarati</option>
                <option value="mr">Marathi</option>
                <option value="pa">Punjabi</option>
              </select>
            </div>

            {/* Spoken Languages */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white mb-1">
                Spoken Languages
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { code: 'en', name: 'English' },
                  { code: 'hi', name: 'Hindi' },
                  { code: 'ml', name: 'Malayalam' },
                  { code: 'ta', name: 'Tamil' },
                  { code: 'te', name: 'Telugu' },
                  { code: 'bn', name: 'Bengali' },
                  { code: 'kn', name: 'Kannada' },
                  { code: 'gu', name: 'Gujarati' },
                  { code: 'mr', name: 'Marathi' },
                  { code: 'pa', name: 'Punjabi' }
                ].map((lang) => (
                  <label key={lang.code} className="flex items-center space-x-2 text-white">
                    <input
                      type="checkbox"
                      checked={formData.spokenLanguages?.includes(lang.code) || false}
                      onChange={(e) => {
                        const currentLanguages = formData.spokenLanguages || []
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            spokenLanguages: [...currentLanguages, lang.code]
                          })
                        } else {
                          setFormData({
                            ...formData,
                            spokenLanguages: currentLanguages.filter(l => l !== lang.code)
                          })
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{lang.name}</span>
                  </label>
                ))}
              </div>
              <p className="text-gray-400 text-xs mt-1">
                Selected: {formData.spokenLanguages?.join(', ') || 'None'}
              </p>
            </div>

            {/* Censorship */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Censorship
              </label>
              <select
                value={formData.censorship}
                onChange={(e) => setFormData({...formData, censorship: e.target.value as any})}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
              >
                <option value="U">U</option>
                <option value="U/A">U/A</option>
                <option value="U/A 7+">U/A 7+</option>
                <option value="U/A 13+">U/A 13+</option>
                <option value="U/A 16+">U/A 16+</option>
                <option value="A">A</option>
                <option value="S">S</option>
              </select>
            </div>

            {/* Adult */}
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.adult}
                onChange={(e) => setFormData({...formData, adult: e.target.checked})}
                className="mr-2"
              />
              <label className="text-white">Adult Content</label>
            </div>

            {/* Active */}
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="mr-2"
              />
              <label className="text-white">Active</label>
            </div>

            {/* Featured */}
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                className="mr-2"
              />
              <label className="text-white">Featured</label>
            </div>

            {/* Promoted */}
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isPromoted}
                onChange={(e) => setFormData({...formData, isPromoted: e.target.checked})}
                className="mr-2"
              />
              <label className="text-white">Promoted</label>
            </div>

            {/* Poster Upload */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Poster Image
              </label>
              {formData.posterPath && (
                <div className="mb-2">
                  <div className="relative inline-block">
                    <img src={formData.posterPath} alt="Current poster" className="w-20 h-28 object-cover rounded" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage('posterPath')}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      title="Remove poster"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
              {/* Toggle between Upload and URL */}
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setPosterInputMode('upload')}
                  className={`flex-1 py-1.5 px-3 text-sm rounded transition-colors ${
                    posterInputMode === 'upload'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setPosterInputMode('url')}
                  className={`flex-1 py-1.5 px-3 text-sm rounded transition-colors ${
                    posterInputMode === 'url'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  Use URL
                </button>
              </div>
              <div className="space-y-2">
                {posterInputMode === 'upload' ? (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file, 'posterPath')
                      }}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      disabled={uploadingImage}
                    />
                    {!formData.posterPath && (
                      <button
                        type="button"
                        onClick={() => {
                          const fileInput = document.querySelectorAll('input[type="file"]')[2] as HTMLInputElement
                          fileInput?.click()
                        }}
                        className="w-full py-2 border border-dashed border-white/30 rounded text-white/60 hover:text-white hover:border-white/50 transition-colors"
                      >
                        + Add New Poster
                      </button>
                    )}
                    {uploadingImage && <p className="text-yellow-400 text-sm">Uploading...</p>}
                  </>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={posterUrlInput || formData.posterPath || ''}
                      onChange={(e) => setPosterUrlInput(e.target.value)}
                      onBlur={(e) => {
                        if (e.target.value) {
                          handleUrlInput(e.target.value, 'posterPath')
                        }
                      }}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (posterUrlInput || formData.posterPath) {
                          handleUrlInput(posterUrlInput || formData.posterPath || '', 'posterPath')
                        }
                      }}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    >
                      Set URL
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Backdrop Upload */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Backdrop Image
              </label>
              {formData.backdropPath && (
                <div className="mb-2">
                  <div className="relative inline-block">
                    <img src={formData.backdropPath} alt="Current backdrop" className="w-32 h-18 object-cover rounded" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage('backdropPath')}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      title="Remove backdrop"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
              {/* Toggle between Upload and URL */}
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setBackdropInputMode('upload')}
                  className={`flex-1 py-1.5 px-3 text-sm rounded transition-colors ${
                    backdropInputMode === 'upload'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setBackdropInputMode('url')}
                  className={`flex-1 py-1.5 px-3 text-sm rounded transition-colors ${
                    backdropInputMode === 'url'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  Use URL
                </button>
              </div>
              <div className="space-y-2">
                {backdropInputMode === 'upload' ? (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file, 'backdropPath')
                      }}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      disabled={uploadingImage}
                    />
                    {!formData.backdropPath && (
                      <button
                        type="button"
                        onClick={() => {
                          const fileInput = document.querySelectorAll('input[type="file"]')[3] as HTMLInputElement
                          fileInput?.click()
                        }}
                        className="w-full py-2 border border-dashed border-white/30 rounded text-white/60 hover:text-white hover:border-white/50 transition-colors"
                      >
                        + Add New Backdrop
                      </button>
                    )}
                    {uploadingImage && <p className="text-yellow-400 text-sm">Uploading...</p>}
                  </>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={backdropUrlInput || formData.backdropPath || ''}
                      onChange={(e) => setBackdropUrlInput(e.target.value)}
                      onBlur={(e) => {
                        if (e.target.value) {
                          handleUrlInput(e.target.value, 'backdropPath')
                        }
                      }}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (backdropUrlInput || formData.backdropPath) {
                          handleUrlInput(backdropUrlInput || formData.backdropPath || '', 'backdropPath')
                        }
                      }}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    >
                      Set URL
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Trailer URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white mb-1">
                Trailer URL
              </label>
              <input
                type="url"
                value={formData.trailerUrl}
                onChange={(e) => setFormData({...formData, trailerUrl: e.target.value})}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            {/* IMDB ID */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                IMDB ID
              </label>
              <input
                type="text"
                value={formData.imdbId}
                onChange={(e) => setFormData({...formData, imdbId: e.target.value})}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
                placeholder="tt1234567"
              />
            </div>

            {/* TMDB ID */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                TMDB ID
              </label>
              <input
                type="number"
                value={formData.tmdbId}
                onChange={(e) => setFormData({...formData, tmdbId: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
                placeholder="123456"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary py-2 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Movie'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary py-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
