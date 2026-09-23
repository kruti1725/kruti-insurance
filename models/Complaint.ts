import mongoose, { Schema, model, models } from "mongoose";

const ComplaintSchema = new Schema(
  {
    srNo: { type: String, required: true },
    customerVisitDate: { type: String, default: "" },
    customerName: { type: String, required: true },
    customerMobile: { type: String, required: true },
    technicianName: { type: String, default: "" },
    isPickUp: { type: Boolean, default: false },
    pickUpDate: { type: String, default: "" },
    isApproval: { type: Boolean, default: true },
    amount: { type: String, default: "0" },
    status: { type: String, default: "Pending" }, // Pending, Under Repair, Not Ready, Ready
    reason: { type: String, default: "" },
    readyForDelivery: { type: Boolean, default: false },
    deliveryReadyDate: { type: String, default: "" },
    city: { type: String, default: "Vapi" }, // Vapi, Surat, Ahmedabad, CH
    deliveryStatus: { type: String, default: "Pending" }, // Close, Unsold, BER, Reject
    workshopStatus: { type: String, default: "None" }, // In, Out, None
    workshopInDate: { type: String, default: "" },
    workshopOutDate: { type: String, default: "" },
    notes: { type: String, default: "" },
    priority: { type: String, default: "Normal" }, // Urgent, High, Normal, Low
    brand: { type: String, default: "" },
    modelNo: { type: String, default: "" },
    complaintDesc: { type: String, default: "" },
  },
  { timestamps: true }
);

export default models.Complaint || model("Complaint", ComplaintSchema);