import React, { useEffect, useState } from "react";
import { getDashboardStats } from "../services/dashboardService";
import logo from "../assets/logo.png";
import "../styles/dashboard.css";

function Dashboard() {

    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const data = await getDashboardStats();
            setDashboardData(data);
        } catch (error) {
            console.error("Failed to load dashboard", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
            Loading dashboard...
            </div>
        );
    }
  return (
    <div className="dashboard-page">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
            <img
                src={logo}
                alt="Modern Tailors"
                className="sidebar-logo"
            />
        </div>

        <nav className="sidebar-navigation">
          <button className="sidebar-link active">
            <span>⌂</span>
            Dashboard
          </button>

          <button className="sidebar-link">
            <span>▤</span>
            Orders
          </button>

          <button className="sidebar-link">
            <span>＋</span>
            New Order
          </button>

          <button className="sidebar-link">
            <span>✂</span>
            Today's Cutting
          </button>

          <button className="sidebar-link">
            <span>✓</span>
            Today's Deliveries
          </button>

          <button className="sidebar-link">
            <span>₹</span>
            Payments
          </button>
        </nav>

        <div className="sidebar-footer">
          <span>Modern Tailors</span>
          <small>Management Portal</small>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">OVERVIEW</p>
            <h2>Dashboard</h2>
            <p className="dashboard-subtitle">
              Manage orders, payments and daily tailoring operations.
            </p>
          </div>

          <button className="new-order-button">
            <span>＋</span>
            New Order
          </button>
        </header>

        <section className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">TOTAL ORDERS</span>
              <span className="stat-icon">▤</span>
            </div>

            <strong className="stat-value">
                {dashboardData?.totalOrders || 0}
            </strong>

            <span className="stat-description">
              All orders in the system
            </span>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">TOTAL REVENUE</span>
              <span className="stat-icon">₹</span>
            </div>

            <strong className="stat-value">
                ₹{dashboardData?.totalRevenue || 0}
            </strong>

            <span className="stat-description">
              Revenue from all orders
            </span>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">TODAY'S CUTTING</span>
              <span className="stat-icon">✂</span>
            </div>

            <strong className="stat-value">
                {dashboardData?.todaysCutting || 0}
            </strong>

            <span className="stat-description">
              Garments scheduled for cutting
            </span>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">TODAY'S DELIVERIES</span>
              <span className="stat-icon">✓</span>
            </div>

            <strong className="stat-value">
                {dashboardData?.todaysDeliveries || 0}
            </strong>

            <span className="stat-description">
              Orders scheduled for delivery
            </span>
          </div>
        </section>

        <section className="dashboard-content-grid">
          <div className="dashboard-panel recent-orders-panel">
            <div className="panel-header">
              <div>
                <p className="panel-eyebrow">ORDERS</p>
                <h3>Recent Orders</h3>
              </div>

              <button className="panel-action">
                View All
              </button>
            </div>

            <div className="empty-state">
              <div className="empty-state-icon">▤</div>

              <h4>No orders to display</h4>

              <p>
                Your recent orders will appear here once you start
                creating orders.
              </p>

              <button className="empty-state-button">
                Create First Order
              </button>
            </div>
          </div>

          <div className="dashboard-panel today-panel">
            <div className="panel-header">
              <div>
                <p className="panel-eyebrow">TODAY</p>
                <h3>Today's Work</h3>
              </div>
            </div>

            <div className="today-work-list">
              <div className="today-work-item">
                <div className="today-work-icon cutting-icon">
                  ✂
                </div>

                <div className="today-work-content">
                  <strong>Cutting</strong>
                  <span>Garments scheduled today</span>
                </div>

                <strong className="today-work-count">0</strong>
              </div>

              <div className="today-work-item">
                <div className="today-work-icon delivery-icon">
                  ✓
                </div>

                <div className="today-work-content">
                  <strong>Deliveries</strong>
                  <span>Orders scheduled today</span>
                </div>

                <strong className="today-work-count">0</strong>
              </div>

              <div className="today-work-item">
                <div className="today-work-icon payment-icon">
                  ₹
                </div>

                <div className="today-work-content">
                  <strong>Payments</strong>
                  <span>Payments received today</span>
                </div>

                <strong className="today-work-count">0</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-panel quick-actions-panel">
          <div className="panel-header">
            <div>
              <p className="panel-eyebrow">SHORTCUTS</p>
              <h3>Quick Actions</h3>
            </div>
          </div>

          <div className="quick-actions">
            <button className="quick-action">
              <span className="quick-action-icon">＋</span>
              <span>
                <strong>Create New Order</strong>
                <small>Register a new customer order</small>
              </span>
            </button>

            <button className="quick-action">
              <span className="quick-action-icon">▤</span>
              <span>
                <strong>View Orders</strong>
                <small>Search and manage existing orders</small>
              </span>
            </button>

            <button className="quick-action">
              <span className="quick-action-icon">✂</span>
              <span>
                <strong>Today's Cutting</strong>
                <small>View garments waiting for cutting</small>
              </span>
            </button>

            <button className="quick-action">
              <span className="quick-action-icon">✓</span>
              <span>
                <strong>Today's Deliveries</strong>
                <small>View orders due for delivery</small>
              </span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;