#!/bin/bash

# Template script to deploy the AI Ground Truth Generator infrastructure to Azure
# This is a template that you should customize based on your specific requirements

# TODO: Update these configuration variables for your environment
RESOURCE_GROUP_NAME="rg-ai-ground-truth"
LOCATION="eastus"
SOLUTION_NAME="ai-ground-truth"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to display messages
print_message() {
    echo -e "${GREEN}$1${NC}"
}

print_warning() {
    echo -e "${YELLOW}$1${NC}"
}

print_error() {
    echo -e "${RED}$1${NC}"
}

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    print_error "Azure CLI is not installed. Please install it first."
    exit 1
fi

# Check if user is logged in
ACCOUNT=$(az account show --query name -o tsv 2>/dev/null)
if [ $? -ne 0 ]; then
    print_warning "You are not logged in to Azure. Logging in now..."
    az login
    if [ $? -ne 0 ]; then
        print_error "Failed to log in to Azure. Exiting."
        exit 1
    fi
fi

print_message "Deploying AI Ground Truth Generator to Azure..."
print_message "Account: $ACCOUNT"

# Create resource group if it doesn't exist
print_message "Creating resource group $RESOURCE_GROUP_NAME in $LOCATION..."
az group create --name $RESOURCE_GROUP_NAME --location $LOCATION

if [ $? -ne 0 ]; then
    print_error "Failed to create resource group. Exiting."
    exit 1
fi

# Deploy Bicep template
print_message "Deploying infrastructure using Bicep..."
DEPLOYMENT_OUTPUT=$(az deployment group create \
    --resource-group $RESOURCE_GROUP_NAME \
    --template-file main.bicep \
    --parameters solutionName=$SOLUTION_NAME \
    --parameters location=$LOCATION \
    --output json)

if [ $? -ne 0 ]; then
    print_error "Failed to deploy infrastructure. Exiting."
    exit 1
fi

# Extract output values
WEB_APP_URL=$(echo $DEPLOYMENT_OUTPUT | jq -r '.properties.outputs.webAppUrl.value')
API_APP_URL=$(echo $DEPLOYMENT_OUTPUT | jq -r '.properties.outputs.apiAppUrl.value')
KEY_VAULT_NAME=$(echo $DEPLOYMENT_OUTPUT | jq -r '.properties.outputs.keyVaultName.value')
COSMOS_ACCOUNT_NAME=$(echo $DEPLOYMENT_OUTPUT | jq -r '.properties.outputs.cosmosAccountName.value')
OPENAI_ACCOUNT_NAME=$(echo $DEPLOYMENT_OUTPUT | jq -r '.properties.outputs.openAiAccountName.value')

# Print deployment information
print_message "\n===== Deployment Complete ====="
print_message "Web App URL: $WEB_APP_URL"
print_message "API App URL: $API_APP_URL"
print_message "Key Vault: $KEY_VAULT_NAME"
print_message "Cosmos DB Account: $COSMOS_ACCOUNT_NAME"
print_message "OpenAI Account: $OPENAI_ACCOUNT_NAME"

print_warning "\nImportant Next Steps:"
print_warning "1. Create secrets in Key Vault for:"
print_warning "   - AzureAdB2cClientId"
print_warning "   - StorageConnectionString"
print_warning "   - CosmosConnectionString"
print_warning "   - OpenAiApiKey"
print_warning "2. Deploy the frontend and backend code"
print_warning "3. Configure Azure AD B2C for authentication"

print_message "\nDeployment script completed successfully!"
