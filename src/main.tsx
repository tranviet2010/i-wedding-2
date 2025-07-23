import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import 'animate.css'
import { Provider } from 'react-redux'
import { Provider as ChakraProvider } from './components/ui/provider'
import store from './store'
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { toaster } from './components/ui/toaster'
import { HelmetProvider } from 'react-helmet-async'
import { injectStore } from './api/apiClient'

// Inject store for API client
injectStore(store)

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any) => {
      toaster.create({
        title: 'Error',
        description: error.response?.data?.message || error.message || 'An error occurred',
        type: 'error',
      })
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {
      toaster.create({
        title: 'Error',
        description: error.response?.data?.message || error.message || 'An error occurred',
        type: 'error',
      })
    },
  })
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <ChakraProvider>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </Provider>
      </ChakraProvider>
    </HelmetProvider>
  </React.StrictMode>,
)
