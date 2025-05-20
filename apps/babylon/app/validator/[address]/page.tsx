import CommonValidatorDetail, {
  generateMetadata as generateValidatorDetailMetadata,
  type ValidatorDetailProps,
} from '@cosmoscan/core/pages/validators/detail'

export async function generateMetadata(props: ValidatorDetailProps) {
  return await generateValidatorDetailMetadata(props)
}

export default function ValidatorDetail(props: ValidatorDetailProps) {
  return <CommonValidatorDetail {...props} />
}
