import React from 'react'
import Market from "./Market"

interface PropTypes {
    displayMarketDetail: any
    markets: {
        marketList: {
            objectId: React.Key,
            marketName: string,
            marketDescription: string,
            validUntil: number,
            createdTimestamp: number,
            contractAddress: string,
            providerFee: number,
            marketVolume: number,
            isResolved: boolean,
            resolved: boolean
        }[]
    }
}

const ExpiredMarketsPage = (props: PropTypes) => {
    let isThereExpiredMarket = false

    const filterMarketsAndDisplayResults = () => {
        if (props.markets.marketList.length) {
            return props.markets.marketList.map((market: {
                objectId: React.Key,
                marketName: string,
                marketDescription: string,
                validUntil: number,
                createdTimestamp: number,
                contractAddress: string,
                providerFee: number,
                marketVolume: number,
                resolved: boolean
            }) => {

                if (Number(market.validUntil) < new Date(Date.now()).getTime() / 1000) {
                    isThereExpiredMarket = true
                    return <Market key={market.objectId} marketName={market.marketName}
                                   marketDescription={market.marketDescription}
                                   validUntil={market.validUntil} createdTimestamp={market.createdTimestamp}
                                   contractAddress={market.contractAddress} providerFee={market.providerFee}
                                   marketVolume={market.marketVolume} displayMarketDetail={props.displayMarketDetail}
                                   resolved={market.resolved} />
                }
            })
        }
    }

    return (
        <div className="app-body">
            <h1 >Expired markets</h1>
            <div className="markets-container">
                {
                    filterMarketsAndDisplayResults()
                }
                <p className='subtitle'>{!isThereExpiredMarket ? 'No expired markets' : null}</p>
            </div>
        </div>
    )
}

export default ExpiredMarketsPage
