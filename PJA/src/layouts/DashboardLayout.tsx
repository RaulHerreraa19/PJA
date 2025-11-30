import { Outlet } from 'react-router-dom'
import { AppShell, Burger, Group, Text, Button, Avatar, Stack } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import Sidebar from '../components/navigation/Sidebar'
import useAuth from '../hooks/useAuth'

const DashboardLayout = () => {
  const { user, logout } = useAuth()
  const [opened, { toggle }] = useDisclosure()

  return (
    <AppShell
      header={{ height: 80 }}
      navbar={{ width: 280, breakpoint: 'lg', collapsed: { mobile: !opened } }}
      padding="xl"
    >
      <AppShell.Header>
        <Group h="100%" justify="space-between" px="md">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="lg" size="sm" />
            <div>
              <Text size="xs" tt="uppercase" fw={600} c="dimmed" lts={3}>
                Panel
              </Text>
              <Text fz="xl" fw={600}>
                Control de asistencia
              </Text>
            </div>
          </Group>
          <Group gap="md" wrap="nowrap">
            <Stack gap={2} align="flex-end">
              <Text fw={600}>{user?.name ?? user?.email}</Text>
              <Text size="xs" c="dimmed" tt="uppercase" lts={2}>
                {user?.role}
              </Text>
            </Stack>
            <Avatar radius="xl" color="colimaGold">
              {(user?.name ?? user?.email ?? '?').slice(0, 2).toUpperCase()}
            </Avatar>
            <Button variant="light" onClick={logout}>
              Cerrar sesión
            </Button>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar>
        <Sidebar onNavigateMobile={toggle} />
      </AppShell.Navbar>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}

export default DashboardLayout
