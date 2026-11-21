/*
 * Browser entry point. Normalize browser defaults before loading the app's
 * CSS, then mount the React tree under StrictMode during development.
 */
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
