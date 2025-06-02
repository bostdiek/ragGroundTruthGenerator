"""
Script to run the app startup process step by step.
"""
import os
import sys
import traceback
from pprint import pprint

def section(title):
    print("\n" + "="*50)
    print(title)
    print("="*50)

try:
    section("Environment Variables")
    # Check environment variables
    print("Checking environment variables:")
    env_vars = {
        "DATABASE_PROVIDER": os.getenv("DATABASE_PROVIDER", "memory"),
        "GENERATION_PROVIDER": os.getenv("GENERATION_PROVIDER", "demo"),
        "RETRIEVAL_PROVIDER": os.getenv("RETRIEVAL_PROVIDER", "template"),
        "AUTH_PROVIDER": os.getenv("AUTH_PROVIDER", "simple"),
        "ENABLED_DATA_SOURCES": os.getenv("ENABLED_DATA_SOURCES", "memory").split(","),
        "AUTH_SECRET_KEY": os.getenv("AUTH_SECRET_KEY", "[not shown]"),
        "HOST": os.getenv("HOST", "0.0.0.0"),
        "PORT": os.getenv("PORT", "8000"),
        "ENV": os.getenv("ENV", "development"),
    }
    pprint(env_vars)
    
    section("Importing Modules")
    
    try:
        print("Importing dotenv...")
        from dotenv import load_dotenv
        print("Importing FastAPI...")
        from fastapi import FastAPI, Depends, HTTPException
        print("Importing CORS middleware...")
        from fastapi.middleware.cors import CORSMiddleware
        print("Base modules imported successfully")
    except Exception as e:
        print(f"Error importing base modules: {e}")
        traceback.print_exc()
        sys.exit(1)
    
    section("Loading Environment Variables")
    try:
        print("Loading .env file...")
        load_dotenv()
        print(".env file loaded (if it exists)")
    except Exception as e:
        print(f"Error loading .env file: {e}")
        traceback.print_exc()
    
    section("Creating FastAPI Application")
    try:
        print("Creating FastAPI app...")
        app = FastAPI(
            title="AI Ground Truth Generator API Template",
            description="Template API for generating ground truth data for AI training",
            version="0.1.0",
        )
        print("FastAPI app created successfully")
    except Exception as e:
        print(f"Error creating FastAPI app: {e}")
        traceback.print_exc()
        sys.exit(1)
    
    section("Adding CORS Middleware")
    try:
        print("Adding CORS middleware...")
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
        print("CORS middleware added successfully")
    except Exception as e:
        print(f"Error adding CORS middleware: {e}")
        traceback.print_exc()
        sys.exit(1)
    
    section("Creating Health Check Endpoint")
    try:
        @app.get("/health")
        async def health_check():
            return {"status": "ok", "message": "API is operational"}
        print("Health check endpoint created successfully")
    except Exception as e:
        print(f"Error creating health check endpoint: {e}")
        traceback.print_exc()
        sys.exit(1)
    
    section("Importing Routers")
    try:
        print("Importing auth router...")
        from routers import auth
        print("Importing collections router...")
        from routers import collections
        print("Importing generation router...")
        from routers import generation
        print("Importing retrieval router...")
        from routers import retrieval
        print("All routers imported successfully")
    except Exception as e:
        print(f"Error importing routers: {e}")
        traceback.print_exc()
        sys.exit(1)
    
    section("Including Routers")
    try:
        print("Including auth router...")
        app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
        print("Including collections router...")
        app.include_router(collections.router, prefix="/api/collections", tags=["Collections"])
        print("Including retrieval router...")
        app.include_router(retrieval.router, prefix="/api/retrieval", tags=["Retrieval"])
        print("Including generation router...")
        app.include_router(generation.router, prefix="/api/generation", tags=["Generation"])
        print("All routers included successfully")
    except Exception as e:
        print(f"Error including routers: {e}")
        traceback.print_exc()
        sys.exit(1)
    
    section("Startup Complete")
    print("Application startup process completed successfully")
    print("The app should be ready to run with uvicorn")
    
except Exception as e:
    print(f"Unexpected error: {e}")
    traceback.print_exc()
