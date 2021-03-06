import React from 'react'
import {ethers} from "ethers"
import {predictionMarketABI, predictionMarketBytecode} from "../otherContractProps/predictionMarketContractProps"
import {toast} from "react-hot-toast"
import {useMoralis} from "react-moralis"
import {usdContractAddress} from "../otherContractProps/usdContractProps"

interface PropTypes {
    pendingTx: any
    signMessage: any
    logOut: any
    isAdminLogged: any
}

const CreateMarketPage = (props: PropTypes) => {
    const [marketTitle, setMarketTitle] = React.useState('')
    const [marketDescription, setMarketDescription] = React.useState('')
    const [providerFee, setProviderFee] = React.useState(0)
    const [endingDate, setEndingDate] = React.useState(Date())

    const provider = new ethers.providers.Web3Provider((window as any).ethereum)
    const signer = provider.getSigner()

    const newMarketFactory = new ethers.ContractFactory(predictionMarketABI, predictionMarketBytecode, signer)

    const {Moralis} = useMoralis()

    const deployContract = async (event: { preventDefault: () => void }) => {
        event.preventDefault()

        let isAdminLogged = await props.isAdminLogged()

        if (!isAdminLogged) {
            toast.error("You don't have permission to do this action")
            return
        }
        if (
            marketTitle.length >= 10 &&
            marketDescription.length >= 20 &&
            providerFee >= 0 &&
            providerFee <= 100 &&
            new Date(endingDate) > new Date()
        ) {
            let endingDateTimestamp = new Date(endingDate).getTime() / 1000
            let createdTimestamp = +new Date() / 1000

            try {
                const contract = await newMarketFactory.deploy(marketTitle, marketDescription, endingDateTimestamp, usdContractAddress, 18, providerFee)
                props.pendingTx(contract, '')

                const MarketList = Moralis.Object.extend("MarketList")
                const marketList = new MarketList()

                marketList.set("marketName", marketTitle)
                marketList.set("marketDescription", marketDescription)
                marketList.set("validUntil", endingDateTimestamp)
                marketList.set("createdTimestamp", createdTimestamp)
                marketList.set("contractAddress", contract.address)
                marketList.set("providerFee", providerFee)
                marketList.set("marketVolume", 0)

                marketList.save()
                    .then(() => {}, (error: { message: string }) => {
                        alert('Failed to create new object, with error code: ' + error.message)
                    })
            } catch (e) {
                toast.error((e as Error).message)
            }

        } else {
            marketTitle.length < 10 ? toast.error('The title has to be more than 10 characters long') :
                marketDescription.length < 20 ? toast.error('The description has to be more than 20 characters long') :
                        providerFee > 100 ? toast.error('The provider fee has to be lower than 100%') :
                            providerFee < 0 ? toast.error('The provider fee has to be 0% or bigger') :
                                toast.error('The date needs to be in the future')
            }
    }

    return (
        <div className="app-body">
            <form autoComplete="off" className="form" onSubmit={deployContract}>
                <div className="title">Create new market</div>
                <div className="input-container ic1">
                    <input
                        className='input'
                        id='title'
                        type='text'
                        name='title'
                        placeholder='Will Biden be the president of...'
                        value={marketTitle}
                        onChange={e => setMarketTitle(e.target.value)}
                        required
                        minLength={10}
                    />
                    <div className="cut cut-title"></div>
                    <label htmlFor="title" className="placeholder">Market title</label>
                </div>
                <div className="input-container ic1">
                    <input
                        className='input'
                        id='description'
                        type='text'
                        name='description'
                        placeholder='This market will resolve to YES if...'
                        value={marketDescription}
                        onChange={e => setMarketDescription(e.target.value)}
                        required
                        minLength={20}
                    />
                    <div className="cut"></div>
                    <label htmlFor="description" className="placeholder">Market description</label>
                </div>
                <div className="input-container ic1">
                    <input
                        className='input'
                        id='provider-fee'
                        type='number'
                        name='provider-fee'
                        placeholder='0'
                        value={providerFee}
                        onChange={e => setProviderFee(parseFloat(e.target.value))}
                        required
                    />
                    <div className="cut cut-short"></div>
                    <label htmlFor="provider-fee" className="placeholder">Provider fee</label>
                </div>
                <div className="input-container ic1">
                    <input
                        className='input-date'
                        id='endingDate'
                        type='date'
                        name='endingDate'
                        placeholder=' '
                        value={endingDate}
                        onChange={e => {
                            setEndingDate(e.target.value)
                            const input = document.getElementsByClassName('input-date') as HTMLCollectionOf<HTMLElement>

                            if (input.length !== 0) input[0].style.color = "white"
                        }}
                        required
                        minLength={8}
                    />
                    <div className="cut cut-short"></div>
                    <label htmlFor="endingDate" className="placeholder">Ending date</label>
                </div>
                <input id='submit' type="submit" value="Submit"/>
            </form>
        </div>
    )
}

export default CreateMarketPage
