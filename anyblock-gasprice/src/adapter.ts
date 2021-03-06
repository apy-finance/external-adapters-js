import { Requester } from '@chainlink/external-adapter'
import { Config, ExecuteWithConfig, ExecuteFactory } from '@chainlink/types'
import { makeConfig } from './config'
import { gasprice } from './endpoint'

export const execute: ExecuteWithConfig<Config> = async (request, config) => {
  Requester.logConfig(config)
  return await gasprice.execute(request, config)
}

export const makeExecute: ExecuteFactory<Config> = (config) => {
  return async (request) => execute(request, config || makeConfig())
}
