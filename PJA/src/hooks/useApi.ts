import { useMemo } from 'react'
import axiosClient from '../api/axiosClient'

const useApi = () => {
  const client = useMemo(() => axiosClient, [])
  return client
}

export default useApi
