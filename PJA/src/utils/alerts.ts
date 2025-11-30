import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const baseAlert = withReactContent(
  Swal.mixin({
    confirmButtonText: 'Aceptar',
    cancelButtonText: 'Cancelar',
    buttonsStyling: true,
    showCancelButton: false,
    reverseButtons: true,
  }),
)

export const showSuccessAlert = async (title: string, text?: string) => {
  await baseAlert.fire({ icon: 'success', title, text })
}

export const showErrorAlert = async (title: string, text?: string) => {
  await baseAlert.fire({ icon: 'error', title, text })
}

interface ConfirmOptions {
  title: string
  text?: string
  confirmButtonText?: string
  cancelButtonText?: string
  icon?: 'warning' | 'question' | 'info'
}

export const confirmAction = async ({
  title,
  text,
  confirmButtonText = 'Sí, continuar',
  cancelButtonText = 'Cancelar',
  icon = 'warning',
}: ConfirmOptions) => {
  const result = await baseAlert.fire({
    icon,
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
  })

  return result.isConfirmed
}
