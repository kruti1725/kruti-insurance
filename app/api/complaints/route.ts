import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Complaint from "@/models/Complaint";

// 1. Saare Complaints fetch karne ke liye (GET)
export async function GET() {
  try {
    await connectToDatabase();
    const list = await Complaint.find().sort({ createdAt: -1 });
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. Naya Complaint add karne ke liye (POST)
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const created = await Complaint.create(body);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 3. Complaint Update / Edit karne ke liye (PUT)
export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const updated = await Complaint.findByIdAndUpdate(body._id, body, { new: true });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 4. Complaint Delete karne ke liye (DELETE)
export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await Complaint.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}