import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  NumberInput,
  SegmentedControl,
  Select,
  Stack,
  Text,
  Textarea,
  Title,
} from '@mantine/core'
import { DateTimePicker } from '@mantine/dates'
import { IconAlertCircle, IconCheck, IconPlaylistAdd, IconShieldCheck, IconTimeline, IconX } from '@tabler/icons-react'
import DataTable, { type Column } from '../../components/common/DataTable'
import { fetchIncidenceRules } from '../../api/incidenceRules'
import { createIncidence, fetchIncidences, updateIncidenceStatus } from '../../api/incidences'
import { fetchEmployees } from '../../api/employees'
import type { Employee, Incidence, IncidenceRule, IncidenceStatus } from '../../types'
import useAuth from '../../hooks/useAuth'

const statusLabels: Record<IncidenceStatus, string> = {
  pending: 'Pendiente',
  acknowledged: 'Atendida',
  dismissed: 'Descartada',
}

const typeLabels: Record<Incidence['type'], string> = {
  delay: 'Retardo',
  absence: 'Ausencia',
  early_exit: 'Salida anticipada',
  overtime: 'Horas extra',
}

const statusFilterOptions: { value: IncidenceStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'acknowledged', label: 'Atendidas' },
  { value: 'dismissed', label: 'Descartadas' },
]

const dateFormatter = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' })

type ManualIncidenceForm = {
  employeeId: string
  type: Incidence['type']
  occurredAt: Date | null
  minutes: string
  notes: string
  ruleId: string
}

const buildInitialManualForm = (): ManualIncidenceForm => ({
  employeeId: '',
  type: 'delay',
  occurredAt: new Date(),
  minutes: '',
  notes: '',
  ruleId: '',
})

const formatDateTime = (value: string) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'
  return dateFormatter.format(parsed)
}

const buildEmployeeName = (incidence: Incidence) => {
  if (incidence.employee) {
    return `${incidence.employee.firstName} ${incidence.employee.lastName}`.trim()
  }
  return incidence.employeeId
}

const IncidencesPage = () => {
  const { hasRole } = useAuth()
  const canManageIncidences = hasRole(['admin', 'rh', 'ti'])
  const [incidences, setIncidences] = useState<Incidence[]>([])
  const [rules, setRules] = useState<IncidenceRule[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [statusFilter, setStatusFilter] = useState<IncidenceStatus | 'all'>('pending')
  const [loadingIncidences, setLoadingIncidences] = useState(false)
  const [loadingRules, setLoadingRules] = useState(false)
  const [loadingEmployees, setLoadingEmployees] = useState(false)
  const [incidencesError, setIncidencesError] = useState<string | null>(null)
  const [rulesError, setRulesError] = useState<string | null>(null)
  const [employeesError, setEmployeesError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [manualForm, setManualForm] = useState<ManualIncidenceForm>(buildInitialManualForm)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState<string | null>(null)

  const employeeOptions = useMemo(() => {
    return [...employees].sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.trim().toLowerCase()
      const nameB = `${b.firstName} ${b.lastName}`.trim().toLowerCase()
      return nameA.localeCompare(nameB, 'es')
    })
  }, [employees])
  const manualFormDisabled =
    manualForm.employeeId === '' || !manualForm.occurredAt || creating || loadingEmployees || employeeOptions.length === 0

  const handleManualField = <K extends keyof ManualIncidenceForm>(field: K, value: ManualIncidenceForm[K]) => {
    setManualForm((prev) => ({ ...prev, [field]: value }))
    setCreateError(null)
    setCreateSuccess(null)
  }

  useEffect(() => {
    if (!canManageIncidences) {
      setRules([])
      setRulesError(null)
      setLoadingRules(false)
      return
    }

    let isMounted = true
    const loadRules = async () => {
      setLoadingRules(true)
      setRulesError(null)
      try {
        const data = await fetchIncidenceRules()
        if (isMounted) {
          setRules(data)
        }
      } catch (error) {
        if (isMounted) {
          setRulesError('No se pudieron obtener las políticas de incidencia')
        }
      } finally {
        if (isMounted) {
          setLoadingRules(false)
        }
      }
    }

    loadRules()
    return () => {
      isMounted = false
    }
  }, [canManageIncidences])

  useEffect(() => {
    if (!canManageIncidences) {
      setEmployees([])
      setEmployeesError(null)
      setLoadingEmployees(false)
      return
    }

    let isMounted = true
    const loadEmployeesList = async () => {
      setLoadingEmployees(true)
      setEmployeesError(null)
      try {
        const data = await fetchEmployees()
        if (isMounted) {
          setEmployees(data)
        }
      } catch (error) {
        if (isMounted) {
          setEmployeesError('No se pudieron cargar los Trabajadores')
        }
      } finally {
        if (isMounted) {
          setLoadingEmployees(false)
        }
      }
    }

    loadEmployeesList()
    return () => {
      isMounted = false
    }
  }, [canManageIncidences])

  const loadIncidences = useCallback(
    async (filter: IncidenceStatus | 'all') => {
      setLoadingIncidences(true)
      setIncidencesError(null)
      setActionError(null)
      try {
        const params = filter === 'all' ? undefined : { status: filter }
        const data = await fetchIncidences(params)
        setIncidences(data)
      } catch (error) {
        setIncidencesError('No se pudieron cargar las incidencias')
      } finally {
        setLoadingIncidences(false)
      }
    },
    [],
  )

  useEffect(() => {
    loadIncidences(statusFilter)
  }, [loadIncidences, statusFilter])

  const handleStatusUpdate = useCallback(
    async (id: string, status: IncidenceStatus) => {
      if (!canManageIncidences) return
      setActionError(null)
      setUpdatingId(id)
      try {
        const updated = await updateIncidenceStatus(id, { status })
        if (updated) {
          setIncidences((prev) => prev.map((item) => (item.id === id ? { ...item, ...updated } : item)))
        }
      } catch (error) {
        setActionError('No se pudo actualizar la incidencia seleccionada')
      } finally {
        setUpdatingId(null)
      }
    },
    [canManageIncidences],
  )

  const handleManualSubmit = async () => {
    if (!canManageIncidences) {
      setCreateError('No tienes permisos para registrar incidencias manuales')
      return
    }
    setCreateError(null)
    setCreateSuccess(null)

    if (!manualForm.employeeId) {
      setCreateError('Selecciona un Trabajador para registrar la incidencia')
      return
    }

    if (!manualForm.occurredAt || Number.isNaN(manualForm.occurredAt.getTime())) {
      setCreateError('Define una fecha y hora válidas')
      return
    }

    const minutesValue = manualForm.minutes.trim() === '' ? undefined : Number(manualForm.minutes)
    if (minutesValue !== undefined && (Number.isNaN(minutesValue) || minutesValue < 0)) {
      setCreateError('Los minutos deben ser un número igual o mayor a 0')
      return
    }

    setCreating(true)
    try {
      await createIncidence({
        employeeId: manualForm.employeeId,
        type: manualForm.type,
        occurredAt: manualForm.occurredAt.toISOString(),
        minutes: minutesValue,
        notes: manualForm.notes.trim() ? manualForm.notes.trim() : undefined,
        ruleId: manualForm.ruleId || undefined,
      })
      setCreateSuccess('Incidencia registrada correctamente')
      setManualForm((prev) => ({
        ...buildInitialManualForm(),
        employeeId: prev.employeeId,
        type: prev.type,
      }))
      await loadIncidences(statusFilter)
    } catch (error) {
      setCreateError('No se pudo registrar la incidencia, intenta nuevamente')
    } finally {
      setCreating(false)
    }
  }

  const incidenceColumns = useMemo<Column<Incidence>[]>(() => {
    const columns: Column<Incidence>[] = [
      {
        header: 'Trabajador',
        accessor: 'employeeId',
        render: (incidence) => (
          <Stack gap={2}>
            <Text fw={600}>{buildEmployeeName(incidence)}</Text>
            <Text size="xs" c="dimmed">
              {incidence.employee?.employeeCode ?? incidence.employeeId}
            </Text>
          </Stack>
        ),
      },
      {
        header: 'Tipo',
        accessor: 'type',
        render: (incidence) => (
          <Stack gap={2}>
            <Text fw={500}>{typeLabels[incidence.type]}</Text>
            {incidence.rule?.name && (
              <Text size="xs" c="dimmed">
                {incidence.rule.name}
              </Text>
            )}
          </Stack>
        ),
      },
      {
        header: 'Registrado',
        accessor: 'occurredAt',
        render: (incidence) => (
          <Stack gap={2}>
            <Text>{formatDateTime(incidence.occurredAt)}</Text>
            <Text size="xs" c="dimmed">
              {incidence.minutes != null ? `${incidence.minutes} min tarde` : 'Sin duración registrada'}
            </Text>
          </Stack>
        ),
      },
      {
        header: 'Estado',
        accessor: 'status',
        render: (incidence) => (
          <Badge color={incidence.status === 'pending' ? 'statusAmber' : incidence.status === 'acknowledged' ? 'statusGreen' : 'neutralSlate'}>
            {statusLabels[incidence.status]}
          </Badge>
        ),
      },
    ]

    if (canManageIncidences) {
      columns.push({
        header: 'Acciones',
        accessor: 'actions',
        render: (incidence) =>
          incidence.status === 'pending' ? (
            <Group gap="xs">
              <Button
                size="xs"
                leftSection={<IconCheck size={14} />}
                onClick={() => handleStatusUpdate(incidence.id, 'acknowledged')}
                loading={updatingId === incidence.id}
              >
                Atender
              </Button>
              <Button
                size="xs"
                variant="light"
                color="statusRed"
                leftSection={<IconX size={14} />}
                onClick={() => handleStatusUpdate(incidence.id, 'dismissed')}
                loading={updatingId === incidence.id}
              >
                Descartar
              </Button>
            </Group>
          ) : (
            <Text size="xs" c="dimmed">
              —
            </Text>
          ),
      })
    }

    return columns
  }, [canManageIncidences, handleStatusUpdate, updatingId])

  const ruleColumns: Column<IncidenceRule>[] = [
    {
      header: 'Regla',
      accessor: 'name',
      render: (rule) => (
        <Stack gap={2}>
          <Text fw={600}>{rule.name}</Text>
          <Text size="xs" c="dimmed" tt="uppercase">
            {rule.type}
          </Text>
        </Stack>
      ),
    },
    {
      header: 'Descripción',
      accessor: 'description',
      render: (rule) => rule.description ?? '—',
    },
    {
      header: 'Umbral (min)',
      accessor: 'thresholdMinutes',
      render: (rule) => rule.thresholdMinutes ?? '—',
    },
    {
      header: 'Penalización',
      accessor: 'penalty',
      render: (rule) => rule.penalty ?? '—',
    },
  ]

  return (
    <Stack gap="xl">
      <div>
        <Text size="xs" tt="uppercase" fw={600} c="dimmed" lts={3}>
          RH
        </Text>
        <Title order={2} c="colimaBlue.9">
          Registro manual de incidencias
        </Title>
        <Text c="dimmed" size="sm">
          Da seguimiento inmediato a ausencias, retardos o autorizaciones especiales desde un solo panel.
        </Text>
      </div>

      {canManageIncidences && (
        <>
          {employeesError && (
            <Alert color="red" icon={<IconAlertCircle size={16} />}>
              {employeesError}
            </Alert>
          )}

          <Card radius="xl" shadow="xl" withBorder>
            <Stack gap="md">
              <Group gap="sm">
                <IconPlaylistAdd size={20} />
                <Text fw={600}>Registrar incidencia manualmente</Text>
              </Group>

              <Stack gap="md">
                <Select
                  label="Trabajador"
                  placeholder="Selecciona un Trabajador"
                  data={employeeOptions.map((employee) => ({
                    value: employee.id,
                    label: `${employee.firstName} ${employee.lastName} · ${employee.employeeCode}`,
                  }))}
                  searchable
                  nothingFoundMessage="Sin resultados"
                  value={manualForm.employeeId}
                  onChange={(value) => handleManualField('employeeId', value ?? '')}
                  disabled={loadingEmployees || creating}
                  comboboxProps={{ withinPortal: true }}
                />

                <Group grow>
                  <Select
                    label="Tipo"
                    data={Object.entries(typeLabels).map(([value, label]) => ({ value, label }))}
                    value={manualForm.type}
                    onChange={(value) => handleManualField('type', (value as Incidence['type']) ?? 'delay')}
                    disabled={creating}
                  />
                  <DateTimePicker
                    label="Fecha y hora"
                    value={manualForm.occurredAt}
                    onChange={(value) => handleManualField('occurredAt', value)}
                    maxDate={new Date()}
                    disabled={creating}
                  />
                </Group>

                <Group grow>
                  <NumberInput
                    label="Duración (minutos)"
                    placeholder="Ej. 15"
                    min={0}
                    value={manualForm.minutes === '' ? undefined : Number(manualForm.minutes)}
                    onChange={(value) => handleManualField('minutes', value != null ? String(value) : '')}
                    disabled={creating}
                  />
                  <Select
                    label="Regla asociada"
                    placeholder="Sin regla"
                    data={rules.map((rule) => ({ value: rule.id, label: rule.name }))}
                    value={manualForm.ruleId}
                    onChange={(value) => handleManualField('ruleId', value ?? '')}
                    disabled={creating || rules.length === 0}
                  />
                </Group>

                <Textarea
                  label="Notas"
                  minRows={3}
                  placeholder="Detalles adicionales"
                  value={manualForm.notes}
                  onChange={(event) => handleManualField('notes', event.currentTarget.value)}
                  disabled={creating}
                />
              </Stack>

              {createError && (
                <Alert color="red" icon={<IconAlertCircle size={16} />}>
                  {createError}
                </Alert>
              )}
              {createSuccess && (
                <Alert color="statusGreen" icon={<IconShieldCheck size={16} />}>
                  {createSuccess}
                </Alert>
              )}

              <Group justify="flex-end">
                <Button onClick={handleManualSubmit} disabled={manualFormDisabled} loading={creating}>
                  Registrar incidencia
                </Button>
              </Group>
            </Stack>
          </Card>
        </>
      )}

      <Stack gap="sm">
        <Group justify="space-between" align="flex-start" gap="md">
          <div>
            <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts={3}>
              Monitoreo
            </Text>
            <Title order={3} c="colimaBlue.9">
              Incidencias
            </Title>
            <Text c="dimmed" size="sm">
              Revisa los eventos reportados automáticamente por el motor de reglas.
            </Text>
          </div>
          <SegmentedControl
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as IncidenceStatus | 'all')}
            data={statusFilterOptions}
          />
        </Group>

        {incidencesError && (
          <Alert color="red" icon={<IconAlertCircle size={16} />}>
            {incidencesError}
          </Alert>
        )}
        {actionError && (
          <Alert color="red" icon={<IconAlertCircle size={16} />}>
            {actionError}
          </Alert>
        )}

        {loadingIncidences ? (
          <Card radius="xl" withBorder>
            <Text size="sm" c="dimmed">
              Cargando incidencias...
            </Text>
          </Card>
        ) : (
          <DataTable
            columns={incidenceColumns}
            data={incidences}
            emptyMessage="No hay incidencias con el filtro seleccionado"
          />
        )}
      </Stack>

      {canManageIncidences && (
        <Stack gap="sm">
          <Group gap="sm">
            <IconTimeline size={20} />
            <div>
              <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts={3}>
                Motor de reglas
              </Text>
              <Title order={3} c="colimaBlue.9">
                Políticas configuradas
              </Title>
            </div>
          </Group>
          <Text c="dimmed" size="sm">
            Gestiona umbrales y penalizaciones para automatizar incidencias.
          </Text>

          {rulesError && (
            <Alert color="red" icon={<IconAlertCircle size={16} />}>
              {rulesError}
            </Alert>
          )}

          {loadingRules ? (
            <Card radius="xl" withBorder>
              <Text size="sm" c="dimmed">
                Cargando reglas...
              </Text>
            </Card>
          ) : (
            <DataTable columns={ruleColumns} data={rules} emptyMessage="Aún no hay reglas configuradas" />
          )}
        </Stack>
      )}
    </Stack>
  )
}

export default IncidencesPage
