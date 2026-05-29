import React, { useRef } from "react";
import { useParams } from "react-router-dom";

export default function InvoicePrint() {
  const printRef = useRef();
  const { id } = useParams();

  const handlePrint = () => {
    window.print();
  };

  // Dummy data (replace with API later)
  const order = {
    id: id,
    customer: "Sonica Adhikari",
    email: "admin@bookstore.com",
    phone: "986666666",
    address: "Kathmandu, Nepal",
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Paid",
    orderStatus: "Confirmed",
    items: [
      { name: "Book A", qty: 1, price: 798 }
    ],
    deliveryCharge: 100,
  };

  const subtotal = order.items.reduce(
    (sum, i) => sum + i.qty * i.price,
    0
  );

  const grandTotal = subtotal + order.deliveryCharge;

  return (
    <div className="p-10 bg-gray-100 min-h-screen">
      
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg" ref={printRef}>

        {/* HEADER */}
        <div className="flex justify-between border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold">PatraPatrika Center</h1>
            <p className="text-sm text-gray-500">Tax Invoice</p>
          </div>

          <div className="text-right">
            <p>Invoice No: INV-{id.slice(-6)}</p>
            <p>Date: {new Date().toLocaleDateString()}</p>
            <p>Order ID: #{id}</p>
          </div>
        </div>

        {/* CUSTOMER + PAYMENT */}
        <div className="grid grid-cols-2 gap-6 mt-6 text-sm">
          
          <div>
            <h2 className="font-bold mb-2">Buyer Details</h2>
            <p>{order.customer}</p>
            <p>{order.email}</p>
            <p>{order.phone}</p>
          </div>

          <div>
            <h2 className="font-bold mb-2">Delivery / Payment</h2>
            <p>{order.address}</p>
            <p>{order.paymentMethod}</p>
            <p>{order.paymentStatus}</p>
            <p>{order.orderStatus}</p>
          </div>

        </div>

        {/* ITEMS TABLE */}
        <table className="w-full mt-6 border">
          <thead className="bg-black text-white">
            <tr>
              <th className="p-2">Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {order.items.map((item, i) => (
              <tr key={i} className="border-b text-center">
                <td className="p-2">{item.name}</td>
                <td>{item.qty}</td>
                <td>NPR {item.price}</td>
                <td>NPR {item.qty * item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* TOTAL BOX */}
        <div className="mt-6 ml-auto w-72 bg-gray-50 p-4 rounded-lg">
          <p>Subtotal: NPR {subtotal}</p>
          <p>Delivery: NPR {order.deliveryCharge}</p>
          <hr className="my-2" />
          <p className="font-bold text-lg">
            Grand Total: NPR {grandTotal}
          </p>
        </div>

        {/* PRINT BUTTON */}
        <button
          onClick={handlePrint}
          className="mt-6 bg-black text-white px-6 py-2 rounded"
        >
          Print Invoice
        </button>

      </div>
    </div>
  );
}