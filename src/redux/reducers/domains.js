/* eslint-disable camelcase */
import api from '../../utils/api';
import {
    FETCH_DOMAIN_REQUEST,
    FETCH_DOMAIN_SUCCESS,
    FETCH_DOMAIN_FAILURE,
    FETCH_DOMAINS_REQUEST,
    FETCH_DOMAINS_SUCCESS,
    FETCH_DOMAINS_FAILURE,
    LOCK_DOMAIN_REQUEST,
    LOCK_DOMAIN_SUCCESS,
    LOCK_DOMAIN_FAILURE,
    UNLOCK_DOMAIN_REQUEST,
    UNLOCK_DOMAIN_SUCCESS,
    UNLOCK_DOMAIN_FAILURE,
    LOGOUT_USER,
} from '../actions';
import { fetchContacts } from './contacts';
import domainStatuses from '../../utils/domainStatuses.json';

let request = {
    data: {
        domains: [],
        count: 0
    },
    offset: 0,
};

const parseDomain = (domain, shouldFetchContacts = false) => {
    const { admin_contacts, registrant, tech_contacts } = domain;
    const statuses = domain.statuses.sort(
        (a, b) => domainStatuses[a].priority - domainStatuses[b].priority
    );
    const contacts = [
        ...(admin_contacts && admin_contacts.map((item) => ({ ...item, roles: ['admin'] }))),
        ...(tech_contacts && tech_contacts.map((item) => ({ ...item, roles: ['tech'] }))),
        ...(registrant && [
            {
                ...registrant,
                roles: ['registrant'],
            },
        ]),
    ].flat();
    return {
        ...domain,
        contacts: contacts.reduce(
            (acc, { id, roles, ...rest }) => ({
                ...acc,
                [id]: {
                    ...rest,
                    id,
                    roles: acc[id] ? [...acc[id].roles, ...roles] : roles,
                },
            }),
            {}
        ),
        isLockable: ['pendingDelete', 'serverHold'].every((status) => !statuses.includes(status)),
        isLocked:
            domain.locked_by_registrant_at &&
            [
                'serverUpdateProhibited',
                'serverDeleteProhibited',
                'serverTransferProhibited',
            ].every((r) => statuses.includes(r)),
        shouldFetchContacts,
    };
};

const requestDomain = () => ({
    type: FETCH_DOMAIN_REQUEST,
});

const receiveDomain = (payload) => ({
    payload,
    type: FETCH_DOMAIN_SUCCESS,
});

const failDomain = () => ({
    type: FETCH_DOMAIN_FAILURE,
});

const requestDomains = () => ({
    type: FETCH_DOMAINS_REQUEST,
});

const receiveDomains = (payload) => {
    request = {
        data: {
            domains: [],
            count: 0
        },
        offset: 0,
    };
    return {
        payload,
        type: FETCH_DOMAINS_SUCCESS,
    };
};

const failDomains = () => ({
    type: FETCH_DOMAINS_FAILURE,
});

const requestDomainLock = () => ({
    type: LOCK_DOMAIN_REQUEST,
});

const receiveDomainLock = (payload) => ({
    payload,
    type: LOCK_DOMAIN_SUCCESS,
});

const failDomainLock = (payload) => ({
    payload,
    type: LOCK_DOMAIN_FAILURE,
});

const requestDomainUnlock = () => ({
    type: UNLOCK_DOMAIN_REQUEST,
});

const receiveDomainUnlock = (payload) => ({
    payload,
    type: UNLOCK_DOMAIN_SUCCESS,
});

const failDomainUnlock = (payload) => ({
    payload,
    type: UNLOCK_DOMAIN_FAILURE,
});

const fetchDomain = (uuid) => (dispatch) => {
    dispatch(requestDomain());
    return api
        .fetchDomains(uuid)
        .then((res) => res.data)
        .then(async (data) => {
            const domain = parseDomain(data);
            await Promise.all(
                Object.keys(domain.contacts).map((id) => dispatch(fetchContacts(id)))
            );
            return dispatch(receiveDomain(domain));
        })
        .catch(() => {
            return dispatch(failDomain());
        });
};

const fetchDomains = (offset = request.offset) => (dispatch) => {
    dispatch(requestDomains());
    return api
        .fetchDomains(null, offset)
        .then((res) => res.data)
        .then((data) => {
            request.data.domains = request.data.domains.concat(data.domains);
            request.data.count = data.count;
            if (request.data.domains.length !== data.count) {
                request.offset += 200;
                return dispatch(fetchDomains(request.offset));
            }
            return dispatch(receiveDomains(request.data));
        })
        .catch(() => {
            dispatch(failDomains());
        });
};

const lockDomain = (uuid) => (dispatch) => {
    dispatch(requestDomainLock());
    return api
        .setDomainRegistryLock(uuid)
        .then((res) => res.data)
        .then((data) => {
            return dispatch(receiveDomainLock(data));
        })
        .catch((error) => {
            return dispatch(
                failDomainLock({
                    code: error.response.status,
                })
            );
        });
};

const unlockDomain = (uuid) => (dispatch) => {
    dispatch(requestDomainUnlock());
    return api
        .deleteDomainRegistryLock(uuid)
        .then((res) => res.data)
        .then((data) => {
            return dispatch(receiveDomainUnlock(data));
        })
        .catch((error) => {
            return dispatch(
                failDomainUnlock({
                    code: error.response.status,
                })
            );
        });
};

const initialState = {
    data: {
        domains: [],
        count: 0
    },
    ids: [],
    isLoading: false,
    message: null,
};

export default function reducer(state = initialState, { payload, type }) {
    switch (type) {
        case LOGOUT_USER:
            return initialState;

        case FETCH_DOMAIN_REQUEST:
            return {
                ...state,
                isLoading: true,
            };

        case FETCH_DOMAIN_SUCCESS:
            return {
                ...state,
                data: { ...state.data, [payload.id]: payload },
                ids: state.ids.includes(payload.id) ? state.ids : [...state.ids, payload.id],
                isLoading: false,
            };

        case FETCH_DOMAIN_FAILURE:
            return {
                ...state,
                isLoading: false,
            };

        case FETCH_DOMAINS_REQUEST:
            return {
                ...state,
                isLoading: true,
            };

        case FETCH_DOMAINS_SUCCESS:
            return {
                ...state,
                data: {
                    domains: payload.domains.reduce(
                        (acc, item) => ({
                            ...acc,
                            [item.id]: parseDomain(item, true),
                        }),
                        {}
                    ),
                    count: payload.count
                },
                ids: payload.domains.map((item) => item.id),
                isLoading: false,
            };

        case FETCH_DOMAINS_FAILURE:
            return {
                ...state,
                isLoading: false,
            };

        case LOCK_DOMAIN_REQUEST:
            return {
                ...state,
            };

        case LOCK_DOMAIN_SUCCESS:
            return {
                ...state,
                data: {
                    ...state.data,
                    [payload.id]: parseDomain(payload),
                },
                message: {
                    code: 200,
                    type: 'domainLock',
                },
            };

        case LOCK_DOMAIN_FAILURE:
            return {
                ...state,
                message: {
                    ...payload,
                    type: 'domainLock',
                },
            };

        case UNLOCK_DOMAIN_REQUEST:
            return {
                ...state,
            };

        case UNLOCK_DOMAIN_SUCCESS:
            return {
                ...state,
                data: {
                    ...state.data,
                    [payload.id]: parseDomain(payload),
                },
                message: {
                    code: 200,
                    type: 'domainUnlock',
                },
            };

        case UNLOCK_DOMAIN_FAILURE:
            return {
                ...state,
                message: {
                    ...payload,
                    type: 'domainUnlock',
                },
            };

        default:
            return state;
    }
}

export { initialState, fetchDomain, fetchDomains, lockDomain, parseDomain, unlockDomain };
