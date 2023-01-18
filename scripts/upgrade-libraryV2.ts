/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable no-console */
import {run, ethers, upgrades, network} from 'hardhat'
import {log} from '../config/logging'

async function main() {
    await run('compile')

    const [deployer] = await ethers.getSigners()
    console.log('Deploying contracts with the account:', deployer.address)
    console.log('Account balance:', (await deployer.getBalance()).toString())
    console.log('Network: ', network.name)
    let proxyAddress
    switch (network.name) {
        case 'hardhat':
        case 'localhost':
            proxyAddress = '0x0000000000000000000000000000000000000000'
            break
        case 'goerli':
            proxyAddress = '0x778386a3bce9D1DD217Bae91088e1Bd95fbA61f9'
            break
        case 'mainnet':
            proxyAddress = '0x1B0d65fF9cF70d65708295C23b41b6B2dC99623c'
            break
        default:
            throw new Error(`Unknown network: ${network.name}`)
    }
    console.log('Proxy Address:', proxyAddress)
    // We get the contract to deploy
    const LibraryV2 = await ethers.getContractFactory('LibraryV2')
    const library = await upgrades.upgradeProxy(proxyAddress, LibraryV2)
    console.log('SAVE THIS - Library upgraded at:', library.address)
    await library.setRecordingPhase(0)
    await library.addModerator('0x3EBA5f9F184d88FC909C7AC01068fbA5CE4AAc06')
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        log.error(error)
        process.exit(1)
    })
