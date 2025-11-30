import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

export const employeeSchema = z.object({
  id: z.string().optional(),
  employeeCode: z.string().min(2, 'Codigo requerido'),
  firstName: z.string().min(2, 'Nombre demasiado corto'),
  lastName: z.string().min(2, 'Apellido demasiado corto'),
  areaId: z.string().min(1, 'Selecciona un area'),
  scheduleId: z.string().min(1, 'Selecciona un horario'),
  email: z
    .union([z.string().email('Correo invalido'), z.literal('')])
    .optional()
    .transform((value) => (value === '' ? undefined : value)),
  status: z.enum(['active', 'inactive']),
  hireDate: z.date().optional().nullable(),
  supportDocument: z
    .instanceof(File)
    .optional()
    .or(z.null())
    .optional(),
})

export type EmployeeFormValues = z.infer<typeof employeeSchema>

const useEmployeeForm = (defaults?: Partial<EmployeeFormValues>) => {
  const defaultValues = useMemo<EmployeeFormValues>(
    () => ({
      id: defaults?.id,
      employeeCode: defaults?.employeeCode ?? '',
      firstName: defaults?.firstName ?? '',
      lastName: defaults?.lastName ?? '',
      areaId: defaults?.areaId ?? '',
      scheduleId: defaults?.scheduleId ?? '',
      email: defaults?.email ?? '',
      status: defaults?.status ?? 'active',
      hireDate: defaults?.hireDate ?? null,
      supportDocument: undefined,
    }),
    [defaults],
  )

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues,
  })

  useEffect(() => {
    form.reset(defaultValues)
  }, [defaultValues, form])

  return form
}

export default useEmployeeForm
