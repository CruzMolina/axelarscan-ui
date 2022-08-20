import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { useSelector, shallowEqual } from 'react-redux'
import _ from 'lodash'
import { TailSpin } from 'react-loader-spinner'
import { FiCode } from 'react-icons/fi'

import Image from '../../image'
import { getChain } from '../../../lib/object/chain'
import { getAsset } from '../../../lib/object/asset'
import { currency_symbol } from '../../../lib/object/currency'
import { number_format, loader_color } from '../../../lib/utils'

export default ({
  title = '',
  description = '',
  topData,
  n = 5,
  by = 'num_txs',
}) => {
  const { preferences, evm_chains, cosmos_chains } = useSelector(state => ({ preferences: state.preferences, evm_chains: state.evm_chains, cosmos_chains: state.cosmos_chains }), shallowEqual)
  const { theme } = { ...preferences }
  const { evm_chains_data } = { ...evm_chains }
  const { cosmos_chains_data } = { ...cosmos_chains }

  const router = useRouter()
  const { pathname } = { ...router }

  const [data, setData] = useState(null)

  useEffect(() => {
    if (topData && evm_chains_data && cosmos_chains_data) {
      const { data } = { ...topData }
      const chains_data = _.concat(evm_chains_data, cosmos_chains_data)
      setData(data.map((d, i) => {
        const { source_chain, destination_chain } = { ...d }
        const source_chain_data = getChain(source_chain, chains_data)
        const destination_chain_data = getChain(destination_chain, chains_data)
        return {
          ...d,
          source_chain_data,
          destination_chain_data,
        }
      }))
    }
  }, [topData, evm_chains_data, cosmos_chains_data])

  const _data = _.slice(_.orderBy(data, [by], ['desc']), 0, n)

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg space-y-2 pt-4">
      <div className="flex items-center justify-between px-4">
        <div className="flex flex-col space-y-0.5">
          <span className="font-bold">
            {title}
          </span>
          <span className="text-slate-400 dark:text-slate-200 text-xs font-medium">
            {description}
          </span>
        </div>
      </div>
      <div className="w-full h-56">
        {data ?
          <div className="flex flex-col">
            {_data.map((d, i) => (
              <Link
                key={i}
                href={`${pathname}/search?sourceChain=${d?.source_chain}&destinationChain=${d?.destination_chain}`}
              >
                <a className="hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-base font-bold hover:font-extrabold space-x-5 py-2 px-4">
                  <div className="flex items-center space-x-3">
                    <Image
                      src={d?.source_chain_data?.image}
                      title={d?.source_chain_data?.name}
                      className="w-7 h-7 rounded-full"
                    />
                    <FiCode size={20} />
                    <Image
                      src={d?.destination_chain_data?.image}
                      title={d?.destination_chain_data?.name}
                      className="w-7 h-7 rounded-full"
                    />
                  </div>
                  <span className="uppercase">
                    {by === 'volume' ?
                      `${currency_symbol}${number_format(d?.volume, d?.volume > 1000000 ? '0,0.00a' : d?.volume > 100000 ? '0,0' : '0,0.00')}` :
                      number_format(d?.num_txs, '0,0')
                    }
                  </span>
                </a>
              </Link>
            ))}
          </div>
          :
          <div className="w-full h-4/5 flex items-center justify-center">
            <TailSpin color={loader_color(theme)} width="32" height="32" />
          </div>
        }
      </div>
    </div>
  )
}