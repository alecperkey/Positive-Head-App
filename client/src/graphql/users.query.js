import gql from 'graphql-tag';

// find all users matching substring of usernameString
const USERS_QUERY = gql`
query users($id: Int!, $usernameString: String) {
    users(query: $query) {
      usernme
      firstName
      lastName
      avatar
    }
  }
`;

export default USERS_QUERY;
