# Nutritional Label Generator

A full-stack web application that generates nutritional labels for food items using Flask, PostgreSQL with JSONB, and React with TypeScript.

## Features

- Search for nutritional information by food name
- View detailed nutrition facts
- Combine multiple ingredients to get combined nutritional information
- Clean, responsive UI

## Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- npm or yarn

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the backend directory with your database credentials:
   ```env
   DB_NAME=nutrition_db
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432
   FLASK_ENV=development
   ```

5. Set up your PostgreSQL database:
   ```sql
   CREATE DATABASE nutrition_db;
   
   -- Connect to the database
   \c nutrition_db
   
   -- Create a table for food data
   CREATE TABLE foods (
       id SERIAL PRIMARY KEY,
       data JSONB NOT NULL
   );
   
   -- Create an index for better performance on food name searches
   CREATE INDEX idx_food_name ON foods USING GIN ((data->'food_name') jsonb_path_ops);
   ```

6. Run the Flask development server:
   ```bash
   python app.py
   ```
   The API will be available at `http://localhost:5000`

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

## API Endpoints

- `GET /api/nutrition?food=<food_name>` - Get nutrition for a single food item
- `GET /api/nutrition?ingredient_list=<ingredient1,ingredient2,...>` - Get combined nutrition for multiple ingredients

## Project Structure

```
.
├── backend/               # Flask backend
│   ├── app.py            # Main application file
│   └── requirements.txt   # Python dependencies
├── frontend/             # React frontend
│   ├── public/           # Static files
│   └── src/              # Source files
└── README.md             # This file
```

## License

MIT
