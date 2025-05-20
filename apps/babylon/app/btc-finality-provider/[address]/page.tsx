import CommonFinalityProviderDetail, {
  type FinalityProviderParams,
} from '@cosmoscan/core/pages/btc-finality-providers/detail'

export default function FinalityProviderDetail(props: FinalityProviderParams) {
  return <CommonFinalityProviderDetail {...props} />
}
