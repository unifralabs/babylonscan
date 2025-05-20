import { InternalRouterInputs, InternalRouterOutputs } from '../root'

export type InternalTokenRouterInputs = InternalRouterInputs['token']

export type InternalTokenRouterOutputs = InternalRouterOutputs['token']

// Token List
export type TokenListInput = InternalTokenRouterInputs['fetchInfiniteTokens']

export type TokenList =
  InternalTokenRouterOutputs['fetchInfiniteTokens']['items']

export type TokenListItem = TokenList[number]

export type TokenImageJson = {
  large?: string
  small?: string
  thumb?: string
}

export type TokenLinksJson = {
  chat_url?: string[]
  official_forum_url?: string[]
  announcement_url?: string[]
  whitepaper?: string
  subreddit_url?: string
  telegram_channel_identifier?: string
  twitter_screen_name?: string
}

// Token Holders
export type TokenHoldersListInput =
  InternalTokenRouterInputs['fetchTokenTopHolders']

export type TokenHoldersList =
  InternalTokenRouterOutputs['fetchTokenTopHolders']['items']

export type TokenHoldersListItem = TokenHoldersList[number]
