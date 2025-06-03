"""
This script tests the updated router endpoints with the enhanced database provider.

It starts a server and makes a few requests to verify that the endpoints work with
the enhanced database provider.
"""
import os
import asyncio
import subprocess
import time
import json
import requests
import signal
import sys

# Add the parent directory to sys.path to allow importing from providers
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

SERVER_PROCESS = None

async def start_server():
    """Start the FastAPI server in a subprocess."""
    print("Starting the server...")
    global SERVER_PROCESS
    
    # Set the environment variable to use the memory database
    os.environ["DATABASE_PROVIDER"] = "memory"
    
    # Start the server
    SERVER_PROCESS = subprocess.Popen(
        ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
    )
    
    # Wait for the server to start
    print("Waiting for the server to start...")
    time.sleep(3)

async def stop_server():
    """Stop the FastAPI server."""
    print("\nStopping the server...")
    if SERVER_PROCESS:
        SERVER_PROCESS.terminate()
        SERVER_PROCESS.wait()
        print("Server stopped.")

async def test_endpoints():
    """Test the endpoints with the enhanced database provider."""
    base_url = "http://localhost:8000"
    
    try:
        # Test the health endpoint
        print("\nTesting health endpoint...")
        response = requests.get(f"{base_url}/health")
        print(f"Health endpoint response: {response.status_code}")
        print(f"Health endpoint data: {response.json()}")
        
        # Test the collections endpoint
        print("\nTesting collections endpoint...")
        response = requests.get(f"{base_url}/collections")
        print(f"Collections endpoint response: {response.status_code}")
        collections = response.json()
        print(f"Found {len(collections)} collections")
        
        if collections:
            # Test the collection detail endpoint
            collection_id = collections[0]["id"]
            print(f"\nTesting collection detail endpoint for collection {collection_id}...")
            response = requests.get(f"{base_url}/collections/{collection_id}")
            print(f"Collection detail endpoint response: {response.status_code}")
            collection = response.json()
            print(f"Collection name: {collection['name']}")
            print(f"Collection document count: {collection['document_count']}")
            
            # Test the QA pairs endpoint
            print(f"\nTesting QA pairs endpoint for collection {collection_id}...")
            response = requests.get(f"{base_url}/collections/{collection_id}/qa-pairs")
            print(f"QA pairs endpoint response: {response.status_code}")
            qa_pairs = response.json()
            print(f"Found {len(qa_pairs)} QA pairs")
            
            if qa_pairs:
                # Test the QA pair detail endpoint
                qa_pair_id = qa_pairs[0]["id"]
                print(f"\nTesting QA pair detail endpoint for QA pair {qa_pair_id}...")
                response = requests.get(f"{base_url}/collections/qa-pairs/{qa_pair_id}")
                print(f"QA pair detail endpoint response: {response.status_code}")
                qa_pair = response.json()
                print(f"QA pair question: {qa_pair['question']}")
                print(f"QA pair status: {qa_pair['status']}")
                
                # Test the QA pair update endpoint
                print(f"\nTesting QA pair update endpoint for QA pair {qa_pair_id}...")
                new_status = "revision_requested" if qa_pair["status"] != "revision_requested" else "approved"
                response = requests.patch(
                    f"{base_url}/collections/qa-pairs/{qa_pair_id}",
                    json={"status": new_status}
                )
                print(f"QA pair update endpoint response: {response.status_code}")
                updated_qa_pair = response.json()
                print(f"Updated QA pair status: {updated_qa_pair['status']}")
    
    except Exception as e:
        print(f"Error testing endpoints: {e}")

async def main():
    """Main function to run the tests."""
    try:
        await start_server()
        await test_endpoints()
    finally:
        await stop_server()

if __name__ == "__main__":
    # Handle keyboard interrupts
    def signal_handler(sig, frame):
        print("\nCaught keyboard interrupt, stopping...")
        asyncio.run(stop_server())
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    
    # Run the tests
    asyncio.run(main())
