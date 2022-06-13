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

    switch (network.name) {
        case 'hardhat':
        case 'localhost':
            break
        case 'rinkeby':
            break
        case 'mainnet':
            break
        default:
            throw new Error(`Unknown network: ${network.name}`)
    }

    // We get the contract to deploy
    const Library = await ethers.getContractFactory('Library')
    const library = await upgrades.deployProxy(
        Library,
        [deployer.address, '0x0000000000000000000000000000000000000000'],
        {kind: 'uups'}
    )
    console.log('SAVE THIS - Library deployed to:', library.address)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        log.error(error)
        process.exit(1)
    })
