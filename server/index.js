const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")

const connectDB = require("./config/db")
const authRoutes = require("./modules/auth/routes/authRoutes")
const caseManagementRoutes = require("./modules/caseManagement/routes/caseManagementRoutes")
const chatBotRoutes = require("./modules/aiChatBot/routes/chatBotRoutes")
const notificationRoutes = require("./modules/notificationManagement/routes/notificationRoutes")
const { initCronJobs } = require("./modules/notificationManagement/services/cronService")

dotenv.config()
connectDB()

const app = express()
app.use(express.json())
app.use(express.static("build"))
app.use(cors())

// Routes
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1", caseManagementRoutes)
app.use("/api/v1/chatbot", chatBotRoutes)
app.use("/api/v1/notifications", notificationRoutes)

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "Legal Firm API is running" })
})

const port = process.env.PORT || 5000
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
  // Start the daily cron job for hearing notifications
  initCronJobs()
})
