import os
import json
import psycopg2
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

def get_db_connection():
    """Create and return a database connection."""
    try:
        conn = psycopg2.connect(
            dbname=os.getenv('DB_NAME'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            host=os.getenv('DB_HOST', 'localhost'),
            port=os.getenv('DB_PORT', '5432')
        )
        return conn
    except Exception as e:
        app.logger.error(f"Error connecting to database: {e}")
        raise

@app.route('/api/nutrition', methods=['GET'])
def get_nutrition():
    """
    Get nutrition information for a food item or list of ingredients.
    Query parameters:
    - food: (string) Name of the food to search for
    - ingredient_list: (string) Comma-separated list of ingredients
    """
    app.logger.info(f"Received request with params: {request.args}")
    food = request.args.get('food')
    ingredient_list = request.args.get('ingredient_list')
    
    if not food and not ingredient_list:
        return jsonify({"error": "Either 'food' or 'ingredient_list' parameter is required"}), 400
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        if food:
            # Single food search
            query = """
    SELECT
        data->>'orig_source_name' AS nutrient,
        data->>'standard_content' AS value,
        data->>'orig_unit' AS unit
    FROM food_json
    WHERE LOWER(data->>'orig_food_common_name') ILIKE %s
    AND data->>'source_type' = 'Nutrient'
    AND data->>'orig_source_name' IN ('FAT', 'PROTEIN', 'CARBOHYDRATES')
"""
            app.logger.info(f"Executing query: {query} with params: %{food}%")
            cur.execute(query, (f"%{food}%",))
            
            result = cur.fetchall()
            app.logger.info(f"Query result: {result}")
            if not result:
                return jsonify({"error": f"Food '{food}' not found"}), 404
            # Format the nutrients into the expected structure
            nutrients = [{
                "name": row[0],     # nutrient name
                "amount": float(row[1]),  # convert string to float
                "unit": row[2]      # unit
            } for row in result]
            food_name = food  # or extract from the first row if available
            response = {
                "food": food_name,
                "nutrients": nutrients
            }
            return jsonify(response)
            
    except Exception as e:
        app.logger.error(f"Error in /api/nutrition: {str(e)}", exc_info=True)
        return jsonify({
            "error": "Internal server error",
            "details": str(e),
            "type": type(e).__name__
        }), 500
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()
                       
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)