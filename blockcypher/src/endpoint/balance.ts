import bcypher from 'blockcypher'
import objectPath from 'object-path'

import { Config, DEFAULT_CONFIRMATIONS, DEFAULT_DATA_PATH } from '../config'
import { JobSpecRequest } from '../adapter'
import { CoinType, ChainType } from '.'

export const Name = 'balance'

// blockcypher response type for addr balance query
type AddressBalance = {
  address: string
  total_received: number
  total_sent: number
  balance: number
  unconfirmed_balance: number
  final_balance: number
  n_tx: number
  unconfirmed_n_tx: number
  final_n_tx: number
}

type Address = {
  address: string
  coin?: CoinType
  chain?: ChainType
  balance?: number
}

type RequestData = {
  dataPath: string
  confirmations: number
}

const WARNING_NO_OPERATION =
  'No Operation: only btc main/test chains are supported by blockcypher adapter'
const WARNING_NO_OPERATION_MISSING_ADDRESS =
  'No Operation: address param is missing'

const toBalances = async (
  config: Config,
  addresses: Address[],
  confirmations: number = DEFAULT_CONFIRMATIONS
): Promise<Address[]> =>
  Promise.all(
    addresses.map(async (addr: Address) => {
      if (!addr.address)
        return { ...addr, warning: WARNING_NO_OPERATION_MISSING_ADDRESS }

      if (!addr.coin) addr.coin = 'btc'
      if (addr.coin !== 'btc') return { ...addr, warning: WARNING_NO_OPERATION }

      if (!addr.chain) addr.chain = 'main'
      if (addr.chain !== 'main' && addr.chain !== 'test')
        return { ...addr, warning: WARNING_NO_OPERATION }

      // rewrite chain id for bcypher
      const addrChain =
        addr.coin === 'btc' && addr.chain === 'test' ? 'test3' : addr.chain
      const api = new bcypher(addr.coin, addrChain, config.token)
      const params = { confirmations }
      const getAddrBal = (): Promise<AddressBalance> =>
        new Promise((resolve, reject) => {
          api.getAddrBal(
            addr.address,
            params,
            (error: Error, body: AddressBalance) =>
              error ? reject(error) : resolve(body)
          )
        })

      return {
        ...addr,
        balance: (await getAddrBal()).balance,
      }
    })
  )

export const inputParams = {
  dataPath: false,
  confirmations: false,
}

// Export function to integrate with Chainlink node
export const createRequest = async (
  config: Config,
  request: JobSpecRequest,
  data: RequestData
): Promise<Address[]> => {
  const dataPath = data.dataPath || DEFAULT_DATA_PATH
  const inputData = <Address[]>objectPath.get(request.data, dataPath)

  // Check if input data is valid
  if (!inputData || !Array.isArray(inputData) || inputData.length === 0)
    throw Error(`Input, at '${dataPath}' path, must be a non-empty array.`)

  return await toBalances(config, inputData, data.confirmations)
}