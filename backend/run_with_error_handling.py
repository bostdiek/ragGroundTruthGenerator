"""
Script to run the application with explicit error handling.
"""

import traceback

try:
    import uvicorn

    print("Successfully imported uvicorn")

    # Try importing the app
    try:
        from app import app

        print("Successfully imported app")

        # Run the application with error handling
        try:
            print("Attempting to run the application...")
            uvicorn.run(app, host="0.0.0.0", port=8001)
        except Exception as e:
            print(f"Error running application: {e}")
            traceback.print_exc()

    except Exception as e:
        print(f"Error importing app: {e}")
        traceback.print_exc()

except Exception as e:
    print(f"Error importing uvicorn: {e}")
    traceback.print_exc()
