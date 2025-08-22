from flask import Flask, render_template, jsonify, request
import requests
import json
from flask_cors import CORS
import config

app = Flask(__name__)
CORS(app)

# Load configuration
WEAVIATE_URL = config.WEAVIATE_URL
WEAVIATE_API_V1 = f"{WEAVIATE_URL}/v1"

def make_weaviate_request(endpoint, method="GET", data=None):
    """Make a request to Weaviate API"""
    url = f"{WEAVIATE_API_V1}/{endpoint}"
    headers = {"Content-Type": "application/json"}
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            response = requests.post(url, headers=headers, json=data)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers)
        
        return {
            "success": True,
            "data": response.json() if response.content else {},
            "status_code": response.status_code
        }
    except requests.exceptions.RequestException as e:
        return {
            "success": False,
            "error": str(e),
            "status_code": 500
        }
    except json.JSONDecodeError as e:
        return {
            "success": True,
            "data": {},
            "status_code": response.status_code
        }

@app.route('/')
def index():
    """Serve the main dashboard page"""
    return render_template('index.html')

@app.route('/api/health')
def health_check():
    """Check Weaviate connection status"""
    try:
        response = requests.get(f"{WEAVIATE_URL}/v1/meta", timeout=5)
        return jsonify({
            "success": True,
            "connected": response.status_code == 200,
            "url": WEAVIATE_URL
        })
    except:
        return jsonify({
            "success": False,
            "connected": False,
            "url": WEAVIATE_URL
        })

@app.route('/api/schema')
def get_schema():
    """Get the current Weaviate schema"""
    result = make_weaviate_request("schema")
    return jsonify(result)

@app.route('/api/schema/<class_name>', methods=['DELETE'])
def delete_class(class_name):
    """Delete a specific class from the schema"""
    result = make_weaviate_request(f"schema/{class_name}", method="DELETE")
    return jsonify(result)

@app.route('/api/objects/<class_name>')
def get_objects(class_name):
    """Get objects from a specific class"""
    limit = request.args.get('limit', 10, type=int)
    limit = min(limit, 100)  # Cap at 100 for performance
    
    result = make_weaviate_request(f"objects?class={class_name}&limit={limit}")
    return jsonify(result)

@app.route('/api/objects/<class_name>/<object_id>', methods=['DELETE'])
def delete_object(class_name, object_id):
    """Delete a specific object"""
    result = make_weaviate_request(f"objects/{class_name}/{object_id}", method="DELETE")
    return jsonify(result)

@app.route('/api/schema/delete-all', methods=['POST'])
def delete_all_classes():
    """Delete all classes from the schema"""
    # First, get all classes
    schema_result = make_weaviate_request("schema")
    
    if not schema_result["success"]:
        return jsonify(schema_result)
    
    classes = schema_result["data"].get("classes", [])
    deleted_classes = []
    errors = []
    
    # Delete each class
    for class_info in classes:
        class_name = class_info["class"]
        delete_result = make_weaviate_request(f"schema/{class_name}", method="DELETE")
        
        if delete_result["success"]:
            deleted_classes.append(class_name)
        else:
            errors.append({
                "class": class_name,
                "error": delete_result.get("error", "Unknown error")
            })
    
    return jsonify({
        "success": len(errors) == 0,
        "deleted_classes": deleted_classes,
        "errors": errors,
        "total_deleted": len(deleted_classes),
        "total_errors": len(errors)
    })

@app.route('/api/meta')
def get_meta():
    """Get Weaviate metadata"""
    result = make_weaviate_request("meta")
    return jsonify(result)

@app.route('/api/nodes')
def get_nodes():
    """Get nodes information"""
    result = make_weaviate_request("nodes")
    return jsonify(result)

if __name__ == '__main__':
    print("Starting Weaviate Dashboard...")
    print(f"Weaviate URL: {WEAVIATE_URL}")
    print(f"Dashboard will be available at: http://{config.HOST}:{config.PORT}")
    app.run(debug=config.DEBUG, host=config.HOST, port=config.PORT)
