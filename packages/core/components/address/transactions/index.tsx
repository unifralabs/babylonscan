import { TransactionsTable } from '../../transaction'

export default function AddressTransactions({ address }: { address: string }) {
  return <TransactionsTable address={address} />
}
