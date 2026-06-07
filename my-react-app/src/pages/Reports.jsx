import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  BarChart3,
  TrendingUp,
  ShoppingCart,
  PackagePlus,
  RefreshCw,
  Calendar,
  AlertCircle,
  Download,
  Tags,
  Layers,
  Clock,
  Activity,
  FileSpreadsheet,
  ArrowUpRight,
  Printer,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000";

const getTodayDateInput = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDateOnly = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString();
};

const formatDateTime = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleString();
};

export default function Reports() {
  const [reportMode, setReportMode] = useState("daily");
  const [customStartDate, setCustomStartDate] = useState(getTodayDateInput());
  const [customEndDate, setCustomEndDate] = useState(getTodayDateInput());

  const [reportRange, setReportRange] = useState({
    mode: "daily",
    label: "Today's Report",
    startDate: "",
    endDate: "",
  });

  const [liveReport, setLiveReport] = useState({
    revenue: 0,
    itemsSold: 0,
    itemsAdded: 0,
    breakdown: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const breakdown = useMemo(() => {
    return Array.isArray(liveReport?.breakdown) ? liveReport.breakdown : [];
  }, [liveReport]);

  const bestProduct = useMemo(() => {
    if (breakdown.length === 0) return null;

    return breakdown.reduce((best, item) => {
      const currentRevenue = Number(item?.revenue || 0);
      const bestRevenue = Number(best?.revenue || 0);

      return currentRevenue > bestRevenue ? item : best;
    }, breakdown[0]);
  }, [breakdown]);

  const averageItemRevenue = useMemo(() => {
    const itemsSold = Number(liveReport?.itemsSold || 0);
    const revenue = Number(liveReport?.revenue || 0);

    if (itemsSold <= 0) return 0;

    return revenue / itemsSold;
  }, [liveReport]);

  const fetchLiveDatabaseReport = async ({
    mode = "daily",
    startDate = customStartDate,
    endDate = customEndDate,
  } = {}) => {
    if (mode === "custom") {
      if (!startDate || !endDate) {
        toast.error("Please select both From Date and To Date.");
        return;
      }

      const from = new Date(startDate);
      const to = new Date(endDate);

      if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
        toast.error("Invalid date selected.");
        return;
      }

      if (to < from) {
        toast.error("To Date must be after From Date.");
        return;
      }
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      let url = `${API_BASE_URL}/api/admin/daily-report?timeframe=${mode}`;

      if (mode === "custom") {
        url = `${API_BASE_URL}/api/admin/daily-report?startDate=${encodeURIComponent(
          startDate
        )}&endDate=${encodeURIComponent(endDate)}`;
      }

      const response = await axios.get(url);

      if (response.data?.success) {
        setLiveReport(
          response.data.metrics || {
            revenue: 0,
            itemsSold: 0,
            itemsAdded: 0,
            breakdown: [],
          }
        );

        setReportRange(
          response.data.range || {
            mode,
            label: mode === "custom" ? "Custom Date Range Report" : mode,
            startDate,
            endDate,
          }
        );

        setReportMode(mode);
      }
    } catch (err) {
      console.error("Failed to read report API:", err);

      setErrorMessage(
        err.response?.data?.error || "Could not connect to database records cluster."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveDatabaseReport({ mode: "daily" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getTimeframeLabel = () => {
    if (reportMode === "custom") return "Custom Date Range Report";
    if (reportMode === "daily") return "Today's Operational Balance";
    if (reportMode === "weekly") return "Current Week's Operational Balance";

    return "Current Month's Operational Balance";
  };

  const getTimeframeDescription = () => {
    if (reportMode === "custom") {
      return `Showing database records from ${formatDateOnly(
        reportRange.startDate
      )} to ${formatDateOnly(reportRange.endDate)}.`;
    }

    if (reportMode === "daily") {
      return "Live report for orders, sold quantities, revenue, and products added today.";
    }

    if (reportMode === "weekly") {
      return "Live report covering the selected weekly bookstore activity.";
    }

    return "Live report covering the selected monthly bookstore activity.";
  };

  const escapeCsvValue = (value) => {
    if (value === null || value === undefined) return "";

    const stringValue = String(value);

    if (
      stringValue.includes(",") ||
      stringValue.includes('"') ||
      stringValue.includes("\n")
    ) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  };

  const handleExportCsv = () => {
    try {
      setIsExporting(true);

      const generatedAt = new Date();

      const summaryRows = [
        ["PatraPatrika Center Store Performance Ledger"],
        ["Report Mode", reportMode.toUpperCase()],
        ["Report Label", reportRange?.label || getTimeframeLabel()],
        ["From Date", formatDateTime(reportRange?.startDate)],
        ["To Date", formatDateTime(reportRange?.endDate)],
        ["Generated At", generatedAt.toLocaleString()],
        [],
        ["Summary"],
        ["Interval Revenue", `NPR ${Number(liveReport?.revenue || 0)}`],
        ["Total Items Sold", Number(liveReport?.itemsSold || 0)],
        ["New Items Added", Number(liveReport?.itemsAdded || 0)],
        ["Average Item Revenue", Number(averageItemRevenue.toFixed(2))],
        [],
        [
          "Item Product Title",
          "Unit Price",
          "Total Quantities Dispatched",
          "Revenue Yielded",
        ],
      ];

      const itemRows = breakdown.map((item) => [
        item?.name || "Unknown Product",
        Number(item?.price || 0),
        Number(item?.unitsSold || 0),
        Number(item?.revenue || 0),
      ]);

      const csvRows = [...summaryRows, ...itemRows];

      const csvContent = csvRows
        .map((row) => row.map(escapeCsvValue).join(","))
        .join("\n");

      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });

      const fileDate = generatedAt
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");

      const fileName = `store-report-${reportMode}-${fileDate}.csv`;

      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      toast.success("CSV report downloaded successfully");
    } catch (error) {
      console.error("CSV export error:", error);
      toast.error("Failed to export CSV report");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintReport = () => {
    try {
      setIsPrinting(true);

      const printWindow = window.open("", "_blank");

      if (!printWindow) {
        toast.error("Popup blocked. Please allow popup to print report.");
        return;
      }

      const rowsHtml =
        breakdown.length === 0
          ? `<tr><td colspan="4" style="text-align:center;padding:20px;">No product breakdown found.</td></tr>`
          : breakdown
              .map(
                (item, index) => `
                  <tr>
                    <td>${index + 1}. ${item?.name || "Unknown Product"}</td>
                    <td style="text-align:right;">NPR ${Number(
                      item?.price || 0
                    ).toLocaleString()}</td>
                    <td style="text-align:center;">${Number(
                      item?.unitsSold || 0
                    )}</td>
                    <td style="text-align:right;">NPR ${Number(
                      item?.revenue || 0
                    ).toLocaleString()}</td>
                  </tr>
                `
              )
              .join("");

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Store Report</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                color: #111827;
                padding: 28px;
              }

              .header {
                border-bottom: 2px solid #111827;
                padding-bottom: 16px;
                margin-bottom: 22px;
              }

              h1 {
                margin: 0;
                font-size: 26px;
              }

              .muted {
                color: #6b7280;
                font-size: 13px;
              }

              .summary {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 12px;
                margin: 20px 0;
              }

              .card {
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 14px;
              }

              .card-label {
                color: #6b7280;
                font-size: 11px;
                text-transform: uppercase;
                font-weight: 700;
                letter-spacing: 0.08em;
              }

              .card-value {
                margin-top: 6px;
                font-size: 20px;
                font-weight: 900;
              }

              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 18px;
              }

              th,
              td {
                border: 1px solid #e5e7eb;
                padding: 10px;
                font-size: 13px;
              }

              th {
                background: #f3f4f6;
                text-align: left;
                text-transform: uppercase;
                font-size: 11px;
                letter-spacing: 0.08em;
              }

              .footer {
                margin-top: 28px;
                font-size: 12px;
                color: #6b7280;
              }

              @media print {
                button {
                  display: none;
                }

                body {
                  padding: 0;
                }
              }
            </style>
          </head>

          <body>
            <div class="header">
              <h1>PatraPatrika Center - Store Performance Report</h1>
              <p class="muted">${reportRange?.label || getTimeframeLabel()}</p>
              <p class="muted">From: ${formatDateTime(
                reportRange?.startDate
              )} | To: ${formatDateTime(reportRange?.endDate)}</p>
              <p class="muted">Generated At: ${new Date().toLocaleString()}</p>
            </div>

            <div class="summary">
              <div class="card">
                <div class="card-label">Revenue</div>
                <div class="card-value">NPR ${Number(
                  liveReport.revenue || 0
                ).toLocaleString()}</div>
              </div>

              <div class="card">
                <div class="card-label">Items Sold</div>
                <div class="card-value">${Number(
                  liveReport.itemsSold || 0
                )}</div>
              </div>

              <div class="card">
                <div class="card-label">Items Added</div>
                <div class="card-value">${Number(
                  liveReport.itemsAdded || 0
                )}</div>
              </div>

              <div class="card">
                <div class="card-label">Avg. Item Revenue</div>
                <div class="card-value">NPR ${Number(
                  averageItemRevenue || 0
                ).toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}</div>
              </div>
            </div>

            <h2>Itemized Performance Breakdown</h2>

            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th style="text-align:right;">Unit Price</th>
                  <th style="text-align:center;">Quantity</th>
                  <th style="text-align:right;">Revenue</th>
                </tr>
              </thead>

              <tbody>
                ${rowsHtml}
              </tbody>
            </table>

            <div class="footer">
              This report is generated from live database records.
            </div>

            <script>
              window.onload = function () {
                window.print();
              };
            </script>
          </body>
        </html>
      `);

      printWindow.document.close();

      toast.success("Print report opened.");
    } catch (error) {
      console.error("Print report error:", error);
      toast.error("Failed to print report");
    } finally {
      setIsPrinting(false);
    }
  };

  const metricCards = [
    {
      title: "Interval Revenue",
      value: `NPR ${Number(liveReport.revenue || 0).toLocaleString()}`,
      subtitle: "Revenue inside selected date range",
      icon: TrendingUp,
      cardClass: "from-emerald-50 to-green-50 border-emerald-100",
      iconClass: "bg-emerald-100 text-emerald-600",
      valueClass: "text-emerald-700",
    },
    {
      title: "Total Items Sold",
      value: `${Number(liveReport.itemsSold || 0)} Units`,
      subtitle: "Total dispatched product quantity",
      icon: ShoppingCart,
      cardClass: "from-indigo-50 to-blue-50 border-indigo-100",
      iconClass: "bg-indigo-100 text-indigo-600",
      valueClass: "text-indigo-700",
    },
    {
      title: "New Items Added",
      value: `${Number(liveReport.itemsAdded || 0)} Products`,
      subtitle: "New catalog entries in date range",
      icon: PackagePlus,
      cardClass: "from-orange-50 to-amber-50 border-orange-100",
      iconClass: "bg-orange-100 text-orange-600",
      valueClass: "text-orange-700",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 sm:p-8 shadow-xl shadow-slate-200">
        <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-amber-300 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-4">
              <BarChart3 className="w-4 h-4" />
              Store Performance Ledger
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white">
              Reports & Analytics
            </h1>

            <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl">
              View report by daily, weekly, monthly, or any custom calendar date range.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => fetchLiveDatabaseReport({ mode: reportMode })}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-amber-50 disabled:bg-white/70 text-slate-950 px-5 py-3 rounded-2xl text-sm font-black transition-all shadow-lg"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              {isLoading ? "Loading..." : "Sync Live Data"}
            </button>

            <button
              type="button"
              onClick={handlePrintReport}
              disabled={isPrinting || isLoading}
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 disabled:bg-white/5 text-white border border-white/10 px-5 py-3 rounded-2xl text-sm font-black transition-all"
            >
              <Printer className="w-4 h-4" />
              {isPrinting ? "Printing..." : "Print Report"}
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              disabled={isExporting || isLoading}
              className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-300 text-slate-950 px-5 py-3 rounded-2xl text-sm font-black transition-all shadow-lg"
            >
              <Download
                className={`w-4 h-4 ${isExporting ? "animate-bounce" : ""}`}
              />
              {isExporting ? "Exporting..." : "Export CSV"}
            </button>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-amber-50 text-amber-800 border border-amber-200 p-5 rounded-[2rem] text-sm font-bold flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />

          <div>
            <p className="font-black">Report Connection Warning</p>
            <p className="text-xs mt-1">{errorMessage}</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm p-5 sm:p-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-3">
              <Calendar className="w-4 h-4" />
              {getTimeframeLabel()}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-950">
              Live Operational Balance
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              {getTimeframeDescription()}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
            {["daily", "weekly", "monthly"].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => fetchLiveDatabaseReport({ mode })}
                disabled={isLoading}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  reportMode === mode
                    ? "bg-white text-amber-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-end bg-slate-50 border border-slate-100 rounded-[2rem] p-4">
          <div className="lg:col-span-3">
            <label className="block text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 mb-2">
              From Date
            </label>

            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-400"
            />
          </div>

          <div className="lg:col-span-3">
            <label className="block text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 mb-2">
              To Date
            </label>

            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-400"
            />
          </div>

          <div className="lg:col-span-3">
            <button
              type="button"
              onClick={() =>
                fetchLiveDatabaseReport({
                  mode: "custom",
                  startDate: customStartDate,
                  endDate: customEndDate,
                })
              }
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-amber-600 disabled:bg-slate-400 text-white px-5 py-3 rounded-2xl text-sm font-black transition-all"
            >
              <Calendar className="w-4 h-4" />
              Generate Custom Report
            </button>
          </div>

          <div className="lg:col-span-3">
            <button
              type="button"
              onClick={handlePrintReport}
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-5 py-3 rounded-2xl text-sm font-black transition-all"
            >
              <Printer className="w-4 h-4" />
              Print Current Report
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white border border-gray-100 rounded-[2rem] p-12 flex items-center justify-center shadow-sm">
          <div className="w-9 h-9 border-4 border-amber-100 border-t-amber-600 rounded-full animate-spin" />

          <p className="ml-3 text-sm font-black text-gray-500">
            Loading live report data...
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {metricCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className={`relative overflow-hidden bg-gradient-to-br ${card.cardClass} border rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
                >
                  <div className="absolute -top-14 -right-14 w-36 h-36 rounded-full bg-white/60 blur-2xl" />

                  <div className="relative flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black text-gray-500 uppercase tracking-widest">
                        {card.title}
                      </p>

                      <h3
                        className={`text-2xl sm:text-3xl font-black mt-2 ${card.valueClass}`}
                      >
                        {card.value}
                      </h3>

                      <p className="text-xs font-bold text-gray-500 mt-2">
                        {card.subtitle}
                      </p>
                    </div>

                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.iconClass}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Average Item Revenue
                  </p>

                  <h3 className="text-2xl font-black text-slate-950 mt-2">
                    NPR{" "}
                    {Number(averageItemRevenue || 0).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </h3>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Activity className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Item Rows
                  </p>

                  <h3 className="text-2xl font-black text-slate-950 mt-2">
                    {breakdown.length}
                  </h3>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Layers className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-slate-950 text-white rounded-[2rem] p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Top Product
                  </p>

                  <h3 className="text-lg font-black mt-2 truncate">
                    {bestProduct?.name || "No product yet"}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1">
                    Revenue: NPR{" "}
                    {Number(bestProduct?.revenue || 0).toLocaleString()}
                  </p>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-white/10 text-amber-300 flex items-center justify-center shrink-0">
                  <ArrowUpRight className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-3">
                  <FileSpreadsheet className="w-4 h-4" />
                  Live Count
                </div>

                <h3 className="text-xl font-black text-slate-950">
                  Itemized Performance Breakdown
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Product-wise quantity and revenue generated inside selected date range.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handlePrintReport}
                  disabled={isPrinting}
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-5 py-3 rounded-2xl text-sm font-black transition-all"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>

                <button
                  type="button"
                  onClick={handleExportCsv}
                  disabled={isExporting}
                  className="inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-amber-600 disabled:bg-slate-400 text-white px-5 py-3 rounded-2xl text-sm font-black transition-all"
                >
                  <Download className="w-4 h-4" />
                  {isExporting ? "Exporting..." : "Download CSV"}
                </button>
              </div>
            </div>

            {breakdown.length === 0 ? (
              <div className="p-12 bg-slate-50 text-center">
                <Tags className="w-10 h-10 text-gray-300 mx-auto mb-3" />

                <p className="text-sm font-black text-gray-500">
                  No units sold or catalog changes logged within this date range.
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  Select another date range or sync live data to check latest records.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 bg-slate-50 text-gray-400">
                      <th className="py-4 px-5 text-xs font-black uppercase tracking-widest">
                        Product Title
                      </th>

                      <th className="py-4 px-5 text-center text-xs font-black uppercase tracking-widest">
                        Unit Price
                      </th>

                      <th className="py-4 px-5 text-center text-xs font-black uppercase tracking-widest">
                        Quantity
                      </th>

                      <th className="py-4 px-5 text-right text-xs font-black uppercase tracking-widest">
                        Revenue
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {breakdown.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-50 text-gray-700 hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black shrink-0">
                              {index + 1}
                            </div>

                            <div>
                              <p className="font-black text-gray-950">
                                {item.name || "Unknown Product"}
                              </p>

                              <p className="text-xs text-gray-400 mt-0.5">
                                Catalog item performance
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-5 text-center font-bold text-gray-500">
                          NPR {Number(item.price || 0).toLocaleString()}
                        </td>

                        <td className="py-4 px-5 text-center">
                          <span className="inline-flex items-center justify-center bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-black">
                            {Number(item.unitsSold || 0)} Units
                          </span>
                        </td>

                        <td className="py-4 px-5 text-right font-black text-emerald-600">
                          NPR {Number(item.revenue || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-100 rounded-[2rem] p-5 shadow-sm">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <Clock className="w-5 h-5 text-amber-500" />

              <p>
                Report mode:{" "}
                <span className="font-black text-slate-950">
                  {reportMode.toUpperCase()}
                </span>{" "}
                • From{" "}
                <span className="font-black text-slate-950">
                  {formatDateOnly(reportRange.startDate)}
                </span>{" "}
                to{" "}
                <span className="font-black text-slate-950">
                  {formatDateOnly(reportRange.endDate)}
                </span>
                .
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}