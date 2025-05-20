import { BABYLON_PHASE3 } from '@cosmoscan/shared/constants/chain'
import { ChainNetworkEnum } from '@cosmoscan/shared/constants/chains/types'
import {
  MenuBlockchainIcon,
  MenuHomeIcon, MenuStakeIcon, MenuTokenIcon
} from '@cosmoscan/ui/icons/menu'

import { ROUTES } from '@/constants/routes'

const IS_MAINNET =
  process.env.COSMOSCAN_PUBLIC_CHAIN_NETWORK_KEY === ChainNetworkEnum.MAINNET

export const MENU_DATA = [
  {
    labelKey: 'home',
    icon: <MenuHomeIcon />,
    link: ROUTES.home,
  },
  {
    labelKey: 'babylonChain',
    icon: <MenuBlockchainIcon />,
    children: [
      {
        labelKey: 'transactions',
        link: ROUTES.blockchain.transactions.index,
      },
      {
        labelKey: 'blocks',
        link: ROUTES.blockchain.blocks.index,
      },
      // {
      //   labelKey: 'topAccounts',
      //   link: ROUTES.blockchain.topAccounts,
      // },
      {
        labelKey: 'contracts',
        link: ROUTES.blockchain.contracts.index,
      },
      {
        labelKey: 'validators',
        link: ROUTES.blockchain.validators.index,
      },
      {
        labelKey: 'proposals',
        link: ROUTES.blockchain.proposals.index,
      },
    ],
  },
  {
    labelKey: 'btcStaking',
    icon: <MenuStakeIcon />,
    children: [
      {
        labelKey: 'stakingTransactions',
        link: ROUTES.staking.transactions.index,
      },
      {
        labelKey: 'finalityProviders',
        link: ROUTES.staking.finalityProvider.index,
      },
      // {
      //   labelKey: 'btcFinalityProviders',
      //   link: 'https://babylon-devnet.l2scan.co/btc-finality-providers',
      //   isExternal: true,
      // },
      ...(BABYLON_PHASE3
        ? [
            {
              labelKey: 'consumerChains',
              link: ROUTES.chain.index,
            },
          ]
        : []),
    ],
  },
  {
    labelKey: 'tokens',
    icon: <MenuTokenIcon />,
    link: ROUTES.token.index,
  },
  
]
