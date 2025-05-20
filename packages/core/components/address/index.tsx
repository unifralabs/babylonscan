import { serverApi } from '../../trpc/server'
import { AssetStats } from './asset-stats'


export async function AddressAssetStats({ address }: { address: string }) {
  const stats = await serverApi.internal.address.fetchAddressAssetStats({
    address,
  })

  return <AssetStats stats={stats} />
}

