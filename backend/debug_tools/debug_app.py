#!/usr/bin/env python3

"""
Debug script to test the entire application
"""

import asyncio
import os

from providers.factory import get_auth_provider
from providers.memory_db import _database


async def diagnose_application():
    print("=== BACKEND APPLICATION DIAGNOSTICS ===\n")

    # 1. Check memory database state
    print("\n=== MEMORY DATABASE STATE ===")
    print(f"Collections count: {len(_database.get('collections', []))}")
    print(f"QA Pairs count: {len(_database.get('qa_pairs', []))}")

    # 2. Print collections and their QA pairs
    print("\n=== COLLECTIONS AND QA PAIRS ===")
    for collection in _database.get("collections", []):
        collection_id = collection.get("id")
        collection_name = collection.get("name")
        print(f"\nCollection: {collection_name} (ID: {collection_id})")

        # Count QA pairs manually
        qa_count = 0
        qa_pairs_for_collection = []
        for qa_pair in _database.get("qa_pairs", []):
            if qa_pair.get("collection_id") == collection_id:
                qa_count += 1
                qa_pairs_for_collection.append(qa_pair)

        print(f"QA Pairs count (manual): {qa_count}")
        print(
            f"QA Pairs count (from collection): {collection.get('document_count', 'NOT SET')}"
        )

        # Print status counts
        status_counts = {}
        for qa_pair in qa_pairs_for_collection:
            status = qa_pair.get("status", "draft")
            status_counts[status] = status_counts.get(status, 0) + 1
        print(f"Status counts: {status_counts}")

    # 3. Check authentication
    print("\n=== AUTHENTICATION ===")
    auth_provider = get_auth_provider()
    print("Auth provider type:", type(auth_provider).__name__)

    # Print available users
    print("\nAvailable users:")
    from providers.auth.simple_auth import DEMO_USERS

    for email, user in DEMO_USERS.items():
        print(f"  {email}: {user.get('password')} (Roles: {user.get('roles', [])})")

    # 4. Environment variables
    print("\n=== ENVIRONMENT VARIABLES ===")
    env_vars = [
        "AUTH_PROVIDER",
        "GENERATION_PROVIDER",
        "RETRIEVAL_PROVIDER",
        "ENABLED_DATA_SOURCES",
        "DEBUG",
    ]
    for var in env_vars:
        print(f"{var}: {os.getenv(var, 'NOT SET')}")

    print("\n=== END OF DIAGNOSTICS ===")


if __name__ == "__main__":
    asyncio.run(diagnose_application())
