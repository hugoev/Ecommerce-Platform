import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './App.tsx'
import { store } from './app/store.ts'
import { ThemeProvider } from './components/theme-provider'
import { ToastProvider } from './components/ui/toast'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Provider store={store}>
        <ToastProvider>
        <App />
        </ToastProvider>
      </Provider>
    </ThemeProvider>
  </React.StrictMode>,
)