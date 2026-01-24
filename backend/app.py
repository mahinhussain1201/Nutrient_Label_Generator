import os
import json
import psycopg2
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from typing import Dict, List, Optional, Union, Any
import json
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

def get_nutrition_for_ingredient(ingredient_name: str, quantity_g: float = 100.0) -> Optional[Dict]:
    """
    Get nutrition information for a single ingredient.
    
    Args:
        ingredient_name: Name of the ingredient
        quantity_g: Quantity in grams (default: 100g)
    
    Returns:
        Dict containing nutrition info or None if not found
    """
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            query = """
            SELECT
                data->>'orig_source_name' AS nutrient,
                (data->>'standard_content')::float AS value_per_100g,
                data->>'orig_unit' AS unit
            FROM food_json
            WHERE LOWER(data->>'orig_food_common_name') ILIKE %s
            AND data->>'source_type' = 'Nutrient'
            AND data->>'orig_source_name' IN (
                'Energy', 'Protein', 'Total lipid (fat)', 'Carbohydrate, by difference',
                'Fiber, total dietary', 'Sugars, total', 'Calcium, Ca', 'Iron, Fe',
                'Sodium, Na', 'Vitamin C, total ascorbic acid', 'Cholesterol',
                'Fatty acids, total saturated', 'Fatty acids, total trans'
            )
            """
            app.logger.info(f"Searching for ingredient: {ingredient_name}")
            cur.execute(query, (f"%{ingredient_name}%",))
            results = cur.fetchall()
            
            if not results:
                return None
                
            # Calculate nutrient values based on quantity
            nutrients = []
            for row in results:
                nutrient_name = row[0]
                value_per_100g = float(row[1])
                unit = row[2]
                
                # Calculate value for the given quantity
                calculated_value = (value_per_100g * quantity_g) / 100.0
                
                nutrients.append({
                    "name": nutrient_name,
                    "amount": round(calculated_value, 2),
                    "unit": unit,
                    "per_100g": round(value_per_100g, 2)
                })
            
            return {
                "ingredient": ingredient_name,
                "quantity_g": quantity_g,
                "nutrients": nutrients
            }
    except Exception as e:
        app.logger.error(f"Error getting nutrition for {ingredient_name}: {str(e)}")
        return None
    finally:
        if 'conn' in locals():
            conn.close()

@app.route('/api/nutrition/single', methods=['GET'])
def get_single_nutrition():
    """
    Get nutrition information for a single food item.
    Query parameters:
    - food: (required) Name of the food to search for
    - quantity_g: (optional) Quantity in grams (default: 100)
    """
    food = request.args.get('food')
    quantity = float(request.args.get('quantity_g', 100.0))
    
    if not food:
        return jsonify({"error": "'food' parameter is required"}), 400
    
    try:
        result = get_nutrition_for_ingredient(food, quantity)
        if not result:
            return jsonify({"error": f"Food '{food}' not found"}), 404
        return jsonify(result)
    except Exception as e:
        app.logger.error(f"Error in /api/nutrition/single: {str(e)}", exc_info=True)
        return jsonify({
            "error": "Internal server error",
            "details": str(e)
        }), 500

@app.route('/api/nutrition/multiple', methods=['POST'])
def get_multiple_nutrition():
    """
    Get nutrition information for multiple ingredients with quantities.
    Request body (JSON):
    [
        {"name": "ingredient1", "quantity_g": 100},
        {"name": "ingredient2", "quantity_g": 50}
    ]
    """
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
    
    ingredients = request.get_json()
    
    if not isinstance(ingredients, list):
        return jsonify({"error": "Request body must be a JSON array"}), 400
    
    try:
        results = []
        not_found = []
        total_nutrients = {}
        
        for item in ingredients:
            if not isinstance(item, dict) or 'name' not in item:
                continue
                
            name = item['name']
            quantity = float(item.get('quantity_g', 100.0))
            
            nutrition = get_nutrition_for_ingredient(name, quantity)
            if nutrition:
                results.append(nutrition)
                
                # Aggregate total nutrients
                for nutrient in nutrition['nutrients']:
                    nutrient_name = nutrient['name']
                    if nutrient_name not in total_nutrients:
                        total_nutrients[nutrient_name] = {
                            'amount': 0.0,
                            'unit': nutrient['unit']
                        }
                    total_nutrients[nutrient_name]['amount'] += nutrient['amount']
            else:
                not_found.append(name)
        
        # Format total nutrients
        formatted_totals = [
            {"name": name, "amount": round(data['amount'], 2), "unit": data['unit']}
            for name, data in total_nutrients.items()
        ]
        
        response = {
            "ingredients": results,
            "total_nutrients": formatted_totals,
            "not_found": not_found
        }
        
        if not results:
            return jsonify({"error": "No matching ingredients found"}), 404
            
        return jsonify(response)
        
    except Exception as e:
        app.logger.error(f"Error in /api/nutrition/multiple: {str(e)}", exc_info=True)
        return jsonify({
            "error": "Internal server error",
            "details": str(e)
        }), 500
            
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