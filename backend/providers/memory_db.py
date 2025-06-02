"""
Simple in-memory database provider for development.

This module provides a simple in-memory database implementation for development.
In production, replace this with your actual database implementation (MongoDB, CosmosDB, etc.).
"""
import json
import os
from datetime import datetime, UTC
from typing import Any, Dict, List, Optional

# Simple in-memory database for development
# This will be reset when the application restarts
_database: Dict[str, List[Dict[str, Any]]] = {
    "collections": [
        {
            "id": "col1",
            "name": "Equipment Manuals",
            "description": "Technical manuals for equipment maintenance",
            "tags": ["manuals", "maintenance", "technical"],
            "document_count": 45,
            "created_at": "2023-05-15T10:30:00Z",
            "updated_at": "2023-06-20T15:45:00Z"
        },
        {
            "id": "col2",
            "name": "SAP Notifications",
            "description": "Historical customer issues and resolutions",
            "tags": ["sap", "notifications", "issues"],
            "document_count": 128,
            "created_at": "2023-04-10T09:15:00Z",
            "updated_at": "2023-06-22T11:20:00Z"
        },
        {
            "id": "col3",
            "name": "Internal Wiki",
            "description": "Knowledge base for common procedures",
            "tags": ["wiki", "knowledge", "procedures"],
            "document_count": 73,
            "created_at": "2023-01-05T14:20:00Z",
            "updated_at": "2023-06-15T08:30:00Z"
        }
    ],
    "qa_pairs": [
        {
            "id": "qa1",
            "collection_id": "col1",
            "question": "How do I reset the equipment?",
            "answer": "To reset the equipment, power cycle the device and wait for 30 seconds before turning it back on.",
            "documents": [
                {
                    "id": "doc1",
                    "title": "Equipment Manual",
                    "content": "Section on troubleshooting steps for common issues. Power cycle procedures are outlined on page 42.",
                    "source": {
                        "id": "tech_docs",
                        "name": "Technical Documentation",
                        "type": "manual"
                    },
                    "url": "https://example.com/docs/equipment-manual.pdf",
                    "metadata": {
                        "document_id": "EM-2023-042",
                        "last_updated": "2023-03-15",
                        "version": "2.4",
                        "department": "Engineering",
                        "page_number": 42
                    }
                }
            ],
            "status": "approved",
            "metadata": {"priority": "high"},
            "created_at": "2023-06-01T10:00:00Z",
            "updated_at": "2023-06-02T15:30:00Z",
            "created_by": "demo_user"
        },
        {
            "id": "qa2",
            "collection_id": "col1",
            "question": "What are the maintenance intervals?",
            "answer": "Regular maintenance should be performed every 3 months, with a major service annually.",
            "documents": [
                {
                    "id": "doc2",
                    "title": "Maintenance Schedule",
                    "content": "Regular maintenance intervals are specified as quarterly (every 3 months) for basic service, with an annual comprehensive service that includes component replacement and calibration.",
                    "source": {
                        "id": "tech_docs",
                        "name": "Technical Documentation",
                        "type": "schedule"
                    },
                    "url": "https://example.com/docs/maintenance-schedule.pdf",
                    "metadata": {
                        "document_id": "MS-2023-015",
                        "last_updated": "2023-02-10",
                        "version": "1.2",
                        "department": "Maintenance",
                        "priority": "high"
                    }
                }
            ],
            "status": "ready_for_review",
            "metadata": {"priority": "medium"},
            "created_at": "2023-06-05T09:45:00Z",
            "updated_at": "2023-06-06T14:20:00Z",
            "created_by": "demo_user"
        },
        {
            "id": "qa3",
            "collection_id": "col2",
            "question": "How do I create a new SAP notification?",
            "answer": "Navigate to the Notifications module, click 'Create New', fill in the required fields, and submit the form.",
            "documents": [
                {
                    "id": "doc3",
                    "title": "SAP User Guide",
                    "content": "To create a new notification in SAP, navigate to the Notifications module using the main menu. Click on the 'Create New' button in the top toolbar. Fill in all required fields marked with an asterisk (*), including notification type, priority, and description. Attach any relevant documents using the attachment feature. Review the information and click 'Submit' to create the notification.",
                    "source": {
                        "id": "sap_docs",
                        "name": "SAP Documentation",
                        "type": "user_guide"
                    },
                    "url": "https://example.com/docs/sap-guide.pdf",
                    "metadata": {
                        "document_id": "SAP-UG-2023-034",
                        "last_updated": "2023-01-05",
                        "version": "3.1",
                        "department": "IT",
                        "module": "Notifications"
                    }
                }
            ],
            "status": "ready_for_review",
            "metadata": {"priority": "low"},
            "created_at": "2023-06-10T11:30:00Z",
            "updated_at": "2023-06-10T11:30:00Z",
            "created_by": "demo_user"
        },
        {
            "id": "qa4",
            "collection_id": "col3",
            "question": "Where can I find the company holiday schedule?",
            "answer": "The company holiday schedule is available on the HR page of the internal wiki, under 'Benefits and Time Off'.",
            "documents": [
                {
                    "id": "doc4",
                    "title": "HR Policies",
                    "content": "The company holiday schedule is published annually on the HR page of the internal wiki. Navigate to the 'Benefits and Time Off' section to find the current year's holiday calendar. This calendar includes all company-wide holidays, floating holidays, and early closure days. Employees should refer to this schedule when planning time off to avoid scheduling conflicts with company closures.",
                    "source": {
                        "id": "internal_wiki",
                        "name": "Internal Wiki",
                        "type": "policy"
                    },
                    "url": "https://internal-wiki.example.com/hr/benefits/holidays",
                    "metadata": {
                        "document_id": "HR-POL-2023-007",
                        "last_updated": "2023-01-15",
                        "version": "2023.1",
                        "department": "Human Resources",
                        "category": "Benefits"
                    }
                }
            ],
            "status": "approved",
            "metadata": {"priority": "medium"},
            "created_at": "2023-05-20T13:15:00Z",
            "updated_at": "2023-05-21T09:10:00Z",
            "created_by": "demo_user"
        },
        {
            "id": "qa5",
            "collection_id": "col1",
            "question": "How do I troubleshoot error code E-45?",
            "answer": "Error code E-45 indicates a power supply issue. Check the power connections and voltage levels.",
            "documents": [
                {
                    "id": "doc1",
                    "title": "Equipment Manual",
                    "content": "Error code E-45 indicates a power supply issue. This is typically caused by voltage fluctuations, loose connections, or faulty power supply units. Check all power connections for secure fitting, verify the input voltage matches specifications (110-120V or 220-240V depending on your region), and inspect the power supply unit for visible damage. If the issue persists after checking connections, the power supply unit may need replacement.",
                    "source": {
                        "id": "tech_docs",
                        "name": "Technical Documentation",
                        "type": "manual"
                    },
                    "url": "https://example.com/docs/equipment-manual.pdf",
                    "metadata": {
                        "document_id": "EM-2023-042",
                        "last_updated": "2023-03-15",
                        "version": "2.4",
                        "department": "Engineering",
                        "page_number": 87,
                        "section": "Error Codes"
                    }
                }
            ],
            "status": "rejected",
            "metadata": {"priority": "high"},
            "created_at": "2023-06-08T14:20:00Z",
            "updated_at": "2023-06-09T10:15:00Z",
            "created_by": "demo_user"
        },
        {
            "id": "qa6",
            "collection_id": "col1",
            "question": "What is the warranty period for replacement parts?",
            "answer": "All replacement parts come with a 90-day warranty from the date of installation.",
            "documents": [
                {
                    "id": "doc5",
                    "title": "Warranty Information",
                    "content": "All replacement parts provided by the manufacturer come with a standard 90-day warranty from the date of installation. This warranty covers defects in materials and workmanship under normal use conditions. To claim warranty service, customers must provide proof of installation date and the original work order number. Extended warranty options are available for purchase at an additional cost, extending coverage to 1 year or 2 years from installation date.",
                    "source": {
                        "id": "tech_docs",
                        "name": "Technical Documentation",
                        "type": "warranty"
                    },
                    "url": "https://example.com/docs/warranty-information.pdf",
                    "metadata": {
                        "document_id": "WI-2023-018",
                        "last_updated": "2023-02-28",
                        "version": "1.3",
                        "department": "Customer Service",
                        "legal_approval": "Approved"
                    }
                }
            ],
            "status": "revision_requested",
            "metadata": {
                "priority": "medium",
                "revision_comments": "Please provide more details about the extended warranty options, including pricing and terms for the 1-year and 2-year options."
            },
            "created_at": "2023-06-12T09:30:00Z",
            "updated_at": "2023-06-12T09:30:00Z",
            "created_by": "demo_user"
        },
        {
            "id": "qa7",
            "collection_id": "col2",
            "question": "What information should be included in an SAP notification?",
            "answer": "An SAP notification should include the equipment ID, problem description, and priority level.",
            "documents": [
                {
                    "id": "doc3",
                    "title": "SAP User Guide",
                    "content": "When creating a notification in SAP, certain information is required to ensure proper handling and resolution. The notification form includes fields for equipment identification, problem categorization, and priority assignment. Additional information can be added in the notes section and through file attachments.",
                    "source": {
                        "id": "sap_docs",
                        "name": "SAP Documentation",
                        "type": "user_guide"
                    },
                    "url": "https://example.com/docs/sap-guide.pdf",
                    "metadata": {
                        "document_id": "SAP-UG-2023-034",
                        "last_updated": "2023-01-05",
                        "version": "3.1",
                        "department": "IT",
                        "module": "Notifications"
                    }
                }
            ],
            "status": "revision_requested",
            "metadata": {
                "priority": "high",
                "revision_comments": "The answer is incomplete. Please include information about required vs. optional fields, and mention the attachment capabilities for photos and supporting documents."
            },
            "created_at": "2023-05-30T14:15:00Z",
            "updated_at": "2023-06-01T09:25:00Z",
            "created_by": "demo_user"
        },
        {
            "id": "qa8",
            "collection_id": "col3",
            "question": "How do I request access to restricted wiki sections?",
            "answer": "To request access to restricted wiki sections, contact your department manager.",
            "documents": [
                {
                    "id": "doc4",
                    "title": "HR Policies",
                    "content": "Access to restricted sections of the internal wiki is managed by department managers. Employees needing access to additional content should submit a request through their direct supervisor.",
                    "source": {
                        "id": "internal_wiki",
                        "name": "Internal Wiki",
                        "type": "policy"
                    },
                    "url": "https://internal-wiki.example.com/hr/policies/access",
                    "metadata": {
                        "document_id": "HR-POL-2023-012",
                        "last_updated": "2023-02-10",
                        "version": "2023.1",
                        "department": "Human Resources",
                        "category": "Access Control"
                    }
                }
            ],
            "status": "revision_requested",
            "metadata": {
                "priority": "low",
                "revision_comments": "This answer needs to be expanded to include the formal process. Please specify that requests must be submitted through the IT portal with manager approval, and include the typical approval timeline."
            },
            "created_at": "2023-06-05T11:30:00Z",
            "updated_at": "2023-06-07T14:20:00Z",
            "created_by": "demo_user"
        }
    ],
    "documents": [
        {
            "id": "doc1",
            "title": "Equipment Manual",
            "content": "Comprehensive guide for equipment operation, maintenance, and troubleshooting.",
            "source": {
                "id": "tech_docs",
                "name": "Technical Documentation",
                "type": "manual"
            },
            "url": "https://example.com/docs/equipment-manual.pdf",
            "metadata": {
                "document_id": "EM-2023-042",
                "last_updated": "2023-03-15",
                "version": "2.4",
                "department": "Engineering"
            },
            "created_at": "2023-05-10T08:00:00Z",
            "updated_at": "2023-05-10T08:00:00Z"
        },
        {
            "id": "doc2",
            "title": "Maintenance Schedule",
            "content": "Detailed maintenance intervals and procedures for all equipment types.",
            "source": {
                "id": "tech_docs",
                "name": "Technical Documentation",
                "type": "schedule"
            },
            "url": "https://example.com/docs/maintenance-schedule.pdf",
            "metadata": {
                "document_id": "MS-2023-015",
                "last_updated": "2023-02-10",
                "version": "1.2",
                "department": "Maintenance"
            },
            "created_at": "2023-05-12T10:30:00Z",
            "updated_at": "2023-05-12T10:30:00Z"
        },
        {
            "id": "doc3",
            "title": "SAP User Guide",
            "content": "Comprehensive guide for using the SAP system, including creating and managing notifications.",
            "source": {
                "id": "sap_docs",
                "name": "SAP Documentation",
                "type": "user_guide"
            },
            "url": "https://example.com/docs/sap-guide.pdf",
            "metadata": {
                "document_id": "SAP-UG-2023-034",
                "last_updated": "2023-01-05",
                "version": "3.1",
                "department": "IT"
            },
            "created_at": "2023-04-05T14:45:00Z",
            "updated_at": "2023-04-05T14:45:00Z"
        },
        {
            "id": "doc4",
            "title": "HR Policies",
            "content": "Official company policies related to human resources, benefits, and workplace conduct.",
            "source": {
                "id": "internal_wiki",
                "name": "Internal Wiki",
                "type": "policy"
            },
            "url": "https://internal-wiki.example.com/hr/policies",
            "metadata": {
                "document_id": "HR-POL-2023-007",
                "last_updated": "2023-01-15",
                "version": "2023.1",
                "department": "Human Resources"
            },
            "created_at": "2023-01-15T09:20:00Z",
            "updated_at": "2023-01-15T09:20:00Z"
        },
        {
            "id": "doc5",
            "title": "Warranty Information",
            "content": "Detailed warranty terms and conditions for all products and replacement parts.",
            "source": {
                "id": "tech_docs",
                "name": "Technical Documentation",
                "type": "warranty"
            },
            "url": "https://example.com/docs/warranty-information.pdf",
            "metadata": {
                "document_id": "WI-2023-018",
                "last_updated": "2023-02-28",
                "version": "1.3",
                "department": "Customer Service"
            },
            "created_at": "2023-02-28T11:15:00Z",
            "updated_at": "2023-02-28T11:15:00Z"
        }
    ]
}

class MemoryDB:
    """
    A simple in-memory database implementation for development.
    
    This class provides basic CRUD operations for collections in the in-memory database.
    In production, replace this with your actual database implementation.
    """
    
    def __init__(self, collection_name: str):
        """
        Initialize the memory database with a collection name.
        
        Args:
            collection_name: The name of the collection to operate on.
        """
        self.collection_name = collection_name
        
        # Create the collection if it doesn't exist
        if collection_name not in _database:
            _database[collection_name] = []
    
    # Add aliases for method names to match test expectations
    async def list_collections(self, query: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Alias for find_all() to maintain compatibility."""
        return await self.find_all(query)
        
    async def get_collection(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Alias for find_one() to maintain compatibility."""
        return await self.find_one(query)
        
    async def create_collection(self, document: Dict[str, Any]) -> Dict[str, Any]:
        """Alias for insert_one() to maintain compatibility."""
        return await self.insert_one(document)
    
    async def find_all(self, query: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Find all documents in the collection that match the query.
        
        Args:
            query: The query to filter documents by.
            
        Returns:
            List[Dict[str, Any]]: The list of matching documents.
        """
        if query is None:
            return _database[self.collection_name]
        
        # Simple filtering implementation
        results = []
        for item in _database[self.collection_name]:
            match = True
            for key, value in query.items():
                if key not in item or item[key] != value:
                    match = False
                    break
            if match:
                results.append(item)
        
        return results
    
    async def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Find a single document in the collection that matches the query.
        
        Args:
            query: The query to filter documents by.
            
        Returns:
            Optional[Dict[str, Any]]: The matching document, or None if no match is found.
        """
        results = await self.find_all(query)
        return results[0] if results else None
    
    async def insert_one(self, document: Dict[str, Any]) -> Dict[str, Any]:
        """
        Insert a document into the collection.
        
        Args:
            document: The document to insert.
            
        Returns:
            Dict[str, Any]: The inserted document with generated id.
        """
        # Generate a simple ID if not provided
        if "_id" not in document:
            document["_id"] = f"{len(_database[self.collection_name]) + 1}"
        
        # Add created_at and updated_at timestamps
        document["created_at"] = datetime.now(UTC).isoformat()
        document["updated_at"] = document["created_at"]
        
        _database[self.collection_name].append(document)
        return document
    
    async def update_one(self, query: Dict[str, Any], update: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update a document in the collection.
        
        Args:
            query: The query to find the document to update.
            update: The update to apply to the document.
            
        Returns:
            Optional[Dict[str, Any]]: The updated document, or None if no match is found.
        """
        document = await self.find_one(query)
        if document is None:
            return None
        
        # Apply the update
        document.update(update)
        
        # Update the updated_at timestamp
        document["updated_at"] = datetime.now(UTC).isoformat()
        
        return document
    
    async def delete_one(self, query: Dict[str, Any]) -> bool:
        """
        Delete a document from the collection.
        
        Args:
            query: The query to find the document to delete.
            
        Returns:
            bool: True if a document was deleted, False otherwise.
        """
        document = await self.find_one(query)
        if document is None:
            return False
        
        _database[self.collection_name].remove(document)
        return True

def get_database(collection_name: str) -> MemoryDB:
    """
    Get a database instance for the specified collection.
    
    Args:
        collection_name: The name of the collection to operate on.
        
    Returns:
        MemoryDB: A database instance for the specified collection.
    """
    return MemoryDB(collection_name)
