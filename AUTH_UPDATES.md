# Authentication Updates

## Changes Made

1. **Authentication Changes:**
   - Added support for simple usernames (`demo` and `admin`) in addition to email addresses
   - Improved authentication debugging with better error messages
   - Added authentication test script (`test_auth_credentials.py`)

2. **Collection Display Fixes:**
   - Fixed QA pair counting in the collections endpoint using manual filtering
   - Corrected hardcoded document_count values in the memory database
   - Updated QA pairs endpoint to use the same manual filtering approach

3. **Environment Variables:**
   - Added proper environment variables to docker-compose.yml
   - Updated start script to include all necessary environment variables

4. **Debugging Tools:**
   - Added debug_app.py to provide comprehensive diagnostics
   - Added detailed request/response logging to the frontend API service

## Login Credentials

You can now log in with either simple usernames or email addresses:

### Demo User
- Username: `demo` or `demo@example.com`
- Password: `password`

### Admin User
- Username: `admin` or `admin@example.com`
- Password: `admin123`

## Starting the Application

Use the provided start script:

```bash
./start_app.sh
```

This will:
1. Set necessary environment variables
2. Start the application with docker-compose
3. Open your browser to the application
4. Show the logs from both services
