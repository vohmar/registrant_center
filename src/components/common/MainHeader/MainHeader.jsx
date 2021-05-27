import React, { useState, useEffect } from 'react';
import MediaQuery from 'react-responsive';
import { connect } from 'react-redux';
import { Button, Container, Icon } from 'semantic-ui-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useCookies } from 'react-cookie';
import classNames from 'classnames';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import MainMenu from '../MainMenu/MainMenu';
import {
    closeMainMenu as closeMainMenuAction,
    setLang as setLangAction,
    toggleMainMenu as toggleMainMenuAction,
} from '../../../redux/reducers/ui';
import { logoutUser as logoutUserAction } from '../../../redux/reducers/user';

function MainHeader({ closeMainMenu, logoutUser, setLang, toggleMainMenu, ui, user }) {
    const [cookies, setCookies] = useCookies(['cookiesAccepted']);
    const { formatMessage } = useIntl();
    const { cookiesAccepted } = cookies;
    const {
        lang,
        menus: { main },
    } = ui;
    const [isCookiesAccepted, setIsCookiesAccepted] = useState(false);
    const [isHeaderFixed, setIsHeaderFixed] = useState(false);

    const handleScroll = (e) => {
        const { scrollTop } = e.target.scrollingElement;
        setIsHeaderFixed(scrollTop > 0);
    };

    useEffect(() => {
        setIsCookiesAccepted(!!cookiesAccepted);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [cookiesAccepted]);

    const handleLogout = () => {
        logoutUser();
        closeMainMenu();
    };

    const handleCookies = () => {
        setCookies('cookiesAccepted', true, { path: '/' });
    };

    return (
        <>
            {!isCookiesAccepted && (
                <div className="cookie-notice">
                    <Container>
                        <div className="content">
                            <FormattedMessage
                                id="cookieNotice.content"
                                tagName="p"
                                values={{
                                    a: (linkText) => (
                                        <a
                                            href={formatMessage({
                                                id: 'cookieNotice.content.link',
                                            })}
                                            rel="noopener noreferrer"
                                            target="_blank"
                                        >
                                            {linkText}
                                        </a>
                                    ),
                                }}
                            />
                        </div>
                        <div className="actions">
                            <Button onClick={handleCookies} primary type="button">
                                <FormattedMessage id="cookieNotice.close" />
                            </Button>
                        </div>
                    </Container>
                </div>
            )}
            <header className={classNames({ 'main-header': true, 'u-fixed': isHeaderFixed })}>
                <MediaQuery query="(min-width: 1224px)">
                    <div className="main-header-top">
                        <PortalMenu items={main} lang={lang} />
                        <LangMenu handleLangSwitch={setLang} lang={lang} />
                        <UserMenu
                            handleLogout={handleLogout}
                            toggleMainMenu={toggleMainMenu}
                            user={user}
                        />
                    </div>
                </MediaQuery>
                <div className="main-header-bottom">
                    <Logo />
                    <MediaQuery query="(min-width: 1224px)">
                        <MainMenu
                            closeMainMenu={closeMainMenu}
                            items={main}
                            lang={lang}
                            user={user}
                        />
                    </MediaQuery>
                    <MediaQuery query="(max-width: 1223px)">
                        <div className="actions">
                            <button
                                className="btn btn-menu"
                                onClick={() => toggleMainMenu()}
                                type="button"
                            >
                                <Icon name="bars" />
                            </button>
                        </div>
                    </MediaQuery>
                </div>
            </header>
            <MediaQuery query="(max-width: 1223px)">
                <div className="menu-mobile">
                    <button className="btn btn-menu" onClick={() => toggleMainMenu()} type="button">
                        <Icon name="times" />
                    </button>
                    <LangMenu handleLangSwitch={setLang} lang={lang} />
                    <MainMenu closeMainMenu={closeMainMenu} items={main} lang={lang} user={user} />
                    <UserMenu
                        closeMainMenu={closeMainMenu}
                        handleLogout={handleLogout}
                        user={user}
                    />
                    <PortalMenu items={main} lang={lang} />
                </div>
            </MediaQuery>
        </>
    );
}

const Logo = () => {
    return (
        <a className="logo" href="https://internet.ee">
            <svg height="120" viewBox="0 0 125 120" width="125" xmlns="http://www.w3.org/2000/svg">
                <g fillRule="evenodd" id="Logo-EE">
                    <g fill="#FFF" id="ee-group">
                        <path
                            d="M53.3530015,45.6162852 L48.9153903,45.6162852 L48.9153903,48.5233732 L53.1797207,48.5233732 L53.1797207,49.9918601 L48.9153903,49.9918601 L48.9153903,53.2548625 L53.3530015,53.2548625 L53.3530015,54.7382925 L47.2313182,54.7382925 L47.2313182,44.1464398 L53.3530015,44.1464398 L53.3530015,45.6162852 Z M62.671985,51.0919348 L62.6598012,51.2223462 L57.1337704,51.2223462 C57.1608455,51.9178738 57.3706777,52.4626132 57.7646206,52.8416214 C58.1869923,53.2464401 58.8083662,53.4515664 59.6138509,53.4515664 C59.8453431,53.4515664 60.0741278,53.4420573 60.29479,53.4243974 C60.5235747,53.4067375 60.7442369,53.3822854 60.9527152,53.351041 C61.1666086,53.3197966 61.3683182,53.2844768 61.5632591,53.2437232 C61.7527849,53.2084035 61.9355419,53.1635746 62.0993463,53.1187456 L62.2807496,53.0671244 L62.2807496,54.4907825 L62.1765104,54.51931 C61.7988126,54.6279861 61.3683182,54.7149271 60.8958575,54.7801328 C60.4233968,54.846697 59.9265684,54.8820167 59.41891,54.8820167 C58.7284946,54.8820167 58.1260733,54.7855666 57.62383,54.5967417 C57.1161716,54.4038415 56.6937998,54.119925 56.3702522,53.7572182 C56.0453508,53.393153 55.8043823,52.9421468 55.6473466,52.4164258 C55.495726,51.8988555 55.4199157,51.3052118 55.4199157,50.6531547 C55.4199157,50.0798878 55.501141,49.53379 55.6635917,49.0284457 C55.8287499,48.5163092 56.0737797,48.0598692 56.3892048,47.6713519 C56.7100449,47.281476 57.1039878,46.9676736 57.5656185,46.740812 C58.0245417,46.5112336 58.5565676,46.3957651 59.1440976,46.3957651 C59.7086138,46.3957651 60.2189797,46.4867814 60.6589503,46.6647387 C61.1043359,46.8481298 61.48068,47.1075942 61.7825675,47.4390565 C62.084455,47.767802 62.317301,48.1766961 62.4743367,48.6494375 C62.6259573,49.1140282 62.7031214,49.6438246 62.7031214,50.2198084 C62.7031214,50.416784 62.7004139,50.5825152 62.6977064,50.7129266 C62.6922913,50.8474134 62.6841688,50.9737494 62.671985,51.0919348 Z M57.147308,49.8788369 C57.1784443,49.6017126 57.2380096,49.3408898 57.3287112,49.1031606 C57.4329504,48.8246779 57.568326,48.5842318 57.7361917,48.3886147 C57.8999961,48.1929976 58.0976445,48.0422093 58.3237217,47.9362501 C58.5484451,47.8289323 58.8043049,47.7759527 59.0804711,47.7759527 C59.4040187,47.7759527 59.6910149,47.8302908 59.934691,47.9403254 C60.1756595,48.0503601 60.3800766,48.2038652 60.538466,48.3954069 C60.7022704,48.5910241 60.8241085,48.8273948 60.8999188,49.0963683 C60.9689603,49.332739 61.0028042,49.5962788 61.0000967,49.8788369 L57.147308,49.8788369 Z M69.0362613,53.185989 C69.3056587,53.0352008 69.436973,52.8232823 69.436973,52.5447995 L69.3733465,52.2228463 L69.1459155,51.9525143 C69.0240775,51.8574227 68.833198,51.7582556 68.5705694,51.6536548 C68.3025257,51.5449786 67.9261816,51.4186426 67.4564284,51.278722 C67.0949756,51.1714042 66.7565367,51.0491435 66.4546492,50.9146568 C66.1378703,50.7747362 65.8644117,50.6076465 65.6383345,50.4161048 C65.4041348,50.2204876 65.2173165,49.9881923 65.0832947,49.7246525 C64.9465653,49.4583959 64.8802313,49.1418765 64.8802313,48.7846035 C64.8802313,48.5455159 64.9343815,48.2846931 65.0413282,48.0062104 C65.1509824,47.7236523 65.3405082,47.4587541 65.6004293,47.2196665 C65.8589967,46.9832958 66.2109732,46.7836033 66.6482362,46.6273813 C67.2872089,46.3978028 68.1563201,46.3421063 69.3083662,46.4467071 C69.6820028,46.4806684 70.0813607,46.5390819 70.5023787,46.6246644 L70.6160942,46.647758 L70.6160942,48.1692246 L70.4414597,48.1271126 C70.0217955,48.0238702 69.614315,47.9464385 69.2339096,47.8961757 C68.4216562,47.7915749 67.8260037,47.8078763 67.4212308,47.8988926 C67.2073374,47.9464385 67.0327029,48.0130026 66.9013886,48.0958682 L66.63876,48.3648418 L66.5615959,48.6976626 L66.6319912,49.0223327 C66.6753114,49.1147074 66.7633055,49.2097991 66.8919123,49.3035323 C67.0313491,49.4026993 67.2303512,49.5073002 67.4875648,49.6105425 C67.7474859,49.7165018 68.0940473,49.8319703 68.5177729,49.9569479 C68.9888799,50.09551 69.3922991,50.2422229 69.7172004,50.3943695 C70.0475168,50.5492331 70.3223292,50.7244734 70.5308076,50.9200906 C70.7460548,51.1184246 70.9044442,51.3466446 70.9978533,51.5965998 C71.088555,51.8451966 71.1372902,52.1263962 71.1372902,52.4347649 C71.1372902,52.729549 71.0844937,52.9998811 70.9816083,53.2389687 C70.8800766,53.4780563 70.7419935,53.6899748 70.5687128,53.8692905 C70.395432,54.0526816 70.1950762,54.2089036 69.9676452,54.3352397 C69.7510443,54.4588588 69.5100758,54.5634597 69.2569235,54.6463253 C69.0064787,54.7264739 68.7452038,54.7876043 68.4825752,54.8229241 C68.2199466,54.8609607 67.9600255,54.8813375 67.708227,54.8813375 C67.1721397,54.8813375 66.6712501,54.8568854 66.2190957,54.8093395 C65.768295,54.7617937 65.3202019,54.6830035 64.8856463,54.5770442 L64.7773459,54.5498751 L64.7773459,52.987655 L64.9587491,53.0392762 C65.413611,53.1683291 65.8698267,53.2688546 66.3152123,53.3354188 C66.7565367,53.4019829 67.2073374,53.4359442 67.6540767,53.4359442 C68.2795119,53.4359442 68.7452038,53.3517202 69.0362613,53.185989 Z M74.8968051,51.9621593 L74.8968051,47.9723849 L72.6901833,47.9723849 L72.6901833,46.5365008 L74.8968051,46.5365008 L74.8968051,44.3928631 L76.5497409,43.9635921 L76.5497409,46.5365008 L80.0938733,46.5365008 L80.0938733,47.9723849 L76.5497409,47.9723849 L76.5497409,51.8521247 C76.5497409,52.3778457 76.6851164,52.7704385 76.9558676,53.0203937 C77.3498105,53.3885343 78.0537634,53.4700414 78.9973312,53.3464222 C79.2951574,53.3070271 79.6051675,53.2445383 79.9151775,53.1643896 L80.0938733,53.1195607 L80.0938733,54.5975568 L79.9855728,54.6247259 C79.668794,54.7048745 79.3411851,54.763288 79.0068075,54.7972493 C78.6751373,54.8312106 78.3326371,54.8488705 77.9860757,54.8488705 C76.9612826,54.8488705 76.1842268,54.6097829 75.6725072,54.1370415 C75.15808,53.6615832 74.8968051,52.9280189 74.8968051,51.9621593 Z M89.004158,53.3093365 L89.004158,54.7384283 L82.3964764,54.7384283 L82.3964764,53.3093365 L84.9875648,53.3093365 L84.9875648,47.9570344 L82.65369,47.9570344 L82.65369,46.5374517 L86.6540381,46.5374517 L86.6540381,53.3093365 L89.004158,53.3093365 Z M84.7406397,45.3038412 C84.6323393,45.1924481 84.5470527,45.0620367 84.4847799,44.9139654 C84.4197996,44.7631772 84.3886633,44.6069551 84.3886633,44.4398655 C84.3886633,44.2673421 84.4225072,44.1070447 84.4861337,43.9616903 C84.5443452,43.8176943 84.6323393,43.6872829 84.7406397,43.5758898 C84.850294,43.4631383 84.9816083,43.3734804 85.1278139,43.3096332 C85.4283476,43.1846556 85.7898004,43.186014 86.0889804,43.3096332 C86.2365398,43.3734804 86.3637928,43.4631383 86.4748008,43.5731729 C86.5858088,43.6899998 86.6738029,43.8190528 86.7333681,43.9616903 C86.7983484,44.1070447 86.8294848,44.2659836 86.8294848,44.4398655 C86.8294848,44.6083136 86.7983484,44.7631772 86.7360757,44.9139654 C86.6738029,45.0579613 86.5858088,45.1910896 86.4761546,45.3038412 C86.3665003,45.4165927 86.2365398,45.5062506 86.0889804,45.5687394 C85.9400673,45.6312282 85.7776166,45.6624726 85.6097509,45.6624726 C85.4405314,45.6624726 85.2780808,45.6312282 85.1278139,45.5687394 C84.9816083,45.5062506 84.850294,45.4165927 84.7406397,45.3038412 Z M53.7074147,63.10174 L51.3410497,63.10174 L51.3410497,70.7403173 L53.7074147,70.7403173 L53.7074147,72.2237472 L47.2770751,72.2237472 L47.2770751,70.7403173 L49.6434401,70.7403173 L49.6434401,63.10174 L47.2770751,63.10174 L47.2770751,61.6318946 L53.7074147,61.6318946 L53.7074147,63.10174 Z M62.6574998,72.2234755 L61.0032103,72.2234755 L61.0032103,67.0273955 C61.0032103,66.4405441 60.8989711,66.0071978 60.6904928,65.7395827 C60.4860757,65.4760429 60.1868956,65.3469899 59.7726464,65.3469899 C59.6210258,65.3469899 59.4707589,65.3714421 59.3231995,65.4176295 C59.1824089,65.4610999 59.026727,65.5412486 58.8656301,65.6567171 C58.7004719,65.7749024 58.5231299,65.9324829 58.3241278,66.1403261 C58.1278332,66.3427355 57.9139398,66.5913323 57.6838013,66.8793242 L57.6838013,72.2234755 L56.0322194,72.2234755 L56.0322194,64.0224989 L57.530827,64.0224989 L57.5741471,65.0834502 C57.7271215,64.9190775 57.8760347,64.7750815 58.023594,64.6501039 C58.2442562,64.4626375 58.4662721,64.3104908 58.6801655,64.1977393 C58.9008277,64.0809124 59.1269049,63.9966884 59.3516284,63.9491425 C59.5736443,63.9029551 59.807844,63.8798615 60.0461051,63.8798615 C60.8976174,63.8798615 61.5555427,64.1406843 61.9995745,64.6501039 C62.4368376,65.1554482 62.6574998,65.9175399 62.6574998,66.9173608 L62.6574998,72.2234755 Z M67.9773536,61.4494544 L67.9773536,64.0223631 L71.521486,64.0223631 L71.521486,65.4596056 L67.9773536,65.4596056 L67.9773536,69.337987 C67.9773536,69.8623496 68.1154367,70.2563008 68.3848341,70.506256 C68.778777,70.8743966 69.4840837,70.9559037 70.4262977,70.8322845 C70.7227702,70.791531 71.0314265,70.7317591 71.344144,70.6502519 L71.521486,70.6040645 L71.521486,72.0834191 L71.4145393,72.1105882 C71.100468,72.1880199 70.7701516,72.2491503 70.4344202,72.2831116 C70.1013963,72.3170729 69.7588961,72.3333743 69.4150422,72.3333743 C68.3929566,72.3333743 67.6145471,72.0929283 67.1028274,71.6215453 C66.5884002,71.1474455 66.3244179,70.4152397 66.3244179,69.4466632 L66.3244179,65.4596056 L64.1164423,65.4596056 L64.1164423,64.0223631 L66.3244179,64.0223631 L66.3244179,61.8787254 L67.9773536,61.4494544 Z M79.7539452,64.9245113 C80.0571865,65.2546152 80.2886787,65.6607924 80.4457144,66.1362507 C80.5986888,66.6021999 80.6758529,67.1306378 80.6758529,67.7052632 C80.6758529,67.9022387 80.6731454,68.0666115 80.6663766,68.1997398 C80.6623153,68.3342266 80.6541928,68.4605626 80.6433627,68.5773895 L80.6325327,68.707801 L75.1065019,68.707801 C75.1322233,69.404687 75.3434091,69.9494264 75.7359983,70.3270761 C76.1570163,70.7305365 76.7797439,70.9370212 77.5865823,70.9370212 C77.8234896,70.9370212 78.0455055,70.9288705 78.2661677,70.9098522 C78.4908912,70.8921923 78.7115533,70.8677401 78.9254467,70.8378542 C79.1379864,70.8066098 79.3410497,70.7699316 79.5359906,70.7305365 C79.7349927,70.6897829 79.9150422,70.6490293 80.0693703,70.6042004 L80.2507736,70.5525792 L80.2507736,71.9762372 L80.1478881,72.0061232 C79.7620678,72.1134409 79.3329272,72.2017403 78.8672352,72.266946 C78.3934207,72.3321517 77.8952386,72.366113 77.388934,72.366113 C76.7025799,72.366113 76.0974511,72.2710214 75.5965615,72.0808381 C75.0889031,71.8879378 74.667885,71.6067382 74.3416299,71.242673 C74.0167286,70.8786078 73.7730525,70.42896 73.6187244,69.903239 C73.46575,69.3843102 73.3899397,68.792025 73.3899397,68.1386094 C73.3899397,67.5680595 73.4738725,67.0233201 73.6349694,66.5152589 C73.8014814,66.0004055 74.0451574,65.545324 74.3605825,65.1595235 C74.6814226,64.7655724 75.0753655,64.4531283 75.5369962,64.2262668 C75.9986269,63.9966884 76.5279454,63.8812199 77.1141216,63.8812199 C77.6799915,63.8812199 78.1890036,63.9708778 78.6316818,64.1501935 C79.0743599,64.3335845 79.4520577,64.5930489 79.7539452,64.9245113 Z M75.1173319,67.3656501 C75.1484683,67.0898843 75.2107411,66.8290614 75.300089,66.5872569 C75.4043282,66.3087742 75.5410575,66.0683281 75.7075694,65.872711 C75.8727276,65.6784523 76.0690222,65.5276641 76.2964532,65.4203464 C76.5211766,65.3143871 76.7756827,65.2614075 77.0532026,65.2614075 C77.3767502,65.2614075 77.6623927,65.317104 77.9033612,65.4257802 C78.1456835,65.5358148 78.3501006,65.6879615 78.5111975,65.8795033 C78.6736482,66.0764788 78.7954862,66.3114911 78.8712965,66.5818231 C78.9403381,66.8168353 78.9741819,67.0803751 78.9741819,67.3656501 L75.1173319,67.3656501 Z M87.0792527,63.8804048 C87.9388876,63.8804048 88.6022279,64.1656798 89.0476135,64.730796 C89.4902916,65.286403 89.6974163,66.112342 89.6662799,67.1895947 L89.6622186,67.3267983 L87.9943916,67.3267983 L87.9984529,67.1814439 C88.0106367,66.5198777 87.919935,66.0417025 87.7209329,65.7564275 C87.5300534,65.4820201 87.2565947,65.3475333 86.8816044,65.3475333 C86.7137387,65.3475333 86.5485805,65.3787777 86.373946,65.4385496 C86.2047265,65.4969631 86.024677,65.598847 85.8392125,65.7333338 C85.6469792,65.8773297 85.4439158,66.0566454 85.2327299,66.2753563 C85.0296666,66.4845579 84.8035894,66.7426639 84.5666821,67.0455987 L84.5666821,72.2240189 L82.8988551,72.2240189 L82.8988551,64.0216839 L84.4285991,64.0216839 L84.4597354,65.2538001 C84.8536783,64.8204538 85.2503288,64.4930668 85.6388567,64.2757145 C86.1099636,64.0121747 86.5959619,63.8804048 87.0792527,63.8804048 Z M95.441131,63.8804048 C96.2912895,63.8804048 96.9451536,64.1385108 97.3891854,64.6506473 C97.829156,65.1546331 98.051172,65.9167248 98.051172,66.9179042 L98.051172,72.2240189 L96.3968825,72.2240189 L96.3968825,67.0265804 C96.3968825,66.4410874 96.2912895,66.0063827 96.0841649,65.740126 C95.8783941,65.4765863 95.579214,65.3475333 95.1663186,65.3475333 C95.0119904,65.3475333 94.8603698,65.3719855 94.7182254,65.4168144 C94.5733736,65.4630018 94.4190454,65.541792 94.2565947,65.6572605 C94.0914365,65.7754458 93.9086795,65.9384601 93.7178,66.139511 C93.5269204,66.3378451 93.3170883,66.5796496 93.0761197,66.8785091 L93.0761197,72.2240189 L91.423184,72.2240189 L91.423184,64.0216839 L92.9204378,64.0216839 L92.9651118,65.085352 C93.1194399,64.9196208 93.2697068,64.7756249 93.4159124,64.6506473 C93.6406359,64.460464 93.8626518,64.3083173 94.0738377,64.1955658 C94.2890849,64.0814558 94.5138083,63.9972317 94.742593,63.9496859 C94.9659627,63.9034985 95.2001625,63.8804048 95.441131,63.8804048 Z M106.297575,64.9245113 C106.60217,65.2546152 106.833662,65.6607924 106.990698,66.1335338 C107.140965,66.6008414 107.220836,67.1306378 107.220836,67.7052632 C107.220836,67.9022387 107.218129,68.0666115 107.212714,68.1983813 C107.207299,68.335585 107.197822,68.4605626 107.185639,68.578748 L107.173455,68.707801 L101.648778,68.707801 C101.675853,69.404687 101.887039,69.9494264 102.280982,70.3270761 C102.703353,70.7305365 103.324727,70.9370212 104.131566,70.9370212 C104.367119,70.9370212 104.589135,70.9288705 104.811151,70.9098522 C105.025044,70.8935507 105.24706,70.8677401 105.47043,70.8378542 C105.681616,70.8052513 105.884679,70.7699316 106.07962,70.7305365 C106.274561,70.6924998 106.450549,70.6503878 106.614354,70.6042004 L106.795757,70.5525792 L106.795757,71.9762372 L106.691518,72.0061232 C106.311112,72.1134409 105.877911,72.2003819 105.413572,72.266946 C104.93705,72.3321517 104.438868,72.366113 103.935271,72.366113 C103.244856,72.366113 102.642434,72.2696629 102.141545,72.0794796 C101.633886,71.8879378 101.211515,71.6067382 100.88526,71.2413145 C100.563066,70.8799662 100.318036,70.42896 100.165061,69.903239 C100.010733,69.3870271 99.934923,68.7947419 99.934923,68.1386094 C99.934923,67.5680595 100.016148,67.0233201 100.179953,66.5152589 C100.346465,65.9976886 100.591495,65.5426071 100.908273,65.1595235 C101.223698,64.7682893 101.620349,64.4531283 102.08198,64.2262668 C102.542257,63.9966884 103.070221,63.8812199 103.659105,63.8812199 C104.229036,63.8812199 104.738048,63.9708778 105.176665,64.1501935 C105.617989,64.3322261 105.994334,64.5916905 106.297575,64.9245113 Z M101.662315,67.3656501 C101.694805,67.0817335 101.755724,66.8249861 101.846426,66.5872569 C101.947958,66.3114911 102.086041,66.071045 102.252553,65.872711 C102.417711,65.6798108 102.612652,65.5276641 102.838729,65.4203464 C103.064806,65.3143871 103.320666,65.2614075 103.598186,65.2614075 C103.919026,65.2614075 104.206022,65.317104 104.451052,65.4257802 C104.690667,65.5358148 104.895084,65.6879615 105.054827,65.8795033 C105.215924,66.0737619 105.337762,66.3087742 105.418987,66.5818231 C105.485321,66.8181938 105.520519,67.0817335 105.517812,67.3656501 L101.662315,67.3656501 Z M112.217684,61.4494544 L112.217684,64.0210046 L115.761816,64.0210046 L115.761816,65.4596056 L112.217684,65.4596056 L112.217684,69.337987 C112.217684,69.8609911 112.354413,70.2549423 112.625164,70.506256 C113.017754,70.8743966 113.727122,70.9545452 114.665274,70.8322845 C114.9631,70.791531 115.271757,70.7317591 115.583121,70.6502519 L115.761816,70.6040645 L115.761816,72.0834191 L115.65487,72.1105882 C115.336737,72.1893784 115.006421,72.2491503 114.673397,72.2817531 C114.345788,72.3170729 114.004641,72.3333743 113.655372,72.3333743 C112.633287,72.3333743 111.854877,72.0929283 111.343158,71.6229038 C110.827377,71.1474455 110.566102,70.4152397 110.566102,69.4466632 L110.566102,65.4596056 L108.358126,65.4596056 L108.358126,64.0210046 L110.566102,64.0210046 L110.566102,61.8787254 L112.217684,61.4494544 Z M120.408854,62.7886167 C120.300553,62.6772236 120.212559,62.5468122 120.152994,62.3987409 C120.089367,62.2465942 120.059585,62.0917307 120.059585,61.9259995 C120.059585,61.7548345 120.090721,61.5945371 120.152994,61.4478243 C120.215266,61.3011114 120.300553,61.1720585 120.408854,61.0606654 C120.519862,60.9479138 120.649822,60.8596144 120.797381,60.7944087 C121.093854,60.672148 121.463429,60.672148 121.757194,60.7944087 C121.904754,60.8596144 122.034714,60.9492723 122.144368,61.0606654 C122.254023,61.1734169 122.342017,61.3024699 122.402936,61.4464658 C122.466562,61.5918202 122.496345,61.7521176 122.496345,61.9259995 C122.496345,62.0930891 122.466562,62.2506696 122.402936,62.3987409 C122.342017,62.5440953 122.254023,62.6758652 122.145722,62.7886167 C122.040129,62.9013683 121.908815,62.9910261 121.757194,63.0548734 C121.609635,63.1160037 121.447184,63.1472481 121.276611,63.1472481 C121.107392,63.1472481 120.944941,63.1160037 120.798735,63.0548734 C120.644407,62.9896677 120.518508,62.9013683 120.408854,62.7886167 Z M122.3232,70.7961497 L124.671966,70.7961497 L124.671966,72.2238831 L118.064284,72.2238831 L118.064284,70.7961497 L120.65808,70.7961497 L120.65808,65.4438476 L118.321498,65.4438476 L118.321498,64.021548 L122.3232,64.021548 L122.3232,70.7961497 Z M53.3992999,84.9059863 C53.6619285,85.1396401 53.8785294,85.4181228 54.0409801,85.7319253 C54.2061383,86.0511616 54.2887174,86.4315283 54.2887174,86.8607992 C54.2887174,87.3729357 54.1831245,87.8293757 53.9732923,88.217893 C53.7621064,88.6023351 53.4683415,88.9283636 53.0933511,89.1837526 C52.7251296,89.4391417 52.2756827,89.6306835 51.7626093,89.7543026 C51.2535971,89.8765633 50.6863735,89.9404106 50.0771834,89.9404106 C49.8037248,89.9404106 49.5275586,89.9268261 49.2513924,89.9064493 C48.9440899,89.8819971 48.6936451,89.8589034 48.4648604,89.827659 C48.2171231,89.7964146 47.9788621,89.758378 47.7541386,89.7162659 C47.5212926,89.6700786 47.3222906,89.6252496 47.1476561,89.5790623 L47.0420631,89.5505348 L47.0420631,87.87828 L47.2342964,87.9516364 C47.6106405,88.0929154 48.0465499,88.2083839 48.5325482,88.2912495 C49.0117777,88.3741151 49.5654638,88.4148686 50.1773613,88.4148686 C50.6132707,88.4148686 50.9896148,88.3809073 51.2969173,88.3129847 C51.5933898,88.2464205 51.8384196,88.148612 52.0279454,88.0182006 C52.2066411,87.8959398 52.3379554,87.7424347 52.4164733,87.5685528 C52.5004061,87.3878787 52.5423726,87.1773186 52.5423726,86.9423063 C52.5423726,86.6937096 52.4760385,86.4885833 52.3420167,86.3160598 C52.1944573,86.1326688 52.002224,85.9642207 51.769378,85.8215832 C51.5216408,85.6694365 51.2400596,85.5295159 50.9314033,85.4072552 C50.6065019,85.2782022 50.2775393,85.1464324 49.9431616,85.0092287 C49.6047227,84.872025 49.270345,84.7185199 48.9467974,84.5582225 C48.6178348,84.3938498 48.3186548,84.1968742 48.0573799,83.9700127 C47.7920438,83.7431511 47.5767966,83.4701022 47.4156997,83.1603751 C47.2505415,82.8452142 47.1666086,82.4702813 47.1666086,82.0450857 C47.1666086,81.6755867 47.2451265,81.3074461 47.3994546,80.9474563 C47.5537828,80.5874664 47.7961051,80.2641548 48.1223602,79.9843136 C48.4432003,79.7085478 48.8588033,79.4830447 49.3596929,79.3159551 C49.857875,79.1488654 50.456235,79.0632829 51.1344666,79.0632829 C51.3145161,79.0632829 51.5081032,79.0714336 51.7098128,79.0863766 C51.9142299,79.1040365 52.1213545,79.1257717 52.3325404,79.1570161 C52.5383113,79.1841852 52.7467897,79.2181465 52.949853,79.2561832 C53.1529164,79.2928614 53.3451497,79.330898 53.5184304,79.375727 L53.6267309,79.4015376 L53.6267309,80.9651162 L53.4453276,80.913495 C53.060861,80.8021019 52.6601493,80.712444 52.2540226,80.6526721 C51.8533109,80.5929002 51.4674905,80.5630143 51.1060378,80.5630143 C50.3384583,80.5630143 49.7698809,80.6893503 49.4192581,80.9393056 C49.0794655,81.1797516 48.9143073,81.4949126 48.9143073,81.9038067 C48.9143073,82.1524035 48.9792875,82.3588882 49.1173706,82.5314117 C49.259515,82.7202365 49.447687,82.8846093 49.6886555,83.0367559 C49.929624,83.1889026 50.212559,83.3288232 50.5266303,83.4538008 L50.7797826,83.5570432 C51.0207511,83.6548517 51.2657809,83.7513019 51.5108107,83.8531858 C51.8587259,83.9958233 52.1944573,84.1479699 52.5071749,84.3082673 C52.8374913,84.47264 53.1380251,84.6750494 53.3992999,84.9059863 Z M58.5472267,79.2055129 L60.6685619,79.2055129 L64.126054,89.7973655 L62.2998375,89.7973655 L61.5864083,87.549127 L57.5183724,87.549127 L56.7954669,89.7973655 L55.0409995,89.7973655 L58.5472267,79.2055129 Z M58.0097857,86.0100005 L59.554421,81.1154968 L61.0936412,86.0100005 L58.0097857,86.0100005 Z"
                            id="Combined-Shape"
                        />
                        <path
                            d="M29.4824979,67.8032076 L25.3724956,63.6816633 C22.8166048,66.1812155 20.2566527,67.5220079 16.6637851,67.5220079 C11.90398,67.5220079 8.2407171,64.5836756 7.3851435,59.3142391 L28.5660053,59.3142391 L31.1814613,56.6924261 C31.0853446,52.6741242 30.0199389,48.9247958 28.0028429,45.985105 L50.090721,29.051997 C53.060861,32.0310829 57.2101222,33.749525 61.9008857,33.749525 C67.6692388,33.749525 71.8103775,31.4781928 74.8414365,27.9652351 L70.7314342,23.8450493 C68.1755434,26.3432431 65.6155914,27.6853939 62.0227238,27.6853939 C57.2629187,27.6853939 53.598302,24.7457031 52.7454359,19.4776251 L73.9262977,19.4776251 L76.5403999,16.8558121 C76.3224453,7.74195556 71.1402684,0.000135845231 61.1075849,0.000135845231 C51.8912161,0.000135845231 45.3606985,7.59524271 45.3606985,16.9047164 C45.3606985,20.6975152 46.3895529,24.0257234 48.1710954,26.7032329 L26.0344821,43.6743776 C23.519204,41.2902938 20.0901408,39.8381083 15.7472925,39.8381083 C6.5322774,39.8381083 0.000406126712,47.4318567 0.000406126712,56.7413304 C0.000406126712,66.7870852 7.20238648,73.5861391 16.5419471,73.5861391 C18.2151891,73.5861391 19.7354568,73.3755789 21.1487778,73.018306 L36.2472151,102.492646 L38.9384815,101.105666 L24.0363387,72.0130513 C26.1725652,71.0064381 27.9662915,69.5596864 29.4824979,67.8032076 M61.0466659,6.06290851 C65.9296627,6.06290851 68.7373521,9.80001081 69.2247041,14.5763291 L52.6845169,14.5763291 C53.3559797,9.5554894 56.5291831,6.06290851 61.0466659,6.06290851 M15.6877272,45.900881 C20.5707241,45.900881 23.3784134,49.6366248 23.8671192,54.4143016 L7.32422449,54.4143016 C7.99568732,49.3921034 11.1702444,45.900881 15.6877272,45.900881"
                            id="Fill-36"
                        />
                    </g>
                    <path
                        d="M52.2293842,109.125968 C52.2293842,115.017576 47.4695792,119.793894 41.5969869,119.793894 C35.7271022,119.793894 30.9672971,115.017576 30.9672971,109.125968 C30.9672971,103.235719 35.7271022,98.456684 41.5969869,98.456684 C47.4695792,98.456684 52.2293842,103.235719 52.2293842,109.125968"
                        fill="#0085CA"
                        id="Fill-38"
                    />
                </g>
            </svg>
        </a>
    );
};

const PortalMenu = ({ items = [], lang }) => {
    const menu = items
        .filter((item) => {
            const includedItems = [2133844, 2223713, 2142515];
            return (
                !item.hidden && item.language.code === lang && includedItems.includes(item.node.id)
            );
        }, [])
        .sort((a, b) => {
            return a.node.position - b.node.position;
        });
    return (
        <nav className="menu-portal">
            <a href="https://internet.ee">
                <FormattedMessage id="header.public_portal" />
            </a>
            {menu.map((item) => (
                <a
                    key={item.id}
                    className={
                        item.public_url === 'https://registrant.internet.ee'
                            ? 'u-active'
                            : undefined
                    }
                    href={item.public_url}
                >
                    {item.title}
                </a>
            ))}
        </nav>
    );
};

const LangMenu = ({ lang, handleLangSwitch }) => {
    return (
        <nav className="menu-language">
            <ul>
                <li className={lang === 'et' ? 'active' : ''}>
                    <button onClick={() => handleLangSwitch('et')} type="button">
                        eesti keeles
                    </button>
                </li>
                <li className={lang === 'en' ? 'active' : ''}>
                    <button onClick={() => handleLangSwitch('en')} type="button">
                        in english
                    </button>
                </li>
            </ul>
        </nav>
    );
};

const UserMenu = ({ user, handleLogout }) => {
    if (user.ident) {
        return (
            <nav className="menu-user">
                {/*
        <Link to='/' onClick={() => closeMainMenu()}>
          <Icon name='user'/>
          { `${user.first_name} ${user.last_name}` }
        </Link>
        */}
                <button className="log-out" onClick={() => handleLogout()} type="button">
                    <FormattedMessage id="header.logOut" />
                </button>
            </nav>
        );
    }
    return null;
};

const mapStateToProps = ({ ui, user }) => ({
    ui,
    user: user.data,
});

const mapDispatchToProps = (dispatch) =>
    bindActionCreators(
        {
            closeMainMenu: closeMainMenuAction,
            logoutUser: logoutUserAction,
            setLang: setLangAction,
            toggleMainMenu: toggleMainMenuAction,
        },
        dispatch
    );

export default connect(mapStateToProps, mapDispatchToProps)(MainHeader);
MainHeader.propTypes = {
    closeMainMenu: PropTypes.func.isRequired,
    logoutUser: PropTypes.func.isRequired,
    setLang: PropTypes.func.isRequired,
    toggleMainMenu: PropTypes.func.isRequired,
    ui: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
};
