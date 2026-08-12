import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import "../styles/invoice.css";
import logo from "../assets/logo.png";

function PublicInvoice() {
  const { publicInvoiceId } = useParams();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/orders/invoice/${publicInvoiceId}`
        );

        setInvoice(response.data.invoice);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load invoice."
        );
      } finally {
        setLoading(false);
      }
    };

    if (publicInvoiceId) {
      fetchInvoice();
    }
  }, [publicInvoiceId]);

  if (loading) {
    return (
      <div className="invoice-page-state">
        <div className="invoice-loader">
          Loading invoice...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="invoice-page-state">
        <div className="invoice-error">
          <h2>Invoice Not Found</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return null;
  }

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  return (
    <main className="invoice-page">
      <div className="invoice-container">

        {/* Header */}
        <header className="invoice-header">
          <div>
            <img
                src={logo}
                alt="Modern Tailors"
                className="invoice-logo"
            />
            <p>Customer Invoice</p>
          </div>

          <div className="invoice-number">
            <span>Invoice</span>
            <strong>#{invoice.orderNumber}</strong>
          </div>
        </header>

        {/* Customer & Order Information */}
        <section className="invoice-info-grid">

          <div className="invoice-info-card">
            <span className="invoice-label">
              Customer
            </span>

            <strong>
              {invoice.customerName}
            </strong>

            <span>
              {invoice.mobileNumber}
            </span>
          </div>

          <div className="invoice-info-card">
            <span className="invoice-label">
              Order Date
            </span>

            <strong>
              {formatDate(invoice.orderDate)}
            </strong>
          </div>

          <div className="invoice-info-card">
            <span className="invoice-label">
              Delivery Date
            </span>

            <strong>
              {formatDate(invoice.deliveryDate)}
            </strong>
          </div>

        </section>

        {/* Items */}
        <section className="invoice-section">

          <div className="invoice-section-header">
            <h2>Order Items</h2>
          </div>

          <div className="invoice-table-wrapper">
            <table className="invoice-table">

              <thead>
                <tr>
                  <th>#</th>
                  <th>Garment</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item._id}>
                    <td data-label="#">
                      {item.itemNumber}
                    </td>

                    <td data-label="Garment">
                      {item.garmentType}
                    </td>

                    <td data-label="Quantity">
                      {item.quantity}
                    </td>

                    <td data-label="Unit Price">
                      {formatCurrency(item.unitPrice)}
                    </td>

                    <td data-label="Total">
                      {formatCurrency(item.subtotal)}
                    </td>

                    <td data-label="Status">
                      <span
                        className={`invoice-status invoice-status-${item.status
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>

        </section>

        {/* Payment Summary */}
        <section className="invoice-payment-layout">

          <div className="invoice-section payment-history">

            <div className="invoice-section-header">
              <h2>Payment History</h2>
            </div>

            {invoice.payment.transactions.length === 0 ? (
              <p className="empty-payment">
                No payments recorded.
              </p>
            ) : (
              <div className="payment-list">

                {invoice.payment.transactions.map(
                  (transaction, index) => (
                    <div
                      className="payment-row"
                      key={index}
                    >
                      <div>
                        <strong>
                          {transaction.type}
                        </strong>

                        <span>
                          {formatDate(
                            transaction.date
                          )}
                        </span>
                      </div>

                      <div>
                        <span>
                          {transaction.mode}
                        </span>

                        <strong>
                          {formatCurrency(
                            transaction.amount
                          )}
                        </strong>
                      </div>
                    </div>
                  )
                )}

              </div>
            )}

          </div>

          <div className="invoice-summary">

            <div className="summary-row">
              <span>Total Amount</span>

              <strong>
                {formatCurrency(
                  invoice.payment.totalAmount
                )}
              </strong>
            </div>

            <div className="summary-row">
              <span>Paid Amount</span>

              <strong>
                {formatCurrency(
                  invoice.payment.paidAmount
                )}
              </strong>
            </div>

            <div className="summary-row remaining">
              <span>Remaining</span>

              <strong>
                {formatCurrency(
                  invoice.payment.remainingAmount
                )}
              </strong>
            </div>

          </div>

        </section>

        {/* Footer */}
        <footer className="invoice-footer">
          <div>
            <strong>
              Thank you for choosing Modern Tailors.
            </strong>

            <p>
              Please keep this invoice for your records.
            </p>
          </div>

          <button
            type="button"
            className="print-invoice-button"
            onClick={() => window.print()}
          >
            Print Invoice
          </button>
        </footer>

      </div>
    </main>
  );
}

export default PublicInvoice;