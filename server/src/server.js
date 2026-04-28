import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import connectDB from "./config/db.js";
import Appointment from "./models/Appointment.js";

dotenv.config();

const app = express();

// DB connect
connectDB();

// Middlewares
app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Magic Minds Backend Running!");
});

// -------------------- AUTH HELPERS --------------------
const createToken = () => {
  return jwt.sign(
    { role: "admin", username: process.env.ADMIN_USERNAME },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const requireAdminAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// -------------------- ADMIN LOGIN --------------------
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required",
    });
  }

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({
      success: false,
      message: "Invalid username or password",
    });
  }

  const token = createToken();

  return res.json({
    success: true,
    message: "Login successful",
    token,
  });
});

// -------------------- VALIDATIONS --------------------
const isValidPhone = (phone) => /^[0-9]{10,15}$/.test(String(phone || ""));

// -------------------- CREATE APPOINTMENT (PUBLIC) --------------------
app.post("/api/appointments", async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      childName,
      childAge,
      preferredDate,
      preferredTime,
      service,
      message,
    } = req.body;

    if (
      !name ||
      !phone ||
      !email ||
      !childName ||
      !childAge ||
      !preferredDate ||
      !service
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Parent name, phone, email, child name, child age, preferred date and service are required",
      });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Phone must contain only numbers (10–15 digits).",
      });
    }

    const today = new Date().toISOString().split("T")[0];

    if (preferredDate < today) {
      return res.status(400).json({
        success: false,
        message: "Past date is not allowed",
      });
    }

    // ✅ Same-day past time validation
    const now = new Date();
    const selected = new Date(`${preferredDate}T${preferredTime || "00:00"}`);

    if (preferredDate === today && preferredTime && selected < now) {
      return res.status(400).json({
        success: false,
        message: "Selected time cannot be in the past.",
      });
    }

    const newAppointment = new Appointment({
      name: String(name).trim(),
      phone: String(phone).trim(),
      email: String(email).trim(),
      childName: String(childName).trim(),
      childAge: String(childAge).trim(),
      preferredDate: String(preferredDate).trim(),
      preferredTime: String(preferredTime || "").trim(),
      service: String(service).trim(),
      message: String(message || "").trim(),
    });

    await newAppointment.save();

    return res.status(201).json({
      success: true,
      message: "Appointment saved successfully",
    });
  } catch (error) {
    console.log("Appointment Save Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while saving appointment",
    });
  }
});

// -------------------- GET APPOINTMENTS (PROTECTED) --------------------
app.get("/api/appointments", requireAdminAuth, async (req, res) => {
  try {
    const { q = "", status = "all" } = req.query;
    const filter = {};

    if (q.trim()) {
      const re = new RegExp(q.trim(), "i");
      filter.$or = [
        { name: re },
        { phone: re },
        { email: re },
        { service: re },
        { childName: re },
      ];
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    const appointments = await Appointment.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.log("Fetch Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching appointments",
    });
  }
});

// -------------------- UPDATE STATUS (PROTECTED) --------------------
app.patch("/api/appointments/:id/status", requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["new", "contacted", "scheduled", "done", "cancelled"];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const updated = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    return res.json({
      success: true,
      message: "Status updated",
      data: updated,
    });
  } catch (error) {
    console.log("Status Update Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while updating status",
    });
  }
});

// -------------------- DELETE APPOINTMENT (PROTECTED) --------------------
app.delete("/api/appointments/:id", requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Appointment.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    return res.json({
      success: true,
      message: "Appointment deleted",
    });
  } catch (error) {
    console.log("Delete Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting appointment",
    });
  }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});