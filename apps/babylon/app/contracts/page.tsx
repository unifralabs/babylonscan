import CommonContractsList, {
  generateMetadata as generateContractsMetadata,
  type ContractsListParams,
} from '@cosmoscan/core/pages/contracts'

export async function generateMetadata(props: ContractsListParams) {
  return await generateContractsMetadata(props)
}

export default function ContractsList(props: ContractsListParams) {
  return <CommonContractsList {...props} />
}
