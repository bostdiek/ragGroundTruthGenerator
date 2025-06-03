"""
This script tests the memory database implementation.

It verifies that the MemoryDatabase class correctly handles
collection and QA pair operations using the provider pattern.
"""

import asyncio
import os
import sys

# Add the parent directory to the path to allow importing from providers
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from providers.database.memory import get_memory_database


async def test_memory_db():
    print("\n=== Testing Memory Database ===\n")

    # Test collections operations
    print("Testing collections operations...")
    collections_db = get_memory_database("collections")

    # Get all collections
    collections = await collections_db.list_collections()
    print(f"Found {len(collections)} collections")

    # Get a specific collection
    if collections:
        collection_id = collections[0]["id"]
        print(f"\nLooking for collection with ID: {collection_id}")
        collection = await collections_db.find_one({"id": collection_id})

        if collection:
            print(f"Found collection: {collection['name']}")
        else:
            print(f"Collection not found: {collection_id}")

    # Test QA pairs operations
    print("\nTesting QA pairs operations...")
    qa_pairs_db = get_memory_database("qa_pairs")

    # Get all QA pairs
    qa_pairs = await qa_pairs_db.list_collections()
    print(f"Found {len(qa_pairs)} QA pairs")

    # Get QA pairs for a specific collection
    if collections:
        collection_id = collections[0]["id"]
        print(f"\nLooking for QA pairs with collection_id: {collection_id}")
        collection_qa_pairs = await qa_pairs_db.find_all(
            {"collection_id": collection_id}
        )

        print(
            f"Found {len(collection_qa_pairs)} QA pairs for collection {collection_id}"
        )

        # Get a specific QA pair
        if collection_qa_pairs:
            qa_pair_id = collection_qa_pairs[0]["id"]
            print(f"\nLooking for QA pair with ID: {qa_pair_id}")
            qa_pair = await qa_pairs_db.find_one({"id": qa_pair_id})

            if qa_pair:
                print(f"Found QA pair: {qa_pair['question']}")

                # Update the QA pair
                print("\nUpdating QA pair...")
                updated_status = (
                    "revision_requested"
                    if qa_pair["status"] != "revision_requested"
                    else "approved"
                )
                updated_qa_pair = await qa_pairs_db.update_one(
                    {"id": qa_pair_id}, {"status": updated_status}
                )

                if updated_qa_pair:
                    print(f"Updated QA pair status to: {updated_qa_pair['status']}")

                    # Verify the update
                    verified_qa_pair = await qa_pairs_db.find_one({"id": qa_pair_id})
                    print(f"Verified QA pair status: {verified_qa_pair['status']}")
                else:
                    print("Failed to update QA pair")
            else:
                print(f"QA pair not found: {qa_pair_id}")


async def main():
    await test_memory_db()


if __name__ == "__main__":
    asyncio.run(main())
