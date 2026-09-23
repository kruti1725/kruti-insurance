"use client";
import React, { useState, useEffect } from "react";
import { Trash2, Edit3, Plus, Bell, Tv, CheckCircle2, Clock, Wrench, ShieldCheck, Search, Download, AlertTriangle } from "lucide-react";

export default function KrutiInsuranceApp() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "add" | "all">("all");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("All");
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const initialForm = {
    srNo: "",
    customerVisitDate: new Date().toISOString().split("T")[0],
    customerName: "",
    customerMobile: "",
    technicianName: "Ramesh Kumar",
    isPickUp: false,
    pickUpDate: "",
    isApproval: true,
    amount: "0",
    status: "Pending",
    reason: "",
    readyForDelivery: false,
    deliveryReadyDate: "",
    city: "Vapi",
    deliveryStatus: "Pending",
    workshopStatus: "None",
    workshopInDate: "",
    workshopOutDate: "",
    priority: "Normal",
    brand: "",
    modelNo: "",
    complaintDesc: "",
    notes: "",
  };

  const [formData, setFormData] = useState(initialForm);

  // MongoDB se data load karna
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/complaints");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error("Error fetching:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Form submit (Add naya ya Update purana)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingItem ? "PUT" : "POST";
      const payload = editingItem ? { ...formData, _id: editingItem._id } : formData;

      const res = await fetch("/api/complaints", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setEditingItem(null);
        setFormData(initialForm);
        setActiveTab("all");
        fetchComplaints();
      } else {
        alert("Error saving data. Please check MongoDB connection.");
      }
    } catch (err) {
      alert("Error saving data: " + err);
    }
  };

  // Delete complaint
  const handleDelete = async (id: string, srNo: string) => {
    if (confirm(`Are you sure you want to delete Receipt #${srNo}?`)) {
      try {
        const res = await fetch(`/api/complaints?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          fetchComplaints();
        }
      } catch (err) {
        alert("Error deleting: " + err);
      }
    }
  };

  // Edit mode on karna
  const startEdit = (item: any) => {
    setEditingItem(item);
    setFormData(item);
    setActiveTab("add");
  };

  // Google Calendar Sync
  const syncGoogleCalendar = (item: any) => {
    const title = encodeURIComponent(`TV Repair Visit: ${item.customerName} (#${item.srNo})`);
    const details = encodeURIComponent(
      `Issue: ${item.complaintDesc}\nTechnician: ${item.technicianName}\nNotes: ${item.notes}\nStatus: ${item.status}`
    );
    const location = encodeURIComponent(`${item.city} - Customer House`);
    const dateFormatted = item.customerVisitDate ? item.customerVisitDate.replace(/-/g, "") : new Date().toISOString().split("T")[0].replace(/-/g, "");
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dateFormatted}T100000Z/${dateFormatted}T120000Z`;
    window.open(url, "_blank");
  };

  // Calculate kitna din hua receipt bane
  const getDaysCount = (item: any) => {
    const createdDate = item.createdAt ? new Date(item.createdAt) : (item.customerVisitDate ? new Date(item.customerVisitDate) : new Date());
    const now = new Date();
    // Reset hours to calculate exact calendar days
    const d1 = new Date(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate());
    const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 0 ? 0 : diffDays;
  };

  // Check agar 3 din ya usse zyada pending hai (Highlight ke liye)
  const isOverdue3Days = (item: any) => {
    if (item.status === "Ready" || item.deliveryStatus === "Close") {
      return false; // Delivered wale ko alert nahi karenge
    }
    return getDaysCount(item) >= 3;
  };

  // EXPORT TO EXCEL
  const exportToExcel = () => {
    if (items.length === 0) {
      alert("No receipts to export!");
      return;
    }

    const headers = [
      "Sr No",
      "Customer Name",
      "Mobile",
      "City",
      "Brand",
      "Model",
      "Days Passed",
      "Priority",
      "Status",
      "Amount",
      "Visit Date",
      "Pick Up",
      "Pick Up Date",
      "Technician Approval",
      "Technician Name",
      "Workshop Status",
      "Delivery Status",
      "Reason",
      "Problem Description",
      "Notes",
      "Created Date"
    ];

    const rows = items.map((i) => [
      `"${i.srNo || ""}"`,
      `"${i.customerName || ""}"`,
      `"${i.customerMobile || ""}"`,
      `"${i.city || ""}"`,
      `"${i.brand || ""}"`,
      `"${i.modelNo || ""}"`,
      `"${getDaysCount(i)} days"`,
      `"${i.priority || ""}"`,
      `"${i.status || ""}"`,
      `"${i.amount || "0"}"`,
      `"${i.customerVisitDate || ""}"`,
      `"${i.isPickUp ? "Yes" : "No"}"`,
      `"${i.pickUpDate || ""}"`,
      `"${i.isApproval ? "Yes" : "No"}"`,
      `"${i.technicianName || ""}"`,
      `"${i.workshopStatus || ""}"`,
      `"${i.deliveryStatus || ""}"`,
      `"${(i.reason || "").replace(/"/g, '""')}"`,
      `"${(i.complaintDesc || "").replace(/"/g, '""')}"`,
      `"${(i.notes || "").replace(/"/g, '""')}"`,
      `"${i.createdAt ? new Date(i.createdAt).toLocaleDateString() : ""}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Kruti_Insurance_Receipts_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics calculation
  const metrics = {
    total: items.length,
    pending: items.filter((i) => i.status === "Pending").length,
    underRepair: items.filter((i) => i.status === "Under Repair" || i.workshopStatus === "In").length,
    delivered: items.filter((i) => i.status === "Ready" || i.deliveryStatus === "Close").length,
    overdue: items.filter((i) => isOverdue3Days(i)).length,
  };

  // Filter list
  const filtered = items.filter((i) => {
    const matchesQuery =
      (i.srNo || "").includes(search) ||
      (i.customerName || "").toLowerCase().includes(search.toLowerCase()) ||
      (i.customerMobile || "").includes(search);
    const matchesPriority = priorityFilter === "All" || i.priority === priorityFilter;
    const matchesStatus = statusFilter === "All" || i.status === statusFilter;
    const matchesCity = cityFilter === "All" || i.city === cityFilter;
    return matchesQuery && matchesPriority && matchesStatus && matchesCity;
  });

  return (
    <div className="min-h-screen bg-[#F7F7FA] text-slate-800 font-sans pb-12">
      {/* 1. Header (Brand Red Navbar - NO LOGOUT BUTTON) */}
      <header className="bg-[#D32F2F] text-white px-6 py-3 shadow-md flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <Tv className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wide leading-tight">Kruti Insurance & Electronics</h1>
            <p className="text-xs text-white/80 font-medium">Service Desk & Workflow Manager</p>
          </div>
        </div>

        {/* Navigation buttons + Export to Excel */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => { setActiveTab("dashboard"); setEditingItem(null); }}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
              activeTab === "dashboard" ? "bg-white text-[#D32F2F] shadow" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => { setActiveTab("add"); setEditingItem(null); setFormData(initialForm); }}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
              activeTab === "add" ? "bg-white text-[#D32F2F] shadow" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            + Add Receipt
          </button>
          <button
            onClick={() => { setActiveTab("all"); setEditingItem(null); }}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
              activeTab === "all" ? "bg-white text-[#D32F2F] shadow" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            All Receipts
          </button>

          {/* EXPORT TO EXCEL BUTTON */}
          <button
            onClick={exportToExcel}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md transition ml-2 border border-emerald-400"
            title="Download full list in Excel (.csv)"
          >
            <Download className="w-3.5 h-3.5" /> Export to Excel
          </button>
        </div>
      </header>

      {/* 2. Main Content Container */}
      <main className="max-w-6xl mx-auto px-4 mt-6">
        
        {/* Overdue Banner if 3+ days pending exist */}
        {metrics.overdue > 0 && activeTab !== "add" && (
          <div className="mb-4 bg-red-100 border-2 border-red-500 rounded-xl p-3 flex items-center justify-between shadow-sm animate-pulse">
            <div className="flex items-center gap-3">
              <div className="bg-red-600 text-white p-2 rounded-lg">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-red-900">
                  CRITICAL ALERT: {metrics.overdue} Receipt(s) pending for 3 or more days!
                </h4>
                <p className="text-xs text-red-800">Highlighted in bright red below. Please attend to them immediately.</p>
              </div>
            </div>
            <span className="bg-red-600 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase">
              Action Required
            </span>
          </div>
        )}

        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Dashboard</h2>
                <p className="text-xs text-slate-500">Live summary of all insurance claims and repairs</p>
              </div>
              <button
                onClick={() => { setActiveTab("add"); setEditingItem(null); setFormData(initialForm); }}
                className="bg-[#D32F2F] text-white text-xs font-bold px-4 py-2 rounded-lg shadow hover:bg-red-700 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add New Receipt
              </button>
            </div>

            {/* 4 Cards matching photo + Overdue Card */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#1E88E5] text-white p-5 rounded-xl shadow">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-100">Total Receipts</span>
                <p className="text-4xl font-black mt-2">{metrics.total}</p>
              </div>
              <div className="bg-[#FBC02D] text-white p-5 rounded-xl shadow">
                <span className="text-xs font-semibold uppercase tracking-wider text-yellow-100">Pending</span>
                <p className="text-4xl font-black mt-2">{metrics.pending}</p>
              </div>
              <div className="bg-[#00ACC1] text-white p-5 rounded-xl shadow">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-100">Under Repair</span>
                <p className="text-4xl font-black mt-2">{metrics.underRepair}</p>
              </div>
              <div className="bg-[#2E7D32] text-white p-5 rounded-xl shadow">
                <span className="text-xs font-semibold uppercase tracking-wider text-green-100">Delivered</span>
                <p className="text-4xl font-black mt-2">{metrics.delivered}</p>
              </div>
            </div>

            {/* Priority Section */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Organization by Priority</h3>
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-center">
                  <span className="text-xs font-bold text-red-700">Urgent</span>
                  <p className="text-2xl font-black text-red-800">{items.filter(i => i.priority === "Urgent").length}</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg text-center">
                  <span className="text-xs font-bold text-orange-700">High</span>
                  <p className="text-2xl font-black text-orange-800">{items.filter(i => i.priority === "High").length}</p>
                </div>
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-center">
                  <span className="text-xs font-bold text-green-700">Normal</span>
                  <p className="text-2xl font-black text-green-800">{items.filter(i => i.priority === "Normal").length}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
                  <span className="text-xs font-bold text-slate-700">Low</span>
                  <p className="text-2xl font-black text-slate-800">{items.filter(i => i.priority === "Low").length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ADD / EDIT RECEIPT FORM */}
        {(activeTab === "add" || editingItem) && (
          <form onSubmit={handleSave} className="bg-white rounded-xl shadow-md p-6 space-y-6 max-w-4xl mx-auto border border-slate-100">
            <div className="bg-[#D32F2F] text-white -mx-6 -mt-6 p-4 rounded-t-xl flex justify-between items-center">
              <h3 className="font-bold text-base">
                {editingItem ? `Update Receipt #${formData.srNo}` : "Add New Receipt"}
              </h3>
              {editingItem && (
                <button
                  type="button"
                  onClick={() => { setEditingItem(null); setActiveTab("all"); }}
                  className="text-xs bg-white/20 px-2.5 py-1 rounded hover:bg-white/30"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {/* Section 1: Customer & Visit Details */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#D32F2F] mb-3">1. Customer & Visit Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Sr No *</label>
                  <input
                    required
                    placeholder="e.g. 64756"
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:border-red-500 outline-none"
                    value={formData.srNo}
                    onChange={(e) => setFormData({ ...formData, srNo: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Customer Date for Visit</label>
                  <input
                    type="date"
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:border-red-500 outline-none"
                    value={formData.customerVisitDate}
                    onChange={(e) => setFormData({ ...formData, customerVisitDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Customer Name *</label>
                  <input
                    required
                    placeholder="e.g. VINAY BHAI PARDI"
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:border-red-500 outline-none"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Customer Mobile *</label>
                  <input
                    required
                    placeholder="e.g. 9909474429"
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:border-red-500 outline-none"
                    value={formData.customerMobile}
                    onChange={(e) => setFormData({ ...formData, customerMobile: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">City *</label>
                  <select
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:border-red-500 outline-none"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  >
                    <option value="Vapi">Vapi</option>
                    <option value="Surat">Surat</option>
                    <option value="Ahmedabad">Ahmedabad</option>
                    <option value="CH">CH (Customer House)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Technician Name</label>
                  <input
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:border-red-500 outline-none"
                    value={formData.technicianName}
                    onChange={(e) => setFormData({ ...formData, technicianName: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Pickup & Approval Verification */}
            <div className="border-t pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#D32F2F] mb-3">2. Pickup & Approval</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700">Pick up TV?</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, isPickUp: true, pickUpDate: new Date().toISOString().split("T")[0] })}
                        className={`px-4 py-1 rounded text-xs font-bold ${formData.isPickUp ? "bg-green-600 text-white" : "bg-white border"}`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, isPickUp: false, pickUpDate: "" })}
                        className={`px-4 py-1 rounded text-xs font-bold ${!formData.isPickUp ? "bg-slate-700 text-white" : "bg-white border"}`}
                      >
                        No
                      </button>
                    </div>
                  </div>
                  {formData.isPickUp && (
                    <input
                      type="date"
                      className="border border-slate-300 rounded p-1.5 text-xs w-full mt-2"
                      value={formData.pickUpDate}
                      onChange={(e) => setFormData({ ...formData, pickUpDate: e.target.value })}
                    />
                  )}
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">Technician Approval?</span>
                    <span className="text-[11px] text-slate-500">Authorized to intake TV</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isApproval: true })}
                      className={`px-4 py-1 rounded text-xs font-bold ${formData.isApproval ? "bg-blue-600 text-white" : "bg-white border"}`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isApproval: false })}
                      className={`px-4 py-1 rounded text-xs font-bold ${!formData.isApproval ? "bg-slate-700 text-white" : "bg-white border"}`}
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: TV Details & Task Description */}
            <div className="border-t pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#D32F2F] mb-3">3. TV & Repair Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Brand</label>
                  <input
                    placeholder="e.g. SONY, LG, SAMSUNG, MICROMAX"
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:border-red-500 outline-none"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Model / Size</label>
                  <input
                    placeholder="e.g. 43 inch, 55 inch"
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:border-red-500 outline-none"
                    value={formData.modelNo}
                    onChange={(e) => setFormData({ ...formData, modelNo: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Priority Level</label>
                  <select
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:border-red-500 outline-none"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Normal">Normal</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="mt-3">
                <label className="text-xs font-semibold text-slate-700">Task / Problem Description</label>
                <input
                  placeholder="e.g. Sound OK but display dark, vertical lines on screen"
                  className="w-full border border-slate-300 rounded-md p-2 text-sm focus:border-red-500 outline-none"
                  value={formData.complaintDesc}
                  onChange={(e) => setFormData({ ...formData, complaintDesc: e.target.value })}
                />
              </div>
            </div>

            {/* Section 4: Workshop & Delivery Status */}
            <div className="border-t pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#D32F2F] mb-3">4. Workshop, Status & Financials</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Repair Status</label>
                  <select
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:border-red-500 outline-none"
                    value={formData.status}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      setFormData({
                        ...formData,
                        status: newStatus,
                        readyForDelivery: newStatus === "Ready",
                        deliveryReadyDate: newStatus === "Ready" ? new Date().toISOString().split("T")[0] : formData.deliveryReadyDate,
                      });
                    }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Under Repair">Under Repair</option>
                    <option value="Not Ready">Not Ready</option>
                    <option value="Ready">Ready</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Workshop TV (In/Out)</label>
                  <select
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:border-red-500 outline-none"
                    value={formData.workshopStatus}
                    onChange={(e) => setFormData({ ...formData, workshopStatus: e.target.value })}
                  >
                    <option value="None">None</option>
                    <option value="In">In</option>
                    <option value="Out">Out</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Workshop In Date</label>
                  <input
                    type="date"
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:border-red-500 outline-none"
                    value={formData.workshopInDate}
                    onChange={(e) => setFormData({ ...formData, workshopInDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Workshop Out Date</label>
                  <input
                    type="date"
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:border-red-500 outline-none"
                    value={formData.workshopOutDate}
                    onChange={(e) => setFormData({ ...formData, workshopOutDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Amount (₹)</label>
                  <input
                    placeholder="e.g. 1500"
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:border-red-500 outline-none"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Delivery Status</label>
                  <select
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:border-red-500 outline-none"
                    value={formData.deliveryStatus}
                    onChange={(e) => setFormData({ ...formData, deliveryStatus: e.target.value })}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Close">Close</option>
                    <option value="Unsold">Unsold</option>
                    <option value="BER">BER (Beyond Repair)</option>
                    <option value="Reject">Reject</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Reason / Diagnosis</label>
                  <input
                    placeholder="e.g. Power supply board replaced"
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:border-red-500 outline-none"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="text-xs font-semibold text-slate-700">Notes Section (Additional Details)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. SERVICE OK, warranty approved by insurance..."
                  className="w-full border border-slate-300 rounded-md p-2 text-sm focus:border-red-500 outline-none"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => { setEditingItem(null); setActiveTab("all"); }}
                className="px-5 py-2 border rounded-md text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#D32F2F] text-white rounded-md text-xs font-bold hover:bg-red-700 shadow"
              >
                {editingItem ? "Update Receipt" : "Save Receipt"}
              </button>
            </div>
          </form>
        )}

        {/* ALL RECEIPTS TABLE VIEW */}
        {activeTab === "all" && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black text-[#D32F2F]">All Receipts</h2>
                <p className="text-xs text-slate-500">
                  Total Receipts: {items.length} (Showing {filtered.length})
                  {metrics.overdue > 0 && (
                    <span className="ml-2 font-bold text-red-600 bg-red-100 px-2.5 py-0.5 rounded-full text-[11px] border border-red-300">
                      ⚠️ {metrics.overdue} Overdue (&gt;=3 Days)
                    </span>
                  )}
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search Serial No / Customer / Mobile..."
                  className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs w-72 focus:outline-none focus:border-red-500 shadow-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <select
                className="border p-1.5 rounded-md bg-white text-slate-700"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="All">All Priority</option>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Normal">Normal</option>
                <option value="Low">Low</option>
              </select>

              <select
                className="border p-1.5 rounded-md bg-white text-slate-700"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Under Repair">Under Repair</option>
                <option value="Ready">Ready</option>
                <option value="Not Ready">Not Ready</option>
              </select>

              <select
                className="border p-1.5 rounded-md bg-white text-slate-700"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              >
                <option value="All">All Cities</option>
                <option value="Vapi">Vapi</option>
                <option value="Surat">Surat</option>
                <option value="Ahmedabad">Ahmedabad</option>
                <option value="CH">CH</option>
              </select>
            </div>

            {/* Table with DAYS PASSED COLUMN & RED HIGHLIGHT FOR >= 3 DAYS */}
            <div className="bg-white rounded-xl shadow border border-slate-200 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Sr No</th>
                    <th className="p-3">Customer Name</th>
                    <th className="p-3">Mobile</th>
                    <th className="p-3">TV Brand</th>
                    <th className="p-3 text-center">Days Passed</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Remarks / Notes</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={11} className="p-8 text-center text-slate-400 font-semibold">
                        Loading complaints from MongoDB Atlas...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="p-8 text-center text-slate-400 font-semibold">
                        No receipts found. Click "+ Add Receipt" to create one.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item, idx) => {
                      const days = getDaysCount(item);
                      const overdue = isOverdue3Days(item);

                      return (
                        <tr
                          key={item._id}
                          className={`transition ${
                            overdue
                              ? "bg-red-100 hover:bg-red-200/90 font-medium text-red-950 border-l-4 border-l-red-600"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <td className="p-3">
                            {overdue ? (
                              <span className="flex items-center gap-1 font-bold text-red-700">
                                <AlertTriangle className="w-3.5 h-3.5" /> {idx + 1}
                              </span>
                            ) : (
                              <span className="text-slate-400">{idx + 1}</span>
                            )}
                          </td>
                          <td className="p-3 font-bold text-[#D32F2F]">
                            {item.srNo}
                          </td>
                          <td className="p-3 font-semibold text-slate-900">{item.customerName}</td>
                          <td className="p-3 text-slate-700">{item.customerMobile}</td>
                          <td className="p-3">{item.brand || "TV"} {item.modelNo}</td>
                          
                          {/* KITNE DIN HUE COLUMN */}
                          <td className="p-3 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide inline-flex items-center gap-1 ${
                                overdue
                                  ? "bg-red-600 text-white shadow-sm animate-pulse"
                                  : days === 0
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-slate-200 text-slate-800"
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              {days === 0 ? "Today" : `${days} Day${days > 1 ? "s" : ""}`}
                            </span>
                          </td>

                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.priority === "Urgent"
                                  ? "bg-red-200 text-red-800"
                                  : item.priority === "High"
                                  ? "bg-orange-200 text-orange-800"
                                  : item.priority === "Low"
                                  ? "bg-slate-200 text-slate-800"
                                  : "bg-green-200 text-green-800"
                              }`}
                            >
                              {item.priority}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.status === "Ready"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : item.status === "Under Repair"
                                  ? "bg-cyan-100 text-cyan-800"
                                  : item.status === "Not Ready"
                                  ? "bg-red-200 text-red-900"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="p-3 font-bold">₹{item.amount || "0"}</td>
                          <td className="p-3 text-slate-700 max-w-xs truncate">{item.notes || item.reason || "-"}</td>
                          
                          {/* STRICTLY ACTIONS: CALENDAR, UPDATE, DELETE */}
                          <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => syncGoogleCalendar(item)}
                              title="Sync to Google Calendar"
                              className="px-2 py-1 bg-white text-blue-700 border border-blue-300 rounded text-[11px] font-semibold hover:bg-blue-50 shadow-sm"
                            >
                              Calendar
                            </button>
                            <button
                              onClick={() => startEdit(item)}
                              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-[11px] font-bold shadow-sm"
                            >
                              Update
                            </button>
                            <button
                              onClick={() => handleDelete(item._id, item.srNo)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-bold shadow-sm"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}