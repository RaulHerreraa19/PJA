import type { ComponentType } from 'react'
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom'
import { NavLink, Stack, Text, Group, rem, ScrollArea } from '@mantine/core'
import { motion } from 'framer-motion'
import {
  IconLayoutDashboard,
  IconCalendarCheck,
  IconUsersGroup,
  IconFileAnalytics,
  IconReportAnalytics,
  IconTimelineEvent,
  IconSettings,
} from '@tabler/icons-react'
import useAuth from '../../hooks/useAuth'
import type { Role } from '../../types'

interface NavItem {
  label: string
  to: string
  roles: Role[]
  icon: ComponentType<{ size?: number | string }>
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', roles: ['admin', 'rh', 'user', 'ti', 'jefaturas-adscripciones'], icon: IconLayoutDashboard },
  { label: 'Empleados', to: '/employees', roles: ['admin', 'rh', 'ti', 'jefaturas-adscripciones'], icon: IconUsersGroup },
  { label: 'Checadas', to: '/attendance', roles: ['admin', 'rh', 'ti', 'jefaturas-adscripciones'], icon: IconCalendarCheck },
  { label: 'Periodos', to: '/periods', roles: ['admin', 'rh', 'ti', 'jefaturas-adscripciones'], icon: IconTimelineEvent },
  { label: 'Incidencias', to: '/incidences', roles: ['admin', 'rh', 'ti', 'jefaturas-adscripciones'], icon: IconReportAnalytics },
  { label: 'Reportes', to: '/reports', roles: ['admin', 'rh', 'user', 'ti', 'jefaturas-adscripciones'], icon: IconFileAnalytics },
  { label: 'Catálogos', to: '/catalogs', roles: ['admin', 'ti'], icon: IconSettings },
]

interface SidebarProps {
  onNavigateMobile?: () => void
}

const Sidebar = ({ onNavigateMobile }: SidebarProps) => {
  const { hasRole } = useAuth()
  const location = useLocation()

  return (
    <Stack justify="space-between" h="100%" p="md" gap="xl">
      <div>
        <Text size="xs" tt="uppercase" fw={600} c="colimaGold.5" lts={4}>
          Control
        </Text>
        <Text fz="xl" fw={600} mb="lg">
          Asistencias
        </Text>
        <ScrollArea h="70vh" type="hover">
          <Stack gap="xs">
            {NAV_ITEMS.filter((item) => hasRole(item.roles)).map((item) => {
              const Icon = item.icon
              const isActive = location.pathname.startsWith(item.to)
              return (
                <motion.div key={item.to} whileHover={{ x: 6 }} transition={{ duration: 0.15 }}>
                  <NavLink
                    component={RouterNavLink}
                    to={item.to}
                    label={item.label}
                    leftSection={<Icon size={18} />}
                    active={isActive}
                    onClick={onNavigateMobile}
                    variant={isActive ? 'filled' : 'subtle'}
                    style={{ borderRadius: rem(16) }}
                  />
                </motion.div>
              )
            })}
          </Stack>
        </ScrollArea>
      </div>
      <Group gap="xs" c="dimmed" fz="xs">
        <Text fw={600}>© {new Date().getFullYear()} STJ Colima</Text>
        <Text>·</Text>
        <Text>Vanguardia digital</Text>
      </Group>
    </Stack>
  )
}

export default Sidebar
