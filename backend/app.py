"""
Main application module for the AI Ground Truth Generator backend template.

This module sets up the FastAPI application with its routers and middleware.
You can customize this template to fit your specific implementation requirements.
"""
import os

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

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
                   "http://localhost:4000", "http://frontend:3000", "http://frontend:4000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(collections.router, prefix="/api/collections", tags=["Collections"])
app.include_router(retrieval.router, prefix="/api/retrieval", tags=["Retrieval"])
app.include_router(generation.router, prefix="/api/generation", tags=["Generation"])

if __name__ == "__main__":
    import uvicorn

    # Run the application with uvicorn
    uvicorn.run(
        "app:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("ENV", "development") == "development",
    )
