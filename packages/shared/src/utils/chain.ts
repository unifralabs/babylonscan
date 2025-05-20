import { CURRENT_CHAIN } from '../constants/chains'
import { bech32 } from 'bech32'

export function isValidAddress(address?: string) {
  const value = address?.toString()?.trim()?.toLowerCase()
  if (!!!value) return false

  try {
    return !!bech32.decode(value)
  } catch (error) {
    return false
  }
}

export function formatExplorerUrl(
  explorerUrl: string,
  type: 'block' | 'address' | 'tx',
  hash: string,
) {
  return `${explorerUrl}/${type}/${hash}`
}

export function formatBlockExplorerUrl(
  type: 'block' | 'address' | 'tx',
  hash: string,
) {
  return formatExplorerUrl(CURRENT_CHAIN.blockExplorer, type, hash)
}

export function formatBlockExplorerBlockUrl(hash: string) {
  return formatBlockExplorerUrl('block', hash)
}

export function formatBlockExplorerTxUrl(hash: string) {
  return formatBlockExplorerUrl('tx', hash)
}

export function formatBlockExplorerAddressUrl(address: string) {
  return formatBlockExplorerUrl('address', address)
}
