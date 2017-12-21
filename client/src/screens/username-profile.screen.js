import { _ } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from 'styled-components/native';
import { connect } from 'react-redux';
import { graphql, compose } from 'react-apollo';
import {
  FlatList,
  View,
  Button,
} from 'react-native';

import ProfileHeader from '../components/profile-header.component';
import FeedCard from '../components/feedcard/feedcard.component';

// import { USER_QUERY } from '../graphql/user.query';
import { USERNAME_QUERY } from '../graphql/username.query';
import { UPDATE_FOLLOWED_MUTATION } from '../graphql/update-followed.mutation';


const Root = styled.View`
  flex: 1;
  backgroundColor: #f1f6fa;
`;

const T = styled.Text``;

const Header = ({ onPress }) => (
  <View style={styles.header}>
    <Button title={'New Conversation'} onPress={onPress} />
  </View>
);
Header.propTypes = {
  onPress: PropTypes.func.isRequired,
};

class UsernameProfile extends Component {
  static navigationOptions = {
    title: 'Username Profile',
  };

  constructor(props) {
    super(props);
    // this.goToMessages = this.goToMessages.bind(this);
    // this.goToNewGroup = this.goToNewGroup.bind(this);
    this.onRefresh = this.onRefresh.bind(this);
    // this.updateFollowed = this.updateFollowed.bind(this);
    // props.navigation.state.params.selectedUser
  }

  onRefresh() {
    this.props.refetch();
    // faking unauthorized status
  }

  keyExtractor = item => item.id;

  // goToMessages(group) {
  //   const { navigate } = this.props.navigation;
  //   navigate('Messages', { groupId: group.id, title: group.name, icon: group.icon });
  // }

  // goToNewGroup() {
  //   const { navigate } = this.props.navigation;
  //   navigate('NewGroup');
  // }

  // updateFollowed() {
  //   this.props.updateFollowed({ username, avatar }).then(({ data: { updateFollowed } }) => {
  //   });
  // }

  renderItem = ({ item }) => <FeedCard {...item} />;

  renderPlaceholder = () => (
    <FeedCard
      placeholder
      isLoaded={this.props.loading}
    />
  )

  render() {
    const { loading, username, networkStatus, updateFollowed } = this.props;
    const selectedUser = this.props.navigation.state.params.selectedUser || null;
    console.log('selectedUser', selectedUser);
    // TODO determine, add follow button, add follow 
    // const userIsFollowing = _.find(user.followings, { id: user.id })
    // render loading placeholder while we fetch messages
    if (loading || !username) {
      return (
        <FlatList
          data={[1, 2, 3]}
          renderItem={this.renderPlaceholder}
          keyExtractor={item => item}
          contentContainerStyle={{ alignSelf: 'stretch' }}
        />
      );
    }
    
    const usernameIsFollowed = _.has(username.followeds, { id: selectedUser.id });
    const usernameIsFollowing = true; //TODO show 'follows you' 
    // const renderFollowButton = ({onPress}) => <Button title={'Follow'} onPress={onPress} />;
    // render list of posts (tweets) for user
    // const toggleFollowed = ({usernameIsFollowed}) => 
    debugger;
    return (
      <Root>
        <ProfileHeader
          {...username} 
          usernameIsFollowed={usernameIsFollowed}
          updateFollowed={updateFollowed}
        />
        {usernameIsFollowed ? <FlatList
          data={username.tweets}
          renderItem={this.renderItem}
          keyExtractor={this.keyExtractor}
          contentContainerStyle={{ alignSelf: 'stretch' }}
        /> : undefined}
      </Root>
    );

    // render list of groups for user
    // return (
    //   <View style={styles.container}>
    //     <FlatList
    //       data={user.groups}
    //       keyExtractor={this.keyExtractor}
    //       renderItem={this.renderItem}
    //       ListHeaderComponent={() => <Header onPress={this.goToNewGroup} />}
    //       onRefresh={this.onRefresh}
    //       refreshing={networkStatus === 4}
    //     />
    //   </View>
    // );
  }
}
UsernameProfile.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        selectedUser: PropTypes.object,
        userId: PropTypes.number,
      }),
    }),
  }),
  loading: PropTypes.bool,
  networkStatus: PropTypes.number,
  refetch: PropTypes.func,
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    email: PropTypes.string.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    avatar: PropTypes.string.isRequired,
    groups: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
      }),
    ),
  }),
};

// const userQuery = graphql(USER_QUERY, {
//   skip: ownProps => !ownProps.auth || !ownProps.auth.jwt,
//   options: ownProps => ({ variables: { id: ownProps.auth.id } }),
//   props: ({ userData: { loading, networkStatus, refetch, user } }) => ({
//     loading, networkStatus, refetch, user,
//   }),
//   name: 'userData',
// });

const usernameQuery = graphql(USERNAME_QUERY, {
  skip: ownProps => !ownProps.auth || !ownProps.auth.jwt ||
   !ownProps.navigation || !ownProps.navigation.state || 
   !ownProps.navigation.state.params || !ownProps.navigation.state.params.selectedUser ||
   !ownProps.navigation.state.params.selectedUser.id,
  options: ownProps => ({ variables: { id: ownProps.auth.id, usernameId: ownProps.navigation.state.params.selectedUser.id } }),
  props: ({ data: { loading, networkStatus, refetch, username } }) => ({
    loading, networkStatus, refetch, username,
  }),
});

const updateFollowedMutation = graphql(UPDATE_FOLLOWED_MUTATION, {
  skip: ownProps => !ownProps.auth || !ownProps.auth.jwt ||
  !ownProps.navigation || !ownProps.navigation.state || 
  !ownProps.navigation.state.params || !ownProps.navigation.state.params.selectedUser ||
  !ownProps.navigation.state.params.selectedUser.id,
  props: ({ ownProps, mutate }) => ({
    updateFollowed: () =>
      mutate({
        variables: {
          user: {
            userId: ownProps.auth.id,
            followedId: ownProps.navigation.state.params.selectedUser.id
          },
        },
      }),
  }),
});

const mapStateToProps = ({ auth }) => ({
  auth,
});

export default compose(
  connect(mapStateToProps),
  updateFollowedMutation,
  usernameQuery,
  // userQuery,
)(UsernameProfile);
