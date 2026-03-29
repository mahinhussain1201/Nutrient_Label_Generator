# Nutritional Label Generator

A professional-grade, full-stack application for generating accurate nutritional labels for single food items or complex recipes. Built with a modern tech stack, it features high-performance search, fuzzy matching, and data-driven nutrition calculations.

---

## ✨ Features

- **🔍 Intelligent Search**: Autocomplete and fuzzy matching for thousands of food items.
- **🧪 Data-Driven**: Prioritizes high-quality data sources (USDA, DTU, DUKE) for maximum accuracy.
- **🍳 Recipe Calculator**: Aggregate nutritional data for multiple ingredients, automatically normalized to per 100g.
- **⚡ Performance**: Optimized backend with PostgreSQL trigram similarity and LRU caching.
- **💎 Premium UI**: Modern, responsive interface built with React, Tailwind CSS, and Framer Motion.
- **🔄 Smart Synonyms**: Handles common food name variations (e.g., "brinjal" ↔ "eggplant").

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

### Backend
- **Framework**: [Flask](https://flask.palletsprojects.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Language**: [Python 3.x](https://www.python.org/)
- **Key Libraries**: `psycopg2`, `python-dotenv`, `flask-cors`

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- PostgreSQL

### 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd "Nutritional Label Generator"
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
   *Note: Ensure you have a `.env` file with your database credentials.*

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   ```

### 🏃 Running the Project

1. **Start the Backend**:
   ```bash
   cd backend
   python app.py
   ```
   *Runs on `http://localhost:5000`*

2. **Start the Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   *Runs on `http://localhost:5173`*

---

## 🔌 API Documentation

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/search/suggestions` | `GET` | Autocomplete suggestions for food names |
| `/api/search/fuzzy` | `GET` | Fuzzy search for food names |
| `/api/nutrition/single` | `GET` | Nutrition data for a single ingredient |
| `/api/nutrition/multiple` | `POST` | Aggregated nutrition for multiple ingredients |

---

## 🏗️ Architecture

The project follows a standard client-server architecture:
- **Client**: A React SPA that handles user interactions, recipe state, and dynamic rendering of nutritional labels.
- **Server**: A Flask API that interfaces with a PostgreSQL database containing structured nutritional data in JSONB format.
- **Database**: Uses trigram similarity for efficient fuzzy searching and complex aggregations for recipe calculations.

---

**Developed with ❤️ by [Mahin Hussain](https://github.com/mahinhussain1201)**
