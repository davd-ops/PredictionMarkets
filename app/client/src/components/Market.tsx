import React, {useState} from "react";
import {ethers} from "ethers";
import {predictionMarketABI} from "../otherContractProps/predictionMarketContractProps";

interface PropTypes {
    marketName: string;
    marketDescription: string;
    validUntil: number;
    createdTimestamp: number;
    contractAddress: string;
    providerFee: number;
    marketVolume: number;
    resolved: boolean;
    displayMarketDetail: any;
}

const Market = (props: PropTypes) => {
    const [yesRatio, setYesRatio] = useState(0)
    const [noRatio, setNoRatio] = useState(0)

    const provider = new ethers.providers.Web3Provider((window as any).ethereum)
    const marketContract = new ethers.Contract(props.contractAddress, predictionMarketABI, provider)

    React.useEffect(() => {
        marketContract.calculateMarketRatio().then((r: any) => {
            calculatePercentageOfMarketShares(r[1], r[0])
        })
    }, [])

    const calculatePercentageOfMarketShares = (inferiorShare: string, ratio: number) => {
        if (inferiorShare === "yes") {
            setYesRatio(Math.round(100/(1+(ratio/(10**18)))));
            setNoRatio(Math.round(100-100/(1+(ratio/(10**18)))));
        } else {
            setYesRatio(Math.round(100-100/(1+(ratio/(10**18)))));
            setNoRatio(Math.round(100/(1+(ratio/(10**18)))));
        }
    }

    return (
        <div className="market-div" onClick={() => props.displayMarketDetail(props.marketName, props.marketDescription, props.validUntil, props.createdTimestamp, props.contractAddress, props.providerFee, props.marketVolume, props.resolved)}>
            <p>{props.marketName}</p>
            <div className='percentage-div'>
                <p className="yes">Yes: {yesRatio}%</p>
                <p className="no">No: {noRatio}%</p>
            </div>
        </div>
    );
};

Market.defaultProps = {
    marketName: "Loading...",
    yesRatio: "100%",
    noRatio: "100%",
}

export default Market;
