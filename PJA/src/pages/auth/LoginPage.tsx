import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { type Location, useLocation, useNavigate } from 'react-router-dom'
import { Button, Stack, TextInput, PasswordInput, Text, Alert } from '@mantine/core'
import { IconLock, IconMail, IconAlertCircle } from '@tabler/icons-react'
import { motion } from 'framer-motion'
import useAuth from '../../hooks/useAuth'

const loginSchema = z.object({
  email: z.string().email('Correo invalido'),
  password: z.string().min(6, 'La contrasena debe tener al menos 6 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loading } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: LoginForm) => {
    try {
      setFormError(null)
      await login(values)
      const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard'
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo iniciar sesion')
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Correo corporativo"
            placeholder="admin@empresa.com"
            leftSection={<IconMail size={16} />}
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />
          <PasswordInput
            label="Contraseña"
            placeholder="********"
            leftSection={<IconLock size={16} />}
            {...register('password')}
            error={errors.password?.message}
          />
          {formError && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" radius="lg">
              {formError}
            </Alert>
          )}
          <Button type="submit" loading={loading} fullWidth>
            {loading ? 'Validando...' : 'Entrar'}
          </Button>
          <Alert color="gray" radius="lg" variant="light">
            <Text fw={600} size="sm">
              Usuarios demo (desde la API):
            </Text>
            <Text size="xs">Admin · admin@empresa.com / Admin123*</Text>
            <Text size="xs">RH · rh@empresa.com / rrhh12345</Text>
          </Alert>
        </Stack>
      </form>
    </motion.div>
  )
}

export default LoginPage
