import React, { useState, useEffect } from "react";
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
} from "lucide-react";

export default function Reports() {
  const [reportTimeframe, setReportTimeframe] = useState("daily");
  const [liveReport, setLiveReport] = useState({
    revenue: 0,
    itemsSold: 0,
    itemsAdded: 0,
    breakdown: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchLiveDatabaseReport = async (timeframe) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.get(
        `http://localhost:5000/api/admin/daily-report?timeframe=${timeframe}`
      );

      if (response.data?.success) {
        setLiveReport(response.data.metrics);
      }
    } catch (err) {
      console.error("Failed to read report API:", err);
      setErrorMessage("Could not connect to database records cluster.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveDatabaseReport(reportTimeframe);
  }, [reportTimeframe]);

  const getTimeframeLabel = () => {
    if (reportTimeframe === "daily") return "Today's Operational Balance";

    if (reportTimeframe === "weekly") {
      return "Current Week's Operational Balance";
    }

    return "Current Month's Operational Balance";
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

      const breakdown = Array.isArray(liveReport?.breakdown)
        ? liveReport.breakdown
        : [];

      const generatedAt = new Date();

      const summaryRows = [
        ["PatraPatrika Center Store Performance Ledger"],
        [`Timeframe`, reportTimeframe.toUpperCase()],
        [`Generated At`, generatedAt.toLocaleString()],
        [],
        ["Summary"],
        ["Interval Revenue", `NPR ${Number(liveReport?.revenue || 0)}`],
        ["Total Items Sold", Number(liveReport?.itemsSold || 0)],
        ["New Items Added", Number(liveReport?.itemsAdded || 0)],
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

      const fileName = `store-report-${reportTimeframe}-${fileDate}.csv`;

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="text-amber-600 w-6 h-6" />
            Store Performance Ledger
          </h2>

          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
            <Calendar size={14} className="text-amber-600" />
            Granular overview covering all bookstore catalog items.
          </p>
        </div>

        <button
          onClick={() => fetchLiveDatabaseReport(reportTimeframe)}
          disabled={isLoading}
          className="flex items-center gap-2 bg-gray-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-amber-600 transition-all shadow-sm cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          {isLoading ? "Recalculating..." : "Sync Live Data"}
        </button>
      </div>

      {errorMessage && (
        <div className="bg-amber-50 text-amber-800 border border-amber-200 p-4 rounded-xl text-xs font-medium flex items-center gap-2">
          <AlertCircle size={16} className="text-amber-600" />
          {errorMessage}
        </div>
      )}

      <div className="space-y-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              {getTimeframeLabel()}
            </h3>

            <p className="text-xs text-gray-500 mt-0.5">
              Live totals for books, stationeries, and all user items.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex bg-gray-100 p-1 rounded-lg text-xs font-semibold space-x-1">
              <button
                onClick={() => setReportTimeframe("daily")}
                className={`px-3 py-2 rounded-md transition-all cursor-pointer ${
                  reportTimeframe === "daily"
                    ? "bg-white text-amber-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Daily
              </button>

              <button
                onClick={() => setReportTimeframe("weekly")}
                className={`px-3 py-2 rounded-md transition-all cursor-pointer ${
                  reportTimeframe === "weekly"
                    ? "bg-white text-amber-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Weekly
              </button>

              <button
                onClick={() => setReportTimeframe("monthly")}
                className={`px-3 py-2 rounded-md transition-all cursor-pointer ${
                  reportTimeframe === "monthly"
                    ? "bg-white text-amber-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Monthly
              </button>
            </div>

            <button
              type="button"
              onClick={handleExportCsv}
              disabled={isExporting}
              className="flex items-center gap-1.5 bg-amber-600 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-amber-700 transition-colors shadow-sm ml-auto cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Download size={14} />
              {isExporting ? "Exporting..." : "Export CSV"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Interval Revenue
              </p>

              <h4 className="text-2xl font-black text-gray-900">
                NPR {Number(liveReport.revenue || 0).toLocaleString()}
              </h4>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <TrendingUp size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Total Items Sold
              </p>

              <h4 className="text-2xl font-black text-gray-900">
                {Number(liveReport.itemsSold || 0)} Units
              </h4>
            </div>

            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
              <ShoppingCart size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                New Items Added
              </p>

              <h4 className="text-2xl font-black text-gray-900">
                {Number(liveReport.itemsAdded || 0)} Products
              </h4>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <PackagePlus size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={14} className="text-amber-500" />
              Itemized Performance Breakdown (All Catalog Products)
            </h4>

            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 font-bold rounded-md">
              Live Count
            </span>
          </div>

          {!liveReport?.breakdown || liveReport.breakdown.length === 0 ? (
            <div className="p-8 bg-gray-50 rounded-xl text-center border border-dashed border-gray-200">
              <Tags className="w-8 h-8 text-gray-300 mx-auto mb-2" />

              <p className="text-xs font-semibold text-gray-400">
                No units sold or catalog changes logged within this timeframe
                window.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-medium bg-gray-50/50">
                    <th className="py-2.5 px-3">Item Product Title</th>
                    <th className="py-2.5 px-3 text-center">Unit Price</th>
                    <th className="py-2.5 px-3 text-center">
                      Total Quantities Dispatched
                    </th>
                    <th className="py-2.5 px-3 text-right">
                      Revenue Yielded
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {(liveReport?.breakdown || []).map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-50 text-gray-700 font-medium hover:bg-gray-50/40"
                    >
                      <td className="py-3 px-3 text-gray-900 font-bold">
                        {item.name}
                      </td>

                      <td className="py-3 px-3 text-center text-gray-500">
                        NPR {Number(item.price || 0).toLocaleString()}
                      </td>

                      <td className="py-3 px-3 text-center text-amber-600 font-extrabold">
                        {Number(item.unitsSold || 0)}
                      </td>

                      <td className="py-3 px-3 text-right text-emerald-600 font-bold">
                        NPR {Number(item.revenue || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}