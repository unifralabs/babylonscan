import CommonTokens, {
  generateMetadata as generateTokensMetadata,
  type TokenTrackerParams,
} from '@cosmoscan/core/pages/tokens'

export async function generateMetadata(props: TokenTrackerParams) {
  return await generateTokensMetadata(props)
}

export default function Tokens(props: TokenTrackerParams) {
  return <CommonTokens {...props} />
}
