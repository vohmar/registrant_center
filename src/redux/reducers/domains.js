/* eslint-disable */
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

const parseDomain = (domain, shouldFetchContacts = false, simplify = false) => {
    const { admin_contacts, registrant, tech_contacts } = domain;
    const statuses = domain.statuses.sort(
        (a, b) => domainStatuses[a].priority - domainStatuses[b].priority
    );

    const contacts = (simplify
        ? [
              ...(registrant && [
                  {
                      ...registrant,
                      roles: ['registrant'],
                  },
              ]),
          ]
        : [
              ...(admin_contacts && admin_contacts.map((item) => ({ ...item, roles: ['admin'] }))),
              ...(tech_contacts && tech_contacts.map((item) => ({ ...item, roles: ['tech'] }))),
              ...(registrant && [
                  {
                      ...registrant,
                      roles: ['registrant'],
                  },
              ]),
          ]
    ).flat();

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
                'serverObjUpdateProhibited',
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

const receiveDomains = (payload, simplify = false) => ({
        payload,
        simplify,
        type: FETCH_DOMAINS_SUCCESS,
    });

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

// const fetchRawDomainList = async (isTech) => {
//     let offset = 0;
//     let domains = [];
//     let count = 0;

//     let res = await api.fetchDomains(null, offset, false, isTech);
//     domains = domains.concat(res.data.domains);
//     count = res.data.count;
//     if (offset < count) {
//         offset += 200;
//     } else {
//         return domains;
//     }

//     while (offset < count) {
//         res = api.fetchDomains(null, offset, false);
//         domains = domains.concat(res.data.domains);
//         if (offset < count) {
//             offset += 200;
//         }
//     }
//     return domains;
// };

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

const fetchDomains = (offset = 0, simplify = false, tech = false, accumulatedData = null) => (dispatch) => {
    // console.log("Fetching domains with offset:", offset);
    // console.log("Currently accumulated data:", accumulatedData);

    dispatch(requestDomains());

    return api
        .fetchDomains(null, offset, simplify, tech)
        .then((res) => res.data)
        .then((data) => {
            // Initialize or update accumulated data
            const updatedData = accumulatedData || {
                domains: [],
                count: data.count,
                total: data.total
            };

            // Add new domains to accumulated data
            updatedData.domains = [...updatedData.domains, ...data.domains];
            
            // console.log(`Fetched batch of ${data.domains.length} domains, total now: ${updatedData.domains.length}`);

            // If there are more domains to fetch
            if (offset + 200 < data.total) {
                // Continue fetching with accumulated data
                return dispatch(fetchDomains(
                    offset + 200, 
                    simplify, 
                    tech, 
                    updatedData
                ));
            }

            // All domains fetched, dispatch final result
            // console.log("Final domains payload:", updatedData);
            return dispatch(receiveDomains(updatedData, simplify));
        })
        .catch(() => {
            dispatch(failDomains());
        });
};

const lockDomain = (uuid, extensionsProhibited) => (dispatch) => {
    dispatch(requestDomainLock());
    return api
        .setDomainRegistryLock(uuid, extensionsProhibited)
        .then((res) => res.data)
        .then((data) => {
            return dispatch(receiveDomainLock(data));
        })
        .catch((error) => {
            return dispatch(
                failDomainLock({
                    code: error.response?.status || 500,
                    success: false,
                    message: error.response?.data?.message || 'Unknown error'
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
                    code: error.response?.status || 500,
                    success: false,
                    message: error.response?.data?.message || 'Unknown error'
                })
            );
        });
};

const initialState = {
    data: {
        count: 0,
        domains: [],
    },
    ids: [],
    isLoading: false,
    message: null,
};

export default function reducer(state = initialState, { payload, type, simplify = false }) {
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
                data: { ...state.data, [payload.id]: payload },
                ids: state.ids.includes(payload.id) ? state.ids : [...state.ids, payload.id],
                isLoading: false,
            };

        case FETCH_DOMAIN_FAILURE:
            return {
                ...state,
                isLoading: false,
                error: true,
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
                    count: payload.count,
                    domains: payload.domains.reduce(
                        (acc, item) => ({
                            ...acc,
                            [item.id]: parseDomain(item, true, simplify),
                        }),
                        {}
                    ),
                    total: payload.total,
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
                    code: payload.code,
                    type: 'domainLock',
                    success: false,
                    message: payload.message
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
                    code: payload.code,
                    type: 'domainUnlock',
                    success: false,
                    message: payload.message
                },
            };

        default:
            return state;
    }
}

export {
    initialState,
    fetchDomain,
    fetchDomains,
    lockDomain,
    parseDomain,
    unlockDomain,
    // fetchRawDomainList,
};
