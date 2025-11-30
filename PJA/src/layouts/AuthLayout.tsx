import type { ComponentType } from 'react'
import { Outlet } from 'react-router-dom'
import { Container, SimpleGrid, Stack, Text, Title, Card, ThemeIcon } from '@mantine/core'
import { IconShieldLock, IconClock, IconWorldShare } from '@tabler/icons-react'
import { motion } from 'framer-motion'

const AuthLayout = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at 10% 20%, rgba(12,60,96,0.25), transparent 45%), radial-gradient(circle at 90% 10%, rgba(201,131,5,0.25), transparent 40%), #0f172a',
        padding: '3rem 1rem',
      }}
    >
      <Container size="lg">
        <Card radius="xl" shadow="xl" p={0} withBorder={false} style={{ background: 'white' }}>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              background: 'linear-gradient(135deg, #1e476f, #00554f)',
              color: 'white',
              padding: '3rem',
              borderTopLeftRadius: '1.5rem',
              borderBottomLeftRadius: '1.5rem',
            }}
          >
            <Stack gap="xl">
              <div>
                <Text size="xs" tt="uppercase" fw={600} lts={4} c="colimaGold.2">
                  Sistema de asistencia
                </Text>
                <Title order={1} c="white" mt="sm">
                  Gestiona el talento en tiempo real
                </Title>
                <Text c="gray.2" mt="md">
                  Control de entradas, incidencias y reportes centralizados con la identidad del Poder Judicial de Colima.
                </Text>
              </div>
              <Stack gap="sm">
                {FEATURES.map((feature) => (
                  <Card key={feature.title} radius="lg" bg="white" c="colimaBlue.9" shadow="md">
                    <GroupFeature feature={feature} />
                  </Card>
                ))}
              </Stack>
            </Stack>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div style={{ padding: '2.5rem' }}>
              <Stack gap="sm" mb="xl" align="flex-start">
                <Text size="xs" tt="uppercase" fw={600} c="dimmed" lts={4}>
                  Bienvenido
                </Text>
                <Title order={2} c="colimaBlue.9">
                  Inicia sesión
                </Title>
                <Text c="dimmed" size="sm">
                  Accede con tus credenciales institucionales para continuar.
                </Text>
              </Stack>
              <Outlet />
            </div>
          </motion.div>
          </SimpleGrid>
        </Card>
      </Container>
    </div>
  )
}

interface FeatureCard {
  title: string
  description: string
  icon: ComponentType<{ size?: number }>
}

const FEATURES: FeatureCard[] = [
  {
    title: 'Seguridad institucional',
    description: 'Roles y auditoría listos para producción.',
    icon: IconShieldLock,
  },
  {
    title: 'Reportes en tiempo real',
    description: 'Dashboards responsivos con filtros avanzados.',
    icon: IconClock,
  },
  {
    title: 'Distribución regional',
    description: 'Optimizado para operaciones multi sede.',
    icon: IconWorldShare,
  },
]

const GroupFeature = ({ feature }: { feature: FeatureCard }) => {
  const Icon = feature.icon
  return (
    <Stack gap="xs">
      <ThemeIcon radius="xl" size="lg" color="colimaBlue">
        <Icon size={18} />
      </ThemeIcon>
      <Text fw={600}>{feature.title}</Text>
      <Text size="sm" c="dimmed">
        {feature.description}
      </Text>
    </Stack>
  )
}

export default AuthLayout
