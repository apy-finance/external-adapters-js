import { Requester } from '@chainlink/external-adapter'
import { Config } from '@chainlink/types'

export const DEFAULT_ENDPOINT = 'difficulty'

// TODO: needs to setup config for underlying JSON-RPC adapter
export const makeConfig = (prefix?: string): Config => Requester.getDefaultConfig(prefix)
