#!/usr/bin/env python3

"""
Debug script to test the authentication endpoint
"""

import asyncio
import json

from providers.factory import get_auth_provider
from providers.simple_auth import DEMO_USERS


async def test_auth_endpoint():
    print("Testing the authentication logic directly")

    # Get the authentication provider
    auth_provider = get_auth_provider()

    # Print available users
    print("\nAvailable users in memory:")
    for email, user in DEMO_USERS.items():
        print(f"  {email}: {user.get('password')} (Roles: {user.get('roles', [])})")

    # Test login with demo user
    print("\nTesting login with demo user:")
    try:
        result = await auth_provider.authenticate("demo@example.com", "password")
        print(f"Login successful: {json.dumps(result, indent=2)}")
    except Exception as e:
        print(f"Login failed: {str(e)}")

    # Test login with invalid credentials
    print("\nTesting login with invalid credentials:")
    try:
        result = await auth_provider.authenticate(
            "invalid@example.com", "wrongpassword"
        )
        print(f"Login successful (unexpected): {json.dumps(result, indent=2)}")
    except Exception as e:
        print(f"Login failed (expected): {str(e)}")


if __name__ == "__main__":
    asyncio.run(test_auth_endpoint())
