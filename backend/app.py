"""
Main application module for the AI Ground Truth Generator backend template.

This module sets up the FastAPI application with its routers and middleware.
You can customize this template to fit your specific implementation requirements.
"""
import os
import json
import logging
import sys

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

# Load environment variables from .env file
# This needs to be done before importing routers so they use the enhanced database
load_dotenv()

# Set the DATABASE_PROVIDER environment variable to use the standard memory database
# This is in addition to any value in the .env file
os.environ["DATABASE_PROVIDER"] = "memory"

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Custom middleware for response logging
class ResponseLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Process the request
        response = await call_next(request)

        # Only log collections endpoints
        if request.url.path.startswith("/collections"):
            # Try to get the response body (for JSON responses)
            if isinstance(response, JSONResponse):
                response_body = response.body
                try:
                    # Parse the JSON and log it
                    data = json.loads(response_body)
                    
                    # For collections list endpoint
                    if request.url.path == "/collections" and request.method == "GET":
                        logger.info("Collections endpoint response:")
                        for collection in data:
                            logger.info(f"Collection: {collection.get('name')} - Document count: {collection.get('document_count', 'NOT SET')}")
                            
                    # For collection detail endpoint
                    elif request.url.path.startswith("/collections/") and "qa-pairs" not in request.url.path and request.method == "GET":
                        logger.info(f"Collection detail response: {json.dumps(data, indent=2)}")
                    
                    # For QA pairs endpoint
                    elif "qa-pairs" in request.url.path and request.method == "GET":
                        logger.info(f"QA pairs count: {len(data)}")
                        
                except Exception as e:
                    # If we can't parse the response, just log the error
                    logger.info(f"Error parsing response: {str(e)}")
        
        return response

# Load environment variables from .env file
# TODO: Customize environment variable loading based on your deployment strategy
load_dotenv()

# Create FastAPI application
# TODO: Update application metadata with your specific information
app = FastAPI(
    title="AI Ground Truth Generator API Template",
    description="Template API for generating ground truth data for AI training",
    version="0.1.0",
)

# Add CORS middleware
# TODO: Configure CORS based on your security requirements
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:54083", "http://localhost:54430", 
                   "http://127.0.0.1:3000", "http://127.0.0.1:54083", "http://127.0.0.1:54430",
                   "http://localhost:4000", "http://frontend:3000", "http://frontend:4000",
                   "http://localhost:8080", "http://127.0.0.1:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add response logging middleware
app.add_middleware(ResponseLoggingMiddleware)

# Define a simple health check endpoint
@app.get("/health")
async def health_check():
    """
    Health check endpoint to verify the API is running.
    
    Returns:
        dict: A simple response indicating the API is operational.
    """
    return {"status": "ok", "message": "API is operational"}

# Import and include routers
# These imports are placed here to avoid circular imports
from routers import auth, collections, generation, retrieval

# Add routers to the application
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(collections.router, prefix="/collections", tags=["Collections"])
app.include_router(retrieval.router, prefix="/retrieval", tags=["Retrieval"])
app.include_router(generation.router, prefix="/generation", tags=["Generation"])

if __name__ == "__main__":
    import uvicorn

    # Run the application with uvicorn
    uvicorn.run(
        "app:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("ENV", "development") == "development",
    )
