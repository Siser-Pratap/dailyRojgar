export const serviceCategories = [
  { name: 'Construction', icon: '🏗️', jobs: '1.2k workers' },
  { name: 'Electrical', icon: '⚡', jobs: '840 workers' },
  { name: 'Plumbing', icon: '🔧', jobs: '690 workers' },
  { name: 'Cleaning', icon: '🧹', jobs: '1.6k workers' },
  { name: 'House Help', icon: '🏠', jobs: '980 workers' },
  { name: 'Painting', icon: '🎨', jobs: '520 workers' },
  { name: 'Repairs', icon: '🧰', jobs: '760 workers' },
  { name: 'Driving', icon: '🚗', jobs: '430 workers' },
  { name: 'Gardening', icon: '🌱', jobs: '310 workers' },
  { name: 'Sanitation', icon: '🧼', jobs: '470 workers' },
]

export const workers = [
  {
    id: 'w1',
    name: 'Ramesh Kumar',
    category: 'Electrical',
    skills: ['Wiring', 'Fan repair', 'Switch boards'],
    rating: 4.9,
    reviews: 128,
    price: 850,
    distance: '1.2 km',
    available: true,
    completedJobs: 312,
    experience: '8 years',
    responseRate: '96%',
  },
  {
    id: 'w2',
    name: 'Sanjay Vishwakarma',
    category: 'Plumbing',
    skills: ['Leak fixing', 'Bathroom fitting', 'Motor repair'],
    rating: 4.8,
    reviews: 94,
    price: 750,
    distance: '2.4 km',
    available: true,
    completedJobs: 221,
    experience: '6 years',
    responseRate: '93%',
  },
  {
    id: 'w3',
    name: 'Meena Devi',
    category: 'Cleaning',
    skills: ['Deep cleaning', 'Kitchen', 'Move-in cleaning'],
    rating: 4.7,
    reviews: 156,
    price: 650,
    distance: '3.1 km',
    available: false,
    completedJobs: 408,
    experience: '10 years',
    responseRate: '91%',
  },
]

export const bookings = [
  {
    id: 'DR-2026-000128',
    worker: 'Ramesh Kumar',
    category: 'Electrical',
    status: 'in_progress',
    date: 'Today, 2:30 PM',
    amount: 935,
    address: 'Sector 22, Noida',
  },
  {
    id: 'DR-2026-000121',
    worker: 'Meena Devi',
    category: 'Cleaning',
    status: 'accepted',
    date: 'Tomorrow, 10:00 AM',
    amount: 715,
    address: 'Indirapuram, Ghaziabad',
  },
  {
    id: 'DR-2026-000109',
    worker: 'Sanjay Vishwakarma',
    category: 'Plumbing',
    status: 'completed',
    date: '18 Jun, 11:00 AM',
    amount: 825,
    address: 'Lajpat Nagar, Delhi',
  },
]

export const reviews = [
  { name: 'Amit Sharma', rating: 5, text: 'Very professional and finished the wiring safely.' },
  { name: 'Priya Nair', rating: 5, text: 'Arrived on time and explained the issue clearly.' },
  { name: 'Kavita Rao', rating: 4, text: 'Good work and fair pricing.' },
]

export const adminMetrics = [
  { label: 'Total users', value: '12,480', change: '+12%' },
  { label: 'Verified workers', value: '4,326', change: '+8%' },
  { label: 'Bookings today', value: '286', change: '+18%' },
  { label: 'Revenue', value: '₹8.4L', change: '+15%' },
]

export const workerJobs = [
  {
    title: 'Electrical repair',
    customer: 'Amit Sharma',
    status: 'pending',
    amount: 935,
    time: '2:30 PM',
  },
  {
    title: 'Fan installation',
    customer: 'Nidhi Verma',
    status: 'accepted',
    amount: 650,
    time: '5:00 PM',
  },
  {
    title: 'Switch board replacement',
    customer: 'Ravi Gupta',
    status: 'completed',
    amount: 780,
    time: 'Yesterday',
  },
]

export const payments = [
  { id: 'pay_001', booking: 'DR-2026-000128', amount: 935, status: 'captured', method: 'Razorpay' },
  { id: 'pay_002', booking: 'DR-2026-000121', amount: 715, status: 'created', method: 'Razorpay' },
  { id: 'pay_003', booking: 'DR-2026-000109', amount: 825, status: 'refunded', method: 'Razorpay' },
]
