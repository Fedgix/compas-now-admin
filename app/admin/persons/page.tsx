'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { PersonApiService } from '@/lib/personApi'
import { Person } from '@/lib/types'
import { useEnvironment } from '@/contexts/EnvironmentContext'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function PersonsPage() {
  const [persons, setPersons] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined)
  
  const { currentEnvironment } = useEnvironment()

  // Load persons
  const loadPersons = async (page: number = 1, search: string = '', active?: boolean) => {
    try {
      setLoading(true)
      const response = await PersonApiService.getAllPersons(page, 20, search) as any
      setPersons(response.data || [])
      setTotalPages(response.pagination?.totalPages || 1)
    } catch (error) {
      toast.error('Failed to load persons')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPersons(currentPage, searchTerm, filterActive)
  }, [currentPage, searchTerm, filterActive, currentEnvironment])

  // Search handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadPersons(1, searchTerm, filterActive)
  }

  // Create person modal
  const CreatePersonModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      biography: '',
      birthDate: '',
      birthPlace: '',
      nationality: '',
      roles: [] as string[],
      avatar: '',
      isActive: true as boolean
    })

    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      try {
        setLoading(true)
        await PersonApiService.createPerson(formData)
        toast.success('Person created successfully!')
        setShowCreateModal(false)
        loadPersons(currentPage, searchTerm, filterActive)
        setFormData({
          name: '',
          biography: '',
          birthDate: '',
          birthPlace: '',
          nationality: '',
          roles: [],
          avatar: '',
          isActive: true as boolean
        })
      } catch (error) {
        toast.error('Failed to create person')
      } finally {
        setLoading(false)
      }
    }

    const toggleRole = (role: string) => {
      setFormData(prev => ({
        ...prev,
        roles: prev.roles.includes(role)
          ? prev.roles.filter(r => r !== role)
          : [...prev.roles, role]
      }))
    }

    const availableRoles = ['ACTOR', 'ACTRESS', 'DIRECTOR', 'PRODUCER', 'WRITER', 'MUSIC_DIRECTOR', 'SCREENWRITER']

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4 text-white">Create New Person</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="Enter person name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Biography</label>
              <textarea
                value={formData.biography}
                onChange={(e) => setFormData(prev => ({ ...prev, biography: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                rows={3}
                placeholder="Enter biography"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Birth Date</label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Birth Place</label>
                <input
                  type="text"
                  value={formData.birthPlace}
                  onChange={(e) => setFormData(prev => ({ ...prev, birthPlace: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  placeholder="Enter birth place"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nationality</label>
              <input
                type="text"
                value={formData.nationality}
                onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="Enter nationality"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Avatar URL</label>
              <input
                type="url"
                value={formData.avatar}
                onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="Enter avatar image URL"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Roles</label>
              <div className="grid grid-cols-2 gap-2">
                {availableRoles.map(role => (
                  <label key={role} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.roles.includes(role)}
                      onChange={() => toggleRole(role)}
                      className="rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700"
                    />
                    <span className="text-sm text-gray-300">{role}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700"
              />
              <label htmlFor="isActive" className="text-sm text-gray-300">Active</label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-300 border border-gray-600 rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Person'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Edit person modal
  const EditPersonModal = () => {
    const [formData, setFormData] = useState({
      name: selectedPerson?.name || '',
      biography: selectedPerson?.biography || '',
      birthDate: selectedPerson?.birthDate || '',
      birthPlace: selectedPerson?.birthPlace || '',
      nationality: selectedPerson?.nationality || '',
      roles: selectedPerson?.roles || [],
      avatar: selectedPerson?.avatar || '',
      isActive: selectedPerson?.isActive ?? true
    })

    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!selectedPerson) return

      try {
        setLoading(true)
        await PersonApiService.updatePerson(selectedPerson._id || selectedPerson.id, formData)
        toast.success('Person updated successfully!')
        setShowEditModal(false)
        setSelectedPerson(null)
        loadPersons(currentPage, searchTerm, filterActive)
      } catch (error) {
        toast.error('Failed to update person')
      } finally {
        setLoading(false)
      }
    }

    const toggleRole = (role: string) => {
      setFormData(prev => ({
        ...prev,
        roles: prev.roles.includes(role)
          ? prev.roles.filter(r => r !== role)
          : [...prev.roles, role]
      }))
    }

    const availableRoles = ['ACTOR', 'ACTRESS', 'DIRECTOR', 'PRODUCER', 'WRITER', 'MUSIC_DIRECTOR', 'SCREENWRITER']

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4 text-white">Edit Person</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="Enter person name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Biography</label>
              <textarea
                value={formData.biography}
                onChange={(e) => setFormData(prev => ({ ...prev, biography: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                rows={3}
                placeholder="Enter biography"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Birth Date</label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Birth Place</label>
                <input
                  type="text"
                  value={formData.birthPlace}
                  onChange={(e) => setFormData(prev => ({ ...prev, birthPlace: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  placeholder="Enter birth place"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nationality</label>
              <input
                type="text"
                value={formData.nationality}
                onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="Enter nationality"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Avatar URL</label>
              <input
                type="url"
                value={formData.avatar}
                onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="Enter avatar image URL"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Roles</label>
              <div className="grid grid-cols-2 gap-2">
                {availableRoles.map(role => (
                  <label key={role} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.roles.includes(role)}
                      onChange={() => toggleRole(role)}
                      className="rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700"
                    />
                    <span className="text-sm text-gray-300">{role}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700"
              />
              <label htmlFor="isActive" className="text-sm text-gray-300">Active</label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedPerson(null)
                }}
                className="px-4 py-2 text-gray-300 border border-gray-600 rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Person'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Persons Management</h1>
          <p className="text-gray-400 mt-1">Manage cast and crew members</p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Person</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search persons..."
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </form>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilterActive(undefined)}
              className={`px-3 py-1 rounded-md text-sm ${
                filterActive === undefined 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterActive(true)}
              className={`px-3 py-1 rounded-md text-sm ${
                filterActive === true 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterActive(false)}
              className={`px-3 py-1 rounded-md text-sm ${
                filterActive === false 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Inactive
            </button>
          </div>
        </div>
      </div>

      {/* Persons Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {persons.map((person) => (
            <div
              key={person._id || person.id}
              className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedPerson(person)
                setShowEditModal(true)
              }}
            >
              {/* Avatar */}
              <div className="aspect-square bg-gray-700 flex items-center justify-center">
                {person.avatar ? (
                  <img
                    src={person.avatar}
                    alt={person.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {person.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-white mb-1 truncate">{person.name}</h3>
                
                {person.roles.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {person.roles.slice(0, 2).map((role) => (
                      <span
                        key={role}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded-full"
                      >
                        {role}
                      </span>
                    ))}
                    {person.roles.length > 2 && (
                      <span className="px-2 py-1 text-xs bg-gray-600 text-gray-300 rounded-full">
                        +{person.roles.length - 2}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>{person.nationality || 'Unknown'}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    person.isActive 
                      ? 'bg-green-600 text-white' 
                      : 'bg-red-600 text-white'
                  }`}>
                    {person.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {person.analytics && (
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Movies: {person.analytics.totalMovies}</span>
                      <span>Views: {person.analytics.totalViews}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border border-gray-600 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 text-sm border rounded-md ${
                  currentPage === page
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm border border-gray-600 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && persons.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-white">No persons found</h3>
          <p className="mt-1 text-sm text-gray-400">Get started by creating a new person.</p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Person
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && <CreatePersonModal />}
      {showEditModal && selectedPerson && <EditPersonModal />}
    </div>
  )
}