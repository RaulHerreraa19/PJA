import type { PropsWithChildren, ReactNode } from 'react'
import { Modal as MantineModal, Stack, Text } from '@mantine/core'
import { motion } from 'framer-motion'

interface ModalProps extends PropsWithChildren {
  title: string
  isOpen: boolean
  onClose: () => void
  description?: string
  actions?: ReactNode
}

const Modal = ({ title, description, children, isOpen, onClose, actions }: ModalProps) => {
  return (
    <MantineModal opened={isOpen} onClose={onClose} title={null} size="lg" radius="xl" centered>
      <Stack gap="md">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <Text fz="xs" tt="uppercase" fw={600} c="dimmed" lts={3}>
            Gestión
          </Text>
          <Text component="h2" fz="xl" fw={600} c="colimaBlue.9">
            {title}
          </Text>
          {description && (
            <Text fz="sm" c="dimmed">
              {description}
            </Text>
          )}
        </motion.div>
        <Stack gap="md">{children}</Stack>
        {actions && <Stack gap="sm">{actions}</Stack>}
      </Stack>
    </MantineModal>
  )
}

export default Modal
