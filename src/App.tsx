import './App.css'
import 'react-tooltip/dist/react-tooltip.css'
import { injectStore } from './api/apiClient';
import { RouterProvider } from 'react-router-dom'
import router from './routes'
import store from './store';

injectStore(store)

function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App
