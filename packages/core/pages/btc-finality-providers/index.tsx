import { BtcFpStatisticalData } from '../../components/btc-finality-providers'
import BtcFinalityProvidersTable from '../../components/btc-finality-providers/table'
import { type ExternalLinkRendererProps } from '../../components/external-link-renderer'

export default function BtcFinalityProviders({
  detailRouteType = 'finalityProvider',
}: {
  detailRouteType?: ExternalLinkRendererProps['type']
}) {
  return (
    <div className="gap-page-gap flex flex-col md:gap-6">
      <BtcFpStatisticalData />
      <BtcFinalityProvidersTable detailRouteType={detailRouteType} />
    </div>
  )
}
