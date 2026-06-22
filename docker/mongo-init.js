// MongoDB initialisation script
// Creates the application database with initial indexes
db = db.getSiblingDB('dailyrojgar')

db.createCollection('users')
db.createCollection('workers')
db.createCollection('services')
db.createCollection('bookings')
db.createCollection('payments')
db.createCollection('reviews')
db.createCollection('notifications')
db.createCollection('chats')
db.createCollection('messages')
db.createCollection('otps')

print('dailyrojgar database initialised')
