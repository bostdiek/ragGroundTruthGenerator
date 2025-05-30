// AI Ground Truth Generator - Infrastructure Template
//
// This is a template Bicep file for deploying the AI Ground Truth Generator to Azure.
// You should customize this template based on your specific requirements.
//
// TODO: Review and customize all resources and parameters for your implementation

@description('The name of the solution')
param solutionName string

@description('The location for all resources')
param location string = resourceGroup().location

@description('The SKU for the App Service Plan')
param appServicePlanSku string = 'B1'

// TODO: Update this to your preferred AI service and model
@description('OpenAI deployment name')
param openAiDeploymentName string = 'gpt-4'

@description('OpenAI API version')
param openAiApiVersion string = '2023-05-15'

// TODO: Replace with your preferred database if not using Cosmos DB
@description('Cosmos DB database name')
param cosmosDbName string = 'groundtruth'

// Variables
var uniqueSuffix = uniqueString(resourceGroup().id)
var webAppName = '${solutionName}-web-${uniqueSuffix}'
var apiAppName = '${solutionName}-api-${uniqueSuffix}'
var appServicePlanName = '${solutionName}-asp-${uniqueSuffix}'
var storageAccountName = '${replace(toLower(solutionName), '-', '')}${uniqueSuffix}'
var appInsightsName = '${solutionName}-ai-${uniqueSuffix}'
var cosmosAccountName = '${replace(toLower(solutionName), '-', '')}${uniqueSuffix}'
var keyVaultName = '${solutionName}-kv-${uniqueSuffix}'
var aadB2cName = '${solutionName}${uniqueSuffix}'
var openAiAccountName = '${solutionName}-openai-${uniqueSuffix}'

// App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: appServicePlanSku
  }
  properties: {
    reserved: true // Required for Linux
  }
}

// Frontend Web App
resource webApp 'Microsoft.Web/sites@2022-09-01' = {
  name: webAppName
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|16-lts'
      appSettings: [
        {
          name: 'APPINSIGHTS_INSTRUMENTATIONKEY'
          value: appInsights.properties.InstrumentationKey
        }
        {
          name: 'REACT_APP_API_URL'
          value: 'https://${apiApp.properties.defaultHostName}/api'
        }
        {
          name: 'REACT_APP_AZURE_CLIENT_ID'
          value: '@Microsoft.KeyVault(SecretUri=https://${keyVault.name}.vault.azure.net/secrets/AzureAdB2cClientId/)'
        }
        {
          name: 'REACT_APP_AZURE_AUTHORITY'
          value: 'https://${aadB2cName}.b2clogin.com/${aadB2cName}.onmicrosoft.com/B2C_1_signupsignin'
        }
      ]
    }
  }
}

// Backend API App
resource apiApp 'Microsoft.Web/sites@2022-09-01' = {
  name: apiAppName
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'PYTHON|3.9'
      appSettings: [
        {
          name: 'APPINSIGHTS_INSTRUMENTATIONKEY'
          value: appInsights.properties.InstrumentationKey
        }
        {
          name: 'AZURE_STORAGE_CONNECTION_STRING'
          value: '@Microsoft.KeyVault(SecretUri=https://${keyVault.name}.vault.azure.net/secrets/StorageConnectionString/)'
        }
        {
          name: 'COSMOS_CONNECTION_STRING'
          value: '@Microsoft.KeyVault(SecretUri=https://${keyVault.name}.vault.azure.net/secrets/CosmosConnectionString/)'
        }
        {
          name: 'OPENAI_API_KEY'
          value: '@Microsoft.KeyVault(SecretUri=https://${keyVault.name}.vault.azure.net/secrets/OpenAiApiKey/)'
        }
        {
          name: 'OPENAI_API_ENDPOINT'
          value: openAiAccount.properties.endpoint
        }
        {
          name: 'OPENAI_DEPLOYMENT_NAME'
          value: openAiDeploymentName
        }
        {
          name: 'OPENAI_API_VERSION'
          value: openAiApiVersion
        }
        {
          name: 'FRONTEND_URL'
          value: 'https://${webApp.properties.defaultHostName}'
        }
      ]
    }
  }
}

// Storage Account
resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
  }
}

// Application Insights
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
  }
}

// Cosmos DB Account
resource cosmosAccount 'Microsoft.DocumentDB/databaseAccounts@2022-08-15' = {
  name: cosmosAccountName
  location: location
  properties: {
    databaseAccountOfferType: 'Standard'
    enableAutomaticFailover: false
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
  }
}

// Cosmos DB Database
resource cosmosDatabase 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2022-08-15' = {
  parent: cosmosAccount
  name: cosmosDbName
  properties: {
    resource: {
      id: cosmosDbName
    }
  }
}

// Cosmos DB Containers
resource collectionsContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2022-08-15' = {
  parent: cosmosDatabase
  name: 'collections'
  properties: {
    resource: {
      id: 'collections'
      partitionKey: {
        paths: [
          '/id'
        ]
        kind: 'Hash'
      }
      indexingPolicy: {
        indexingMode: 'consistent'
        automatic: true
        includedPaths: [
          {
            path: '/*'
          }
        ]
      }
    }
  }
}

resource qaPairsContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2022-08-15' = {
  parent: cosmosDatabase
  name: 'qapairs'
  properties: {
    resource: {
      id: 'qapairs'
      partitionKey: {
        paths: [
          '/collection_id'
        ]
        kind: 'Hash'
      }
      indexingPolicy: {
        indexingMode: 'consistent'
        automatic: true
        includedPaths: [
          {
            path: '/*'
          }
        ]
      }
    }
  }
}

// Key Vault
resource keyVault 'Microsoft.KeyVault/vaults@2022-07-01' = {
  name: keyVaultName
  location: location
  properties: {
    enabledForDeployment: true
    enabledForTemplateDeployment: true
    enabledForDiskEncryption: true
    tenantId: subscription().tenantId
    accessPolicies: [
      {
        tenantId: subscription().tenantId
        objectId: apiApp.identity.principalId
        permissions: {
          secrets: [
            'get'
            'list'
          ]
        }
      }
      {
        tenantId: subscription().tenantId
        objectId: webApp.identity.principalId
        permissions: {
          secrets: [
            'get'
            'list'
          ]
        }
      }
    ]
    sku: {
      name: 'standard'
      family: 'A'
    }
  }
}

// Azure OpenAI Account
resource openAiAccount 'Microsoft.CognitiveServices/accounts@2022-12-01' = {
  name: openAiAccountName
  location: location
  sku: {
    name: 'S0'
  }
  kind: 'OpenAI'
  properties: {
    customSubDomainName: openAiAccountName
    publicNetworkAccess: 'Enabled'
  }
}

// Managed Identities for the apps
resource webAppIdentity 'Microsoft.Web/sites/config@2022-09-01' = {
  parent: webApp
  name: 'managedServiceIdentity'
  properties: {
    type: 'SystemAssigned'
  }
}

resource apiAppIdentity 'Microsoft.Web/sites/config@2022-09-01' = {
  parent: apiApp
  name: 'managedServiceIdentity'
  properties: {
    type: 'SystemAssigned'
  }
}

// Outputs
output webAppUrl string = 'https://${webApp.properties.defaultHostName}'
output apiAppUrl string = 'https://${apiApp.properties.defaultHostName}'
output keyVaultName string = keyVault.name
output cosmosAccountName string = cosmosAccount.name
output openAiAccountName string = openAiAccount.name
