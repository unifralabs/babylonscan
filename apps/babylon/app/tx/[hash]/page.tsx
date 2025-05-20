import CommonTransactionDetail, {
  generateMetadata as generateTransactionDetailMetadata,
  type TransactionDetailProps,
} from '@cosmoscan/core/pages/transactions/detail'

export async function generateMetadata(props: TransactionDetailProps) {
  return await generateTransactionDetailMetadata(props)
}

export default function TransactionDetail(props: TransactionDetailProps) {
  return <CommonTransactionDetail {...props} />
}
