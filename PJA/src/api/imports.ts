import axiosClient from './axiosClient'

interface UploadClockingsOptions {
  file: File
  format?: 'csv' | 'dat'
}

export const uploadClockingsFile = async ({ file, format = 'dat' }: UploadClockingsOptions) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('format', format)

  await axiosClient.post('/import/clockings', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
