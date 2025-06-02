"""
Unit tests for the database provider.
"""
import pytest
import uuid

from providers.database.base import BaseDatabase
from providers.database.memory import MemoryDatabase

class TestMemoryDatabase:
    """Tests for the MemoryDatabase implementation."""
    
    def setup_method(self):
        """Set up the test environment."""
        self.collection_name = f"test_collection_{uuid.uuid4().hex[:8]}"
        self.db = MemoryDatabase(self.collection_name)
    
    def test_database_interface(self):
        """Test that the database implements the required interface."""
        assert isinstance(self.db, BaseDatabase)
    
    @pytest.mark.asyncio
    async def test_create_and_get_collection(self):
        """Test creating and getting a collection."""
        # Create a test collection
        collection_data = {
            "name": "Test Collection",
            "description": "A test collection",
            "metadata": {"key": "value"}
        }
        
        collection_id = await self.db.create_collection(collection_data)
        
        # Get the collection
        try:
            collection = await self.db.get_collection(collection_id["id"])
            
            assert collection["id"] == collection_id["id"]
            assert collection["name"] == collection_data["name"]
            assert collection["description"] == collection_data["description"]
            assert collection["metadata"]["key"] == collection_data["metadata"]["key"]
        except Exception as e:
            # If the test fails here, let's print some diagnostic info
            print(f"Collection ID type: {type(collection_id)}")
            print(f"Collection ID: {collection_id}")
            raise e
    
    @pytest.mark.asyncio
    async def test_list_collections(self):
        """Test listing collections."""
        # Create a couple of test collections
        collection_data1 = {
            "name": "Test Collection 1",
            "description": "A test collection",
            "metadata": {"key": "value1"}
        }
        
        collection_data2 = {
            "name": "Test Collection 2",
            "description": "Another test collection",
            "metadata": {"key": "value2"}
        }
        
        await self.db.create_collection(collection_data1)
        await self.db.create_collection(collection_data2)
        
        # List collections
        collections = await self.db.list_collections()
        
        assert isinstance(collections, list)
        assert len(collections) >= 2
    
    @pytest.mark.asyncio
    async def test_update_collection(self):
        """Test updating a collection."""
        # Create a test collection
        collection_data = {
            "name": "Test Collection",
            "description": "A test collection",
            "metadata": {"key": "value"}
        }
        
        collection_id = await self.db.create_collection(collection_data)
        
        # Update the collection
        updated_data = {
            "name": "Updated Test Collection",
            "description": "An updated test collection",
            "metadata": {"key": "new_value"}
        }
        
        await self.db.update_collection(collection_id["id"], updated_data)
        
        # Get the updated collection
        collection = await self.db.get_collection(collection_id["id"])
        
        assert collection["id"] == collection_id["id"]
        assert collection["name"] == updated_data["name"]
        assert collection["description"] == updated_data["description"]
        assert collection["metadata"]["key"] == updated_data["metadata"]["key"]
    
    @pytest.mark.asyncio
    async def test_delete_collection(self):
        """Test deleting a collection."""
        # Create a test collection
        collection_data = {
            "name": "Test Collection",
            "description": "A test collection",
            "metadata": {"key": "value"}
        }
        
        collection_id = await self.db.create_collection(collection_data)
        
        # Delete the collection
        await self.db.delete_collection(collection_id["id"])
        
        # Try to get the deleted collection
        with pytest.raises(Exception):
            await self.db.get_collection(collection_id["id"])
