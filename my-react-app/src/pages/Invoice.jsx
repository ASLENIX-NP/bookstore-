import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  ArrowLeft,
  Printer,
  ReceiptText,
  AlertCircle,
  Lock,
  Download,
} from "lucide-react";

import { Link, useNavigate, useParams } from "react-router-dom";

const DEFAULT_INVOICE_SETTINGS = {
  sellerName: "PatraPatrika Center",
  sellerVatPan: "000000",
  sellerAddress: "000000",
  sellerPhone: "000000",
  sellerEmail: "000000",
  sellerWebsite: "",
  invoiceTitle: "TAX INVOICE",
  invoicePrefix: "VAT",
  vatRate: 13,
  defaultBuyerVatPan: "000000",
  invoiceNote: "",
  declaration: "",
  footerText: "",
};

const roundMoney = (value) => Math.round(Number(value || 0) * 100) / 100;

export default function Invoice() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [invoiceSettings, setInvoiceSettings] = useState(
    DEFAULT_INVOICE_SETTINGS
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isAdmin = Boolean(localStorage.getItem("adminToken"));

  useEffect(() => {
    document.body.classList.add("invoice-print-mode");

    return () => {
      document.body.classList.remove("invoice-print-mode");
    };
  }, []);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        setError("");

        const orderResponse = await axios.get(
          `https://bookstore-f3if.onrender.com/api/orders/${id}`
        );

        const orderData =
          orderResponse.data?.order ||
          orderResponse.data?.data ||
          orderResponse.data;

        setOrder(orderData);

        try {
          const settingsResponse = await axios.get(
            "https://bookstore-f3if.onrender.com/api/invoice-settings"
          );

          const settingsData =
            settingsResponse.data?.settings ||
            settingsResponse.data?.data ||
            settingsResponse.data;

          setInvoiceSettings({
            ...DEFAULT_INVOICE_SETTINGS,
            ...(settingsData || {}),
          });
        } catch (settingsError) {
          console.warn("Invoice settings fallback used:", settingsError);
          setInvoiceSettings(DEFAULT_INVOICE_SETTINGS);
        }
      } catch (err) {
        console.error("Invoice fetch error:", err);

        setError(err.response?.data?.error || "Unable to load invoice.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  const printInvoice = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-sm font-black text-gray-500">
            Loading invoice...
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-12">
        <div className="max-w-3xl mx-auto bg-red-50 border border-red-100 text-red-700 rounded-2xl p-6 flex gap-3">
          <AlertCircle className="w-6 h-6 shrink-0" />

          <div>
            <h1 className="font-black">Invoice Error</h1>

            <p className="text-sm mt-1">{error || "Invoice not found."}</p>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-4 text-sm font-black underline"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const paymentStatus = order?.paymentStatus || "Pending";

  const isPaid = String(paymentStatus).toLowerCase() === "paid";

  if (!isPaid && !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-12">
        <div className="max-w-3xl mx-auto bg-white border border-gray-100 rounded-[2rem] shadow-sm p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-black text-gray-950">
            Invoice Available After Payment
          </h1>

          <p className="text-gray-500 mt-2">
            This order is currently marked as{" "}
            <strong>{paymentStatus}</strong>. Your VAT invoice will be
            available after admin marks the payment as Paid.
          </p>

          <Link
            to="/my-orders"
            className="mt-6 inline-flex bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl text-sm font-black"
          >
            Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const productSubtotal = roundMoney(
    order.productSubtotal ||
      order.orderItems?.reduce(
        (total, item) => total + Number(item.subtotal || 0),
        0
      )
  );

  const deliveryCharge = roundMoney(order.deliveryCharge || 0);

  const vatRate = Number(invoiceSettings.vatRate || order.vatRate || 13);
  const vatDivisor = 1 + vatRate / 100;

  const taxableAmount = roundMoney(productSubtotal / vatDivisor);
  const vatAmount = roundMoney(productSubtotal - taxableAmount);
  const grandTotal = roundMoney(productSubtotal + deliveryCharge);

  const invoicePrefix = invoiceSettings.invoicePrefix || "VAT";

  const invoiceNo = `${invoicePrefix}-${String(order._id)
    .slice(-8)
    .toUpperCase()}`;

  return (
    <div className="invoice-wrapper min-h-screen bg-slate-100 py-8 px-4">
      <style>
        {`
          @media print {
            body {
              background: white !important;
            }

            nav,
            header,
            footer,
            .navbar,
            .sidebar,
            .no-print {
              display: none !important;
            }

            .invoice-wrapper {
              padding: 0 !important;
              margin: 0 !important;
              background: white !important;
            }

            .invoice-sheet {
              box-shadow: none !important;
              border: none !important;
              margin: 0 !important;
              max-width: 100% !important;
              border-radius: 0 !important;
              width: 100% !important;
            }

            button {
              display: none !important;
            }

            @page {
              size: A4;
              margin: 12mm;
            }
          }
        `}
      </style>

      <div className="no-print max-w-5xl mx-auto mb-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 bg-white border border-gray-100 px-5 py-3 rounded-2xl text-sm font-black text-gray-700 hover:bg-slate-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <button
          type="button"
          onClick={printInvoice}
          className="inline-flex items-center gap-2 bg-slate-950 text-white px-5 py-3 rounded-2xl text-sm font-black hover:bg-slate-800"
        >
          <Printer className="w-4 h-4" />
          Print / Save PDF
          <Download className="w-4 h-4" />
        </button>
      </div>

      <div className="invoice-sheet max-w-5xl mx-auto bg-white rounded-[1.5rem] shadow-xl border border-gray-100 p-4 sm:p-8 md:p-10">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 border-b-2 border-gray-900 pb-6">
          <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 break-words">
              {invoiceSettings.sellerName}
            </h1>

            <p className="text-sm text-gray-600 mt-2">
              Address: {invoiceSettings.sellerAddress}
            </p>

            <p className="text-sm text-gray-600">
              Phone: {invoiceSettings.sellerPhone}
            </p>

            <p className="text-sm text-gray-600">
              Email: {invoiceSettings.sellerEmail}
            </p>

            {invoiceSettings.sellerWebsite && (
              <p className="text-sm text-gray-600">
                Website: {invoiceSettings.sellerWebsite}
              </p>
            )}

            <p className="text-sm font-black text-gray-900 mt-2">
              VAT/PAN No: {invoiceSettings.sellerVatPan}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <div className="inline-flex items-center gap-2 bg-gray-950 text-white px-4 py-2 rounded-xl text-sm font-black mb-3">
              <ReceiptText className="w-4 h-4" />
              {invoiceSettings.invoiceTitle || "TAX INVOICE"}
            </div>

            <p className="text-sm text-gray-600">
              Invoice No: <span className="font-black">{invoiceNo}</span>
            </p>

            <p className="text-sm text-gray-600">
              Invoice Date:{" "}
              <span className="font-black">
                {new Date(order.createdAt || Date.now()).toLocaleDateString()}
              </span>
            </p>

            <p className="text-sm text-gray-600">
              Order ID: <span className="font-black">#{order._id}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-gray-200">
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-3">
              Buyer Details
            </h2>

            <p className="text-sm">
              <strong>Name:</strong>{" "}
              {order.deliveryInfo?.fullName || order.customerName || "N/A"}
            </p>

            <p className="text-sm">
              <strong>Email:</strong> {order.email || "N/A"}
            </p>

            <p className="text-sm">
              <strong>Phone:</strong>{" "}
              {order.deliveryInfo?.phone || order.phone || "N/A"}
            </p>

            <p className="text-sm">
              <strong>Buyer VAT/PAN:</strong>{" "}
              {order.deliveryInfo?.vatPan ||
                order.buyerVatPan ||
                invoiceSettings.defaultBuyerVatPan ||
                "N/A"}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-3">
              Delivery / Payment
            </h2>

            <p className="text-sm">
              <strong>Address:</strong>{" "}
              {order.deliveryInfo?.building}, {order.deliveryInfo?.area},{" "}
              {order.deliveryInfo?.city}, {order.deliveryInfo?.region}
            </p>

            <p className="text-sm">
              <strong>Payment Method:</strong>{" "}
              {order.paymentMethod || "Cash on Delivery"}
            </p>

            <p className="text-sm">
              <strong>Payment Status:</strong> {paymentStatus}
            </p>

            <p className="text-sm">
              <strong>Order Status:</strong>{" "}
              {order.orderStatus || order.status || "Processing"}
            </p>
          </div>
        </div>

        <div className="py-6 overflow-x-auto">
        <table className="w-full min-w-[650px] border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-950 text-white">
                <th className="border border-gray-300 px-3 py-3 text-left">
                  S.N.
                </th>

                <th className="border border-gray-300 px-3 py-3 text-left">
                  Description of Goods
                </th>

                <th className="border border-gray-300 px-3 py-3 text-right">
                  Qty
                </th>

                <th className="border border-gray-300 px-3 py-3 text-right">
                  Rate
                </th>

                <th className="border border-gray-300 px-3 py-3 text-right">
                  Amount
                </th>
              </tr>
            </thead>

            <tbody>
              {(order.orderItems || []).map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-3 py-3">
                    {index + 1}
                  </td>

                  <td className="border border-gray-300 px-3 py-3">
                    {item.title}
                  </td>

                  <td className="border border-gray-300 px-3 py-3 text-right">
                    {item.qty}
                  </td>

                  <td className="border border-gray-300 px-3 py-3 text-right">
                    NPR {Number(item.price || 0).toLocaleString()}
                  </td>

                  <td className="border border-gray-300 px-3 py-3 text-right">
                    NPR {Number(item.subtotal || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-full sm:w-96 border border-gray-300 rounded-xl overflow-hidden">
            <div className="flex justify-between px-4 py-3 border-b border-gray-300">
              <span>Product Price (Without VAT)</span>

              <strong>NPR {taxableAmount.toFixed(2)}</strong>
            </div>

            <div className="flex justify-between px-4 py-3 border-b border-gray-300">
              <span>VAT {vatRate}%</span>

              <strong>NPR {vatAmount.toFixed(2)}</strong>
            </div>

            <div className="flex justify-between px-4 py-3 border-b border-gray-300">
              <span>Product Total</span>

              <strong>NPR {productSubtotal.toLocaleString()}</strong>
            </div>

            <div className="flex justify-between px-4 py-3 border-b border-gray-300">
              <span>Delivery Charge</span>

              <strong>NPR {deliveryCharge.toLocaleString()}</strong>
            </div>

            <div className="flex justify-between px-4 py-4 bg-gray-950 text-white">
              <span className="font-black">Grand Total</span>

              <strong className="text-lg sm:text-xl">
                NPR {grandTotal.toLocaleString()}
              </strong>
            </div>
          </div>
        </div>

        {(invoiceSettings.invoiceNote ||
          invoiceSettings.declaration ||
          invoiceSettings.footerText) && (
          <div className="mt-8 border-t border-gray-200 pt-5 text-sm text-gray-600 space-y-3">
            {invoiceSettings.invoiceNote && (
              <p>
                <strong>Note:</strong> {invoiceSettings.invoiceNote}
              </p>
            )}

            {invoiceSettings.declaration && (
              <p>
                <strong>Declaration:</strong> {invoiceSettings.declaration}
              </p>
            )}

            {invoiceSettings.footerText && (
              <p className="text-center font-bold text-gray-500">
                {invoiceSettings.footerText}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}