import { _ } from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  Button,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { graphql, compose } from 'react-apollo';
import { NavigationActions } from 'react-navigation';
import update from 'immutability-helper';
import { connect } from 'react-redux';
import ImagePicker from 'react-native-image-crop-picker';
import { ReactNativeFile } from 'apollo-upload-client';

import USERS_QUERY from '../graphql/users.query';
import CREATE_GROUP_MUTATION from '../graphql/create-group.mutation';
import SelectedUserList from '../components/selected-user-list.component';

const goToNewGroup = group => NavigationActions.reset({
  index: 1,
  actions: [
    NavigationActions.navigate({ routeName: 'Main' }),
    NavigationActions.navigate({ routeName: 'Messages', params: { groupId: group.id, title: group.name, icon: group.icon } }),
  ],
});

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
      // usernameString: usernameString || 'ell',
      // searchResults: searchResults || [],
      usernameString: 'ell',
      searchResults: [],
    };

    // this.create = this.create.bind(this);
    this.pop = this.pop.bind(this);
    // this.remove = this.remove.bind(this);
    // this.getIcon = this.getIcon.bind(this);
  }

  componentDidMount() {
    console.log('componentDidMount', this);
    this.refreshNavigation(this.state.usernameString);
  }

  componentWillReceiveProps(nextProps) {
    // const state = {};

    // // if (nextProps.usernameString) {
    // //   console.log('nextProps', nextProps);
    // //   Object.assign(state, {
    // //     usernameString: nextProps.usernameString,
    // //   });
    // // }

    // this.setState(state);
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

  render() {
    // const { friendCount } = this.props.navigation.state.params;
    // const { icon } = this.state;
    const users = this.props.users ? this.props.users : [];

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
          {`matches: ${users.length}`.toUpperCase()}
        </Text>
        <View style={styles.selected}>
          {users.length ?
            <SelectedUserList
              data={users}
              remove={this.remove}
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
      : 'ell';
    if (usernameQuery.length <= 2) { usernameQuery = 'ell'; }
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
