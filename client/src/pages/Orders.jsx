import React, { useEffect, useState } from "react";
import api from "../api/api";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders");

      const ordersData = response.data.orders || [];

      setOrders(ordersData);
      setFilteredOrders(ordersData);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let result = [...orders];

    if (searchTerm.trim()) {
      result = result.filter((order) => {
        const search = searchTerm.toLowerCase();

        return (
          order.customerName?.toLowerCase().includes(search) ||
          order.mobileNumber?.includes(search) ||
          order.orderNumber?.toString().includes(search)
        );
      });
    }

    if (statusFilter !== "All") {
      result = result.filter(
        (order) => order.status === statusFilter
      );
    }

    setFilteredOrders(result);
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN");
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          fontSize: "18px",
        }}
      >
        Loading Orders...
      </div>
    );
  }

  const handleViewOrder = (order) => {
      setSelectedOrder(order);
      setShowModal(true);
  };

  return (
    <div
      style={{
        padding: "30px",
        minHeight: "100vh",
        background: "#f7f8fc",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>
            Orders Management
          </h1>

          <p
            style={{
              color: "#666",
              marginTop: "5px",
            }}
          >
            Manage all tailoring orders
          </p>
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "20px",
        }}
      >
        <input
          type="text"
          placeholder="Search by customer, order number or mobile..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
          style={{
            width: "100%",
            padding: "12px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            marginBottom: "15px",
          }}
        />

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          {[
            "All",
            "Pending",
            "In Progress",
            "Ready",
            "Delivered",
            "Cancelled",
          ].map((status) => (
            <button
              key={status}
              onClick={() =>
                setStatusFilter(status)
              }
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                background:
                  statusFilter === status
                    ? "#1e293b"
                    : "#e5e7eb",
                color:
                  statusFilter === status
                    ? "#fff"
                    : "#000",
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow:
            "0 2px 10px rgba(0,0,0,0.05)",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#f3f4f6",
              }}
            >
              <th style={thStyle}>Order No</th>
              <th style={thStyle}>Customer</th>
              <th style={thStyle}>Mobile</th>
              <th style={thStyle}>Garment</th>
              <th style={thStyle}>Amount</th>
              <th style={thStyle}>Delivery</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td style={tdStyle}>
                    #{order.orderNumber}
                  </td>

                  <td style={tdStyle}>
                    {order.customerName}
                  </td>

                  <td style={tdStyle}>
                    {order.mobileNumber}
                  </td>

                  <td style={tdStyle}>
                    {order.items
                      ?.map(
                        (item) =>
                          item.garmentType
                      )
                      .join(", ")}
                  </td>

                  <td style={tdStyle}>
                    ₹
                    {order.payment
                      ?.totalAmount || 0}
                  </td>

                  <td style={tdStyle}>
                    {formatDate(
                      order.deliveryDate
                    )}
                  </td>

                  <td style={tdStyle}>
                    {order.status}
                  </td>

                  <td style={tdStyle}>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                      }}
                    >
                      <button onClick={() => handleViewOrder(order)}>
                        View
                      </button>

                      <button>
                        Edit
                      </button>

                      <button onClick={() =>
                            window.open(
                            `/invoice/${order.publicInvoiceId}`,
                            "_blank"
                            )
                        }>
                        Invoice
                      </button>

                      <button>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="8"
                  style={{
                    textAlign: "center",
                    padding: "30px",
                  }}
                >
                  No Orders Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && selectedOrder && (
        <div
            style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            }}>
            <div
            style={{
                background: "#fff",
                width: "90%",
                maxWidth: "900px",
                maxHeight: "85vh",
                overflowY: "auto",
                borderRadius: "12px",
                padding: "25px",
            }}
            >
            <div
                style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                }}
            >
                <h2>
                Order #{selectedOrder.orderNumber}
                </h2>

                <button
                onClick={() =>
                    setShowModal(false)
                }
                >
                Close
                </button>
            </div>

            <h3>Customer Information</h3>

            <p>
                <strong>Name:</strong>{" "}
                {selectedOrder.customerName}
            </p>

            <p>
                <strong>Mobile:</strong>{" "}
                {selectedOrder.mobileNumber}
            </p>

            <hr />

            <h3>Order Information</h3>

            <p>
                <strong>Status:</strong>{" "}
                {selectedOrder.status}
            </p>

            <p>
                <strong>Order Date:</strong>{" "}
                {formatDate(
                selectedOrder.orderDate
                )}
            </p>

            <p>
                <strong>Delivery Date:</strong>{" "}
                {formatDate(
                selectedOrder.deliveryDate
                )}
            </p>

            <p>
                <strong>Cutting Date:</strong>{" "}
                {formatDate(
                selectedOrder.cuttingDate
                )}
            </p>

            <hr />

            <h3>Garments</h3>

            {selectedOrder.items?.map(
                (item) => (
                <div
                    key={item._id}
                    style={{
                    border: "1px solid #ddd",
                    padding: "15px",
                    marginBottom: "15px",
                    borderRadius: "8px",
                    }}
                >
                    <h4>
                    {item.garmentType}
                    </h4>

                    <p>
                    Quantity: {item.quantity}
                    </p>

                    <p>
                    Price: ₹
                    {item.unitPrice}
                    </p>

                    <p>
                    Note: {item.note}
                    </p>

                    <h5>
                    Measurements
                    </h5>

                    {item.measurements?.map(
                    (measurement, index) => (
                        <div key={index}>
                        {measurement.name}:{" "}
                        {measurement.value}
                        </div>
                    )
                    )}
                </div>
                )
            )}

            <hr />

            <h3>Payment Summary</h3>

            <p>
                <strong>Total Amount:</strong>
                ₹
                {
                selectedOrder.payment
                    ?.totalAmount
                }
            </p>

            <h4>Transactions</h4>

            {selectedOrder.payment
                ?.transactions?.length > 0 ? (
                selectedOrder.payment.transactions.map(
                (txn, index) => (
                    <div
                    key={index}
                    style={{
                        border:
                        "1px solid #eee",
                        padding: "10px",
                        marginBottom: "10px",
                    }}
                    >
                    <p>
                        Amount: ₹
                        {txn.amount}
                    </p>

                    <p>
                        Type: {txn.type}
                    </p>

                    <p>
                        Mode: {txn.mode}
                    </p>

                    <p>
                        Date:{" "}
                        {formatDate(
                        txn.date
                        )}
                    </p>
                    </div>
                )
                )
            ) : (
                <p>
                No payments received
                </p>
            )}
            </div>
        </div>
      )}
    </div>
  );
}

const thStyle = {
  padding: "15px",
  textAlign: "left",
  fontSize: "14px",
};

const tdStyle = {
  padding: "15px",
  borderTop: "1px solid #eee",
};

export default Orders;