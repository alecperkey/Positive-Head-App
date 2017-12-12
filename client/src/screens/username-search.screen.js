import { _ } from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { graphql, compose } from 'react-apollo';
import AlphabetListView from 'react-native-alphabetlistview';
import { NavigationActions } from 'react-navigation';
import { connect } from 'react-redux';

import USERS_QUERY from '../graphql/users.query';
import SelectedUserList from '../components/selected-user-list.component';
import UserListItem from '../components/user-list-item.component';
import { sortObject } from '../utils/formatters';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  detailsContainer: {
    padding: 20,
    flexDirection: 'row',
  },
  imageContainer: {
    paddingRight: 20,
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'column',
    flex: 1,
  },
  input: {
    color: 'black',
    height: 32,
  },
  inputBorder: {
    borderColor: '#dbdbdb',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    paddingVertical: 8,
  },
  inputInstructions: {
    paddingTop: 6,
    color: '#777',
    fontSize: 12,
  },
  groupImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  selected: {
    flexDirection: 'row',
  },
  loading: {
    justifyContent: 'center',
    flex: 1,
  },
  navIcon: {
    color: 'blue',
    fontSize: 18,
    paddingTop: 2,
  },
  participants: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    backgroundColor: '#dbdbdb',
    color: '#777',
  },
});

const SectionHeader = ({ title }) => {
  // inline styles used for brevity, use a stylesheet when possible
  const textStyle = {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  };

  const viewStyle = {
    backgroundColor: '#ccc',
  };
  return (
    <View style={viewStyle}>
      <Text style={textStyle}>{title}</Text>
    </View>
  );
};
SectionHeader.propTypes = {
  title: PropTypes.string,
};

const SectionItem = ({ title }) => (
  <Text style={{ color: 'blue' }}>{title}</Text>
);
SectionItem.propTypes = {
  title: PropTypes.string,
};

class UsernameSearch extends Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation;
    const isReady = state.params && state.params.mode === 'ready';
    return {
      title: 'Search by Username',
      headerRight: (
        isReady ? <Button
          title="Create"
          onPress={state.params.create}
        /> : undefined
      ),
    };
  };

  constructor(props) {
    super(props);

    // const { usernameString, searchResults } = props.navigation.state.params;

    this.state = {
      selected: [],
      usernameSearch: '',
      resultsLength: props.users ?
        props.users.length : 0,
      users: props.users ?
        _.groupBy(props.users, user => user.username.charAt(0).toUpperCase()) : [],
    };

    // this.create = this.create.bind(this);
    this.pop = this.pop.bind(this);
    this.isSelected = this.isSelected.bind(this);
    // this.remove = this.remove.bind(this);
    // this.getIcon = this.getIcon.bind(this);
  }

  componentDidMount() {
    console.log('componentDidMount', this);
    this.refreshNavigation(this.state.usernameString);
  }

  componentWillReceiveProps(nextProps) {
    const state = {};

    if (nextProps.users && nextProps.users && nextProps.users !== this.props.users) {
      state.resultsLength = nextProps.users.length;
      state.users = sortObject(
        _.groupBy(nextProps.users, user => user.username.charAt(0).toUpperCase()),
      );
    }

    this.setState(state);
  }
  componentWillUpdate(nextProps, nextState) {
    // TODO finish componnet lifecycle of controlled textinput for username search
    // if (!!this.state.searchResults.length !== !!nextState.searchResults.length) {
    //   this.refreshNavigation({ searchResults: nextState.searchResults });
    // }
    if (nextState.usernameString !== this.state.usernameString) {
      this.refreshNavigation(nextState.usernameString);
    }
    console.log('nextState', nextState);
  }

  pop() {
    this.props.navigation.goBack();
  }

  refreshNavigation(usernameString) {
    const { navigation } = this.props;
    navigation.setParams({
      mode: true ? 'ready' : undefined,
      usernameString,
    });
  }

  isSelected(user) {
    return ~this.state.selected.indexOf(user);
  }

  render() {
    // const { friendCount } = this.props.navigation.state.params;
    // const { icon } = this.state;
    // const users = this.props.users ? this.props.users : [];
    const users = this.state.users;
    const resultsLength = this.state.resultsLength;

    return (
      <View style={styles.container}>
        <View style={styles.detailsContainer}>
          <View style={styles.inputContainer}>
            <View style={styles.inputBorder}>
              <TextInput
                autoFocus
                onChangeText={usernameString => this.setState({ usernameString })}
                placeholder=""
                style={styles.input}
              />
            </View>
            <Text style={styles.inputInstructions}>
              {'Please enter at least 3 characters for results'}
            </Text>
          </View>
        </View>
        <Text style={styles.participants}>
          {`matches: ${resultsLength}`.toUpperCase()}
        </Text>
        <View style={styles.selected}>
          {users.length ?
            <SelectedUserList
              data={users}
              remove={this.remove}
            /> : undefined}
          {_.keys(users).length ? <AlphabetListView
            style={{ flex: 1 }}
            data={users}
            cell={UserListItem}
            cellHeight={30}
            cellProps={{
              isSelected: this.isSelected,
              toggle: this.toggle,
            }}
            sectionListItem={SectionItem}
            sectionHeader={SectionHeader}
            sectionHeaderHeight={22.5}
          /> : undefined}
        </View>
      </View>
    );
  }
}

UsernameSearch.propTypes = {
  navigation: PropTypes.shape({
    dispatch: PropTypes.func,
    goBack: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        usernameString: PropTypes.string.isRequired,
      }),
    }),
  }),
};

// const createGroupMutation = graphql(CREATE_GROUP_MUTATION, {
//   props: ({ ownProps, mutate }) => ({
//     createGroup: group =>
//       mutate({
//         variables: { group },
//         update: (store, { data: { createGroup } }) => {
//           // Read the data from our cache for this query.
//           const data = store.readQuery({ query: USER_QUERY, variables: { id: ownProps.auth.id } });

//           // Add our message from the mutation to the end.
//           data.user.groups.push(createGroup);

//           // Write our data back to the cache.
//           store.writeQuery({
//             query: USER_QUERY,
//             variables: { id: ownProps.auth.id },
//             data,
//           });
//         },
//       }),
//   }),
// });

const usersQuery = graphql(USERS_QUERY, {
  options: (ownProps) => {
    console.log(ownProps);
    let usernameQuery =  (ownProps.navigation.state.params && ownProps.navigation.state.params.usernameString) 
      ? ownProps.navigation.state.params.usernameString
      : '';
    if (usernameQuery.length <= 2) { usernameQuery = ''; }
    return {
      variables: {
        id: 2,
        // id: ownProps.navigation.state.params.userId,
        // usernameString: ownProps.navigation.state.params.usernameString,
        usernameString: usernameQuery,
      },
    };
  },
  props: ({ data: { loading, users } }) => ({
    loading, users,
  }),
});

const mapStateToProps = ({ auth }) => ({
  auth,
});

export default compose(
  connect(mapStateToProps),
  usersQuery,
)(UsernameSearch);
