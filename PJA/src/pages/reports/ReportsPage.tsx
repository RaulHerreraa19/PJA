import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Card, Group, SimpleGrid, Select, Stack, Text, Title } from '@mantine/core'
import { IconAlertCircle, IconDownload } from '@tabler/icons-react'
import { fetchPeriods } from '../../api/periods'
import { fetchEmployees } from '../../api/employees'
import { generatePeriodReport } from '../../api/reports'
import type { Employee, Period } from '../../types'

type AttendanceStatusFilter = 'all' | 'present' | 'absent' | 'late' | 'leave'

const statusOptions: { value: AttendanceStatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'present', label: 'Asistencia' },
  { value: 'absent', label: 'Ausencia' },
  { value: 'late', label: 'Retardo' },
  { value: 'leave', label: 'Permiso' },
]

const downloadBase64File = (base64: string, mime: string, filename: string) => {
  const link = document.createElement('a')
  link.href = `data:${mime};base64,${base64}`
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const ReportsPage = () => {
  const [periods, setPeriods] = useState<Period[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedPosition, setSelectedPosition] = useState('')
  const [statusFilter, setStatusFilter] = useState<AttendanceStatusFilter>('all')
  const [initialLoading, setInitialLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const loadCatalogs = async () => {
      setInitialLoading(true)
      setError(null)
      try {
        const [periodData, employeeData] = await Promise.all([fetchPeriods(), fetchEmployees()])
        if (!isMounted) return
        setPeriods(periodData)
        setEmployees(employeeData)
      } catch (err) {
        if (!isMounted) return
        setError('No se pudieron obtener los catálogos de reportes')
      } finally {
        if (isMounted) {
          setInitialLoading(false)
        }
      }
    }

    loadCatalogs()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!selectedPeriod && periods.length > 0) {
      setSelectedPeriod(periods[0].id)
    }
  }, [periods, selectedPeriod])

  const employeeOptions = useMemo(
    () =>
      [...employees]
        .map((employee) => ({
          value: employee.id,
          label: `${employee.firstName} ${employee.lastName} · ${employee.employeeCode}`,
        }))
        .sort((a, b) => a.label.localeCompare(b.label, 'es')),
    [employees],
  )

  const departmentOptions = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>()
    employees.forEach((employee) => {
      if (employee.department) {
        map.set(employee.department.id, { id: employee.department.id, name: employee.department.name })
      }
    })
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'es'))
  }, [employees])

  const positionOptions = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>()
    employees.forEach((employee) => {
      if (employee.position) {
        map.set(employee.position.id, { id: employee.position.id, name: employee.position.name })
      }
    })
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'es'))
  }, [employees])

  const handleGenerate = async () => {
    if (!selectedPeriod) {
      setError('Selecciona un periodo para generar el reporte')
      return
    }
    setGenerating(true)
    setError(null)
    setMessage(null)
    try {
      const payload = {
        periodId: selectedPeriod,
        departmentId: selectedDepartment || undefined,
        positionId: selectedPosition || undefined,
        employeeId: selectedEmployee || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
      }
      const result = await generatePeriodReport(payload)
      if (result) {
        const today = new Date().toISOString().split('T')[0]
        downloadBase64File(result.excel, result.excelMime, `reporte-periodo-${today}.xlsx`)
        downloadBase64File(result.pdf, result.pdfMime, `reporte-periodo-${today}.pdf`)
        setMessage('Reportes generados correctamente. Revisa tus descargas.')
      }
    } catch (err) {
      setError('No se pudo generar el reporte, intenta nuevamente.')
    } finally {
      setGenerating(false)
    }
  }

  const handleFilterChange = (callback: (value: string) => void) => (value: string | null) => {
    callback(value ?? '')
    setMessage(null)
  }

  return (
    <Stack gap="xl">
      <div>
        <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts={3}>
          Insights
        </Text>
        <Title order={2} c="colimaBlue.9">
          Reportes
        </Title>
        <Text c="dimmed" size="sm">
          Genera PDF y Excel directamente desde el backend.
        </Text>
      </div>

      <Card radius="xl" shadow="xl" withBorder>
        <Stack gap="lg">
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
            <Select
              label="Periodo"
              placeholder="Selecciona un periodo"
              value={selectedPeriod || null}
              onChange={handleFilterChange(setSelectedPeriod)}
              data={periods.map((period) => ({
                value: period.id,
                label: `${period.name} (${new Date(period.startDate).toLocaleDateString()} - ${new Date(period.endDate).toLocaleDateString()})`,
              }))}
              disabled={initialLoading || periods.length === 0}
              searchable
              nothingFoundMessage="Sin periodos"
            />
            <Select
              label="Trabajador"
              placeholder="Todos"
              value={selectedEmployee || null}
              onChange={handleFilterChange(setSelectedEmployee)}
              data={employeeOptions}
              searchable
              clearable
              disabled={initialLoading}
            />
            <Select
              label="Área"
              placeholder="Todas"
              value={selectedDepartment || null}
              onChange={handleFilterChange(setSelectedDepartment)}
              data={departmentOptions.map((department) => ({ value: department.id, label: department.name }))}
              searchable
              clearable
              disabled={initialLoading}
            />
            <Select
              label="Puesto"
              placeholder="Todos"
              value={selectedPosition || null}
              onChange={handleFilterChange(setSelectedPosition)}
              data={positionOptions.map((position) => ({ value: position.id, label: position.name }))}
              searchable
              clearable
              disabled={initialLoading}
            />
            <Select
              label="Estado de asistencia"
              placeholder="Todos los estados"
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter((value as AttendanceStatusFilter) ?? 'all')
                setMessage(null)
              }}
              data={statusOptions}
              disabled={initialLoading}
            />
          </SimpleGrid>

          {initialLoading && (
            <Alert color="neutralSlate" icon={<IconAlertCircle size={16} />}>
              Cargando catálogos…
            </Alert>
          )}
          {error && (
            <Alert color="red" icon={<IconAlertCircle size={16} />}>
              {error}
            </Alert>
          )}
          {message && (
            <Alert color="statusGreen" icon={<IconAlertCircle size={16} />}>
              {message}
            </Alert>
          )}

          <Group justify="flex-end">
            <Button
              leftSection={<IconDownload size={16} />}
              onClick={handleGenerate}
              disabled={initialLoading || !selectedPeriod}
              loading={generating}
            >
              Generar reporte
            </Button>
          </Group>
        </Stack>
      </Card>
    </Stack>
  )
}

export default ReportsPage
