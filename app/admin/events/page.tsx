'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { apiService } from '../../../lib/api'
import AdminCard from '../../../components/AdminCard'
import AdminTable from '../../../components/AdminTable'
import LoadingSpinner from '../../../components/LoadingSpinner'
import { useEnvironment } from '../../../contexts/EnvironmentContext'

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  venue: string
  city: string
  state: string
  status: 'active' | 'completed' | 'cancelled' | 'draft'
  totalSeats: number
  availableSeats: number
  price: number
  category: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

interface EventStats {
  totalEvents: number
  activeEvents: number
  completedEvents: number
  cancelledEvents: number
  totalRevenue: number
  averageTicketPrice: number
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [stats, setStats] = useState<EventStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [showExclusiveSeatsModal, setShowExclusiveSeatsModal] = useState(false)
  const [showEventAnalysisModal, setShowEventAnalysisModal] = useState(false)
  const [showEventBookingsModal, setShowEventBookingsModal] = useState(false)
  const [showEventPaymentsModal, setShowEventPaymentsModal] = useState(false)
  const [eventAnalysisData, setEventAnalysisData] = useState<any>(null)
  const [eventBookingsData, setEventBookingsData] = useState<any[]>([])
  const [eventPaymentsData, setEventPaymentsData] = useState<any[]>([])
  const [filterEventStatus, setFilterEventStatus] = useState<'all' | 'active' | 'completed' | 'cancelled' | 'draft'>('all')
  const { currentConfig } = useEnvironment()

  // Fetch events data
  const fetchEvents = async () => {
    try {
      setIsLoading(true)
      
      // Mock data for demonstration
      const mockEvents: Event[] = [
        {
          id: 'EVT001',
          title: 'FANTASY FRIDAY',
          description: 'An amazing fantasy themed event',
          date: '2024-09-20',
          time: '19:00',
          venue: 'Broad Bean Hotel',
          city: 'Vyttila',
          state: 'Kerala',
          status: 'active',
          totalSeats: 100,
          availableSeats: 75,
          price: 1500,
          category: 'Entertainment',
          imageUrl: 'https://example.com/image1.jpg',
          createdAt: '2024-09-01T10:00:00Z',
          updatedAt: '2024-09-01T10:00:00Z'
        },
        {
          id: 'EVT002',
          title: 'NEON NIGHT',
          description: 'A vibrant neon themed party',
          date: '2024-09-25',
          time: '20:00',
          venue: 'Elysium Gastronomic Lounge',
          city: 'Vyttila',
          state: 'Kerala',
          status: 'active',
          totalSeats: 80,
          availableSeats: 60,
          price: 2000,
          category: 'Party',
          imageUrl: 'https://example.com/image2.jpg',
          createdAt: '2024-09-02T10:00:00Z',
          updatedAt: '2024-09-02T10:00:00Z'
        },
        {
          id: 'EVT003',
          title: 'TECH CONFERENCE 2024',
          description: 'Latest technology trends and innovations',
          date: '2024-09-30',
          time: '09:00',
          venue: 'Convention Center',
          city: 'Kochi',
          state: 'Kerala',
          status: 'draft',
          totalSeats: 200,
          availableSeats: 200,
          price: 3000,
          category: 'Conference',
          imageUrl: 'https://example.com/image3.jpg',
          createdAt: '2024-09-03T10:00:00Z',
          updatedAt: '2024-09-03T10:00:00Z'
        }
      ]
      
      setEvents(mockEvents)
      
      // Note: Uncomment below for real API call
      // const response = await apiService.get('/admin/events') as any
      // if (response.status === 'success') {
      //   setEvents(response.data?.events || [])
      // } else {
      //   setError(response.message || 'Failed to fetch events')
      // }
      
    } catch (error: any) {
      setError(error.response?.data?.message || error.message || 'Failed to fetch events')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch event statistics
  const fetchEventStats = async () => {
    try {
      
      const response = await apiService.get('/admin/events/earnings') as any
      
      if (response.status === 'success') {
        const earnings = response.data || {}
        setStats({
          totalEvents: events.length,
          activeEvents: events.filter(e => e.status === 'active').length,
          completedEvents: events.filter(e => e.status === 'completed').length,
          cancelledEvents: events.filter(e => e.status === 'cancelled').length,
          totalRevenue: earnings.totalEarnings || 0,
          averageTicketPrice: earnings.averageTicketPrice || 0
        })
      }
    } catch (error: any) {
    }
  }

  // Create new event
  const handleCreateEvent = async (eventData: Partial<Event>) => {
    try {
      
      const response = await apiService.post('/admin/events', eventData) as any
      
      if (response.status === 'success') {
        toast.success('Event created successfully!')
        setShowCreateModal(false)
        fetchEvents()
      } else {
        toast.error(response.message || 'Failed to create event')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to create event')
    }
  }

  // Update event
  const handleUpdateEvent = async (eventId: string, eventData: Partial<Event>) => {
    try {
      
      const response = await apiService.put(`/admin/events/${eventId}`, eventData) as any
      
      if (response.status === 'success') {
        toast.success('Event updated successfully!')
        setShowEditModal(false)
        setSelectedEvent(null)
        fetchEvents()
      } else {
        toast.error(response.message || 'Failed to update event')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to update event')
    }
  }

  // Delete event
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return
    
    try {
      
      const response = await apiService.delete(`/admin/events/${eventId}`) as any
      
      if (response.status === 'success') {
        toast.success('Event deleted successfully!')
        fetchEvents()
      } else {
        toast.error(response.message || 'Failed to delete event')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to delete event')
    }
  }

  // Get event statistics
  const handleGetEventStats = async (eventId: string) => {
    try {
      
      const response = await apiService.get(`/admin/events/${eventId}/statistics`) as any
      
      if (response.status === 'success') {
        setSelectedEvent(events.find(e => e.id === eventId) || null)
        setShowStatsModal(true)
      } else {
        toast.error(response.message || 'Failed to get event statistics')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to get event statistics')
    }
  }

  // Get event bookings
  const handleGetEventBookings = async (eventId: string) => {
    try {
      
      const response = await apiService.get(`/admin/events/${eventId}/bookings`) as any
      
      if (response.status === 'success') {
        // Navigate to bookings page with event filter
        window.location.href = `/admin/bookings?eventId=${eventId}`
      } else {
        toast.error(response.message || 'Failed to get event bookings')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to get event bookings')
    }
  }

  // Get event profit
  const handleGetEventProfit = async (eventId: string) => {
    try {
      
      const response = await apiService.get(`/admin/events/${eventId}/profit`) as any
      
      if (response.status === 'success') {
        toast.success(`Event Profit: ₹${response.data?.profit || 0}`)
      } else {
        toast.error(response.message || 'Failed to get event profit')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to get event profit')
    }
  }

  // Get exclusive seats for event
  const handleGetExclusiveSeats = async (eventId: string) => {
    try {
      
      const response = await apiService.get(`/admin/events/${eventId}/exclusive-seats`) as any
      
      if (response.status === 'success') {
        setSelectedEvent(events.find(e => e.id === eventId) || null)
        setShowExclusiveSeatsModal(true)
      } else {
        toast.error(response.message || 'Failed to get exclusive seats')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to get exclusive seats')
    }
  }

  // Get detailed event analysis
  const handleGetEventAnalysis = async (eventId: string) => {
    try {
      
      // Mock analysis data
      const mockAnalysisData = {
        eventId,
        eventName: events.find(e => e.id === eventId)?.title || 'Unknown Event',
        totalBookings: 45,
        totalRevenue: 67500,
        averageBookingValue: 1500,
        bookingTrends: [
          { date: '2024-09-01', bookings: 5, revenue: 7500 },
          { date: '2024-09-02', bookings: 8, revenue: 12000 },
          { date: '2024-09-03', bookings: 12, revenue: 18000 },
          { date: '2024-09-04', bookings: 15, revenue: 22500 },
          { date: '2024-09-05', bookings: 5, revenue: 7500 }
        ],
        paymentMethods: {
          UPI: 25,
          Card: 15,
          NetBanking: 5
        },
        seatCategoryBreakdown: {
          VIP: { sold: 20, total: 30, revenue: 40000 },
          Standard: { sold: 25, total: 70, revenue: 27500 }
        },
        userDemographics: {
          ageGroups: {
            '18-25': 15,
            '26-35': 20,
            '36-45': 8,
            '46+': 2
          },
          cities: {
            'Kochi': 25,
            'Thiruvananthapuram': 12,
            'Kozhikode': 8
          }
        },
        conversionRate: 4.5,
        cancellationRate: 2.1,
        refundAmount: 3000
      }
      
      setEventAnalysisData(mockAnalysisData)
      setSelectedEvent(events.find(e => e.id === eventId) || null)
      setShowEventAnalysisModal(true)
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to get event analysis')
    }
  }

  // Get event bookings details
  const handleGetEventBookingsDetails = async (eventId: string) => {
    try {
      
      // Mock bookings data
      const mockBookingsData = [
        {
          id: 'BK001',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          seatNumber: 'A1',
          seatCategory: 'VIP',
          amount: 2000,
          status: 'confirmed',
          paymentStatus: 'paid',
          bookingDate: '2024-09-15T10:00:00Z'
        },
        {
          id: 'BK002',
          userName: 'Jane Smith',
          userEmail: 'jane@example.com',
          seatNumber: 'B5',
          seatCategory: 'Standard',
          amount: 1500,
          status: 'confirmed',
          paymentStatus: 'paid',
          bookingDate: '2024-09-14T14:30:00Z'
        },
        {
          id: 'BK003',
          userName: 'Bob Johnson',
          userEmail: 'bob@example.com',
          seatNumber: 'A3',
          seatCategory: 'VIP',
          amount: 2000,
          status: 'cancelled',
          paymentStatus: 'refunded',
          bookingDate: '2024-09-13T18:45:00Z'
        }
      ]
      
      setEventBookingsData(mockBookingsData)
      setSelectedEvent(events.find(e => e.id === eventId) || null)
      setShowEventBookingsModal(true)
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to get event bookings details')
    }
  }

  // Get event payments details
  const handleGetEventPaymentsDetails = async (eventId: string) => {
    try {
      
      // Mock payments data
      const mockPaymentsData = [
        {
          id: 'PAY001',
          bookingId: 'BK001',
          userName: 'John Doe',
          amount: 2000,
          status: 'success',
          paymentMethod: 'UPI',
          gateway: 'Easebuzz',
          transactionId: 'TXN123456789',
          paymentDate: '2024-09-15T10:00:00Z'
        },
        {
          id: 'PAY002',
          bookingId: 'BK002',
          userName: 'Jane Smith',
          amount: 1500,
          status: 'success',
          paymentMethod: 'Card',
          gateway: 'Razorpay',
          transactionId: 'TXN987654321',
          paymentDate: '2024-09-14T14:30:00Z'
        },
        {
          id: 'PAY003',
          bookingId: 'BK003',
          userName: 'Bob Johnson',
          amount: 2000,
          status: 'refunded',
          paymentMethod: 'Net Banking',
          gateway: 'Easebuzz',
          transactionId: 'TXN456789123',
          refundAmount: 2000,
          refundDate: '2024-09-13T20:00:00Z'
        }
      ]
      
      setEventPaymentsData(mockPaymentsData)
      setSelectedEvent(events.find(e => e.id === eventId) || null)
      setShowEventPaymentsModal(true)
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to get event payments details')
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [currentConfig])

  useEffect(() => {
    if (events.length > 0) {
      fetchEventStats()
    }
  }, [events])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchEvents}
          className="btn-primary px-4 py-2"
        >
          Retry
        </button>
      </div>
    )
  }

  const tableColumns = [
    { key: 'title', label: 'Event Title' },
    { key: 'date', label: 'Date' },
    { key: 'venue', label: 'Venue' },
    { key: 'city', label: 'City' },
    { key: 'status', label: 'Status' },
    { key: 'totalSeats', label: 'Total Seats' },
    { key: 'availableSeats', label: 'Available' },
    { key: 'price', label: 'Price' },
    { key: 'actions', label: 'Actions' }
  ]

  const tableData = events.map(event => ({
    ...event,
    date: new Date(event.date).toLocaleDateString(),
    price: `₹${event.price}`,
    status: (
      <span className={`px-2 py-1 rounded-full text-xs ${
        event.status === 'active' ? 'bg-green-500/20 text-green-400' :
        event.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
        event.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
        'bg-gray-500/20 text-gray-400'
      }`}>
        {event.status}
      </span>
    ),
    actions: (
      <div className="flex flex-wrap gap-1">
        <button
          onClick={() => {
            setSelectedEvent(event)
            setShowEditModal(true)
          }}
          className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 rounded bg-blue-500/10"
          title="Edit Event"
        >
          Edit
        </button>
        <button
          onClick={() => handleGetEventAnalysis(event.id)}
          className="text-cyan-400 hover:text-cyan-300 text-xs px-2 py-1 rounded bg-cyan-500/10"
          title="Detailed Analysis"
        >
          Analysis
        </button>
        <button
          onClick={() => handleGetEventBookingsDetails(event.id)}
          className="text-yellow-400 hover:text-yellow-300 text-xs px-2 py-1 rounded bg-yellow-500/10"
          title="View Bookings"
        >
          Bookings
        </button>
        <button
          onClick={() => handleGetEventPaymentsDetails(event.id)}
          className="text-green-400 hover:text-green-300 text-xs px-2 py-1 rounded bg-green-500/10"
          title="View Payments"
        >
          Payments
        </button>
        <button
          onClick={() => handleGetEventStats(event.id)}
          className="text-purple-400 hover:text-purple-300 text-xs px-2 py-1 rounded bg-purple-500/10"
          title="Basic Stats"
        >
          Stats
        </button>
        <button
          onClick={() => handleGetEventProfit(event.id)}
          className="text-indigo-400 hover:text-indigo-300 text-xs px-2 py-1 rounded bg-indigo-500/10"
          title="Profit Analysis"
        >
          Profit
        </button>
        <button
          onClick={() => handleGetExclusiveSeats(event.id)}
          className="text-orange-400 hover:text-orange-300 text-xs px-2 py-1 rounded bg-orange-500/10"
          title="Exclusive Seats"
        >
          Seats
        </button>
        <button
          onClick={() => handleDeleteEvent(event.id)}
          className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded bg-red-500/10"
          title="Delete Event"
        >
          Delete
        </button>
      </div>
    )
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Event Management</h1>
          <p className="text-white/60">Manage all events and their details</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary px-4 py-2"
        >
          + Create Event
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminCard>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.totalEvents}</div>
              <div className="text-white/60">Total Events</div>
            </div>
          </AdminCard>
          <AdminCard>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{stats.activeEvents}</div>
              <div className="text-white/60">Active Events</div>
            </div>
          </AdminCard>
          <AdminCard>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.completedEvents}</div>
              <div className="text-white/60">Completed</div>
            </div>
          </AdminCard>
          <AdminCard>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">₹{stats.totalRevenue.toLocaleString()}</div>
              <div className="text-white/60">Total Revenue</div>
            </div>
          </AdminCard>
        </div>
      )}

      {/* Filters */}
      <AdminCard>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search events..."
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
            />
          </div>
          <div>
            <select
              value={filterEventStatus}
              onChange={(e) => setFilterEventStatus(e.target.value as any)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
            >
              <option value="all">All Events</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </AdminCard>

      {/* Events Table */}
      <AdminCard>
        <AdminTable
          columns={tableColumns}
          data={tableData}
          title="All Events"
        />
      </AdminCard>

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateEvent}
        />
      )}

      {/* Edit Event Modal */}
      {showEditModal && selectedEvent && (
        <EditEventModal
          event={selectedEvent}
          onClose={() => {
            setShowEditModal(false)
            setSelectedEvent(null)
          }}
          onSubmit={(data) => handleUpdateEvent(selectedEvent.id, data)}
        />
      )}

      {/* Event Statistics Modal */}
      {showStatsModal && selectedEvent && (
        <EventStatsModal
          event={selectedEvent}
          onClose={() => {
            setShowStatsModal(false)
            setSelectedEvent(null)
          }}
        />
      )}

      {/* Exclusive Seats Modal */}
      {showExclusiveSeatsModal && selectedEvent && (
        <ExclusiveSeatsModal
          event={selectedEvent}
          onClose={() => {
            setShowExclusiveSeatsModal(false)
            setSelectedEvent(null)
          }}
        />
      )}

      {/* Event Analysis Modal */}
      {showEventAnalysisModal && selectedEvent && eventAnalysisData && (
        <EventAnalysisModal
          event={selectedEvent}
          analysisData={eventAnalysisData}
          onClose={() => {
            setShowEventAnalysisModal(false)
            setSelectedEvent(null)
            setEventAnalysisData(null)
          }}
        />
      )}

      {/* Event Bookings Modal */}
      {showEventBookingsModal && selectedEvent && (
        <EventBookingsModal
          event={selectedEvent}
          bookingsData={eventBookingsData}
          onClose={() => {
            setShowEventBookingsModal(false)
            setSelectedEvent(null)
            setEventBookingsData([])
          }}
        />
      )}

      {/* Event Payments Modal */}
      {showEventPaymentsModal && selectedEvent && (
        <EventPaymentsModal
          event={selectedEvent}
          paymentsData={eventPaymentsData}
          onClose={() => {
            setShowEventPaymentsModal(false)
            setSelectedEvent(null)
            setEventPaymentsData([])
          }}
        />
      )}
    </div>
  )
}

// Create Event Modal Component
function CreateEventModal({ onClose, onSubmit }: { onClose: () => void, onSubmit: (data: Partial<Event>) => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    city: '',
    state: '',
    totalSeats: '',
    price: '',
    category: '',
    imageUrl: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      totalSeats: parseInt(formData.totalSeats) || 0,
      price: parseFloat(formData.price) || 0
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">Create New Event</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Event Title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
            required
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
            rows={3}
          />
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
            required
          />
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({...formData, time: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
            required
          />
          <input
            type="text"
            placeholder="Venue"
            value={formData.venue}
            onChange={(e) => setFormData({...formData, venue: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
            required
          />
          <input
            type="text"
            placeholder="City"
            value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
            required
          />
          <input
            type="text"
            placeholder="State"
            value={formData.state}
            onChange={(e) => setFormData({...formData, state: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
            required
          />
          <input
            type="number"
            placeholder="Total Seats"
            value={formData.totalSeats}
            onChange={(e) => setFormData({...formData, totalSeats: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
            required
          />
          <input
            type="text"
            placeholder="Category"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
            required
          />
          <input
            type="url"
            placeholder="Image URL"
            value={formData.imageUrl}
            onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
          />
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 btn-primary py-2"
            >
              Create Event
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

// Edit Event Modal Component
function EditEventModal({ event, onClose, onSubmit }: { event: Event, onClose: () => void, onSubmit: (data: Partial<Event>) => void }) {
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description,
    date: event.date,
    time: event.time,
    venue: event.venue,
    city: event.city,
    state: event.state,
    totalSeats: event.totalSeats.toString(),
    price: event.price.toString(),
    category: event.category,
    imageUrl: event.imageUrl || '',
    status: event.status
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      totalSeats: parseInt(formData.totalSeats) || 0,
      price: parseFloat(formData.price) || 0
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">Edit Event</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Event Title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
            required
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
            rows={3}
          />
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
            required
          />
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({...formData, time: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
            required
          />
          <input
            type="text"
            placeholder="Venue"
            value={formData.venue}
            onChange={(e) => setFormData({...formData, venue: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
            required
          />
          <input
            type="text"
            placeholder="City"
            value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
            required
          />
          <input
            type="text"
            placeholder="State"
            value={formData.state}
            onChange={(e) => setFormData({...formData, state: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
            required
          />
          <input
            type="number"
            placeholder="Total Seats"
            value={formData.totalSeats}
            onChange={(e) => setFormData({...formData, totalSeats: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
            required
          />
          <input
            type="text"
            placeholder="Category"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
            required
          />
          <select
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value as any})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input
            type="url"
            placeholder="Image URL"
            value={formData.imageUrl}
            onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
          />
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 btn-primary py-2"
            >
              Update Event
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

// Event Statistics Modal Component
function EventStatsModal({ event, onClose }: { event: Event, onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">Event Statistics</h2>
        <div className="space-y-4">
          <div className="text-white">
            <strong>Event:</strong> {event.title}
          </div>
          <div className="text-white">
            <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
          </div>
          <div className="text-white">
            <strong>Venue:</strong> {event.venue}
          </div>
          <div className="text-white">
            <strong>Total Seats:</strong> {event.totalSeats}
          </div>
          <div className="text-white">
            <strong>Available Seats:</strong> {event.availableSeats}
          </div>
          <div className="text-white">
            <strong>Price:</strong> ₹{event.price}
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full btn-secondary py-2 mt-4"
        >
          Close
        </button>
      </div>
    </div>
  )
}

// Exclusive Seats Modal Component
function ExclusiveSeatsModal({ event, onClose }: { event: Event, onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">Exclusive Seats</h2>
        <div className="space-y-4">
          <div className="text-white">
            <strong>Event:</strong> {event.title}
          </div>
          <div className="text-white">
            <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
          </div>
          <div className="text-white">
            <strong>Venue:</strong> {event.venue}
          </div>
          <div className="text-white/60">
            Exclusive seat management features will be implemented here.
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full btn-secondary py-2 mt-4"
        >
          Close
        </button>
      </div>
    </div>
  )
}

// Event Analysis Modal Component
function EventAnalysisModal({ event, analysisData, onClose }: { event: Event, analysisData: any, onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">Event Analysis - {event.title}</h2>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="text-2xl font-bold text-white">{analysisData.totalBookings}</div>
            <div className="text-white/60">Total Bookings</div>
          </div>
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="text-2xl font-bold text-primary">₹{analysisData.totalRevenue.toLocaleString()}</div>
            <div className="text-white/60">Total Revenue</div>
          </div>
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-400">{analysisData.conversionRate}%</div>
            <div className="text-white/60">Conversion Rate</div>
          </div>
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-400">{analysisData.cancellationRate}%</div>
            <div className="text-white/60">Cancellation Rate</div>
          </div>
        </div>

        {/* Booking Trends */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Booking Trends</h3>
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="space-y-2">
              {analysisData.bookingTrends.map((trend: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-white">{new Date(trend.date).toLocaleDateString()}</span>
                  <span className="text-white">{trend.bookings} bookings</span>
                  <span className="text-primary">₹{trend.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Payment Methods</h3>
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="space-y-2">
              {Object.entries(analysisData.paymentMethods).map(([method, count]: [string, any]) => (
                <div key={method} className="flex justify-between items-center">
                  <span className="text-white">{method}</span>
                  <span className="text-primary">{count} transactions</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Seat Category Breakdown */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Seat Category Breakdown</h3>
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="space-y-3">
              {Object.entries(analysisData.seatCategoryBreakdown).map(([category, data]: [string, any]) => (
                <div key={category} className="border-b border-white/10 pb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white font-medium">{category}</span>
                    <span className="text-primary">₹{data.revenue.toLocaleString()}</span>
                  </div>
                  <div className="text-white/60 text-sm">
                    {data.sold}/{data.total} seats sold
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Demographics */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">User Demographics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-lg">
              <h4 className="text-white font-medium mb-2">Age Groups</h4>
              <div className="space-y-1">
                {Object.entries(analysisData.userDemographics.ageGroups).map(([age, count]: [string, any]) => (
                  <div key={age} className="flex justify-between text-white/80 text-sm">
                    <span>{age}</span>
                    <span>{count} users</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <h4 className="text-white font-medium mb-2">Cities</h4>
              <div className="space-y-1">
                {Object.entries(analysisData.userDemographics.cities).map(([city, count]: [string, any]) => (
                  <div key={city} className="flex justify-between text-white/80 text-sm">
                    <span>{city}</span>
                    <span>{count} users</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full btn-secondary py-2"
        >
          Close
        </button>
      </div>
    </div>
  )
}

// Event Bookings Modal Component
function EventBookingsModal({ event, bookingsData, onClose }: { event: Event, bookingsData: any[], onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">Event Bookings - {event.title}</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-white/80">Booking ID</th>
                <th className="text-left py-3 px-4 text-white/80">User</th>
                <th className="text-left py-3 px-4 text-white/80">Seat</th>
                <th className="text-left py-3 px-4 text-white/80">Amount</th>
                <th className="text-left py-3 px-4 text-white/80">Status</th>
                <th className="text-left py-3 px-4 text-white/80">Payment</th>
                <th className="text-left py-3 px-4 text-white/80">Date</th>
              </tr>
            </thead>
            <tbody>
              {bookingsData.map((booking) => (
                <tr key={booking.id} className="border-b border-white/5">
                  <td className="py-3 px-4 text-white">{booking.id}</td>
                  <td className="py-3 px-4 text-white">
                    <div>
                      <div className="font-medium">{booking.userName}</div>
                      <div className="text-white/60 text-sm">{booking.userEmail}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-white">
                    <div>
                      <div>{booking.seatNumber}</div>
                      <div className="text-white/60 text-sm">{booking.seatCategory}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-white">₹{booking.amount.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                      booking.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      booking.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400' :
                      booking.paymentStatus === 'refunded' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {booking.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white/80 text-sm">
                    {new Date(booking.bookingDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={onClose}
          className="w-full btn-secondary py-2 mt-6"
        >
          Close
        </button>
      </div>
    </div>
  )
}

// Event Payments Modal Component
function EventPaymentsModal({ event, paymentsData, onClose }: { event: Event, paymentsData: any[], onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">Event Payments - {event.title}</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-white/80">Payment ID</th>
                <th className="text-left py-3 px-4 text-white/80">Booking ID</th>
                <th className="text-left py-3 px-4 text-white/80">User</th>
                <th className="text-left py-3 px-4 text-white/80">Amount</th>
                <th className="text-left py-3 px-4 text-white/80">Status</th>
                <th className="text-left py-3 px-4 text-white/80">Method</th>
                <th className="text-left py-3 px-4 text-white/80">Gateway</th>
                <th className="text-left py-3 px-4 text-white/80">Date</th>
              </tr>
            </thead>
            <tbody>
              {paymentsData.map((payment) => (
                <tr key={payment.id} className="border-b border-white/5">
                  <td className="py-3 px-4 text-white">{payment.id}</td>
                  <td className="py-3 px-4 text-white">{payment.bookingId}</td>
                  <td className="py-3 px-4 text-white">{payment.userName}</td>
                  <td className="py-3 px-4 text-white">₹{payment.amount.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      payment.status === 'success' ? 'bg-green-500/20 text-green-400' :
                      payment.status === 'refunded' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white">{payment.paymentMethod}</td>
                  <td className="py-3 px-4 text-white">{payment.gateway}</td>
                  <td className="py-3 px-4 text-white/80 text-sm">
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={onClose}
          className="w-full btn-secondary py-2 mt-6"
        >
          Close
        </button>
      </div>
    </div>
  )
}
