"""
Script to check for import issues in the refactored backend.
"""
import sys
print(f"Python path: {sys.path}")

# Try importing the main modules
try:
    from routers import auth, collections, generation, retrieval
    print("Router imports successful")
except Exception as e:
    print(f"Router import error: {e}")

# Try importing providers
try:
    from providers import factory
    print("Factory import successful")
    
    # Test factory functions
    try:
        auth_provider = factory.get_auth_provider()
        print(f"Auth provider: {auth_provider}")
    except Exception as e:
        print(f"Auth provider error: {e}")
    
    try:
        generator = factory.get_generator()
        print(f"Generator: {generator}")
    except Exception as e:
        print(f"Generator error: {e}")
    
    try:
        retriever = factory.get_retriever()
        print(f"Retriever: {retriever}")
    except Exception as e:
        print(f"Retriever error: {e}")
        
except Exception as e:
    print(f"Factory import error: {e}")

# Try importing specific provider modules
try:
    from providers.auth import base as auth_base
    print("Auth base import successful")
except Exception as e:
    print(f"Auth base import error: {e}")

try:
    from providers.auth.simple_auth import SimpleAuthProvider
    print("SimpleAuthProvider import successful")
except Exception as e:
    print(f"SimpleAuthProvider import error: {e}")

try:
    from providers.database import base as db_base
    print("Database base import successful")
except Exception as e:
    print(f"Database base import error: {e}")

try:
    from providers.database.memory import get_database
    print("Memory database import successful")
except Exception as e:
    print(f"Memory database import error: {e}")
