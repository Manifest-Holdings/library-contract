import 'dotenv/config'
import {task} from 'hardhat/config'
import '@typechain/hardhat'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-etherscan'
import '@openzeppelin/hardhat-upgrades'
import '@nomiclabs/hardhat-waffle'
import 'hardhat-gas-reporter'
import {log} from './config/logging'

/*
 * This is a sample Hardhat task. To learn how to create your own go to https://hardhat.org/guides/create-task.html
 */
task('accounts', 'Prints the list of accounts', async (args, hre) => {
    const accounts = await hre.ethers.getSigners()

    log.info('List of available Accounts')
    for (const account of accounts) {
        log.info('%s', account.address)
    }
})

// task action function receives the Hardhat Runtime Environment as second argument
task('blockNumber', 'Prints the current block number', async (_, {ethers}) => {
    await ethers.provider.getBlockNumber().then((blockNumber) => {
        log.info('Current block number: %d', blockNumber)
    })
})

/*
 * You need to export an object to set up your config
 * Go to https://hardhat.org/config/ to learn more
 *
 * At time of authoring 0.8.4 was the latest version supported by Hardhat
 */
export default {
    networks: {
        hardhat: {
            chainId: 33133,
            allowUnlimitedContractSize: false,
            loggingEnabled: false
        },
        local: {
            url: 'http://localhost:8545',
            chainId: 33133,
            allowUnlimitedContractSize: false,
            loggingEnabled: true
        },
        goerli: {
            url: process.env.GOERLI_URL || '',
            accounts:
                typeof process.env.GOERLI_PRIVATE_KEY === 'undefined'
                    ? []
                    : [`0x${process.env.GOERLI_PRIVATE_KEY}`]
        },
        rinkeby: {
            url: process.env.RINKEBY_URL || '',
            accounts:
                typeof process.env.RINKEBY_PRIVATE_KEY === 'undefined'
                    ? []
                    : [`0x${process.env.RINKEBY_PRIVATE_KEY}`],
            gas: 30000000
        },
        mainnet: {
            url: process.env.MAINNET_URL || '',
            accounts:
                typeof process.env.MAINNET_PRIVATE_KEY === 'undefined'
                    ? []
                    : [`0x${process.env.MAINNET_PRIVATE_KEY}`]
            /*
             * gasPrice: 45000000000, // 45 Gwei
             * gasLimit: 223527,
             */
        },
        mumbai: {
            url: process.env.MUMBAI_URL || '',
            accounts:
                typeof process.env.MUMBAI_PRIVATE_KEY === 'undefined'
                    ? []
                    : [`0x${process.env.MUMBAI_PRIVATE_KEY}`]
        },
        matic: {
            url: process.env.MATIC_URL || '',
            accounts:
                typeof process.env.MATIC_PRIVATE_KEY === 'undefined'
                    ? []
                    : [`0x${process.env.MATIC_PRIVATE_KEY}`]
        }
    },
    solidity: {
        compilers: [
            {
                version: '0.7.6',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            },
            {
                version: '0.8.4'
            },
            {
                version: '0.8.2'
            },
            {
                version: '0.8.8'
            }
        ]
    },
    gasReporter: {
        enabled: true,
        currency: 'USD',
        gasPrice: 45,
        coinmarketcap: process.env.COINMARKETCAP_API_KEY
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY
    }
}
