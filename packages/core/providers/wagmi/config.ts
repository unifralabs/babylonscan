import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, type AppKitNetwork } from '@reown/appkit/networks'
import { cookieStorage, createStorage, http } from '@wagmi/core'

export const projectId = '195e08f8d59ea5f707d2ff35f5e3a978'

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [mainnet]

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
  transports: {
    [mainnet.id]: http('https://rpc.ankr.com/eth'),
  },
})

export const config = wagmiAdapter.wagmiConfig
