import gql from 'graphql-tag';

const UPDATE_FOLLOWEDS_MUTATION = gql`
  mutation updateFollowed($user: UpdateFollowedInput!) {
    updateFollowed(user: $user) {
      id
      username
    }
  }
`;

export default UPDATE_FOLLOWED_MUTATION;
