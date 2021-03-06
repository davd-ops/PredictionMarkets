import React from 'react'
import MarketDetailTitle from "./MarketDetailTitle"
import MarketDetailFooter from "./MarketDetailFooter"
import {ethers} from "ethers"
import {predictionMarketABI} from "../otherContractProps/predictionMarketContractProps"
import {toast} from "react-hot-toast"
import {useMoralis} from "react-moralis"

interface PropTypes {
    marketName: string
    marketDescription: string
    validUntil: number
    providerFee: number
    contractAddress: string
    resolved: boolean
    pendingTx: any
    signMessage: any
    isAdminLogged: any
    createdTimestamp: number
}

const ExpiredMarketDetail = (props: PropTypes) => {
    const [pickedOutcome, setPickedOutcome] = React.useState('yes')
    const [resolved, setResolved] = React.useState(props.resolved)

    const provider = new ethers.providers.Web3Provider((window as any).ethereum)
    const signer = provider.getSigner()
    const marketContract = new ethers.Contract(props.contractAddress, predictionMarketABI, provider)

    const {Moralis} = useMoralis()

    provider.once("block", () => {
        marketContract.on('WinningSideChosen', async () => {
            setResolved(true)
        })
    })

    const pickOutcome = async (event: { preventDefault: () => void }) => {
        event.preventDefault()

        let isAdminLogged = await props.isAdminLogged()

        if ((pickedOutcome === 'yes' && isAdminLogged) || (pickedOutcome === 'no' && isAdminLogged)) {
            try {
                await submitOutcome()
            } catch (e: any) {
                typeof (e.data) !== "undefined" ? toast.error(e.data.message.substring(
                    e.data.message.indexOf("'") + 1,
                    e.data.message.lastIndexOf("'")
                )) : toast.error(e.message)
            }
        }
    }

    const submitOutcome = async () => {
        const userAddress = await props.signMessage()

        try {
            if (typeof userAddress !== "undefined") {
                await marketContract.connect(signer).chooseWinningSide(pickedOutcome)
                props.pendingTx(marketContract, userAddress)

                const MarketList = Moralis.Object.extend("MarketList")
                const query = new Moralis.Query(MarketList)
                query.equalTo("contractAddress", props.contractAddress)
                const result = await query.first()
                if (typeof result !== "undefined") {
                    result.set('isResolved', true)
                    result.save().then(() => {}, (error: { message: string }) => {
                            toast.error('Failed to create new object, with error code: ' + error.message)
                        })
                } else {
                    toast.error('Something went wrong!')
                }
            } else {
                toast.error('You denied the message, please try again')
            }
        } catch (e) {
            toast.error((e as Error).message)
        }
    }

    return (
        <div className="app-body">
            <MarketDetailTitle
                marketName={props.marketName}
                validUntil={props.validUntil}
                createdTimestamp={props.createdTimestamp}
                liquidity={0}
                marketVolume={0}
                resolved={resolved}
                providerFee = {props.providerFee}
            />
            <div className="market-main-body-section">
                <h1 id={!resolved ? 'expired-detail-heading' : 'resolved-detail-heading'}>{!resolved ? 'Choose the market outcome' : 'Market resolved'}</h1>
                {
                    !resolved ?
                        <form action="" onSubmit={pickOutcome}>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    id="togBtn"
                                    value={pickedOutcome}
                                    onChange={() => pickedOutcome === 'yes' ? setPickedOutcome('no') : setPickedOutcome('yes')}
                                />
                                <div className="slider round"/>
                            </label>
                            <input id='submit' type="submit" value="Choose outcome"/>
                        </form> : null
                }
            </div>
            <MarketDetailFooter marketDescription={props.marketDescription}/>
        </div>
    )
}

export default ExpiredMarketDetail
