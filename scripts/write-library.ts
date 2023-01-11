/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable no-console */
import {run, ethers, network} from 'hardhat'
import {log} from '../config/logging'

async function main() {
    await run('compile')

    const [deployer] = await ethers.getSigners()
    console.log('Deploying contracts with the account:', deployer.address)
    console.log('Account balance:', (await deployer.getBalance()).toString())
    console.log('Network: ', network.name)
    let libraryAddress

    switch (network.name) {
        case 'hardhat':
        case 'localhost':
            libraryAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
            break
        case 'rinkeby':
            libraryAddress = ''
            break
        case 'mainnet':
            libraryAddress = ''
            break
        default:
            throw new Error(`Unknown network: ${network.name}`)
    }

    // We get the contract to deploy
    const Library = await ethers.getContractFactory('Library')
    const library = Library.attach(libraryAddress)
    await library.revoke(
        '0xb3d5eaa9d5471458a91914a82c0fde870157618787a4c63eabb8d43ebe96eb87'
    )

    /*
     * await library.record(
     *     'Divine City: Prologue Teaser',
     *     'Andrew Gould & Conway Anderson',
     *     '0x0000000000000000000000000000000000000000',
     *     midSizeContent,
     *     [
     *         {
     *             key: 'coverart',
     *             value: 'https://divineeye.xyz/images/default_coverart.jpg'
     *         },
     *         {
     *             key: 'storyart',
     *             value: 'https://divineeye.xyz/images/default_storyart.jpg'
     *         },
     *         {
     *             key: 'world',
     *             value: 'Lootverse'
     *         },
     *         {
     *             key: 'license',
     *             value: 'CC0'
     *         },
     *         {
     *             key: 'reference',
     *             value: 'NFT||0x0000000000000000000000000000000000000000||323'
     *         }
     *     ]
     * )
     */

    console.log('Success with ', library.address)
}

const midSizeContent =
    'Nos vero, inquit ille;\n======================\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Ita multo sanguine profuso in laetitia et in victoria est mortuus. Dolor ergo, id est summum malum, metuetur semper, etiamsi non aderit; Ad quorum et cognitionem et usum iam corroborati natura ipsa praeeunte deducimur. Sit sane ista voluptas. Haec et tu ita posuisti, et verba vestra sunt. Itaque dicunt nec dubitant: mihi sic usus est, tibi ut opus est facto, fac.\n\nTu vero, inquam, ducas licet, si sequetur;\n------------------------------------------\n\nEt harum quidem rerum facilis est et expedita distinctio. Nam de isto magna dissensio est. Quamvis enim depravatae non sint, pravae tamen esse possunt. Quid, cum fictas fabulas, e quibus utilitas nulla elici potest, cum voluptate legimus? Suo genere perveniant ad extremum; Ut non sine causa ex iis memoriae ducta sit disciplina. `Itaque hic ipse iam pridem est reiectus;`\n\nDuo Reges: constructio interrete. Haec non erant eius, qui innumerabilis mundos infinitasque regiones, quarum nulla esset ora, nulla extremitas, mente peragravisset. An eiusdem modi? Quare hoc videndum est, possitne nobis hoc ratio philosophorum dare. `Nunc haec primum fortasse audientis servire debemus.` An hoc usque quaque, aliter in vita? Quis est, qui non oderit libidinosam, protervam adolescentiam? Is ita vivebat, ut nulla tam exquisita posset inveniri voluptas, qua non abundaret. In qua si nihil est praeter rationem, sit in una virtute finis bonorum; Voluptatem cum summum bonum diceret, primum in eo ipso parum vidit, deinde hoc quoque alienum; _Hic nihil fuit, quod quaereremus._ Itaque contra est, ac dicitis;\n\nQuoniamque non dubium est quin in iis, quae media dicimus,\nsit aliud sumendum, aliud reiciendum, quicquid ita fit aut\ndicitur, omne officio continetur.\n\nAliis esse maiora, illud dubium, ad id, quod summum bonum\ndicitis, ecquaenam possit fieri accessio.\n\n_Scrupulum, inquam, abeunti;_ Dicet pro me ipsa virtus nec dubitabit isti vestro beato M. Ergo et avarus erit, sed finite, et adulter, verum habebit modum, et luxuriosus eodem modo. Scrupulum, inquam, abeunti; Non enim ipsa genuit hominem, sed accepit a natura inchoatum. Minime vero probatur huic disciplinae, de qua loquor, aut iustitiam aut amicitiam propter utilitates adscisci aut probari.\n\n> Hic Speusippus, hic Xenocrates, hic eius auditor Polemo, cuius illa ipsa sessio fuit, quam videmus.\n\n### Sed quid attinet de rebus tam apertis plura requirere?\n\nSint ista Graecorum; Prodest, inquit, mihi eo esse animo.'

main()
    .then(() => process.exit(0))
    .catch((error) => {
        log.error(error)
        process.exit(1)
    })
