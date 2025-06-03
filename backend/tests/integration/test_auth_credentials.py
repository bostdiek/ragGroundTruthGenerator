#!/usr/bin/env python3

"""
Test script to verify authentication with different usernames
"""

import asyncio
import os
import sys

# Add the parent directory to sys.path to allow importing from providers
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from providers.auth.simple_auth import DEMO_USERS
from providers.factory import get_auth_provider


async def test_auth_credentials():
    print("Testing authentication with different credentials")

    # Get the authentication provider
    auth_provider = get_auth_provider()

    # Print available users
    print("\nAvailable users in memory:")
    for username, user in DEMO_USERS.items():
        print(f"  {username}: {user.get('password')} (Roles: {user.get('roles', [])})")

    # Test credentials to try
    test_credentials = [
        {"username": "demo", "password": "password", "expected": True},
        {"username": "demo@example.com", "password": "password", "expected": True},
        {"username": "admin", "password": "admin123", "expected": True},
        {"username": "admin@example.com", "password": "admin123", "expected": True},
        {"username": "demo", "password": "wrong", "expected": False},
        {"username": "unknown", "password": "password", "expected": False},
    ]

    # Test each set of credentials
    print("\nTesting credentials:")
    for cred in test_credentials:
        username = cred["username"]
        password = cred["password"]
        expected = cred["expected"]

        print(
            f"\n> Testing {username}:{password} (Expected: {'Success' if expected else 'Failure'})"
        )
        try:
            result = await auth_provider.authenticate(username, password)
            print(f"  Result: Success - Got token for {result['user']['name']}")
            if not expected:
                print("  WARNING: Authentication succeeded but was expected to fail")
        except Exception as e:
            print(f"  Result: Failure - {str(e)}")
            if expected:
                print("  WARNING: Authentication failed but was expected to succeed")


if __name__ == "__main__":
    asyncio.run(test_auth_credentials())
