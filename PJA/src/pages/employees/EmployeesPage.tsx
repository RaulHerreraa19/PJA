import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Group, Stack, Text, Title, Card, Badge, ActionIcon, TextInput, Select, Tooltip } from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { IconUserPlus, IconSearch, IconFilter, IconRefresh, IconTrash, IconEdit } from '@tabler/icons-react'
import { motion } from 'framer-motion'
import DataTable, { type Column } from '../../components/common/DataTable'
import Modal from '../../components/common/Modal'
import EmployeeForm from '../../components/forms/EmployeeForm'
import type { EmployeeFormValues } from '../../hooks/useEmployeeForm'
import { createEmployee, deleteEmployee, fetchEmployees, updateEmployee } from '../../api/employees'
import { fetchDepartments, fetchSchedules } from '../../api/catalogs'
import { confirmAction, showErrorAlert, showSuccessAlert } from '../../utils/alerts'
import type { Department, Employee, ScheduleCatalog } from '../../types'
import useAuth from '../../hooks/useAuth'

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
const normalizeId = (value?: string | null) => (value && uuidRegex.test(value) ? value : undefined)

const formatHireDate = (value?: string | null) => {
  if (!value) return 'Sin fecha'
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime())
    ? 'Sin fecha'
    : parsed.toLocaleDateString('es-MX', { dateStyle: 'medium' })
}

const EmployeesPage = () => {
  const { hasRole } = useAuth()
  const canManageEmployees = hasRole(['admin', 'rh', 'ti'])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(false)
  const [tableError, setTableError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [schedules, setSchedules] = useState<ScheduleCatalog[]>([])
  const [catalogLoading, setCatalogLoading] = useState(false)
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(search, 250)
  const selectedFormValues = useMemo<Partial<EmployeeFormValues> | undefined>(() => {
    if (!selectedEmployee) return undefined
    return {
      id: selectedEmployee.id,
      employeeCode: selectedEmployee.employeeCode,
      firstName: selectedEmployee.firstName,
      lastName: selectedEmployee.lastName,
      areaId: selectedEmployee.department?.id ?? '',
      scheduleId: selectedEmployee.schedule?.id ?? '',
      email: selectedEmployee.email ?? '',
      status: selectedEmployee.status,
      hireDate: selectedEmployee.hireDate ? new Date(selectedEmployee.hireDate) : null,
    }
  }, [selectedEmployee])

  const loadEmployees = useCallback(async () => {
    setLoading(true)
    setTableError(null)
    try {
      const data = await fetchEmployees()
      setEmployees(data)
    } catch (error) {
      setTableError('No se pudo cargar el listado de empleados')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadCatalogs = useCallback(async () => {
    if (!canManageEmployees) {
      setDepartments([])
      setSchedules([])
      setCatalogLoading(false)
      setCatalogError(null)
      return
    }

    setCatalogLoading(true)
    setCatalogError(null)
    try {
      const [departmentsData, schedulesData] = await Promise.all([fetchDepartments(), fetchSchedules()])
      setDepartments(departmentsData)
      setSchedules(schedulesData)
    } catch (error) {
      setCatalogError('No se pudieron cargar las áreas u horarios disponibles')
    } finally {
      setCatalogLoading(false)
    }
  }, [canManageEmployees])

  useEffect(() => {
    loadEmployees()
    loadCatalogs()
  }, [loadEmployees, loadCatalogs])

  const handleCreate = () => {
    if (!canManageEmployees) return
    setSelectedEmployee(null)
    setIsModalOpen(true)
    setFormError(null)
  }

  const handleEdit = useCallback((employee: Employee) => {
    if (!canManageEmployees) return
    setSelectedEmployee(employee)
    setIsModalOpen(true)
    setFormError(null)
  }, [canManageEmployees])

  const handleDelete = useCallback(
    async (id: string) => {
      if (!canManageEmployees) return
      const confirmed = await confirmAction({
        title: '¿Eliminar Trabajador?',
        text: 'Esta acción no se puede deshacer y eliminará sus accesos.',
      })
      if (!confirmed) return
      try {
        await deleteEmployee(id)
        await loadEmployees()
        await showSuccessAlert('Empleado eliminado', 'El registro fue eliminado correctamente.')
      } catch (error) {
        setTableError('No se pudo eliminar al empleado')
        await showErrorAlert('Error', 'El empleado no se pudo eliminar, intenta nuevamente.')
      }
    },
    [canManageEmployees, loadEmployees],
  )

  const handleRefresh = useCallback(() => {
    loadEmployees()
    loadCatalogs()
  }, [loadEmployees, loadCatalogs])

  const handleSubmit = async (values: EmployeeFormValues) => {
    if (!canManageEmployees) {
      setFormError('No tienes permisos para modificar empleados')
      return
    }
    setFormError(null)
    try {
      const departmentId = normalizeId(values.areaId) ?? selectedEmployee?.department?.id ?? undefined
      const scheduleId = normalizeId(values.scheduleId) ?? selectedEmployee?.schedule?.id ?? undefined
      const payload = {
        employeeCode: values.employeeCode,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        status: values.status,
        hireDate: values.hireDate ? values.hireDate.toISOString() : undefined,
        supportDocument: values.supportDocument ?? undefined,
        departmentId,
        scheduleId,
      }

      // Esta llamada POST/PUT impacta directamente los endpoints REST `/employees` expuestos por el backend.
      // Cuando `supportDocument` existe se envía como `multipart/form-data` (ver helper buildBody en api/employees.ts).

      if (selectedEmployee) {
        await updateEmployee(selectedEmployee.id, payload)
      } else {
        await createEmployee(payload)
      }

      await loadEmployees()
      setIsModalOpen(false)
      await showSuccessAlert('Cambios guardados', 'El expediente del Trabajador fue actualizado.')
    } catch (error) {
      setFormError('No se pudieron guardar los cambios')
    }
  }

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesStatus = statusFilter === 'all' ? true : employee.status === statusFilter
      const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase()
      const matchesSearch = fullName.includes(debouncedSearch.toLowerCase()) || employee.employeeCode.includes(debouncedSearch)
      return matchesStatus && matchesSearch
    })
  }, [employees, statusFilter, debouncedSearch])

  const columns = useMemo<Column<Employee>[]>(() => {
    const base: Column<Employee>[] = [
      {
        header: 'Trabajador',
        accessor: 'firstName',
        render: (employee) => (
          <Stack gap={2}>
            <Text fw={600}>
              {employee.firstName} {employee.lastName}
            </Text>
            <Text size="xs" c="dimmed">
              {employee.email ?? 'Sin correo'}
            </Text>
          </Stack>
        ),
      },
      {
        header: 'Área',
        accessor: 'department',
        render: (employee) => employee.department?.name ?? 'Sin área',
      },
      {
        header: 'Puesto',
        accessor: 'position',
        render: (employee) => employee.position?.name ?? 'Sin puesto',
      },
      {
        header: 'Horario',
        accessor: 'schedule',
        render: (employee) =>
          employee.schedule ? `${employee.schedule.name} (${employee.schedule.startTime}-${employee.schedule.endTime})` : 'Sin horario',
      },
      {
        header: 'Código',
        accessor: 'employeeCode',
        render: (employee) => (
          <Text ff="monospace" size="sm">
            {employee.employeeCode}
          </Text>
        ),
      },
      {
        header: 'Correo',
        accessor: 'email',
        render: (employee) => employee.email ?? '—',
      },
      {
        header: 'Fecha de ingreso',
        accessor: 'hireDate',
        render: (employee) => formatHireDate(employee.hireDate),
      },
      {
        header: 'Estado',
        accessor: 'status',
        render: (employee) => (
          <Badge color={employee.status === 'active' ? 'statusGreen' : 'statusAmber'} variant="light">
            {employee.status === 'active' ? 'Activo' : 'Inactivo'}
          </Badge>
        ),
      },
    ]

    if (canManageEmployees) {
      base.push({
        header: 'Acciones',
        accessor: 'actions',
        render: (employee) => (
          <Group gap="xs">
            <Tooltip label="Editar" withArrow>
              <ActionIcon variant="light" color="colimaBlue" onClick={() => handleEdit(employee)}>
                <IconEdit size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Eliminar" withArrow>
              <ActionIcon variant="light" color="statusRed" onClick={() => handleDelete(employee.id)}>
                <IconTrash size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        ),
      })
    }

    return base
  }, [canManageEmployees, handleDelete, handleEdit])

  return (
    <Stack gap="lg">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
          <Stack gap={4}>
            <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts={3}>
              Equipo
            </Text>
            <Title order={2} c="colimaBlue.9">
              Gestión de empleados
            </Title>
            <Text c="dimmed" size="sm">
              Administra altas, bajas y documentos con auditoría centralizada.
            </Text>
          </Stack>
          <Group>
            <Button leftSection={<IconRefresh size={16} />} variant="light" onClick={handleRefresh}>
              Actualizar
            </Button>
            {canManageEmployees && (
              <Button leftSection={<IconUserPlus size={16} />} onClick={handleCreate}>
                Nuevo empleado
              </Button>
            )}
          </Group>
        </Group>
      </motion.div>

      <Card radius="xl" shadow="xl" withBorder>
        <Group gap="md" wrap="wrap">
          <TextInput
            placeholder="Buscar por nombre o código"
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            style={{ flex: 1, minWidth: 220 }}
          />
          <Select
            data={[
              { value: 'all', label: 'Todos' },
              { value: 'active', label: 'Activos' },
              { value: 'inactive', label: 'Inactivos' },
            ]}
            leftSection={<IconFilter size={16} />}
            value={statusFilter}
            onChange={(value) => setStatusFilter((value as 'all' | 'active' | 'inactive') ?? 'all')}
            placeholder="Estado"
            comboboxProps={{ withinPortal: true }}
          />
        </Group>
      </Card>

      {catalogError && (
        <Card radius="lg" withBorder>
          <Text size="sm" c="red">
            {catalogError}
          </Text>
        </Card>
      )}

      {tableError && (
        <Card radius="lg" withBorder>
          <Text size="sm" c="red">
            {tableError}
          </Text>
        </Card>
      )}

      <DataTable columns={columns} data={filteredEmployees} isLoading={loading} />

      {canManageEmployees && (
        <Modal
          title={selectedEmployee ? 'Editar empleado' : 'Nuevo empleado'}
          description="Completa la información para guardar el expediente del Trabajador."
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        >
          <EmployeeForm
            initialValues={selectedFormValues}
            onSubmit={handleSubmit}
            onCancel={() => setIsModalOpen(false)}
            serverError={formError}
            departments={departments}
            schedules={schedules}
            catalogLoading={catalogLoading}
            catalogError={catalogError}
          />
        </Modal>
      )}
    </Stack>
  )
}

export default EmployeesPage
