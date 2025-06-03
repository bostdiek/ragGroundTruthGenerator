#!/usr/bin/env python3

"""
Debug script to test the get_collections endpoint
"""

import asyncio

from providers.database import get_database
from providers.memory_db import _database


async def test_get_collections():
    print("Testing the get_collections logic directly")

    # Simulate the collections endpoint logic
    collections_db = get_database("collections")
    collections = await collections_db.list_collections()

    # Print the collections from the database
    print(f"\nFound {len(collections)} collections in database")

    # For each collection, get QA pair statistics (exactly like in the endpoint)
    qa_pairs_db = get_database("qa_pairs")
    for collection in collections:
        # Get count of QA pairs for this collection
        print(f"\nLooking for QA pairs with collection_id: {collection['id']}")

        # Dump the current QA pairs database state
        print("Current QA pairs in memory:")
        for qa in _database.get("qa_pairs", []):
            print(f"  {qa.get('id')}: Collection={qa.get('collection_id')}")

        # Try filter using list_collections
        qa_pairs = await qa_pairs_db.list_collections(
            {"collection_id": collection["id"]}
        )
        print(f"Found {len(qa_pairs)} QA pairs using list_collections()")

        # Skip this since it seems our container has a different implementation
        # qa_pairs_alt = await qa_pairs_db.find_all({"collection_id": collection["id"]})
        # print(f"Found {len(qa_pairs_alt)} QA pairs using find_all()")

        # Try manual filtering
        manual_count = sum(
            1
            for qa in _database.get("qa_pairs", [])
            if qa.get("collection_id") == collection["id"]
        )
        print(f"Manual count: {manual_count}")

        # Set the document_count
        collection["document_count"] = len(qa_pairs)

        # Get counts by status
        status_counts = {}
        for qa_pair in qa_pairs:
            status = qa_pair.get("status", "draft")
            status_counts[status] = status_counts.get(status, 0) + 1
        collection["status_counts"] = status_counts

    # Print final results
    print("\nFinal collection data:")
    for collection in collections:
        print(
            f"Collection {collection['id']}: {collection['name']} - {collection['document_count']} QA pairs"
        )
        print(f"  Status counts: {collection['status_counts']}")


if __name__ == "__main__":
    asyncio.run(test_get_collections())
