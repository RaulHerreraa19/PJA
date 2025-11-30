import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  ActionIcon,
  Button,
  Card,
  Group,
  NumberInput,
  Select,
  Stack,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Title,
  Badge,
} from '@mantine/core'
import { IconBuildingBank, IconBriefcase, IconClockHour4, IconRefresh, IconSquarePlus, IconTrash, IconEdit, IconNotebook } from '@tabler/icons-react'
import DataTable from '../../components/common/DataTable'
import type { Column } from '../../components/common/DataTable'
import type { Department, IncidenceRule, Position, ScheduleCatalog } from '../../types'
import {
  createDepartment,
  createPosition,
  createSchedule,
  deleteDepartment,
  deletePosition,
  deleteSchedule,
  fetchDepartments,
  fetchPositions,
  fetchSchedules,
  updateDepartment,
  updatePosition,
  updateSchedule,
} from '../../api/catalogs'
import {
  createIncidenceRule,
  deleteIncidenceRule,
  fetchIncidenceRules,
  type IncidenceRulePayload,
  updateIncidenceRule,
} from '../../api/incidenceRules'
import { confirmAction, showErrorAlert, showSuccessAlert } from '../../utils/alerts'

const CatalogsPage = () => {
  const [departments, setDepartments] = useState<Department[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [schedules, setSchedules] = useState<ScheduleCatalog[]>([])
  const [rules, setRules] = useState<IncidenceRule[]>([])

  const [loadingDepartments, setLoadingDepartments] = useState(false)
  const [loadingPositions, setLoadingPositions] = useState(false)
  const [loadingSchedules, setLoadingSchedules] = useState(false)
  const [loadingRules, setLoadingRules] = useState(false)

  const loadDepartments = useCallback(async () => {
    setLoadingDepartments(true)
    try {
      const data = await fetchDepartments()
      setDepartments(data)
    } catch (error) {
      await showErrorAlert('Error', 'No se pudieron cargar las direcciones')
    } finally {
      setLoadingDepartments(false)
    }
  }, [])

  const loadPositions = useCallback(async () => {
    setLoadingPositions(true)
    try {
      const data = await fetchPositions()
      setPositions(data)
    } catch (error) {
      await showErrorAlert('Error', 'No se pudieron cargar los puestos')
    } finally {
      setLoadingPositions(false)
    }
  }, [])

  const loadSchedules = useCallback(async () => {
    setLoadingSchedules(true)
    try {
      const data = await fetchSchedules()
      setSchedules(data)
    } catch (error) {
      await showErrorAlert('Error', 'No se pudieron cargar los horarios')
    } finally {
      setLoadingSchedules(false)
    }
  }, [])

  const loadRules = useCallback(async () => {
    setLoadingRules(true)
    try {
      const data = await fetchIncidenceRules()
      setRules(data)
    } catch (error) {
      await showErrorAlert('Error', 'No se pudieron cargar las reglas de incidencias')
    } finally {
      setLoadingRules(false)
    }
  }, [])

  useEffect(() => {
    loadDepartments()
    loadPositions()
    loadSchedules()
    loadRules()
  }, [loadDepartments, loadPositions, loadSchedules, loadRules])

  return (
    <Stack gap="xl">
      <Stack gap={4}>
        <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts={3}>
          Catálogos
        </Text>
        <Title order={2} c="colimaBlue.9">
          Administración de catálogos
        </Title>
        <Text c="dimmed" size="sm">
          Configura horarios base, puestos y reglas de incidencias. Esta sección solo está disponible para administradores.
        </Text>
      </Stack>

      <Tabs defaultValue="departments" keepMounted={false} variant="default" radius="lg">
        <Tabs.List>
          <Tabs.Tab value="departments" leftSection={<IconBuildingBank size={16} />}>Direcciones</Tabs.Tab>
          <Tabs.Tab value="positions" leftSection={<IconBriefcase size={16} />}>Puestos</Tabs.Tab>
          <Tabs.Tab value="schedules" leftSection={<IconClockHour4 size={16} />}>Horarios</Tabs.Tab>
          <Tabs.Tab value="rules" leftSection={<IconNotebook size={16} />}>Reglas</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="departments" pt="xl">
          <DepartmentSection
            departments={departments}
            loading={loadingDepartments}
            onRefresh={loadDepartments}
          />
        </Tabs.Panel>

        <Tabs.Panel value="positions" pt="xl">
          <PositionSection
            positions={positions}
            departments={departments}
            loading={loadingPositions}
            onRefresh={async () => {
              await Promise.all([loadPositions(), loadDepartments()])
            }}
          />
        </Tabs.Panel>

        <Tabs.Panel value="schedules" pt="xl">
          <ScheduleSection schedules={schedules} loading={loadingSchedules} onRefresh={loadSchedules} />
        </Tabs.Panel>

        <Tabs.Panel value="rules" pt="xl">
          <RuleSection rules={rules} loading={loadingRules} onRefresh={loadRules} />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  )
}

interface DepartmentSectionProps {
  departments: Department[]
  loading: boolean
  onRefresh: () => Promise<void> | void
}

const DepartmentSection = ({ departments, loading, onRefresh }: DepartmentSectionProps) => {
  const [form, setForm] = useState({ name: '', code: '' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const columns = useMemo<Column<Department>[]>(
    () => [
      { header: 'Nombre', accessor: 'name' },
      { header: 'Código', accessor: 'code', render: (item) => <Badge color="colimaGold">{item.code}</Badge> },
      {
        header: 'Acciones',
        accessor: 'actions',
        render: (item) => (
          <Group gap="xs">
            <ActionIcon
              variant="subtle"
              color="colimaBlue"
              onClick={() => {
                setEditingId(item.id)
                setForm({ name: item.name, code: item.code })
              }}
            >
              <IconEdit size={16} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              color="statusRed"
              onClick={() => handleDelete(item.id)}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        ),
      },
    ],
    [],
  )

  const resetForm = () => {
    setForm({ name: '', code: '' })
    setEditingId(null)
  }

  const handleDelete = async (id: string) => {
    const confirmed = await confirmAction({ title: '¿Eliminar dirección?', text: 'Esta acción no se puede deshacer.' })
    if (!confirmed) return
    try {
      await deleteDepartment(id)
      await showSuccessAlert('Dirección eliminada')
      await onRefresh()
    } catch (error) {
      await showErrorAlert('Error', 'No se pudo eliminar la dirección')
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.name || !form.code) return
    setSaving(true)
    try {
      if (editingId) {
        await updateDepartment(editingId, form)
        await showSuccessAlert('Dirección actualizada')
      } else {
        await createDepartment(form)
        await showSuccessAlert('Dirección creada')
      }
      resetForm()
      await onRefresh()
    } catch (error) {
      await showErrorAlert('Error', 'No se pudieron guardar los datos de la dirección')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Stack gap="lg">
      <Card radius="xl" withBorder shadow="sm">
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <Group justify="space-between" align="flex-end">
              <Stack gap={2}>
                <Text fw={600}>{editingId ? 'Editar dirección' : 'Nueva dirección'}</Text>
                <Text size="xs" c="dimmed">
                  Define las áreas o direcciones a las que se asignan los empleados.
                </Text>
              </Stack>
              <Group gap="xs">
                {editingId && (
                  <Button variant="subtle" onClick={resetForm} type="button">
                    Cancelar
                  </Button>
                )}
                <Button type="submit" loading={saving} leftSection={<IconSquarePlus size={16} />}>
                  {editingId ? 'Actualizar' : 'Guardar'}
                </Button>
              </Group>
            </Group>
            <TextInput label="Nombre" placeholder="Sala Civil" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.currentTarget.value }))} required />
            <TextInput
              label="Código"
              placeholder="SC"
              value={form.code}
              onChange={(e) => setForm((prev) => ({ ...prev, code: e.currentTarget.value.toUpperCase() }))}
              required
            />
          </Stack>
        </form>
      </Card>

      <Group justify="space-between">
        <Text fw={600}>Direcciones registradas</Text>
        <Button variant="light" leftSection={<IconRefresh size={16} />} onClick={onRefresh}>
          Actualizar
        </Button>
      </Group>

      <DataTable columns={columns} data={departments} isLoading={loading} />
    </Stack>
  )
}

interface PositionSectionProps {
  positions: Position[]
  departments: Department[]
  loading: boolean
  onRefresh: () => Promise<void> | void
}

const PositionSection = ({ positions, departments, loading, onRefresh }: PositionSectionProps) => {
  const [form, setForm] = useState({ name: '', departmentId: '' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const departmentOptions = useMemo(() => departments.map((dept) => ({ value: dept.id, label: `${dept.name} (${dept.code})` })), [departments])

  const columns = useMemo<Column<Position>[]>(
    () => [
      { header: 'Puesto', accessor: 'name' },
      {
        header: 'Dirección',
        accessor: 'department',
        render: (item) => item.department?.name ?? '—',
      },
      {
        header: 'Acciones',
        accessor: 'actions',
        render: (item) => (
          <Group gap="xs">
            <ActionIcon
              variant="subtle"
              color="colimaBlue"
              onClick={() => {
                setEditingId(item.id)
                setForm({ name: item.name, departmentId: item.departmentId })
              }}
            >
              <IconEdit size={16} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="statusRed" onClick={() => handleDelete(item.id)}>
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        ),
      },
    ],
    [],
  )

  const resetForm = () => {
    setForm({ name: '', departmentId: '' })
    setEditingId(null)
  }

  const handleDelete = async (id: string) => {
    const confirmed = await confirmAction({ title: '¿Eliminar puesto?', text: 'Los empleados asociados conservarán el registro previo.' })
    if (!confirmed) return
    try {
      await deletePosition(id)
      await showSuccessAlert('Puesto eliminado')
      await onRefresh()
    } catch (error) {
      await showErrorAlert('Error', 'No se pudo eliminar el puesto')
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.name || !form.departmentId) return
    setSaving(true)
    try {
      if (editingId) {
        await updatePosition(editingId, form)
        await showSuccessAlert('Puesto actualizado')
      } else {
        await createPosition(form)
        await showSuccessAlert('Puesto creado')
      }
      resetForm()
      await onRefresh()
    } catch (error) {
      await showErrorAlert('Error', 'No se pudieron guardar los datos del puesto')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Stack gap="lg">
      <Card radius="xl" withBorder shadow="sm">
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <Group justify="space-between" align="flex-end">
              <Stack gap={2}>
                <Text fw={600}>{editingId ? 'Editar puesto' : 'Nuevo puesto'}</Text>
                <Text size="xs" c="dimmed">
                  Relaciona cada puesto con la dirección responsable.
                </Text>
              </Stack>
              <Group gap="xs">
                {editingId && (
                  <Button variant="subtle" onClick={resetForm} type="button">
                    Cancelar
                  </Button>
                )}
                <Button type="submit" loading={saving} leftSection={<IconSquarePlus size={16} />}>
                  {editingId ? 'Actualizar' : 'Guardar'}
                </Button>
              </Group>
            </Group>
            <TextInput label="Nombre del puesto" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.currentTarget.value }))} required />
            <Select
              label="Dirección"
              placeholder="Selecciona una dirección"
              data={departmentOptions}
              value={form.departmentId || null}
              onChange={(value) => setForm((prev) => ({ ...prev, departmentId: value ?? '' }))}
              required
              searchable
            />
          </Stack>
        </form>
      </Card>

      <Group justify="space-between">
        <Text fw={600}>Puestos registrados</Text>
        <Button variant="light" leftSection={<IconRefresh size={16} />} onClick={onRefresh}>
          Actualizar
        </Button>
      </Group>

      <DataTable columns={columns} data={positions} isLoading={loading} />
    </Stack>
  )
}

interface ScheduleSectionProps {
  schedules: ScheduleCatalog[]
  loading: boolean
  onRefresh: () => Promise<void> | void
}

const ScheduleSection = ({ schedules, loading, onRefresh }: ScheduleSectionProps) => {
  const [form, setForm] = useState({ name: '', timezone: 'America/Mexico_City', startTime: '', endTime: '' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const columns = useMemo<Column<ScheduleCatalog>[]>(
    () => [
      { header: 'Nombre', accessor: 'name' },
      {
        header: 'Horario',
        accessor: 'startTime',
        render: (item) => (
          <Text fw={500}>
            {item.startTime} - {item.endTime}
          </Text>
        ),
      },
      { header: 'Zona', accessor: 'timezone' },
      {
        header: 'Acciones',
        accessor: 'actions',
        render: (item) => (
          <Group gap="xs">
            <ActionIcon
              variant="subtle"
              color="colimaBlue"
              onClick={() => {
                setEditingId(item.id)
                setForm({ name: item.name, timezone: item.timezone, startTime: item.startTime, endTime: item.endTime })
              }}
            >
              <IconEdit size={16} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="statusRed" onClick={() => handleDelete(item.id)}>
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        ),
      },
    ],
    [],
  )

  const resetForm = () => {
    setForm({ name: '', timezone: 'America/Mexico_City', startTime: '', endTime: '' })
    setEditingId(null)
  }

  const handleDelete = async (id: string) => {
    const confirmed = await confirmAction({ title: '¿Eliminar horario?', text: 'Los empleados asignados conservarán el valor previo.' })
    if (!confirmed) return
    try {
      await deleteSchedule(id)
      await showSuccessAlert('Horario eliminado')
      await onRefresh()
    } catch (error) {
      await showErrorAlert('Error', 'No se pudo eliminar el horario')
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.name || !form.startTime || !form.endTime) return
    setSaving(true)
    try {
      if (editingId) {
        await updateSchedule(editingId, form)
        await showSuccessAlert('Horario actualizado')
      } else {
        await createSchedule(form)
        await showSuccessAlert('Horario creado')
      }
      resetForm()
      await onRefresh()
    } catch (error) {
      await showErrorAlert('Error', 'No se pudieron guardar los datos del horario')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Stack gap="lg">
      <Card radius="xl" withBorder shadow="sm">
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <Group justify="space-between" align="flex-end">
              <Stack gap={2}>
                <Text fw={600}>{editingId ? 'Editar horario' : 'Nuevo horario'}</Text>
                <Text size="xs" c="dimmed">
                  Establece los bloques de hora disponibles para asignar a cada colaborador.
                </Text>
              </Stack>
              <Group gap="xs">
                {editingId && (
                  <Button variant="subtle" onClick={resetForm} type="button">
                    Cancelar
                  </Button>
                )}
                <Button type="submit" loading={saving} leftSection={<IconSquarePlus size={16} />}>
                  {editingId ? 'Actualizar' : 'Guardar'}
                </Button>
              </Group>
            </Group>
            <TextInput label="Nombre" placeholder="Matutino" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.currentTarget.value }))} required />
            <TextInput label="Zona horaria" placeholder="America/Mexico_City" value={form.timezone} onChange={(e) => setForm((prev) => ({ ...prev, timezone: e.currentTarget.value }))} required />
            <Group grow>
              <TextInput label="Inicio" placeholder="08:00" value={form.startTime} onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.currentTarget.value }))} required />
              <TextInput label="Fin" placeholder="16:00" value={form.endTime} onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.currentTarget.value }))} required />
            </Group>
          </Stack>
        </form>
      </Card>

      <Group justify="space-between">
        <Text fw={600}>Horarios registrados</Text>
        <Button variant="light" leftSection={<IconRefresh size={16} />} onClick={onRefresh}>
          Actualizar
        </Button>
      </Group>

      <DataTable columns={columns} data={schedules} isLoading={loading} />
    </Stack>
  )
}

interface RuleSectionProps {
  rules: IncidenceRule[]
  loading: boolean
  onRefresh: () => Promise<void> | void
}

const RuleSection = ({ rules, loading, onRefresh }: RuleSectionProps) => {
  const [form, setForm] = useState<IncidenceRulePayload>({ name: '', description: '', type: 'delay', thresholdMinutes: undefined, penalty: '' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const columns = useMemo<Column<IncidenceRule>[]>(
    () => [
      { header: 'Nombre', accessor: 'name' },
      {
        header: 'Tipo',
        accessor: 'type',
        render: (item) => <Badge color="colimaBlue">{item.type}</Badge>,
      },
      {
        header: 'Umbral (min)',
        accessor: 'thresholdMinutes',
        render: (item) => item.thresholdMinutes ?? '—',
      },
      { header: 'Penalización', accessor: 'penalty', render: (item) => item.penalty ?? '—' },
      {
        header: 'Acciones',
        accessor: 'actions',
        render: (item) => (
          <Group gap="xs">
            <ActionIcon
              variant="subtle"
              color="colimaBlue"
              onClick={() => {
                setEditingId(item.id)
                setForm({
                  name: item.name,
                  description: item.description ?? '',
                  type: item.type,
                  thresholdMinutes: item.thresholdMinutes ?? undefined,
                  penalty: item.penalty ?? '',
                })
              }}
            >
              <IconEdit size={16} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="statusRed" onClick={() => handleDelete(item.id)}>
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        ),
      },
    ],
    [],
  )

  const resetForm = () => {
    setForm({ name: '', description: '', type: 'delay', thresholdMinutes: undefined, penalty: '' })
    setEditingId(null)
  }

  const handleDelete = async (id: string) => {
    const confirmed = await confirmAction({ title: '¿Eliminar regla?', text: 'Esto afectará futuras evaluaciones.' })
    if (!confirmed) return
    try {
      await deleteIncidenceRule(id)
      await showSuccessAlert('Regla eliminada')
      await onRefresh()
    } catch (error) {
      await showErrorAlert('Error', 'No se pudo eliminar la regla')
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.name) return
    setSaving(true)
    try {
      const payload: IncidenceRulePayload = {
        ...form,
        thresholdMinutes: form.thresholdMinutes || undefined,
        description: form.description?.trim() === '' ? undefined : form.description,
        penalty: form.penalty?.trim() === '' ? undefined : form.penalty,
      }
      if (editingId) {
        await updateIncidenceRule(editingId, payload)
        await showSuccessAlert('Regla actualizada')
      } else {
        await createIncidenceRule(payload)
        await showSuccessAlert('Regla creada')
      }
      resetForm()
      await onRefresh()
    } catch (error) {
      await showErrorAlert('Error', 'No se pudieron guardar los datos de la regla')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Stack gap="lg">
      <Card radius="xl" withBorder shadow="sm">
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <Group justify="space-between" align="flex-end">
              <Stack gap={2}>
                <Text fw={600}>{editingId ? 'Editar regla' : 'Nueva regla'}</Text>
                <Text size="xs" c="dimmed">
                  Configura los criterios de incidencias y su penalización asociada.
                </Text>
              </Stack>
              <Group gap="xs">
                {editingId && (
                  <Button variant="subtle" onClick={resetForm} type="button">
                    Cancelar
                  </Button>
                )}
                <Button type="submit" loading={saving} leftSection={<IconSquarePlus size={16} />}>
                  {editingId ? 'Actualizar' : 'Guardar'}
                </Button>
              </Group>
            </Group>
            <TextInput label="Nombre" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.currentTarget.value }))} required />
            <Textarea label="Descripción" minRows={2} value={form.description ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, description: e.currentTarget.value }))} />
            <Select
              label="Tipo"
              data={[
                { value: 'delay', label: 'Retardo' },
                { value: 'absence', label: 'Ausencia' },
                { value: 'overtime', label: 'Horas extra' },
              ]}
              value={form.type}
              onChange={(value) => setForm((prev) => ({ ...prev, type: (value as IncidenceRule['type']) ?? 'delay' }))}
              required
            />
            <NumberInput
              label="Umbral en minutos"
              placeholder="Opcional"
              value={form.thresholdMinutes ?? ''}
              onChange={(value) => setForm((prev) => ({ ...prev, thresholdMinutes: typeof value === 'number' ? value : undefined }))}
              min={1}
            />
            <TextInput label="Penalización" placeholder="Descuento, advertencia, etc." value={form.penalty ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, penalty: e.currentTarget.value }))} />
          </Stack>
        </form>
      </Card>

      <Group justify="space-between">
        <Text fw={600}>Reglas registradas</Text>
        <Button variant="light" leftSection={<IconRefresh size={16} />} onClick={onRefresh}>
          Actualizar
        </Button>
      </Group>

      <DataTable columns={columns} data={rules} isLoading={loading} />
    </Stack>
  )
}

export default CatalogsPage
