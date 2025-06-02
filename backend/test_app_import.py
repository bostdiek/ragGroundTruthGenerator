"""
Script to test the app module import and initialization.
"""
import sys
import traceback

try:
    # Try importing app
    print("Importing app module...")
    import app
    print("App module imported successfully")
    
    # Access the FastAPI app instance
    print("Accessing app.app...")
    api_app = app.app
    print(f"FastAPI app instance: {api_app}")
    
    # Check if routers are included
    print("Checking app routers...")
    for route in api_app.routes:
        print(f"Route: {route}")
        
    print("App initialization successful")
    
except Exception as e:
    print(f"Error: {e}")
    traceback.print_exc()
