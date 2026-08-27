import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '../styles.css'
import TableView from '../pages/TableView.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TableView />
  </StrictMode>,
)
