:::writing{variant="standard" id="48291"}
SolarIQ ⚡

A backend system for monitoring and managing solar energy systems with real-time updates, PostgreSQL + MongoDB integration, and email reporting.

🚀 Features
User authentication (JWT)
System monitoring (solar systems)
Fault tracking system
Real-time updates using Socket.IO
PostgreSQL + MongoDB hybrid database
Weekly email reports using cron jobs
RESTful APIs with Express.js
🛠️ Tech Stack
Node.js
Express.js
PostgreSQL (Sequelize ORM)
MongoDB (Mongoose ODM)
Socket.IO
Node-cron
Nodemailer
dotenv
📁 Project Structure
backend/
 ├── config/
 ├── controllers/
 ├── models/
 ├── routes/
 ├── services/
 ├── socket/
 ├── middleware/
 ├── server.js
 ├── .env
⚙️ Installation
git clone <repo-url>
cd backend
npm install
🔐 Environment Variables

Create .env file:

PORT=3000

# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# MongoDB
MONGO_URI=mongodb://localhost:27017/solariq

# JWT
JWT_SECRET=your_secret_key

# Email
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_password
▶️ Run Project
npm run dev

Server runs at:

http://localhost:3000
📡 API Endpoints
Auth
POST /api/auth/register
POST /api/auth/login
Systems
GET /api/systems
POST /api/systems
Readings
GET /api/readings
Faults
GET /api/faults
📊 Real-Time Features

Socket.IO used for live system updates and monitoring dashboard.

📧 Email Reports

Weekly reports are sent automatically every Monday at 9 AM using cron jobs.

👨‍💻 Author

Fatima Sagheer
Backend Developer (Node.js / Express / PostgreSQL / MongoDB)

📌 Notes
Ensure .env is not pushed to GitHub
Always restart server after env changes
Use production-grade secrets in deployment


Troubleshoot 
# to make visibility of port public 
gh codespace ports visibility 3000:public -c $CODESPACE_NAME
gh codespace ports visibility 4200:public -c $CODESPACE_NAME