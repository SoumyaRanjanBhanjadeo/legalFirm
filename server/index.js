const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")

const connectDB = require("./config/db")
const authRoutes = require("./modules/auth/routes/authRoutes")
const caseManagementRoutes = require("./modules/caseManagement/routes/caseManagementRoutes")

dotenv.config()
connectDB()

const app = express()
app.use(express.json())
app.use(express.static("build"))
app.use(cors())

// Routes
app.use("/api/auth", authRoutes)
app.use("/api", caseManagementRoutes)

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "Legal Firm API is running" })
})

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Server running on port ${port}`))
