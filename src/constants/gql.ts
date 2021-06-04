import { gql } from '@apollo/client';

export const M_LOGIN = gql`
    mutation m_login($obj: UsersPermissionsLoginInput!) {
        login(input: $obj), {
            user {
            username,
            id,
            email,
            confirmed,
            blocked,
            },
            jwt
        }
    }
`;

export const Q_REG_FIELDS = gql`
    query q_regFields($sort: String, $limit: Int, $start: Int) {
        regFields(
            sort: $sort,
            limit: $limit,
            start: $start
        ) {
            id,
            title,
            category
        }
    }
`;


export const Q_REG_VALUES = gql`
    query q_regField($obj: ID!) {
        regValues(
            sort: "id",
            limit: 21,
            start: 0,
            where: {
                reg_field: {
                    id: $obj
                }
            }
        ) {
            id,
            value,
            country,
            reg_field {
            id,
            title
            }
        }
    }
`;
