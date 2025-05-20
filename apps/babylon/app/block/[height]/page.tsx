import CommonBlockDetail, {
  generateMetadata as generateBlockDetailMetadata,
  type BlockDetailProps,
} from '@cosmoscan/core/pages/blocks/detail'

export async function generateMetadata(props: BlockDetailProps) {
  return await generateBlockDetailMetadata(props)
}

export default function BlockDetail(props: BlockDetailProps) {
  return <CommonBlockDetail {...props} />
}
