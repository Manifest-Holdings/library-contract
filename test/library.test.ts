/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// Start - Support direct Mocha run & debug
import 'hardhat'
import '@nomiclabs/hardhat-ethers'
import '@openzeppelin/hardhat-upgrades'
// End - Support direct Mocha run & debug

import chai, {expect} from 'chai'
import {before} from 'mocha'
import {solidity} from 'ethereum-waffle'
import {Library, WritePassMock} from '../typechain-types'
import {
    deployContract,
    signer,
    deployContractWithProxy
} from './framework/contracts'
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers'
// Wires up Waffle with Chai
chai.use(solidity)

/*
 * The below comments are only for explaining the test layout.
 *
 * Actual tests do not need them, instead should practice code as documentation.
 */

// Start with the contract name as the top level descriptor
describe('Library', () => {
    /*
     * Once and before any test, get a handle on the signer and observer
     * (only put variables in before, when their state is not affected by any test)
     */
    before(async () => {
        admin = await signer(0)
        observer = await signer(1)
        observer2 = await signer(2)
        // observer3 = await signer(3)
    })

    // Before each test, deploy a fresh amulet (clean starting state)
    beforeEach(async () => {
        library = await deployContractWithProxy<Library>(
            'Library',
            admin.address,
            '0x0000000000000000000000000000000000000000'
        )
    })

    describe('publisher whitelist', () => {
        it('add publisher', async () => {
            await library.addPublisher(observer.address)
            expect(await library.getPublishers()).to.include(observer.address)
        })

        it('remove publisher', async () => {
            await library.addPublisher(observer.address)
            await library.removePublisher(1)
            expect(await library.getPublishers()).to.not.include(
                observer.address
            )
        })

        it('on whitelist can record', async () => {
            await library.addPublisher(observer.address)
            await expect(
                library
                    .connect(observer)
                    .record('test', 'test', observer.address, 'test', ['test'])
            )
                .to.emit(library, 'Record')
                .withArgs('test', 'test', observer.address, 'test', ['test'])
        })

        it('on whitelist can revoke', async () => {
            await library.addPublisher(observer.address)
            await expect(
                library
                    .connect(observer)
                    .revoke('0x0000000000000000000000000000000000000000')
            ).to.emit(library, 'Revoke')
        })

        it('not on whitelist can not record', async () => {
            await expect(
                library
                    .connect(observer)
                    .record('test', 'test', observer.address, 'test', ['test'])
            ).to.revertedWith('NoPublishAccess()')
        })

        it('removed publisher can not record', async () => {
            await library.addPublisher(observer.address)
            await library.removePublisher(1)
            await expect(
                library
                    .connect(observer)
                    .record('test', 'test', observer.address, 'test', ['test'])
            ).to.revertedWith('NoPublishAccess()')
        })
    })

    describe('NFT whitelist', () => {
        beforeEach(async () => {
            writePass = await deployContract<WritePassMock>('WritePassMock')
            await writePass.connect(observer2).mint()
            await library.setWritePassContract(writePass.address)
        })

        it('with NFT can record', async () => {
            await expect(
                library
                    .connect(observer2)
                    .record('test', 'test', observer2.address, 'test', ['test'])
            )
                .to.emit(library, 'Record')
                .withArgs('test', 'test', observer2.address, 'test', ['test'])
        })

        it('with NFT can revoke', async () => {
            await expect(
                library
                    .connect(observer2)
                    .revoke('0x0000000000000000000000000000000000000000')
            ).to.emit(library, 'Revoke')
        })

        it('without NFT can not record', async () => {
            await expect(
                library
                    .connect(observer)
                    .record('test', 'test', observer.address, 'test', ['test'])
            ).to.revertedWith('NoPublishAccess()')
        })
    })

    let admin: SignerWithAddress
    let observer: SignerWithAddress
    let observer2: SignerWithAddress
    // let observer3: SignerWithAddress
    let library: Library
    let writePass: WritePassMock
})
