# Software Group project

## PawTrack

**PawTrack** is a mobile app that helps dog owners check weather conditions for safe walks, record walking routes, find nearby dogs, and discover dog-friendly facilities.

## Team member
### Front-end Development
- Hanxue Qiang
- Jiazhao Teng
- Ruilin Xu
- Yifu Ding

### Back-end Development
- Ning Yang 
- Yuantao Liao

## Quick Start

### Prerequisites
- Node.js and npm installed
- Expo CLI (can be run via npx)

### Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

Then follow the prompts to open the app.

**Note:** This app is developed and tested for iOS only. For best results:
- Use **iOS Simulator** (Recommended for development)
- Or use **Expo Go** on iPhone (scan the QR code from the terminal, you might need to download the Expo Go app if you don't have it)

For more detailed Expo configuration and development information, see [frontend/README.md](./frontend/README.md).

## Project Structure

### `/backend`
Go-based backend server that provides REST APIs for the frontend.

- **`/api`** - API type definitions and schemas
- **`/app`** - Main application logic and server setup
- **`/cmd`** - Command-line entry points
- **`/configs`** - Configuration files (YAML)
- **`/pkg`** - Reusable packages
  - **`/driver`** - Database drivers and external service connections
  - **`/logger`** - Logging utilities
  - **`/util`** - Common utility functions
  - **`/errors`** - Error handling
  - **`/trace`** - Request tracing
- **`/scripts`** - Build and deployment scripts

### `/frontend`
The main React Native application built with Expo.

- **`/app`** - File-based routing screens and navigation structure
- **`/components`** - Reusable React components
- **`/screens`** - Full-page screen components
- **`/utils`** - Utility functions
- **`/hooks`** - Custom React hooks
- **`/services`** - API and external service integration
- **`/context`** - React Context for global state management
- **`/types`** - TypeScript type definitions
- **`/constants`** - App-wide constants
- **`/assets`** - Images, fonts, and other static assets
- **`/android`** - Android-specific native code
- **`/ios`** - iOS-specific native code

### `/convention`
Project conventions and guidelines for code style, naming, and architecture.

### `/.expo`
Expo configuration and settings for the development environment.

