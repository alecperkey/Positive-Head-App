import { _ } from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { graphql, compose } from 'react-apollo';
import { NavigationActions } from 'react-navigation';
import AlphabetListView from 'react-native-alphabetlistview';
import update from 'immutability-helper';
import { connect } from 'react-redux';

import USER_QUERY from '../graphql/user.query';
import CREATE_GROUP_MUTATION from '../graphql/create-group.mutation';

import SelectedUserList from '../components/selected-user-list.component';
import UserListItem from '../components/user-list-item.component';
import ButtonHeader from '../components/button-header.component';

import sortObject from '../utils/formatters';
import { colors, language } from '../utils/constants';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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

class NewConversation extends Component {
  static navigationOptions = ({ navigation, screenProps }) => {
    const { state, navigate } = navigation;
    // const isReady = state.params && state.params.mode === 'ready';
    // const {
    //   isAllowedGlobalSearch,
    //   isRandomConversation,
    // } = state.params;
    const destination = (state.params && state.params.create) ? state.params.create : 'UsernameProfile';

    return {
      title: 'New Conversation',
      headerRight: (
        <ButtonHeader
          side="right"
          onPress={() => {
            return navigate('UsernameSearch', {
              destination,
            });
          }
          }
        >
          <Icon color={colors.PRIMARY} size={20} name="pencil" />
        </ButtonHeader>
      ),
    };
  };

  constructor(props) {
    super(props);

    let selected = [];
    if (this.props.navigation.state.params) {
      selected = this.props.navigation.state.params.selected;
    }

    this.state = {
      selected: selected || [],
      followers: props.user ?
        _.groupBy(props.user.followers, follower => follower.username.charAt(0).toUpperCase()) : [],
    };

    this.create = this.create.bind(this);
    this.goToNewConversation = this.goToNewConversation.bind(this);
  }

  componentDidMount() {
    this.refreshNavigation(this.state.selected);
  }

  componentWillReceiveProps(nextProps) {
    const state = {};
    if (nextProps.user && nextProps.user.followers && nextProps.user !== this.props.user) {
      // TODO fix bug formatters is not a function (with [] empty followers only?)
      state.followers = sortObject(
        _.groupBy(nextProps.user.followers, follower => follower.username.charAt(0).toUpperCase()),
      );
    }

    if (nextProps.navigation.state.params && nextProps.navigation.state.params.selected) {
      Object.assign(state, {
        selected: nextProps.navigation.state.params.selected,
      });
    }

    if (nextProps.selected) {
      Object.assign(state, {
        selected: nextProps.selected,
      });
    }

    this.setState(state);
  }

  componentWillUpdate(nextProps, nextState) {
    console.log('componentWillUpdate', nextProps, nextState);
    if (!!this.state.selected.length !== !!nextState.selected.length) {
      this.refreshNavigation(nextState.selected);
    }
  }

  refreshNavigation(ready) {
    const { navigation } = this.props;
    navigation.setParams({
      mode: ready ? 'ready' : undefined,
      create: this.create,
      // destination: this.create,
    });
  }

  goToNewConversation = group => NavigationActions.reset({
    index: 1,
    actions: [
      NavigationActions.navigate({ routeName: 'Main' }),
      NavigationActions.navigate({ routeName: 'Messages', params: { groupId: group.id, title: group.name, icon: group.icon } }),
    ],
  });

  create(selectedUsers) {
    const { createGroup } = this.props;


    const recipients = [selectedUsers] || this.state.selected;

    debugger;
    createGroup({
      name: `${recipients[0].username} Convo`,
      userIds: _.map(recipients, 'id'),
      icon: this.state.icon,
    }).then((res) => {
      this.props.navigation.dispatch(this.goToNewConversation(res.data.createGroup));
    }).catch((error) => {
      Alert.alert(
        'Error Creating New Conversation',
        error.message,
        [
          { text: 'OK', onPress: () => { } },
        ],
      );
    });
  }

  render() {
    const { user, loading } = this.props;

    // render loading placeholder while we fetch messages
    if (loading || !user) {
      return (
        <View style={[styles.loading, styles.container]}>
          <ActivityIndicator />
        </View>
      );
    }
    console.log('followers', this.state.followers);
    return (
      <View style={styles.container}>
        {this.state.selected.length ? <View style={styles.selected}>
          <SelectedUserList
            data={this.state.selected}
            remove={this.toggle}
          />
        </View> : undefined}
        {_.keys(this.state.followers).length ? <AlphabetListView
          style={{ flex: 1 }}
          data={this.state.followers}
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
    );
  }
}

NewConversation.propTypes = {
  loading: PropTypes.bool.isRequired,
  createGroup: PropTypes.func.isRequired,
  navigation: PropTypes.shape({
    dispatch: PropTypes.func,
    navigate: PropTypes.func,
    setParams: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.object,
    }),
  }),
  user: PropTypes.shape({
    id: PropTypes.number,
    followers: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      username: PropTypes.string,
    })),
  }),
  selected: PropTypes.arrayOf(PropTypes.object),
};

const createGroupMutation = graphql(CREATE_GROUP_MUTATION, {
  props: ({ ownProps, mutate }) => ({
    createGroup: group =>
      mutate({
        variables: { group },
        update: (store, { data: { createGroup } }) => {
          // Read the data from our cache for this query.
          const data = store.readQuery({ query: USER_QUERY, variables: { id: ownProps.auth.id } });

          // Add our message from the mutation to the end.
          data.user.groups.push(createGroup);

          // Write our data back to the cache.
          store.writeQuery({
            query: USER_QUERY,
            variables: { id: ownProps.auth.id },
            data,
          });
        },
      }),
  }),
});

const userQuery = graphql(USER_QUERY, {
  options: ownProps => ({ variables: { id: ownProps.auth.id } }),
  props: ({ data: { loading, user } }) => ({
    loading, user,
  }),
});

const mapStateToProps = ({ auth }) => ({
  auth,
});

export default compose(
  connect(mapStateToProps),
  userQuery,
  createGroupMutation,
)(NewConversation);
