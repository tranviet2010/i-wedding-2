import fs from 'node:fs/promises'
import express from 'express'

// Constants
const isProduction = process.env.NODE_ENV === 'production'
const port = process.env.SEO_PORT || 5175
const base = process.env.BASE || '/'

console.log(`🔧 SEO Server Environment: ${isProduction ? 'production' : 'development'}`)

// Create http server
const app = express()

// Add Vite or respective production middlewares
let vite
if (!isProduction) {
  const { createServer } = await import('vite')
  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
    base
  })
  app.use(vite.middlewares)
} else {
  const compression = (await import('compression')).default
  const sirv = (await import('sirv')).default
  app.use(compression())
  
  // Serve static assets
  app.use('/assets', sirv('./dist/assets', { extensions: [] }))
  app.use(express.static('./dist', { index: false }))
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    service: 'seo-server',
    timestamp: new Date().toISOString(),
    port: port
  })
})

// Function to fetch page data for SEO
async function fetchPageDataForSEO(domain) {
  try {
    const apiUrl = process.env.API_URL || 'http://localhost:8000/api'
    const response = await fetch(`${apiUrl}/pages/lookup?domain=${domain}`)
    console.log('API Response:', response)
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        return result.data
      }
    }
  } catch (error) {
    console.error(`Failed to fetch SEO data for domain ${domain}:`, error)
  }
  return null
}

// Function to fetch template data for SEO
async function fetchTemplateDataForSEO(templateId) {
  try {
    const apiUrl = process.env.API_URL || 'http://localhost:8000/api'
    const response = await fetch(`${apiUrl}/templates/${templateId}`)
    console.log('Template API Response:', response)
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        return result.data
      }
    }
  } catch (error) {
    console.error(`Failed to fetch template SEO data for ID ${templateId}:`, error)
  }
  return null
}

// Function to generate SEO meta tags for pages
function generateSEOTags(pageData, domain) {
  if (!pageData) {
    return `
    <title>Wedding Page - ${domain}</title>
    <meta name="description" content="Beautiful wedding page" />
    <meta property="og:title" content="Wedding Page - ${domain}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://${domain}" />
    `
  }

  const title = pageData.seoSettings?.title || pageData.title || 'Wedding Page'
  const description = pageData.seoSettings?.description || 'Beautiful wedding page'
  const imageUrl = pageData.seoSettings?.imageUrl || ''
  const keywords = pageData.seoSettings?.keywords?.join(', ') || ''
  const favoriteIconUrl = pageData.seoSettings?.favoriteIconUrl || ''

  return `
    <!-- Basic SEO -->
    <title>${title}</title>
    <meta name="description" content="${description}" />
    ${keywords ? `<meta name="keywords" content="${keywords}" />` : ''}
    
    <!-- Open Graph -->
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://${domain}" />
    ${imageUrl ? `<meta property="og:image" content="${imageUrl}" />` : ''}
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    ${imageUrl ? `<meta name="twitter:image" content="${imageUrl}" />` : ''}
    
    <!-- Wedding-specific meta tags -->
    ${pageData.groom ? `<meta name="wedding:groom" content="${pageData.groom}" />` : ''}
    ${pageData.bride ? `<meta name="wedding:bride" content="${pageData.bride}" />` : ''}
    ${pageData.date ? `<meta name="wedding:date" content="${pageData.date}" />` : ''}
    ${pageData.location ? `<meta name="wedding:location" content="${pageData.location}" />` : ''}
    
    <!-- Favicon -->
    ${favoriteIconUrl ? `<link rel="icon" href="${favoriteIconUrl}" />` : ''}
  `
}

// Function to generate SEO meta tags for templates
function generateTemplateSEOTags(templateData, templateId) {
  if (!templateData) {
    return `
    <title>Template Preview - ${templateId}</title>
    <meta name="description" content="Beautiful template preview" />
    <meta property="og:title" content="Template Preview - ${templateId}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://template.mehappy.info/${templateId}" />
    `
  }

  const title = templateData.seoSettings?.title || templateData.name || 'Template Preview'
  const description = templateData.seoSettings?.description || templateData.description || 'Beautiful template preview'
  const imageUrl = templateData.seoSettings?.imageUrl || templateData.previewUrl || ''
  const keywords = templateData.seoSettings?.keywords?.join(', ') || ''
  const favoriteIconUrl = templateData.seoSettings?.favoriteIconUrl || ''

  return `
    <!-- Basic SEO -->
    <title>${title}</title>
    <meta name="description" content="${description}" />
    ${keywords ? `<meta name="keywords" content="${keywords}" />` : ''}

    <!-- Open Graph -->
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://template.mehappy.info/${templateId}" />
    ${imageUrl ? `<meta property="og:image" content="${imageUrl}" />` : ''}

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    ${imageUrl ? `<meta name="twitter:image" content="${imageUrl}" />` : ''}

    <!-- Template-specific meta tags -->
    ${templateData.category ? `<meta name="template:category" content="${templateData.category}" />` : ''}
    ${templateData.tier ? `<meta name="template:tier" content="${templateData.tier}" />` : ''}
    ${templateData.name ? `<meta name="template:name" content="${templateData.name}" />` : ''}
    ${templateData.description ? `<meta name="template:description" content="${templateData.description}" />` : ''}

    <!-- Favicon -->
    ${favoriteIconUrl ? `<link rel="icon" href="${favoriteIconUrl}" />` : ''}
  `
}

// SEO-enhanced route handler
app.use('*', async (req, res) => {
  try {
    const url = req.originalUrl.replace(base, '')
    const hostname = req.hostname
    
    console.log(`🌐 SEO Request: ${req.method} ${url} (Host: ${hostname})`)

    // Check if this is a domain lookup request
    const isLookupDomain = (hostname.includes('.mehappy.info')) &&
                          hostname !== 'mehappy.info' &&
                          hostname !== 'www.mehappy.info' &&
                          hostname !== 'template.mehappy.info'

    // Check if this is a template domain lookup request
    const isTemplateDomain = hostname === 'template.mehappy.info'

    let template
    let pageData = null
    let templateData = null

    // Get the base HTML template
    if (!isProduction) {
      template = await fs.readFile('./index.html', 'utf-8')
      template = await vite.transformIndexHtml(url, template)
    } else {
      try {
        template = await fs.readFile('./dist/index.html', 'utf-8')
      } catch (error) {
        // Fallback template
        template = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>meWedding</title>
    <!--seo-meta-->
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/assets/index.js"></script>
  </body>
</html>`
      }
    }

    // Fetch page data for SEO if it's a lookup domain
    if (isLookupDomain) {
      pageData = await fetchPageDataForSEO(hostname)
    }

    // Fetch template data for SEO if it's a template domain
    if (isTemplateDomain) {
      // Extract template ID from URL path
      const pathParts = url.split('/').filter(part => part.length > 0)
      if (pathParts.length > 0) {
        const templateId = pathParts[0]
        if (templateId && !isNaN(parseInt(templateId))) {
          templateData = await fetchTemplateDataForSEO(templateId)
        }
      }
    }

    // Generate and inject SEO meta tags
    let seoTags
    if (isTemplateDomain && templateData) {
      const templateId = url.split('/').filter(part => part.length > 0)[0]
      seoTags = generateTemplateSEOTags(templateData, templateId)
    } else {
      seoTags = generateSEOTags(pageData, hostname)
    }
    
    // Replace or inject SEO meta tags
    if (template.includes('<!--seo-meta-->')) {
      template = template.replace('<!--seo-meta-->', seoTags)
    } else if (template.includes('</head>')) {
      template = template.replace('</head>', `${seoTags}\n  </head>`)
    } else {
      // Fallback: add after title
      template = template.replace('</title>', `</title>${seoTags}`)
    }

    // Add domain data for client-side use (optional)
    if (pageData) {
      const dataScript = `<script>window.DOMAIN_DATA = ${JSON.stringify({ domain: hostname, hasData: true })}</script>`
      template = template.replace('</head>', `${dataScript}\n  </head>`)
    } else if (templateData) {
      const templateId = url.split('/').filter(part => part.length > 0)[0]
      const dataScript = `<script>window.TEMPLATE_DATA = ${JSON.stringify({ templateId, hasData: true })}</script>`
      template = template.replace('</head>', `${dataScript}\n  </head>`)
    }
    console.log('Sending SEO-enhanced HTML to client')
    console.log(template)
    res.status(200).set({ 'Content-Type': 'text/html' }).send(template)
  } catch (e) {
    console.error('SEO Server Error:', e)
    if (!isProduction) {
      vite?.ssrFixStacktrace(e)
    }
    res.status(500).end(e.stack)
  }
})

// Start SEO server
app.listen(port, () => {
  console.log(`🚀 SEO Server started at http://localhost:${port}`)
  console.log(`📄 Serving SEO-enhanced pages for domain lookup`)
  console.log(`🔧 Environment: ${isProduction ? 'production' : 'development'}`)
})
