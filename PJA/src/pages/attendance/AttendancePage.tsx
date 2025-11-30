import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Alert,
  Loader,
  rem,
} from '@mantine/core'
import { Dropzone } from '@mantine/dropzone'
import { IconUpload, IconFileDescription, IconTrash, IconInfoCircle } from '@tabler/icons-react'
import DataTable, { type Column } from '../../components/common/DataTable'
import type { AttendanceRecord } from '../../types'
import { fetchAttendance } from '../../api/attendance'
import { uploadClockingsFile } from '../../api/imports'
import useAuth from '../../hooks/useAuth'

type AttendanceRow = AttendanceRecord & { employeeName: string }

const statusLabels: Record<AttendanceRecord['status'], string> = {
  present: 'Asistencia',
  absent: 'Ausencia',
  late: 'Retardo',
  leave: 'Permiso',
}

const parseDate = (value?: string | null) => {
  if (!value) return null
  // DATEONLY fields arrive as YYYY-MM-DD (interpreted as UTC by Date.parse),
  // so append a local midnight to avoid subtracting a day when formatting.
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value
  const parsed = new Date(normalized)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const formatDateOnly = (value?: string | null) => {
  const date = parseDate(value)
  return date ? date.toLocaleDateString('es-MX', { dateStyle: 'medium' }) : '—'
}

const formatTime = (value?: string | null) => {
  const date = parseDate(value)
  return date ? date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : '—'
}

const columns: Column<AttendanceRow>[] = [
  {
    header: 'Trabajador',
    accessor: 'employeeName',
    render: (record) => (
      <Stack gap={2}>
        <Text fw={600}>{record.employeeName}</Text>
        <Text size="xs" c="dimmed">
          {record.employee?.employeeCode ?? '—'}
        </Text>
      </Stack>
    ),
  },
  {
    header: 'Fecha',
    accessor: 'date',
    render: (record) => formatDateOnly(record.date),
  },
  {
    header: 'Entrada',
    accessor: 'checkIn',
    render: (record) => formatTime(record.checkIn),
  },
  {
    header: 'Salida',
    accessor: 'checkOut',
    render: (record) => formatTime(record.checkOut),
  },
  {
    header: 'Estado',
    accessor: 'status',
    render: (record) => (
      <Badge color="colimaBlue" variant="light" radius="lg">
        {statusLabels[record.status]}
      </Badge>
    ),
  },
  {
    header: 'Total (min)',
    accessor: 'totalMinutes',
    render: (record) => record.totalMinutes ?? '—',
  },
]

const AttendancePage = () => {
  const { hasRole } = useAuth()
  const canImportClockings = hasRole(['admin', 'rh', 'ti'])
  const [records, setRecords] = useState<AttendanceRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadMessage, setUploadMessage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const loadAttendance = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAttendance()
      const mapped: AttendanceRow[] = data.map((record) => ({
        ...record,
        employeeName: record.employee ? `${record.employee.firstName} ${record.employee.lastName}` : 'Empleado',
      }))
      setRecords(mapped)
    } catch (error) {
      setError('No se pudo cargar el registro de asistencia')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAttendance()
  }, [loadAttendance])

  const handleUpload = async () => {
    if (!canImportClockings) return
    if (!selectedFile) {
      setUploadError('Selecciona un archivo .dat antes de enviar')
      setUploadMessage(null)
      return
    }

    setUploading(true)
    setUploadError(null)
    setUploadMessage(null)
    try {
      await uploadClockingsFile({ file: selectedFile, format: 'dat' })
      setSelectedFile(null)
      setUploadMessage('Archivo enviado. El procesamiento inicia en segundo plano.')
      await loadAttendance()
    } catch (error) {
      setUploadError('No se pudo cargar el archivo, intenta de nuevo')
    } finally {
      setUploading(false)
    }
  }

  const stats = useMemo(() => {
    const total = records.length
    const present = records.filter((record) => record.status === 'present').length
    const absent = records.filter((record) => record.status === 'absent').length
    return { total, present, absent }
  }, [records])

  return (
    <Stack gap="xl">
      <div>
        <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts={3}>
          Checadas
        </Text>
        <Title order={2} c="colimaBlue.9">
          Registro de asistencia
        </Title>
        <Text c="dimmed" size="sm">
          Integra tu reloj checador, biométrico o app móvil y genera auditoría centralizada.
        </Text>
      </div>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
        <Card radius="xl" shadow="md" withBorder>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            Registros
          </Text>
          <Text fz={32} fw={700} c="colimaBlue.9">
            {stats.total}
          </Text>
        </Card>
        <Card radius="xl" shadow="md" withBorder>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            Asistencias
          </Text>
          <Text fz={32} fw={700} c="statusGreen.6">
            {stats.present}
          </Text>
        </Card>
        <Card radius="xl" shadow="md" withBorder>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            Ausencias
          </Text>
          <Text fz={32} fw={700} c="statusAmber.6">
            {stats.absent}
          </Text>
        </Card>
      </SimpleGrid>

      {canImportClockings && (
        <Card radius="xl" shadow="xl" withBorder>
          <Stack gap="md">
            <div>
              <Text fw={600} fz="lg">
                Importar archivo .dat
              </Text>
              <Text c="dimmed" size="sm">
                Solo administradores, TI y RH pueden subir archivos para deduplicar y procesar checadas.
              </Text>
            </div>

            <Dropzone
              onDrop={(files) => {
                setSelectedFile(files[0])
                setUploadError(null)
                setUploadMessage(null)
              }}
              onReject={() => setUploadError('Formato no permitido. Usa archivos .dat o .txt')}
              maxFiles={1}
              accept={{ 'text/plain': ['.dat', '.txt'], 'application/octet-stream': ['.dat'] }}
              radius="lg"
              styles={{ inner: { padding: rem(32) } }}
            >
              <Group justify="center" gap="sm">
                <IconUpload size={24} />
                <Stack gap={2} align="center">
                  <Text fw={600}>Arrastra el archivo o haz clic para explorarlo</Text>
                  <Text size="sm" c="dimmed">
                    Se eliminan duplicados con la misma hora de registro.
                  </Text>
                </Stack>
              </Group>
            </Dropzone>

            {selectedFile && (
              <Card radius="lg" withBorder>
                <Group justify="space-between">
                  <Group gap="sm">
                    <IconFileDescription size={24} />
                    <div>
                      <Text fw={600}>{selectedFile.name}</Text>
                      <Text size="xs" c="dimmed">
                        {Math.round(selectedFile.size / 1024)} KB
                      </Text>
                    </div>
                    <Badge color="colimaGold" variant="light">
                      {selectedFile.type || 'DAT'}
                    </Badge>
                  </Group>
                  <ActionIcon variant="subtle" color="statusRed" onClick={() => setSelectedFile(null)}>
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Card>
            )}

            {uploadError && (
              <Alert color="red" icon={<IconInfoCircle size={16} />}>
                {uploadError}
              </Alert>
            )}
            {uploadMessage && (
              <Alert color="statusGreen" icon={<IconInfoCircle size={16} />}>
                {uploadMessage}
              </Alert>
            )}

            <Group justify="flex-end">
              <Button onClick={handleUpload} loading={uploading} disabled={!selectedFile}>
                Subir y procesar
              </Button>
            </Group>
          </Stack>
        </Card>
      )}

      {error && (
        <Alert color="red" icon={<IconInfoCircle size={16} />}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Card radius="xl" withBorder>
          <Group justify="center" gap="sm">
            <Loader color="colimaBlue" />
            <Text size="sm" c="dimmed">
              Cargando registros...
            </Text>
          </Group>
        </Card>
      ) : (
        <DataTable columns={columns} data={records} />
      )}
    </Stack>
  )
}

export default AttendancePage
