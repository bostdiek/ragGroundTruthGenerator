"""
This script tests the QA pair HTTP endpoints.

It checks the get_qa_pair and update_qa_pair endpoints.
"""

import asyncio
import os
import sys

# Add the parent directory to sys.path to allow importing from providers
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

import httpx

BASE_URL = "http://localhost:8000/api/collections"


async def test_qa_pair_endpoints():
    async with httpx.AsyncClient() as client:
        # Get all collections
        print("Getting all collections...")
        response = await client.get(f"{BASE_URL}/")

        if response.status_code != 200:
            print(f"Failed to get collections: {response.status_code}")
            print(response.text)
            return

        collections = response.json()
        if not collections:
            print("No collections found")
            return

        collection_id = collections[0]["id"]
        print(f"Using collection: {collection_id}")

        # Get QA pairs for the collection
        print(f"\nGetting QA pairs for collection {collection_id}...")
        response = await client.get(f"{BASE_URL}/{collection_id}/qa-pairs")

        if response.status_code != 200:
            print(f"Failed to get QA pairs: {response.status_code}")
            print(response.text)
            return

        qa_pairs = response.json()
        if not qa_pairs:
            print(f"No QA pairs found for collection {collection_id}")
            return

        qa_pair_id = qa_pairs[0]["id"]
        print(f"Using QA pair: {qa_pair_id}")

        # Get specific QA pair
        print(f"\nGetting specific QA pair {qa_pair_id}...")
        response = await client.get(f"{BASE_URL}/qa-pairs/{qa_pair_id}")

        if response.status_code != 200:
            print(f"Failed to get QA pair: {response.status_code}")
            print(response.text)
            return

        qa_pair = response.json()
        print("QA pair retrieved successfully")
        print(f"Question: {qa_pair['question']}")
        print(f"Status: {qa_pair['status']}")

        # Update QA pair
        print(f"\nUpdating QA pair {qa_pair_id}...")
        new_status = (
            "revision_requested"
            if qa_pair["status"] != "revision_requested"
            else "approved"
        )
        update_data = {"status": new_status}

        response = await client.patch(
            f"{BASE_URL}/qa-pairs/{qa_pair_id}", json=update_data
        )

        if response.status_code != 200:
            print(f"Failed to update QA pair: {response.status_code}")
            print(response.text)
            return

        updated_qa_pair = response.json()
        print("QA pair updated successfully")
        print(f"New status: {updated_qa_pair['status']}")

        # Verify the update by getting the QA pair again
        print(f"\nVerifying update by getting QA pair {qa_pair_id} again...")
        response = await client.get(f"{BASE_URL}/qa-pairs/{qa_pair_id}")

        if response.status_code != 200:
            print(f"Failed to get updated QA pair: {response.status_code}")
            print(response.text)
            return

        verified_qa_pair = response.json()
        print("QA pair retrieved successfully")
        print(f"Verified status: {verified_qa_pair['status']}")

        if verified_qa_pair["status"] == new_status:
            print("Update was successful!")
        else:
            print(
                f"Update failed. Expected {new_status}, got {verified_qa_pair['status']}"
            )


if __name__ == "__main__":
    asyncio.run(test_qa_pair_endpoints())
