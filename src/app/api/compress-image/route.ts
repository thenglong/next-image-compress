import { NextRequest, NextResponse } from "next/server";
import { compressImage } from "@/service/image-compressor";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const result = await compressImage(formData);
  return NextResponse.json(result);
}
