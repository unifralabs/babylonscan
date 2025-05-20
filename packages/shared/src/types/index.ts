import { CSSProperties } from 'react'

export interface StyleProps {
  style?: CSSProperties
  className?: string
}

export interface SearchResult {
  // Contract
  id?: number | bigint
  label?: string | null
  address?: string
  // Token
  denom?: string
  display_denom?: string | null
  type?: string
  name?: string | null
  symbol?: string | null
  // Validator
  operator_address?: string
  // Finality Provider
  btc_pk?: string
}

export * from './zod'
export * from './babylon'
