'use client'

import { createElement } from 'react'

import { BabylonLogo, BabylonLogoWithText } from '../icons/chains/babylon'
import {
  CosmosHubLogo,
  CosmosHubLogoWithText,
} from '../icons/chains/cosmos-hub'

import { ChainTypeEnum } from '@cosmoscan/shared/constants/chain'

export default function ChainLogo({
  className,
  type,
  withText = true,
}: {
  className?: string
  type: ChainTypeEnum
  withText?: boolean
}) {
  switch (type) {
    case ChainTypeEnum.BABYLON:
      return createElement(withText ? BabylonLogoWithText : BabylonLogo, {
        className,
      })
    case ChainTypeEnum.COSMOS_HUB:
      return createElement(withText ? CosmosHubLogoWithText : CosmosHubLogo, {
        className,
      })
    default:
      return null
  }
}
