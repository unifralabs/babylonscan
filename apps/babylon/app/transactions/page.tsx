import CommonTransactions, {
  type TransactionsProps,
} from '@cosmoscan/core/pages/transactions'

export default function Transactions(props: TransactionsProps) {
  return <CommonTransactions {...props} />
}
