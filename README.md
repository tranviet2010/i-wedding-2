# MyHappy Editor - Web Builder Application

A comprehensive web builder application built with React, TypeScript, and Craft.js for creating wedding invitation websites and other event pages.

## 🚀 Project Overview

MyHappy Editor is a sophisticated drag-and-drop web builder specifically designed for creating beautiful wedding invitation websites. The application provides an intuitive visual editor with responsive design capabilities, allowing users to create both desktop and mobile versions of their websites.

### Key Features

- **Visual Drag & Drop Editor**: Built on Craft.js for intuitive component manipulation
- **Responsive Design**: Separate editing modes for desktop (>960px) and mobile (420px) layouts
- **Multi-Select Functionality**: Group selection with Ctrl+click and drag selection
- **Component Library**: Rich set of pre-built components (Text, Image, Button, Form, Calendar, etc.)
- **Real-time Preview**: Live preview with view-only mode for published pages
- **Template System**: Pre-built templates with customization options
- **File Management**: Upload and manage images, videos, fonts, and other assets
- **Form Builder**: Dynamic form creation with multiple submission types
- **SEO Optimization**: Built-in SEO settings and meta tag management
- **Authentication**: Secure user authentication with JWT tokens

## 🏗️ Architecture

### Technology Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6.2.0
- **Styling**: TailwindCSS 4.1.3 + Chakra UI 3.19.0
- **Editor Engine**: Craft.js 0.2.12 for drag-and-drop functionality
- **State Management**: Redux Toolkit 2.7.0 with Redux Persist
- **API Client**: Axios 1.8.4 with TanStack Query 5.74.4
- **Routing**: React Router DOM 7.5.1
- **Animations**: Animate.css + custom animations
- **Icons**: React Icons 5.5.0
- **Notifications**: React Toastify 11.0.5

### Project Structure

```
src/
├── api/                    # API configuration and client setup
├── assets/                 # Static assets (images, icons, fonts)
├── components/            # Reusable UI components
│   ├── editor/           # Editor-specific components
│   ├── selectors/        # Drag-and-drop components
│   ├── template/         # Template-related components
│   └── ui/              # Base UI components
├── features/             # Feature-based modules
│   ├── auth/            # Authentication logic
│   ├── assets/          # Asset management
│   ├── files/           # File upload/management
│   ├── guest/           # Guest management (wedding wishes)
│   ├── page/            # Page management
│   └── template/        # Template management
├── pages/               # Route components
├── routes/              # Routing configuration
├── store.ts             # Redux store configuration
├── theme/               # Chakra UI theme customization
└── utils/               # Utility functions
```

## 📁 Detailed Directory Structure

### `/src/api`
- **`apiClient.ts`**: Axios configuration with interceptors for authentication and error handling
- Handles JWT token refresh automatically
- Configures base URL and request/response interceptors

### `/src/components`

#### `/components/editor`
Core editor functionality:
- **`Viewport/`**: Main editor viewport with context providers
- **`RenderNode.tsx`**: Component rendering in editor mode
- **`ViewOnlyRenderNode.tsx`**: Component rendering in view-only mode
- **`ViewOnlyViewport.tsx`**: Viewport for published pages
- **`Toolbar/`**: Component toolbars and settings panels

#### `/components/selectors`
Drag-and-drop components for the editor:
- **`Text/`**: Text component with rich formatting
- **`Image/`**: Image component with crop and resize
- **`Button/`**: Interactive button with events
- **`Form/`**: Dynamic form builder
- **`Calendar/`**: Calendar display component
- **`Album/`**: Photo gallery with multiple layouts
- **`Container/`**: Layout container with styling
- **`Sections/`**: Full-width section component
- **`Group/`**: Multi-component grouping
- **`Popup/`**: Modal popup component
- **`Dropbox/`**: Dropdown/tooltip component
- **`Count/`**: Countdown timer component
- **`Input/`**: Form input fields
- **`Icon/`**: Icon display component
- **`Line/`**: Divider/separator component
- **`Video/`**: Video player component

### `/src/features`

#### `/features/auth`
Authentication management:
- **`authSlice.ts`**: Redux slice for auth state
- **`authAPI.ts`**: Authentication API calls
- Handles login, token refresh, and user session

#### `/features/template`
Template management:
- **`templateAPI.ts`**: Template CRUD operations
- Supports effects, audio settings, SEO settings
- Template categorization (wedding, birthday, baby)

#### `/features/page`
Page management:
- **`pageAPI.ts`**: Page CRUD operations
- Handles both desktop and mobile content
- Page publishing and status management

#### `/features/files`
File management:
- **`fileAPI.ts`**: File upload and management
- Supports images, videos, fonts, documents
- File type categorization and validation

#### `/features/guest`
Guest management (wedding-specific):
- **`guestsAPI.ts`**: Guest wish management
- Real-time updates for wedding wishes
- Public/private wish settings

### `/src/pages`
Route-level components:
- **`Editor/`**: Template editor page
- **`Page/`**: Page editor
- **`ViewPage/`**: Published page viewer
- **`ViewTemplate/`**: Template preview
- **`Home/`**: Dashboard/home page
- **`Login/`**: Authentication page
- **`Pages/`**: Page management

## 🔧 Key Components

### Editor System

The editor is built on Craft.js and provides:

1. **Viewport Context**: Manages editor state, sidebar visibility, and platform switching
2. **Multi-Select Context**: Handles group selection and manipulation
3. **Responsive Platform Context**: Manages desktop/mobile editing modes
4. **Component Rendering**: Different render modes for editing vs. viewing

### Component Architecture

Each selector component follows a consistent pattern:
- **Props Interface**: TypeScript interface defining component properties
- **Settings Component**: Toolbar/panel for component configuration
- **Craft Configuration**: Craft.js integration with drag/drop rules
- **Responsive Behavior**: Desktop and mobile-specific styling

### State Management

- **Redux Store**: Centralized state for authentication and UI
- **TanStack Query**: Server state management and caching
- **Redux Persist**: Persistent storage for auth and preferences
- **Context Providers**: Component-level state management

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd myhappy-editor
npm install -g pnpm

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Environment Setup

Configure API endpoints in `src/api/apiClient.ts`:
```typescript
export const domain = "your-api-domain/api";
export const domainFile = "your-file-domain";
```

### Development Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm lint         # Run ESLint
```

## 🔌 API Integration

The application integrates with a backend API for:
- User authentication and authorization
- Template and page management
- File upload and storage
- Guest wish management
- Asset management

### API Structure

- **Authentication**: JWT-based with automatic token refresh
- **File Upload**: Multi-part form data for media files
- **Real-time Updates**: Polling for guest wishes and notifications
- **Error Handling**: Centralized error management with user notifications

## 🎨 Styling System

### TailwindCSS + Chakra UI

- **TailwindCSS**: Utility-first CSS framework for rapid styling
- **Chakra UI**: Component library for consistent design system
- **Custom Theme**: Dark mode support with custom color palettes
- **Responsive Design**: Mobile-first approach with breakpoint management

### Component Styling

Components support comprehensive styling options:
- Background (color, gradient, image, video)
- Typography (font family, size, weight, color)
- Layout (padding, margin, positioning)
- Effects (shadows, borders, animations)
- Responsive behavior

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Automatic Token Refresh**: Seamless session management
- **Protected Routes**: Route-level authentication guards
- **Input Sanitization**: XSS protection for user content
- **File Type Validation**: Secure file upload handling

## 📱 Responsive Design

### Platform Management

- **Desktop Mode**: >960px viewport with full feature set
- **Mobile Mode**: 420px safe area with mobile-optimized components
- **Platform Switching**: Separate content management for each platform
- **Auto-save**: Automatic content saving when switching platforms

### Responsive Components

All components support responsive behavior:
- Platform-specific styling
- Breakpoint-aware layouts
- Mobile-optimized interactions
- Touch-friendly controls

## 🧪 Testing Strategy

The application supports comprehensive testing:
- Unit tests for utility functions
- Component testing for selectors
- Integration tests for editor functionality
- E2E tests for user workflows

## 🚀 Deployment

### Production Build

```bash
pnpm build
```

### Docker Support

```dockerfile
# Dockerfile included for containerized deployment
# nginx.conf provided for production serving
```

### Environment Configuration

- Development: Local API endpoints
- Production: Configured API domains
- File serving: CDN or local file server

## 🤝 Contributing

### Development Guidelines

1. Follow TypeScript best practices
2. Use consistent component patterns
3. Implement responsive design
4. Add comprehensive error handling
5. Write meaningful commit messages

### Code Structure

- Feature-based organization
- Separation of concerns
- Reusable component patterns
- Consistent naming conventions

## 📚 Additional Resources

- [Craft.js Documentation](https://craft.js.org/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [Chakra UI Documentation](https://chakra-ui.com/)
- [React Query Documentation](https://tanstack.com/query/)

---

This documentation provides a comprehensive overview of the MyHappy Editor web builder application. For specific implementation details, refer to the individual component files and their associated documentation.