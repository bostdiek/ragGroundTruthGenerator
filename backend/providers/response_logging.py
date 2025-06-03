#!/usr/bin/env python3

"""
Intercepting middleware to log API responses
"""

import json
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import FastAPI
from starlette.responses import JSONResponse, Response
from starlette.requests import Request
import logging
import sys

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

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
                        
                except:
                    # If we can't parse the response, just log the raw body
                    logger.info(f"Raw response body: {response_body}")
        
        return response

def add_logging_middleware(app: FastAPI):
    app.add_middleware(ResponseLoggingMiddleware)
