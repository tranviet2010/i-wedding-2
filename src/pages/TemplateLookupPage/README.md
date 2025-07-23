# TemplateLookupPage Component

## Overview

The `TemplateLookupPage` component is designed to serve templates at the URL pattern `template.mehappy.info/{templateId}`. This component provides a publicly accessible way to view templates without authentication, similar to the existing `LookupPage` but specifically for template preview functionality.

## Features

- **Template Domain Routing**: Handles the `template.mehappy.info/{templateId}` URL pattern
- **SEO Optimization**: Includes proper meta tags using react-helmet-async
- **Password Protection**: Supports password-protected templates
- **Responsive Design**: Uses ViewOnlyViewport for proper mobile/desktop rendering
- **Error Handling**: Graceful handling of invalid or non-existent template IDs
- **Development Support**: Includes fallback route for development/testing

## URL Patterns

### Production
- `https://template.mehappy.info/123` - Displays template with ID 123
- `https://template.mehappy.info/456` - Displays template with ID 456

### Development
- `http://localhost:3000/template-lookup/123` - Development route for testing
- `http://localhost:3000?templateId=123` - Query parameter fallback for localhost

## Architecture

### Component Structure
```
TemplateLookupPage/
├── index.tsx          # Main component
└── README.md          # This documentation
```

### Key Functions

1. **getTemplateIdFromDomain()**: Extracts template ID from domain/URL
2. **Template Data Fetching**: Uses `useGetTemplate` hook from templateAPI
3. **SEO Meta Generation**: Generates template-specific meta tags
4. **Password Protection**: Integrates with existing PasswordProtection component

### Integration Points

- **Routing**: Integrated into `src/routes/index.tsx`
- **Server-side SEO**: Enhanced `server-seo.js` for template domain handling
- **API**: Uses existing `templateAPI.ts` for data fetching
- **Styling**: Reuses `ViewPage.css` for consistent styling

## Usage

### For End Users
1. Navigate to `template.mehappy.info/{templateId}`
2. View the template in read-only mode
3. Enter password if template is protected

### For Developers
1. Use development route: `/template-lookup/{templateId}`
2. Test with query parameter: `?templateId={templateId}`
3. Check browser console for debugging information

## Configuration

### Environment Variables
The component respects the same environment variables as the main application:
- `API_URL`: Backend API endpoint
- Production/development mode detection

### Cloudflare Integration
The component is designed to work with Cloudflare wildcard domain routing:
- `*.mehappy.info` routes to the application
- `template.mehappy.info` specifically handled by this component

## Error Handling

### Invalid Template ID
- Shows "Template Not Found" message
- Provides helpful error information
- Suggests checking the URL

### Network Errors
- Graceful fallback to error state
- Loading indicators during fetch
- Retry logic handled by React Query

### Password Protection
- Seamless integration with existing password system
- Session storage for password verification
- User-friendly password prompt

## SEO Features

### Meta Tags Generated
- Basic SEO (title, description, keywords)
- Open Graph tags for social sharing
- Twitter Card support
- Template-specific meta tags (category, tier, name)
- Custom favicon support

### Server-side Rendering
- Enhanced `server-seo.js` handles template domains
- Pre-renders meta tags for better SEO
- Supports both page and template lookup

## Security Considerations

- **No Authentication Required**: Publicly accessible by design
- **Password Protection**: Optional template-level password protection
- **Input Validation**: Template ID validation and sanitization
- **Error Information**: Limited error details to prevent information disclosure

## Performance

- **React Query Caching**: Efficient template data caching
- **Lazy Loading**: Components loaded on demand
- **Optimized Rendering**: ViewOnlyViewport optimized for view-only mode
- **SEO Pre-rendering**: Server-side meta tag generation

## Future Enhancements

- Template analytics tracking
- Social sharing buttons
- Template rating/feedback system
- Template category browsing
- Mobile-specific optimizations
