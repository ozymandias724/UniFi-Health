import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// 1. Base normalization first
import 'modern-normalize/modern-normalize.css';
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
