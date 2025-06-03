"""
Debug script to test QA pair endpoints.

This script tests the QA pair endpoints directly from the memory database.
"""

import asyncio
from pprint import pprint

from providers.memory_db import _database


async def test_qa_pair_retrieval():
    print("Testing QA pair retrieval...")

    # Get all QA pairs
    print("\nAll QA pairs:")
    for qa_pair in _database.get("qa_pairs", []):
        print(
            f"- ID: {qa_pair.get('id')}, Question: {qa_pair.get('question')}, Collection: {qa_pair.get('collection_id')}"
        )

    # Get a specific QA pair
    qa_pair_id = "qa1"
    print(f"\nLooking for QA pair with ID: {qa_pair_id}")

    # Find the QA pair by ID
    qa_pair = None
    for qap in _database.get("qa_pairs", []):
        if qap.get("id") == qa_pair_id:
            qa_pair = qap
            break

    if qa_pair:
        print(f"Found QA pair with ID {qa_pair_id}:")
        pprint(qa_pair)
    else:
        print(f"QA pair with ID {qa_pair_id} not found")


async def test_qa_pair_update():
    print("\nTesting QA pair update...")

    # Get a specific QA pair
    qa_pair_id = "qa1"
    print(f"\nLooking for QA pair with ID: {qa_pair_id}")

    # Find the QA pair by ID
    qa_pair = None
    qa_pair_index = None
    for i, qap in enumerate(_database.get("qa_pairs", [])):
        if qap.get("id") == qa_pair_id:
            qa_pair = qap
            qa_pair_index = i
            break

    if not qa_pair:
        print(f"QA pair with ID {qa_pair_id} not found")
        return

    # Print original QA pair
    print(f"Original QA pair status: {qa_pair.get('status')}")

    # Update the QA pair
    updated_status = (
        "revision_requested"
        if qa_pair.get("status") != "revision_requested"
        else "approved"
    )
    qa_pair["status"] = updated_status
    _database["qa_pairs"][qa_pair_index] = qa_pair

    print(f"Updated QA pair status to: {updated_status}")

    # Verify the update
    for qap in _database.get("qa_pairs", []):
        if qap.get("id") == qa_pair_id:
            print(f"Verified QA pair status after update: {qap.get('status')}")


async def main():
    await test_qa_pair_retrieval()
    await test_qa_pair_update()


if __name__ == "__main__":
    asyncio.run(main())
