import { apiService } from './api'
import { Person } from './types'

export class PersonApiService {
  // Get all persons with pagination
  static async getAllPersons(page: number = 1, limit: number = 20, search?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    
    if (search) {
      params.append('search', search)
    }

    const response = await apiService.get(`/persons?${params.toString()}`)
    return response
  }

  // Get person by ID
  static async getPersonById(id: string) {
    const response = await apiService.get(`/persons/${id}`)
    return response
  }

  // Create new person
  static async createPerson(personData: Partial<Person>) {
    const response = await apiService.post('/persons', personData)
    return response
  }

  // Update person
  static async updatePerson(id: string, personData: Partial<Person>) {
    const response = await apiService.put(`/persons/${id}`, personData)
    return response
  }

  // Delete person
  static async deletePerson(id: string) {
    const response = await apiService.delete(`/persons/${id}`)
    return response
  }

  // Search persons
  static async searchPersons(query: string) {
    const response = await apiService.get(`/persons/search?q=${encodeURIComponent(query)}`)
    return response
  }

  // Get persons by role
  static async getPersonsByRole(role: string) {
    const response = await apiService.get(`/persons/role/${role}`)
    return response
  }

  // Toggle person active status
  static async togglePersonStatus(id: string) {
    const response = await apiService.patch(`/persons/${id}/toggle-status`)
    return response
  }
}
