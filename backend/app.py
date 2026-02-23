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

# Common food synonyms mapping
SYNONYMS = {
    "brinjal": "eggplant",
    "aubergine": "eggplant",
    "cilantro": "coriander",
    "garbanzo": "chickpea",
    "chana": "chickpea",
    "courgette": "zucchini",
    "capsicum": "pepper, bell",
    "spring onion": "scallion",
}

def resolve_synonym(query: str) -> str:
    """Check if query is a synonym and return its mapped value."""
    query_lower = query.lower().strip()
    return SYNONYMS.get(query_lower, query)

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
    Get nutrition information for a single ingredient with source prioritization.
    """
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            # Use source prioritization (USDA > DTU > DUKE > Others)
            query = """
            WITH ranked_matches AS (
                SELECT
                    (data->>'standard_content')::float AS value_per_100g,
                    data->>'orig_unit' AS unit,
                    data->>'orig_source_name' AS nutrient,
                    data->>'citation' AS citation,
                    CASE 
                         WHEN data->>'citation' = 'USDA' THEN 1
                         WHEN data->>'citation' = 'DTU' THEN 2
                         WHEN data->>'citation' = 'DUKE' THEN 3
                         ELSE 4
                    END as source_rank
                FROM food_json
                WHERE LOWER(data->>'orig_food_common_name') = LOWER(%s)
                AND data->>'source_type' IN ('Nutrient', 'Compound')
                AND data->>'orig_source_name' IS NOT NULL
            )
            SELECT nutrient, value_per_100g, unit, citation
            FROM ranked_matches
            WHERE source_rank = (SELECT MIN(source_rank) FROM ranked_matches)
            AND nutrient IS NOT NULL
            """
            app.logger.info(f"Searching for ingredient: {ingredient_name}")
            cur.execute(query, (ingredient_name,))
            results = cur.fetchall()
            
            if not results:
                return None
                
            nutrients = []
            citation_found = "Unknown"
            for row in results:
                nutrient_name = row[0]
                value_per_100g = float(row[1]) if row[1] is not None else 0.0
                unit = row[2]
                citation_found = row[3]
                
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
                "nutrients": nutrients,
                "source": citation_found
            }
    except Exception as e:
        app.logger.error(f"Error getting nutrition for {ingredient_name}: {str(e)}")
        return None
    finally:
        if 'conn' in locals():
            conn.close()

@app.route('/api/search/suggestions', methods=['GET'])
def search_suggestions():
    """
    Get autocomplete suggestions for food names.
    Query parameters:
    - q: Search query
    """
    query_str = request.args.get('q', '').strip()
    query_str = resolve_synonym(query_str)
    if not query_str or len(query_str) < 2:
        return jsonify([])
        
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            # Use trigram similarity for fuzzy matching and order by relevance
            # We distinct common name to avoid duplicates
            query = """
            SELECT DISTINCT data->>'orig_food_common_name' as name
            FROM food_json
            WHERE lower(data->>'orig_food_common_name') LIKE lower(%s)
            AND data->>'orig_source_name' IS NOT NULL
            AND data->>'source_type' IN ('Nutrient', 'Compound')
            ORDER BY name
            LIMIT 10
            """
            cur.execute(query, ('%' + query_str + '%',))
            results = cur.fetchall()
            return jsonify([row[0] for row in results])
    except Exception as e:
        app.logger.error(f"Error in /api/search/suggestions: {str(e)}")
        return jsonify([])
    finally:
        if 'conn' in locals():
            conn.close()

@app.route('/api/search/fuzzy', methods=['GET'])
def search_fuzzy():
    """
    Fuzzy search for food names.
    Query parameters:
    - q: Search query
    """
    query_str = request.args.get('q', '').strip()
    query_str = resolve_synonym(query_str)
    if not query_str:
        return jsonify([])
        
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            # First try exact match (case insensitive)
            exact_query = """
            SELECT DISTINCT data->>'orig_food_common_name'
            FROM food_json
            WHERE LOWER(data->>'orig_food_common_name') = LOWER(%s)
            AND data->>'orig_source_name' IS NOT NULL
            AND data->>'source_type' IN ('Nutrient', 'Compound')
            LIMIT 1
            """
            cur.execute(exact_query, (query_str,))
            exact_result = cur.fetchone()
            if exact_result:
                return jsonify([exact_result[0]])

            # If no exact match, use trigram similarity and ILIKE for fuzzy search
            fuzzy_query = """
            SELECT name FROM (
                SELECT DISTINCT data->>'orig_food_common_name' as name,
                       similarity(data->>'orig_food_common_name', %s) as score
                FROM food_json
                WHERE (data->>'orig_food_common_name' ILIKE %s
                OR similarity(data->>'orig_food_common_name', %s) > 0.3)
                AND data->>'orig_source_name' IS NOT NULL
                AND data->>'source_type' IN ('Nutrient', 'Compound')
            ) sub
            ORDER BY score DESC, name
            LIMIT 15
            """
            search_pattern = f'%{query_str}%'
            cur.execute(fuzzy_query, (query_str, search_pattern, query_str))
            results = cur.fetchall()
            return jsonify([row[0] for row in results])
    except Exception as e:
        app.logger.error(f"Error in /api/search/fuzzy: {str(e)}")
        return jsonify([])
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
        food = resolve_synonym(food)
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
            name = resolve_synonym(name)
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