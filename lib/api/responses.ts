import { NextResponse } from "next/server";

/**
 * Standard success response
 */
export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(
    { success: true, data },
    { status }
  );
}

/**
 * Standard error response
 */
export function errorResponse(
  error: string | Error,
  status: number = 400
) {
  const errorMessage = error instanceof Error ? error.message : error;
  
  return NextResponse.json(
    { success: false, error: errorMessage },
    { status }
  );
}

/**
 * Internal server error response
 */
export function serverErrorResponse(error: unknown) {
  const errorMessage =
    error instanceof Error ? error.message : "Internal server error";
  
  console.error("API Error:", error);
  
  return NextResponse.json(
    { success: false, error: errorMessage },
    { status: 500 }
  );
}

