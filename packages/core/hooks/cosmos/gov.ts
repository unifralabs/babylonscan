import { useCosmosQueryContext } from '../../providers/cosmos'
import { useQuery } from '@tanstack/react-query'

export function getCosmosGovParamsQueryKey() {
  return ['cosmos-gov-params']
}

export function useCosmosGovParams() {
  const { cosmosQuery } = useCosmosQueryContext()

  const { data, isFetching, refetch } = useQuery({
    queryKey: getCosmosGovParamsQueryKey(),
    queryFn: async () => {
      const [votingParams, depositParams, tallyParams] = await Promise.all([
        cosmosQuery?.gov.v1.params({ paramsType: 'voting' }),
        cosmosQuery?.gov.v1.params({ paramsType: 'deposit' }),
        cosmosQuery?.gov.v1.params({ paramsType: 'tallying' }),
      ])

      return {
        votingParams,
        depositParams,
        tallyParams,
      }
    },
    enabled: !!cosmosQuery,
    staleTime: Infinity,
  })

  return {
    params: data,
    isFetching: isFetching || !cosmosQuery,
    refetch,
  }
}
