import CommonProposalDetail, {
  type ProposalDetailProps,
} from '@cosmoscan/core/pages/proposals/detail'

export function generateMetadata({ params }: { params: { id: string } }) {
  return {
    title: `Proposal #${params.id}`,
  }
}

export default function ProposalDetail(props: ProposalDetailProps) {
  return <CommonProposalDetail {...props} />
}
