# Weaviate Dashboard Configuration

# Weaviate connection settings
WEAVIATE_HOST = "100.66.227.18"
WEAVIATE_PORT = 8080
WEAVIATE_PROTOCOL = "http"

# Construct the full URL
WEAVIATE_URL = f"{WEAVIATE_PROTOCOL}://{WEAVIATE_HOST}:{WEAVIATE_PORT}"

# Flask application settings
DEBUG = True
HOST = "0.0.0.0"
PORT = 5000

# API settings
API_TIMEOUT = 30  # seconds
MAX_OBJECTS_PER_REQUEST = 100

# Dashboard settings
DEFAULT_OBJECT_LIMIT = 10
