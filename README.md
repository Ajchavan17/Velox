# Velox

![Velox Banner](https://via.placeholder.com/1200x400.png?text=Velox+Financial+Dashboard)

<div align="center">

**Personal Financial Intelligence, Redefined.**

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Emerald?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)

</div>

---

## 🚀 Overview

**Velox** is a cutting-edge personal finance management application designed to give you complete control over your financial life. Unlike traditional trackers, Velox focuses on **liquidity**, **debt management**, and **relationship-based lending/borrowing**.

Built with modern web technologies, it features a stunning, responsive UI with dark mode support, intuitive data visualization, and seamless transaction tracking.

## ✨ Key Features

### 📊 Comprehensive Dashboard
- **Real-time Liquidity**: View total cash across all accounts instantly.
- **Credit Pulse**: Monitor credit card utilization and debt status.
- **Net Debt Position**: Visualize what you owe vs. what you are owed.
- **Burn Analysis**: Track monthly spending trends with interactive charts.

### 💰 Accounts & Cards
- **Unified View**: Manage bank accounts and credit cards in one place.
- **Smart Tracking**: Monitor balance available and credit limits.
- **Visual Cards**: Beautifully designed card components with usage indicators.

### 🤝 Debt & Loans Manager
- **IOU Tracking**: Keep track of informal debts (borrowed/lent) with friends and family.
- **Loan Amortization**: Detailed EMI schedules, principal/interest breakdown, and payment tracking.
- **Settlement**: Easy flows to settle debts and record partial payments.

### 💸 Transaction Hub
- **Detailed History**: Filterable list of all income and expenses.
- **Categorization**: Smart categorization for better spending insights.
- **Quick Actions**: Record transactions effortlessly.

### 🎨 Personalization
- **Theme Support**: Seamless Light/Dark mode switching.
- **Responsive Design**: Mobile-first architecture for finance on the go.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + CSS Variables
- **Database**: MongoDB (Mongoose)
- **Auth**: NextAuth.js
- **Icons**: Lucide React
- **Toast**: React Hot Toast

## ⚡ Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Database (Local or Atlas)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/velox.git
    cd velox
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory:
    ```env
    MONGODB_URI=your_mongodb_connection_string
    NEXTAUTH_SECRET=your_nextauth_secret_key
    NEXTAUTH_URL=http://localhost:3000
    EMAIL_SERVER=smtp://username:password@smtp.example.com:587
    EMAIL_FROM=noreply@example.com
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and create a pull request for any features or bug fixes.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built with ❤️ by Velox Team</sub>
</div>
