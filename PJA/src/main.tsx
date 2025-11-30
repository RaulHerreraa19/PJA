import { BrowserRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import { MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/dropzone/styles.css'
import '@mantine/notifications/styles.css'
import 'mantine-datatable/styles.css'
import 'sweetalert2/dist/sweetalert2.min.css'
import './index.css'
import App from './App.tsx'
import authStore from './store/authStore'
import { appTheme } from './theme'

authStore
  .getState()
  .hydrate()
  .catch(() => {
    /* noop */
  })

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <MantineProvider theme={appTheme} defaultColorScheme="light">
      <ModalsProvider>
        <Notifications position="top-right" autoClose={4000} />
        <App />
      </ModalsProvider>
    </MantineProvider>
  </BrowserRouter>,
)
