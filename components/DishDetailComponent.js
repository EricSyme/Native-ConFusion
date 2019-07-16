import React, { Component } from 'react';
import { Text, View, ScrollView, FlatList, Modal, StyleSheet, Button } from 'react-native';
import { Card, Icon, Rating, Input } from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { postFavorite, postComment } from '../redux/ActionCreators';

const mapStateToProps = state => {
    return {
      dishes: state.dishes,
      comments: state.comments,
      favorites: state.favorites
    }
  }

const mapDispatchToProps = dispatch => ({
    postFavorite: (dishId) => dispatch(postFavorite(dishId)),
    postComment: (dishId, rating, author, comment) => dispatch(postComment(dishId, rating, author, comment))
})

function RenderDish(props) {
    const dish = props.dish;
    
    if (dish != null) {
        return(
            <Card
                featuredTitle={dish.name}
                image={{uri: baseUrl + dish.image}}>
                <Text style={{margin: 10}}>
                    {dish.description}
                </Text>
                <View style={styles.cardRow}>
                    <Icon 
                        raised
                        reverse
                        name={ props.favorite ? 'heart' : 'heart-o'}
                        type='font-awesome'
                        color='#f50'
                        onPress={() => props.favorite ? console.log('Already favorite') : props.onPress()}
                        />
                    <Icon style={styles.cardItem}
                        raised
                        reverse
                        name='pencil'
                        type='font-awesome'
                        color='#512DA8'
                        onPress={() => props.onShowModal()}
                        />
                </View>
            </Card>
        );
    }
    else {
        return(<View></View>);
    }
}

function RenderComments(props) {
    const comments = props.comments;
            
    const renderCommentItem = ({item, index}) => {
        return (
            <View key={index} style={{margin: 10}}>
                <Text style={{fontSize: 14}}>{item.comment}</Text>
                <Rating
                    imageSize={20}
                    readonly
                    startingValue={item.rating}
                    style={{ paddingVertical: 10, alignSelf: 'flex-start' }}
                />
                <Text style={{fontSize: 12}}>{'-- ' + item.author + ', ' + item.date} </Text>
            </View>
        );
    };
    
    return (
        <Card title='Comments' >
        <FlatList 
            data={comments}
            renderItem={renderCommentItem}
            keyExtractor={item => item.id.toString()}
            />
        </Card>
    );
}

class DishDetail extends Component {
    constructor(props){
        super(props);
        this.state= {
            favorites:[],
            showModal: false,
            rating: 5,
            author: '',
            comment: ''
        }
        this.toggleModal = this.toggleModal.bind(this);
        this.handleComment = this.handleComment.bind(this);
    }


    resetForm() {
        this.state= {
            rating: 5,
            author: '',
            comment: ''
        };
    }

    static navigationOptions = {
        title: 'Dish Details'
    };

    markFavorite(dishId) {
        this.props.postFavorite(dishId);
    }

    toggleModal() {
        this.setState({showModal: !this.state.showModal});
    }

    handleComment(dishId) {
        this.props.postComment(dishId, this.state.rating, this.state.author, this.state.comment);
        this.toggleModal();
    }

    render() {
        const dishId = this.props.navigation.getParam('dishId','');
        return(
            <ScrollView>
                <RenderDish dish={this.props.dishes.dishes[+dishId]}
                    favorite={this.props.favorites.some(el => el === dishId)}
                    onPress={() => this.markFavorite(dishId)} 
                    onShowModal={() => this.toggleModal()}
                    />
                <RenderComments comments={this.props.comments.comments.filter((comment) => comment.dishId === dishId)} />
                <Modal animationType={"slide"} transparent={false}
                    visible={this.state.showModal}
                    onRequestClose={() => this.toggleModal()}>
                    <View style={styles.modal}>
                        <Rating
                            showRating
                            type="star"
                            startingValue={5}
                            imageSize={40}
                            onFinishRating={(rating) => { this.setState({ rating: rating })}}
                            onStartRating={this.ratingStarted}
                            style={{ paddingVertical: 10 }}
                        />
                        <Input
                            placeholder='Author'
                            leftIcon={{ type: 'font-awesome', name: 'user-o', margin: 10 }}
                            onChangeText={(text) => this.setState({ author: text })} value={this.state.author}
                        />
                        <Input
                    
                            placeholder='Comment'
                            leftIcon={{ type: 'font-awesome', name: 'comment-o', margin: 10 }}
                            onChangeText={(text) => this.setState({ comment: text })} value={this.state.comment}
                        />
                        <View style={styles.modal}>
                            <Button
                                onPress={() => {
                                    this.handleComment(dishId, this.state.rating, this.state.author, this.state.comment);
                                    this.resetForm();
                                }}
                                color="#512DA8"
                                title="Submit"
                                accessibilityLabel="Add your comment"
                            />
                            <Text></Text>
                            <Button 
                                onPress={() => { this.toggleModal(); this.resetForm(); }}
                                color="grey"
                                title="Close"
                            />
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    
    cardRow: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        flexDirection: 'row',
        margin: 20
    },
    cardItem: {
        flex: 1,
        margin: 10
    },
    modal: {
        justifyContent: 'center',
        margin: 20
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(DishDetail);