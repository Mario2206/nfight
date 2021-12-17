import { connectDb } from "../../api/database/connect"
import { getDeck, saveDeck } from "../../api/services/DeckService"
import {ethers} from "ethers"
import { getMyNfts } from "../../api/services/NftService"

async function saveDeckHandler(req, res) {
    const body = req.body

    const provider = new ethers.providers.JsonRpcProvider(process.env.ETHER_CONNECTION_URL)
    const signer = provider.getSigner(body.key)
    const userNfts = await getMyNfts(provider, signer)

    const allowedNfts = body.nfts.filter(nft => userNfts.find(userNft => userNft.image === nft))

    await connectDb()

    const result = await saveDeck(body.key, allowedNfts)

    return res.status(201).json(result)
}

async function getDeckHandler(req, res) {
    await connectDb()
    const { key } = req.query

    if(!key) {
        return res.status(400).send()
    }
    

    const result = await getDeck(key)
    console.log({result})

    if(!result) {
        return res.status(404).send()
    }

    return res.status(200).json(result)
} 

export default function deckHandler(req, res) {

    switch(req.method) {
        case 'POST': 
            return saveDeckHandler(req, res)
        case 'GET' :
            return getDeckHandler(req, res)
    }

    if(req.method !== "POST") {
        return res.status(400).send()
    }
}