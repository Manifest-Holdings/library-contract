/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// Start - Support direct Mocha run & debug
import 'hardhat'
import '@nomiclabs/hardhat-ethers'
import '@openzeppelin/hardhat-upgrades'
// End - Support direct Mocha run & debug
import {ContractReceipt} from 'ethers'
import chai, {expect} from 'chai'
import {before} from 'mocha'
import {solidity} from 'ethereum-waffle'
import {Library, LibraryV2, WritePassMock} from '../typechain-types'
import {
    deployContract,
    signer,
    deployContractWithProxy,
    upgradeContract
} from './framework/contracts'
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers'

type Tag = {
    key: string
    value: string
}

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
        moderator = await signer(3)
        anon = await signer(4)
        tagArray = [
            {
                key: 'coverart',
                value: 'https://www.coverartarchive.org/release/5b8f8f8f-f8f8-f8f8-f8f8-f8f8f8f8f8f8/front'
            },
            {
                key: 'storyart',
                value: 'https://www.coverartarchive.org/release/5b8f8f8f-f8f8-f8f8-f8f8-f8f8f8f8f8f8/front'
            }
        ]
    })

    // Before each test, deploy a fresh amulet (clean starting state)
    beforeEach(async () => {
        library = await deployContractWithProxy<Library>(
            'Library',
            admin.address
        )
    })

    const verifyReceipt = (receipt: ContractReceipt, address: string) => {
        if (receipt.events) {
            expect(receipt.events[0].args?.title).to.equal('test')
            expect(receipt.events[0].args?.author).to.equal('test')
            expect(receipt.events[0].args?.authorWallet).to.equal(address)
            expect(receipt.events[0].args?.content).to.equal('test')
            expect(receipt.events[0].args?.tags[0].key).to.equal(
                tagArray[0].key
            )
            expect(receipt.events[0].args?.tags[0].value).to.equal(
                tagArray[0].value
            )
            expect(receipt.events[0].args?.tags[1].key).to.equal(
                tagArray[1].key
            )
            expect(receipt.events[0].args?.tags[1].value).to.equal(
                tagArray[1].value
            )
        }
    }

    describe('v2', () => {
        beforeEach(async () => {
            libraryV2 = await upgradeContract<LibraryV2>(
                'LibraryV2',
                library.address
            )
            await libraryV2.setRecordingPhase(0)
            await libraryV2.addPublisher(observer.address)
            await libraryV2.addModerator(moderator.address)
        })

        it('should upgrade and execute new function', async () => {
            expect(await libraryV2.version()).to.be.equal('2.0.0')
        })
        describe('should whitelist and record', () => {
            it('when recordphase is INVITE_ONLY', async () => {
                await libraryV2.setRecordingPhase(0)
                const tx = await libraryV2
                    .connect(observer)
                    .record('test', 'test', observer.address, 'test', tagArray)
                const receipt = await tx.wait()
                verifyReceipt(receipt, observer.address)
                const tx2 = await libraryV2
                    .connect(moderator)
                    .record('test', 'test', moderator.address, 'test', tagArray)
                const receipt2 = await tx2.wait()
                verifyReceipt(receipt2, moderator.address)
                await expect(
                    libraryV2
                        .connect(anon)
                        .record('test', 'test', anon.address, 'test', tagArray)
                ).to.be.revertedWith('NoPublishAccess()')
            })
            it('when recordphase is MODERATORS', async () => {
                await libraryV2.setRecordingPhase(1)
                await expect(
                    libraryV2
                        .connect(observer)
                        .record(
                            'test',
                            'test',
                            observer.address,
                            'test',
                            tagArray
                        )
                ).to.be.revertedWith('NotModerator()')
                const tx2 = await libraryV2
                    .connect(moderator)
                    .record('test', 'test', moderator.address, 'test', tagArray)
                const receipt2 = await tx2.wait()
                verifyReceipt(receipt2, moderator.address)
                await expect(
                    libraryV2
                        .connect(anon)
                        .record('test', 'test', anon.address, 'test', tagArray)
                ).to.be.revertedWith('NotModerator()')
            })
            it('when recordphase is PUBLIC', async () => {
                await libraryV2.setRecordingPhase(2)
                const tx = await libraryV2
                    .connect(observer)
                    .record('test', 'test', observer.address, 'test', tagArray)
                const receipt = await tx.wait()
                verifyReceipt(receipt, observer.address)
                const tx2 = await libraryV2
                    .connect(moderator)
                    .record('test', 'test', moderator.address, 'test', tagArray)
                const receipt2 = await tx2.wait()
                verifyReceipt(receipt2, moderator.address)
                const tx3 = await libraryV2
                    .connect(anon)
                    .record('test', 'test', anon.address, 'test', tagArray)
                const receipt3 = await tx3.wait()
                verifyReceipt(receipt3, anon.address)
            })
        })
        describe('should allow permissioned revoke', () => {
            it('moderators CAN revoke', async () => {
                await expect(
                    libraryV2
                        .connect(moderator)
                        .revoke('0x0000000000000000000000000000000000000000')
                ).to.emit(libraryV2, 'Revoke')
            })
            it('publishers CAN NOT revoke', async () => {
                await expect(
                    libraryV2
                        .connect(observer)
                        .revoke('0x0000000000000000000000000000000000000000')
                ).to.revertedWith('NotModerator()')
            })

            it('public CAN NOT revoke', async () => {
                await expect(
                    libraryV2
                        .connect(anon)
                        .revoke('0x0000000000000000000000000000000000000000')
                ).to.revertedWith('NotModerator()')
            })
        })
    })

    describe('v1', () => {
        describe('publisher whitelist', () => {
            it('add publisher', async () => {
                await library.addPublisher(observer.address)
                expect(await library.getPublishers()).to.include(
                    observer.address
                )
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
                const tx = await library
                    .connect(observer)
                    .record('test', 'test', observer.address, 'test', tagArray)
                const receipt = await tx.wait()
                verifyReceipt(receipt, observer.address)
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
                        .record(
                            'test',
                            'test',
                            observer.address,
                            'test',
                            tagArray
                        )
                ).to.revertedWith('NoPublishAccess()')
            })

            it('removed publisher can not record', async () => {
                await library.addPublisher(observer.address)
                await library.removePublisher(1)
                await expect(
                    library
                        .connect(observer)
                        .record(
                            'test',
                            'test',
                            observer.address,
                            'test',
                            tagArray
                        )
                ).to.revertedWith('NoPublishAccess()')
            })
        })

        describe('NFT whitelist', () => {
            beforeEach(async () => {
                writePass = await deployContract<WritePassMock>('WritePassMock')
                await writePass.connect(observer2).mint()

                writePass2 = await deployContract<WritePassMock>(
                    'WritePassMock'
                )
                await writePass2.connect(observer).mint()
            })

            it('add NFT address', async () => {
                await library.addNFTWhitelist(writePass.address)
                expect(await library.getNFTWhitelist()).to.include(
                    writePass.address
                )
            })

            it('remove NFT address', async () => {
                await library.addNFTWhitelist(writePass.address)
                await library.removeNFTWhitelist(0)
                expect(await library.getNFTWhitelist()).to.not.include(
                    writePass.address
                )
            })

            it('has whitelisted NFT, can record', async () => {
                await library.addNFTWhitelist(writePass.address)
                await library.addNFTWhitelist(writePass2.address)
                const tx = await library
                    .connect(observer)
                    .record('test', 'test', observer.address, 'test', tagArray)
                const receipt = await tx.wait()
                verifyReceipt(receipt, observer.address)
            })

            it('has whitelisted NFT can revoke', async () => {
                await library.addNFTWhitelist(writePass.address)
                await expect(
                    library
                        .connect(observer2)
                        .revoke('0x0000000000000000000000000000000000000000')
                ).to.emit(library, 'Revoke')
            })

            it('doe not have whitelisted NFT can not record', async () => {
                await expect(
                    library
                        .connect(observer)
                        .record(
                            'test',
                            'test',
                            observer.address,
                            'test',
                            tagArray
                        )
                ).to.revertedWith('NoPublishAccess()')
            })

            it('removed NFT address can not record', async () => {
                await library.addPublisher(writePass.address)
                await library.removePublisher(0)
                await expect(
                    library
                        .connect(observer)
                        .record(
                            'test',
                            'test',
                            observer.address,
                            'test',
                            tagArray
                        )
                ).to.revertedWith('NoPublishAccess()')
            })
        })
    })
    let admin: SignerWithAddress
    let observer: SignerWithAddress
    let observer2: SignerWithAddress
    let anon: SignerWithAddress
    let moderator: SignerWithAddress
    let library: Library
    let libraryV2: LibraryV2
    let writePass: WritePassMock
    let writePass2: WritePassMock
    let tagArray: Array<Tag>
})
