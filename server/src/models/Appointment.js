import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    // Parent / Guardian
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },

    // Child details
    childName: { type: String, required: true, trim: true },
    childAge: { type: String, required: true, trim: true },

    // Preferred schedule
    preferredDate: { type: String, required: true, trim: true },
    preferredTime: { type: String, trim: true, default: "" },

    // Appointment info
    service: { type: String, required: true, trim: true },
    message: { type: String, trim: true, default: "" },

    // Admin status
    status: {
      type: String,
      enum: ["new", "contacted", "scheduled", "done", "cancelled"],
      default: "new",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Appointment", appointmentSchema);