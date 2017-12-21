import gql from 'graphql-tag';

const FOLLOWED_FRAGMENT = gql`
  fragment FollowedFragment on User {
    id
    username
    followeds {
      id
      username
    }
    createdAt
  }
`;

export default FOLLOWED_FRAGMENT;
