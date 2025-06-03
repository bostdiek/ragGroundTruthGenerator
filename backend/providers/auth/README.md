# Authentication Providers

This directory contains authentication providers for the AI Ground Truth Generator. Authentication providers are responsible for user authentication, authorization, and role-based access control.

## Provider Interface

All authentication providers must implement the `BaseAuthProvider` interface defined in `base.py`. This interface includes methods for:

- User authentication (login, token validation)
- User management (registration, retrieval)
- Role-based access control

## Authentication Model

The authentication system revolves around users and roles:

```json
{
  "id": "user-id",
  "username": "username",
  "email": "user@example.com",
  "roles": ["viewer", "editor", "approver", "admin"],
  "created_at": "ISO timestamp",
  "last_login": "ISO timestamp"
}
```

## Provided Implementations

### Simple Authentication (`simple_auth.py`)

A simple JWT-based authentication implementation for development and testing. This provider stores users in memory and generates JWT tokens for authentication.

## Creating a Custom Authentication Provider

To create a custom authentication provider:

1. Create a new Python file in this directory (e.g., `azure_ad.py`)
2. Import `BaseAuthProvider` from `base.py`
3. Create a class that inherits from `BaseAuthProvider`
4. Implement all required methods
5. Add a factory function to return an instance of your provider
6. Update `providers/factory.py` to use your provider

### Example: Azure AD Provider

```python
from typing import Any, Dict, List, Optional
import os
import msal
import jwt

from providers.auth.base import BaseAuthProvider

class AzureADProvider(BaseAuthProvider):
    def __init__(self):
        """Initialize the Azure AD provider."""
        self.client_id = os.getenv("AZURE_AD_CLIENT_ID")
        self.client_secret = os.getenv("AZURE_AD_CLIENT_SECRET")
        self.tenant_id = os.getenv("AZURE_AD_TENANT_ID")
        self.authority = f"https://login.microsoftonline.com/{self.tenant_id}"
        self.scope = ["https://graph.microsoft.com/.default"]
        
        # Initialize MSAL app
        self.app = msal.ConfidentialClientApplication(
            self.client_id,
            authority=self.authority,
            client_credential=self.client_secret
        )
    
    async def login(self, username: str, password: str) -> Dict[str, Any]:
        """
        This method would not be used with Azure AD, as authentication
        would happen through the OAuth flow in the frontend.
        """
        raise NotImplementedError("Azure AD does not support direct login. Use the OAuth flow instead.")
    
    async def validate_token(self, token: str) -> Dict[str, Any]:
        """Validate a JWT token and return user information."""
        try:
            # Verify token
            decoded = jwt.decode(
                token,
                options={"verify_signature": False},  # In production, verify signature
                audience=self.client_id
            )
            
            # Get user from Microsoft Graph API
            result = self.app.acquire_token_silent(self.scope, account=None)
            if not result:
                result = self.app.acquire_token_for_client(scopes=self.scope)
            
            if "access_token" in result:
                # Use access token to get user info from Graph API
                graph_client = GraphClient(result["access_token"])
                user_info = graph_client.get_user(decoded["oid"])
                
                return {
                    "id": user_info["id"],
                    "username": user_info["displayName"],
                    "email": user_info["mail"],
                    "roles": self._get_user_roles(user_info["id"]),
                    "token": token
                }
            else:
                raise ValueError(f"Failed to acquire token: {result.get('error')}")
        except Exception as e:
            raise ValueError(f"Invalid token: {str(e)}")
    
    async def register(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        This method would not be used with Azure AD, as user management
        would happen in Azure AD itself.
        """
        raise NotImplementedError("Azure AD does not support direct registration. Users are managed in Azure AD.")
    
    async def get_user(self, user_id: str) -> Dict[str, Any]:
        """Get user information by ID."""
        # Get token for Graph API
        result = self.app.acquire_token_silent(self.scope, account=None)
        if not result:
            result = self.app.acquire_token_for_client(scopes=self.scope)
        
        if "access_token" in result:
            # Use access token to get user info from Graph API
            graph_client = GraphClient(result["access_token"])
            user_info = graph_client.get_user(user_id)
            
            return {
                "id": user_info["id"],
                "username": user_info["displayName"],
                "email": user_info["mail"],
                "roles": self._get_user_roles(user_info["id"]),
                "created_at": user_info.get("createdDateTime", ""),
                "last_login": ""  # Not available directly from Graph API
            }
        else:
            raise ValueError(f"Failed to acquire token: {result.get('error')}")
    
    def _get_user_roles(self, user_id: str) -> List[str]:
        """Get user roles from Azure AD groups."""
        # Implementation would depend on how roles are mapped to Azure AD groups
        # This is a simplified example
        roles = ["viewer"]  # Default role
        
        # Get token for Graph API
        result = self.app.acquire_token_silent(self.scope, account=None)
        if not result:
            result = self.app.acquire_token_for_client(scopes=self.scope)
        
        if "access_token" in result:
            # Use access token to get user groups from Graph API
            graph_client = GraphClient(result["access_token"])
            groups = graph_client.get_user_groups(user_id)
            
            # Map groups to roles
            group_role_mapping = {
                "editors-group-id": "editor",
                "approvers-group-id": "approver",
                "admins-group-id": "admin"
            }
            
            for group in groups:
                if group["id"] in group_role_mapping:
                    roles.append(group_role_mapping[group["id"]])
            
            return roles
        else:
            return roles  # Default to viewer role on error

class GraphClient:
    """Simple Microsoft Graph API client."""
    def __init__(self, token):
        self.token = token
        self.base_url = "https://graph.microsoft.com/v1.0"
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
    
    def get_user(self, user_id):
        """Get user by ID."""
        import requests
        response = requests.get(
            f"{self.base_url}/users/{user_id}",
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()
    
    def get_user_groups(self, user_id):
        """Get groups that the user is a member of."""
        import requests
        response = requests.get(
            f"{self.base_url}/users/{user_id}/memberOf",
            headers=self.headers
        )
        response.raise_for_status()
        return response.json().get("value", [])

def get_provider() -> BaseAuthProvider:
    """Get an Azure AD provider instance."""
    return AzureADProvider()
```

Then update `providers/factory.py`:

```python
def get_auth_provider() -> Any:
    """Get an authentication provider instance."""
    auth_provider = os.getenv("AUTH_PROVIDER", "simple")
    
    if auth_provider == "simple":
        from providers.auth.simple_auth import get_provider as get_simple_auth_provider
        return get_simple_auth_provider()
    elif auth_provider == "azure-ad":
        from providers.auth.azure_ad import get_provider as get_azure_ad_provider
        return get_azure_ad_provider()
    else:
        raise ValueError(f"Unknown auth provider: {auth_provider}")
```

## Role-Based Access Control

Authentication providers are responsible for implementing role-based access control (RBAC). The following roles are typically supported:

1. **Viewer**: Can view collections and QA pairs
2. **Editor**: Can create and edit QA pairs (includes Viewer permissions)
3. **Approver**: Can review, approve, or reject QA pairs (includes Editor permissions)
4. **Admin**: Has full access to the system (includes all permissions)

## Security Considerations

When implementing a custom authentication provider, consider:

1. **Token Security**: Use strong encryption and short expiration times for tokens
2. **Password Security**: Implement proper password hashing and storage
3. **Role Verification**: Verify roles on each request
4. **Rate Limiting**: Implement rate limiting to prevent brute force attacks
5. **Audit Logging**: Log authentication events for security monitoring
