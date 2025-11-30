import { useEffect, useMemo } from 'react'
import { Controller, type SubmitHandler } from 'react-hook-form'
import { Button, Group, SimpleGrid, Stack, Text, TextInput, Select, Badge, Box, Alert } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { Dropzone, MIME_TYPES } from '@mantine/dropzone'
import { IconUpload, IconCalendar, IconCloud, IconTrash, IconIdBadge2 } from '@tabler/icons-react'
import useEmployeeForm, { type EmployeeFormValues } from '../../hooks/useEmployeeForm'
import type { Department, ScheduleCatalog } from '../../types'

interface EmployeeFormProps {
  initialValues?: Partial<EmployeeFormValues>
  onSubmit: SubmitHandler<EmployeeFormValues>
  onCancel: () => void
  serverError?: string | null
  departments: Department[]
  schedules: ScheduleCatalog[]
  catalogLoading: boolean
  catalogError?: string | null
}

const EmployeeForm = ({ initialValues, onSubmit, onCancel, serverError, departments, schedules, catalogLoading, catalogError }: EmployeeFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useEmployeeForm(initialValues)

  const supportDocument = watch('supportDocument')
  const areaId = watch('areaId')
  const scheduleId = watch('scheduleId')

  const areaOptions = useMemo(
    () => departments.map((area) => ({ value: area.id, label: area.name, description: area.code })),
    [departments],
  )

  const scheduleOptions = useMemo(
    () =>
      schedules.map((schedule) => ({
        value: schedule.id,
        label: `${schedule.name} · ${schedule.startTime}-${schedule.endTime}`,
        description: schedule.timezone,
      })),
    [schedules],
  )

  useEffect(() => {
    if (scheduleId && scheduleOptions.length > 0 && !scheduleOptions.find((option) => option.value === scheduleId)) {
      setValue('scheduleId', '')
    }
  }, [scheduleId, scheduleOptions, setValue])

  const selectedArea = useMemo(() => departments.find((area) => area.id === areaId), [departments, areaId])
  const selectedSchedule = useMemo(() => schedules.find((schedule) => schedule.id === scheduleId), [schedules, scheduleId])

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="md">
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <TextInput
            label="Código de empleado"
            placeholder="EMP-001"
            leftSection={<IconIdBadge2 size={16} />}
            {...register('employeeCode')}
            error={errors.employeeCode?.message}
          />
          <Controller
            name="hireDate"
            control={control}
            render={({ field }) => (
              <DatePickerInput
                label="Fecha de ingreso"
                placeholder="Selecciona una fecha"
                value={field.value}
                onChange={field.onChange}
                leftSection={<IconCalendar size={16} />}
                valueFormat="DD/MM/YYYY"
                error={errors.hireDate?.message}
              />
            )}
          />
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <TextInput
            label="Nombre(s)"
            placeholder="Laura"
            {...register('firstName')}
            error={errors.firstName?.message}
          />
          <TextInput
            label="Apellidos"
            placeholder="Mendoza"
            {...register('lastName')}
            error={errors.lastName?.message}
          />
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <Controller
            name="areaId"
            control={control}
            render={({ field }) => (
              <Select
                label="Area o direccion"
                placeholder={catalogLoading ? 'Cargando áreas…' : 'Selecciona un área'}
                data={areaOptions}
                value={field.value || null}
                onChange={(value) => field.onChange(value ?? '')}
                error={errors.areaId?.message}
                disabled={catalogLoading || areaOptions.length === 0}
                searchable
                comboboxProps={{ withinPortal: true }}
                nothingFoundMessage="Sin áreas registradas"
              />
            )}
          />
          <Controller
            name="scheduleId"
            control={control}
            render={({ field }) => (
              <Select
                label="Horario"
                placeholder={areaId ? 'Selecciona un horario' : 'Primero elige un área'}
                data={scheduleOptions}
                value={field.value || null}
                onChange={(value) => field.onChange(value ?? '')}
                error={errors.scheduleId?.message}
                disabled={!areaId || catalogLoading || scheduleOptions.length === 0}
                searchable
                comboboxProps={{ withinPortal: true }}
                nothingFoundMessage={areaId ? 'Sin horarios registrados' : 'Selecciona un área'}
              />
            )}
          />
        </SimpleGrid>

        {catalogError && (
          <Alert radius="lg" color="red" variant="light">
            <Text size="sm">{catalogError}</Text>
          </Alert>
        )}

        <TextInput
          label="Correo corporativo"
          placeholder="usuario@empresa.com"
          type="email"
          {...register('email')}
          error={errors.email?.message}
        />

        {(selectedArea || selectedSchedule) && (
          <Alert radius="lg" color="colimaBlue" variant="light">
            <Stack gap={4}>
              {selectedArea && (
                <Text size="sm" fw={600}>
                  {selectedArea.name}
                  {selectedArea.code ? ` · ${selectedArea.code}` : ''}
                </Text>
              )}
              {selectedSchedule && (
                <Text size="sm" c="dimmed">
                  {selectedSchedule.name}: {selectedSchedule.startTime}-{selectedSchedule.endTime}
                  {selectedSchedule.timezone ? ` (${selectedSchedule.timezone})` : ''}
                </Text>
              )}
            </Stack>
          </Alert>
        )}

        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              label="Estado"
              placeholder="Selecciona un estado"
              data={[
                { value: 'active', label: 'Activo' },
                { value: 'inactive', label: 'Inactivo' },
              ]}
              value={field.value}
              onChange={field.onChange}
              error={errors.status?.message}
            />
          )}
        />

        <Controller
          name="supportDocument"
          control={control}
          render={({ field }) => (
            <Stack gap="xs">
              <Text fw={600} size="sm">
                Contrato o comprobante (PDF / CSV)
              </Text>
              <Dropzone
                onDrop={(files) => field.onChange(files[0])}
                onReject={() => field.onChange(null)}
                accept={[MIME_TYPES.csv, MIME_TYPES.pdf]}
                maxSize={5 * 1024 ** 2}
                multiple={false}
                radius="lg"
                style={{ borderStyle: 'dashed', borderWidth: '2px' }}
              >
                <Group justify="center" gap="xs">
                  <IconUpload size={18} />
                  <Text size="sm" c="dimmed">
                    Arrastra y suelta o haz clic para explorar
                  </Text>
                </Group>
              </Dropzone>
              {supportDocument && (
                <Box bg="neutralSlate.0" p="sm" style={{ borderRadius: '1rem' }} data-testid="file-preview">
                  <Group justify="space-between" align="center" wrap="nowrap">
                    <Group gap="xs">
                      <IconCloud size={18} color="var(--app-primary)" />
                      <div>
                        <Text size="sm" fw={600}>
                          {supportDocument.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {Math.round(supportDocument.size / 1024)} KB
                        </Text>
                      </div>
                      <Badge color="colimaGold" variant="light">
                        {supportDocument.type.split('/')[1] ?? 'archivo'}
                      </Badge>
                    </Group>
                    <Button
                      type="button"
                      variant="subtle"
                      leftSection={<IconTrash size={14} />}
                      onClick={() => {
                        field.onChange(null)
                        setValue('supportDocument', undefined)
                      }}
                    >
                      Quitar
                    </Button>
                  </Group>
                </Box>
              )}
            </Stack>
          )}
        />

        {serverError && (
          <Text size="sm" c="red">
            {serverError}
          </Text>
        )}

        <Group justify="space-between" align="center">
          <Text size="xs" c="dimmed">
            *La carga del archivo se envía usando multipart/form-data al endpoint <Text component="span" fw={600}>/employees</Text>
          </Text>
          <Group gap="xs">
            <Button variant="subtle" type="button" onClick={() => onCancel()}>
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Guardar cambios
            </Button>
          </Group>
        </Group>
      </Stack>
    </form>
  )
}

export default EmployeeForm
