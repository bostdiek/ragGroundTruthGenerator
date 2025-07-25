"""
Collections router for the AI Ground Truth Generator backend.

This module handles collection management operations.
"""

import uuid
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel

# Import the database provider
from providers.factory import get_database

# Create router
router = APIRouter()


# Define models
class CollectionBase(BaseModel):
    """Base model for collection data."""

    name: str
    description: str | None = None
    tags: list[str] = []
    metadata: dict[str, Any] | None = None


class CollectionCreate(CollectionBase):
    """Model for collection creation data."""

    pass


class Collection(CollectionBase):
    """Model for collection response data."""

    id: str
    document_count: int = 0
    status_counts: dict[str, int] = {}
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}


# Define collection endpoints
@router.get("/", response_model=list[Collection])
async def get_collections():
    """
    Get a list of collections with their QA pair statistics.

    Returns:
        List[Collection]: A list of collections with statistics.
    """
    # Get collections from the database
    collections_db = get_database("collections")
    collections = await collections_db.list_collections()

    # Get qa_pairs database to query QA pairs for each collection
    qa_pairs_db = get_database("qa_pairs")

    for collection in collections:
        collection_id = collection["id"]
        print(f"Looking for QA pairs with collection_id: {collection_id}")

        # Use the database provider to find QA pairs for this collection
        qa_pairs = await qa_pairs_db.find_all({"collection_id": collection_id})

        print(f"Found {len(qa_pairs)} QA pairs for collection {collection_id}")

        # Set the document count
        collection["document_count"] = len(qa_pairs)

        # Get counts by status
        status_counts = {}
        for qa_pair in qa_pairs:
            qa_status = qa_pair.get("status", "draft")
            status_counts[qa_status] = status_counts.get(qa_status, 0) + 1
        collection["status_counts"] = status_counts

        # Get sample questions (limit to 3)
        sample_questions = [qa_pair["question"] for qa_pair in qa_pairs[:3]]
        collection["sample_questions"] = sample_questions

    # Log the final response being sent
    print(
        f"Returning collections with document counts: {[(c['name'], c['document_count']) for c in collections]}"  # noqa: E501
    )
    return collections


@router.post("/", response_model=Collection, status_code=status.HTTP_201_CREATED)
async def create_collection(collection: CollectionCreate):
    """
    Create a new collection.

    Args:
        collection: The collection data.

    Returns:
        Collection: The created collection.
    """
    # Generate a new ID and timestamps
    collection_id = str(uuid.uuid4())
    current_time = datetime.now(UTC).isoformat()

    # Create the collection object
    new_collection = {
        "id": collection_id,
        "name": collection.name,
        "description": collection.description,
        "tags": collection.tags,
        "metadata": collection.metadata or {},
        "document_count": 0,  # New collections have 0 QA pairs
        "created_at": current_time,
        "updated_at": current_time,
    }

    # Insert the collection into the database
    collections_db = get_database("collections")
    await collections_db.create_collection(new_collection)

    return new_collection


# Add PUT endpoint for updating a collection
@router.put("/{collection_id}", response_model=Collection)
async def update_collection(collection_id: str, collection: CollectionBase):
    """
    Update a specific collection by ID.

    Args:
        collection_id: The ID of the collection to update.
        collection: The updated collection data.

    Returns:
        Collection: The updated collection.
    """
    # Check if the collection exists
    collections_db = get_database("collections")
    existing_collection = await collections_db.find_one({"id": collection_id})

    if not existing_collection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Collection with ID {collection_id} not found",
        )

    # Update the collection
    update_data = {
        "name": collection.name,
        "description": collection.description,
        "tags": collection.tags,
        "metadata": collection.metadata or {},
        "updated_at": datetime.now(UTC).isoformat(),
    }

    updated_collection = await collections_db.update_one(
        {"id": collection_id}, update_data
    )

    if not updated_collection:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update collection",
        )

    # Get updated QA pair statistics
    qa_pairs_db = get_database("qa_pairs")
    qa_pairs = await qa_pairs_db.list_collections({"collection_id": collection_id})

    # Calculate document count
    updated_collection["document_count"] = len(qa_pairs)

    # Calculate counts by status
    status_counts = {}
    for qa_pair in qa_pairs:
        qa_status = qa_pair.get("status", "draft")
        status_counts[qa_status] = status_counts.get(qa_status, 0) + 1
    updated_collection["status_counts"] = status_counts

    return updated_collection


@router.get("/{collection_id}", response_model=Collection)
async def get_collection(collection_id: str):
    """
    Get a specific collection by ID. This implementation uses the enhanced database
    provider.

    Args:
        collection_id: The ID of the collection to retrieve.

    Returns:
        Collection: The requested collection.
    """
    # Get the collection from the database
    collections_db = get_database("collections")
    collection = await collections_db.find_one({"id": collection_id})

    if not collection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Collection with ID {collection_id} not found",
        )

    # Get QA pair statistics
    qa_pairs_db = get_database("qa_pairs")
    qa_pairs = await qa_pairs_db.find_all({"collection_id": collection_id})

    print(f"Found {len(qa_pairs)} QA pairs for collection {collection_id}")

    # Calculate document count
    collection["document_count"] = len(qa_pairs)

    # Calculate counts by status
    status_counts = {}
    for qa_pair in qa_pairs:
        qa_status = qa_pair.get("status", "draft")
        status_counts[qa_status] = status_counts.get(qa_status, 0) + 1
    collection["status_counts"] = status_counts

    return collection


@router.delete("/{collection_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_collection(collection_id: str):
    """
    Delete a specific collection by ID and all associated QA pairs.

    Args:
        collection_id: The ID of the collection to delete.
    """
    try:
        # Use the database provider to delete the collection
        collections_db = get_database("collections")

        # The delete_collection method will handle deleting the collection
        # and all associated QA pairs
        await collections_db.delete_collection(collection_id)

        # Return nothing for successful deletion (204 No Content)
        return None
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(e)
        ) from None


# QA Pair models
class QAPairBase(BaseModel):
    """Base model for QA pair data."""

    question: str
    answer: str
    documents: list[dict[str, Any]] = []
    # Valid status values: ready_for_review, approved, revision_requested, rejected
    status: str = "ready_for_review"
    metadata: dict[str, Any] = {}


class QAPairCreate(QAPairBase):
    """Model for QA pair creation."""

    pass


class QAPair(QAPairBase):
    """Model for QA pair response."""

    id: str
    collection_id: str
    created_at: str
    updated_at: str
    created_by: str = "demo_user"

    model_config = {"from_attributes": True}


# QA Pair endpoints
@router.get("/{collection_id}/qa-pairs", response_model=list[QAPair])
async def get_qa_pairs(collection_id: str):
    """
    Get QA pairs for a collection.

    Args:
        collection_id: The collection ID.

    Returns:
        List[QAPair]: A list of QA pairs.
    """
    print(f"Looking for QA pairs with collection_id: {collection_id}")

    # Use the database provider's list_qa_pairs method
    try:
        qa_pairs_db = get_database("qa_pairs")
        qa_pairs = await qa_pairs_db.list_qa_pairs(collection_id)

        print(f"Found {len(qa_pairs)} QA pairs for collection {collection_id}")

        # Return the QA pairs
        return qa_pairs
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(e)
        ) from None


@router.post(
    "/{collection_id}/qa-pairs",
    response_model=QAPair,
    status_code=status.HTTP_201_CREATED,
)
async def create_qa_pair(collection_id: str, qa_pair: QAPairCreate):
    """
    Create a new QA pair for a collection.

    Args:
        collection_id: The ID of the collection.
        qa_pair: The QA pair data.

    Returns:
        QAPair: The created QA pair.
    """
    # Check if the collection exists
    collections_db = get_database("collections")
    collection = await collections_db.find_one({"id": collection_id})

    if not collection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Collection with ID {collection_id} not found",
        )

    # Create a new QA pair
    qa_pair_id = str(uuid.uuid4())
    current_time = datetime.now(UTC).isoformat()

    new_qa_pair = {
        "id": qa_pair_id,
        "collection_id": collection_id,
        "question": qa_pair.question,
        "answer": qa_pair.answer,
        "documents": qa_pair.documents,
        "status": qa_pair.status or "ready_for_review",
        "metadata": qa_pair.metadata,
        "created_at": current_time,
        "updated_at": current_time,
        "created_by": "demo_user",
    }

    # Insert the QA pair into the database
    qa_pairs_db = get_database("qa_pairs")
    await qa_pairs_db.insert_one(new_qa_pair)

    return new_qa_pair


@router.get("/qa-pairs/{qa_pair_id}", response_model=QAPair)
async def get_qa_pair(qa_pair_id: str):
    """
    Get a specific QA pair by ID.

    Args:
        qa_pair_id: The ID of the QA pair to retrieve.

    Returns:
        QAPair: The requested QA pair.
    """
    # Use the enhanced database provider
    qa_pairs_db = get_database("qa_pairs")
    qa_pair = await qa_pairs_db.find_one({"id": qa_pair_id})

    if not qa_pair:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"QA pair with ID {qa_pair_id} not found",
        )

    print(f"Found QA pair with ID {qa_pair_id}: {qa_pair.get('question')}")
    return qa_pair


class QAPairUpdate(BaseModel):
    """Model for updating a QA pair."""

    status: str | None = None
    answer: str | None = None
    question: str | None = None
    documents: list[dict[str, Any]] | None = None
    metadata: dict[str, Any] | None = None


def validate_metadata(metadata: dict[str, Any]) -> bool:
    """Validate metadata structure to ensure it doesn't contain invalid types."""
    try:
        import json

        json.dumps(
            metadata
        )  # This will raise TypeError if there are non-serializable objects
        return True
    except (TypeError, ValueError) as e:
        print(f"Metadata validation failed: {e}")
        return False


@router.patch("/qa-pairs/{qa_pair_id}", response_model=QAPair)
async def update_qa_pair(qa_pair_id: str, qa_pair_update: QAPairUpdate):
    """
    Update a QA pair.

    Args:
        qa_pair_id: The ID of the QA pair to update.
        qa_pair_update: The QA pair update data.

    Returns:
        QAPair: The updated QA pair.
    """
    try:
        # Debug logging for incoming data
        print(f"Received update request for QA pair {qa_pair_id}")
        print(f"Update data type: {type(qa_pair_update)}")
        print(f"Update data dict: {qa_pair_update.model_dump()}")

        # Test JSON serialization of the received data
        import json

        try:
            json.dumps(qa_pair_update.model_dump())
            print("JSON serialization test passed for incoming data")
        except (TypeError, ValueError) as json_error:
            print(f"JSON serialization failed for incoming data: {json_error}")
            print(f"Problematic data: {qa_pair_update.model_dump()}")

        # Use the enhanced database provider
        qa_pairs_db = get_database("qa_pairs")
        qa_pair = await qa_pairs_db.find_one({"id": qa_pair_id})

        if not qa_pair:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"QA pair with ID {qa_pair_id} not found",
            )
    except Exception as e:
        print(f"Error in update_qa_pair: {e}")
        print(f"Error type: {type(e)}")
        import traceback

        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to process request: {str(e)}",
        ) from None

    # Prepare the update
    update_data = {}
    if qa_pair_update.status is not None:
        # Validate status value
        valid_statuses = [
            "ready_for_review",
            "approved",
            "revision_requested",
            "rejected",
        ]
        if qa_pair_update.status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status value. Must be one of: {', '.join(valid_statuses)}",  # noqa: E501
            )
        update_data["status"] = qa_pair_update.status
    if qa_pair_update.answer is not None:
        update_data["answer"] = qa_pair_update.answer
    if qa_pair_update.question is not None:
        update_data["question"] = qa_pair_update.question
    if qa_pair_update.documents is not None:
        update_data["documents"] = qa_pair_update.documents
    if qa_pair_update.metadata is not None:
        # Merge existing metadata with updates instead of replacing
        existing_metadata = qa_pair.get("metadata", {})
        merged_metadata = {**existing_metadata, **qa_pair_update.metadata}

        # Special handling for approval: archive revision feedback for backend mining
        if qa_pair_update.status == "approved" and (
            existing_metadata.get("revision_feedback")
            or existing_metadata.get("revision_comments")
        ):
            # Initialize revision history for backend knowledge mining
            if "revision_history" not in merged_metadata:
                merged_metadata["revision_history"] = []

            # Archive the revision feedback for backend analysis
            archived_feedback = {
                "revision_feedback": existing_metadata.get("revision_feedback")
                or existing_metadata.get("revision_comments"),  # noqa: E501
                "revision_requested_by": existing_metadata.get("revision_requested_by"),
                "revision_requested_at": existing_metadata.get("revision_requested_at"),
                "archived_on_approval_by": merged_metadata.get("approved_by", "system"),
                "archived_on_approval_at": merged_metadata.get(
                    "approved_at", datetime.now(UTC).isoformat()
                ),  # noqa: E501
                "archive_reason": "moved_to_history_on_approval",
            }

            merged_metadata["revision_history"].append(archived_feedback)

            # Remove active revision feedback from frontend-visible metadata
            merged_metadata.pop("revision_feedback", None)
            merged_metadata.pop("revision_comments", None)
            merged_metadata.pop("revision_requested_by", None)
            merged_metadata.pop("revision_requested_at", None)

            print(f"Archived revision feedback for approved QA pair {qa_pair_id}")

        update_data["metadata"] = merged_metadata

    # Update the timestamp
    update_data["updated_at"] = datetime.now(UTC).isoformat()

    # Update the QA pair
    updated_qa_pair = await qa_pairs_db.update_one({"id": qa_pair_id}, update_data)

    if not updated_qa_pair:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update QA pair",
        )

    print(f"Updated QA pair with ID {qa_pair_id}")
    return updated_qa_pair


@router.patch("/qa-pairs/{qa_pair_id}/raw")
async def update_qa_pair_raw(qa_pair_id: str, request: Request):
    """
    Debug endpoint to see raw request data without Pydantic validation.
    """
    try:
        raw_data = await request.json()
        print(f"Raw request data for QA pair {qa_pair_id}:")
        print(f"Data type: {type(raw_data)}")
        print(f"Data content: {raw_data}")

        # Try to create the QAPairUpdate model manually
        qa_pair_update = QAPairUpdate(**raw_data)
        print(f"Successfully created QAPairUpdate: {qa_pair_update.model_dump()}")

        return {"status": "success", "message": "Data processed successfully"}

    except Exception as e:
        print(f"Error processing raw data: {e}")
        import traceback

        traceback.print_exc()
        return {"status": "error", "message": str(e), "error_type": str(type(e))}
