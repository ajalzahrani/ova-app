import { NextRequest, NextResponse } from "next/server";
import {
  getOccurrenceSummaryReport,
  getReportStatistics,
  ReportFilters,
} from "@/actions/reports";

export async function POST(request: NextRequest) {
  try {
    const filters: ReportFilters = await request.json();

    // Convert date strings to Date objects if present
    if (filters.dateFrom && typeof filters.dateFrom === "string") {
      filters.dateFrom = new Date(filters.dateFrom);
    }
    if (filters.dateTo && typeof filters.dateTo === "string") {
      filters.dateTo = new Date(filters.dateTo);
    }

    const [occurrences, statistics] = await Promise.all([
      getOccurrenceSummaryReport(filters),
      getReportStatistics(filters),
    ]);

    return NextResponse.json({
      occurrences,
      statistics,
    });
  } catch (error) {
    console.error("Error fetching report data:", error);
    return NextResponse.json(
      { error: "Failed to fetch report data" },
      { status: 500 }
    );
  }
}
