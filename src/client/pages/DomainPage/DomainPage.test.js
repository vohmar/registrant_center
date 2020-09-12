import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { CookiesProvider } from 'react-cookie';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { createMemoryHistory } from 'history';
import DomainPage from './DomainPage';
import translations from '../../translations';

const history = createMemoryHistory('/');
history.location.key = 'test';
history.push.entries = 'test';

const initialState = {
    ui: {
        uiElemSize: 'big',
        mainMenu: {
            isOpen: false,
        },
        lang: 'et',
        menus: {
            main: mockMainMenu,
            footer: mockFooterMenu,
        },
    },
    user: mockUser,
    domains: mockDomains,
    contacts: mockContacts,
    router: {
        location: {
            pathname: '/',
            search: '',
            hash: '',
        },
        action: 'POP',
    },
};

const lang = 'et';
const middlewares = [thunk];
const mockStore = configureStore(middlewares);
let store;

describe('pages/Domain', () => {
    const mockAction = () => {};
    const mockLock = jest.fn(() => {});
    const mockUnlock = jest.fn(() => {});
    const mockMatch = {
        params: {
            id: 'domain.ee',
        },
    };

    const props = {
        ui: {
            lang: 'et',
            uiElemSize: 'big',
            menus: {
                main: mockMainMenu,
                footer: mockFooterMenu,
            },
        },
        user: mockUser.data,
        initialDomains: mockDomains,
        initialContacts: mockContacts,
        updateContact: mockAction,
        match: mockMatch,
        history,
        lockDomain: mockLock,
        unlockDomain: mockUnlock,
    };

    beforeEach(() => {
        store = mockStore(initialState);
    });

    it('should render content', () => {
        const page = mount(
            <Provider store={store}>
                <CookiesProvider>
                    <IntlProvider
                        key={lang}
                        defaultLocale="et"
                        locale={lang}
                        messages={translations[lang]}
                    >
                        <DomainPage {...props} />
                    </IntlProvider>
                </CookiesProvider>
            </Provider>
        );
        expect(page).toMatchSnapshot();
    });
});
