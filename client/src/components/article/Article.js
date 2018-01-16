import '../../styles/article.css';

import React, { Component } from 'react';
import _ from 'lodash';

import { publishArticle, retrievePost, subscribeToPostArticle } from '../../api/api';
import HtmlParser from './HtmlParser';

import { Divider } from 'semantic-ui-react';

class Article extends Component {

    constructor(props) {
        super(props);
        this.state = {
            post: null,
            articles: [],
            isSubscribed: false,
        };
        this.ensureSubscription = this.ensureSubscription.bind(this);
        this.resetArticleState = this.resetArticleState.bind(this);
        this.scrollToBottom = this.scrollToBottom.bind(this);
        this.updateArticle = this.updateArticle.bind(this);
    }
    
    componentWillMount() {
        let post = this.props.location.state;
        // If we weren't able to grab the post through the props, 
        // grab it from the db
        if (!post) {
            let postId = this.props.match.params.postId;
            retrievePost(postId, (res) => {
                post = res;
                this.setState({ post: post });
            });
        }
        this.setState({ post: post });
    }

    componentDidMount() {
        if (this.state.post != null) {
            this.ensureSubscription();
        }
    }
    
    componentDidUpdate() {
        if (!this.state.isSubscribed && this.state.post) {
            this.ensureSubscription();
        }
        this.scrollToBottom();
    }

    /**
     * A method to ensure the Observable stream is put into place, 
     * even if the user accesses the site via the url directly
     */
    ensureSubscription() {
        this.setState({ isSubscribed: true });
        subscribeToPostArticle(this.state.post.id, (articleEvent) => {
            if (articleEvent.articles.length > 0) {
                this.setState((prevState) => {
                    return {
                        articles: [...prevState.articles, ...articleEvent.articles]
                            .sort((x, y) => {
                                let x_time = (new Date(x.timestamp).getTime());
                                let y_time = (new Date(y.timestamp).getTime());
                                return x_time - y_time;
                            }),
                    };
                });
            }
        });

        this.scrollToBottom();
    }

    /*
     *   This is a smelly method to handle the renrendering of the same component
     *   when updates to the server occur
     *   TODO : Find a better way of dealing with this. --> seems to be derived from the reconnect to socket.io
     *   https://github.com/socketio/socket.io/issues/474 --> recurring issue since 2011
    */
    resetArticleState() {
        let articles = this.state.articles;
        articles = _.uniqBy(articles, 'id');
        return articles;

    }

    /**
     * Scrolls to the bottom of the container so that the focus is
     * always on the most recently accessed article
     */
    scrollToBottom() {
        this.refs.scrollContainer.scrollIntoView({ behaviour: 'smooth' });
    }

    /**
     * Update the post to include the most recent article
     */
    updateArticle() {
        let article = this.refs.articleContent.value;
        this.refs.articleContent.value = '';
        publishArticle({
            postId: this.state.post.id,
            article: article
        });
    }

    /**
     * 
     */
    render() {
        const post = this.state.post;
        const articles = this.resetArticleState();

        if (this.state.post) {
            return (
                <div className="component">
                    <div className="ui secondary pointing menu">
                        <div className="item">
                            <p>Check</p>
                        </div>

                    </div>
                    <div className="ui segment">
                        <h1 className="ui center aligned header">{post.title}</h1>
                        <Divider />
                        <div className="scrolling content">
                            {
                                articles.map((x, i) => {

                                    return (post.id === x.postId) ?
                                        <HtmlParser content={x.article} key={x.id} />
                                        : '';

                                })
                            }
                            <div ref="scrollContainer" />

                        </div>
                    </div>
                    <div className="ui form">
                        <div className="field">
                            <textarea ref="articleContent" rows="2" />
                        </div>
                        <button onClick={this.updateArticle} className="ui button primary" > Add Content</button>
                    </div>

                </div>
            );
        } else {
            return (
                <div className="ui segment">
                    <div className="ui active inverted dimmer">
                        <div className="ui massive text loader">Loading...</div>
                    </div>
                    <p />
                </div>
            );
        }
    }
}

export default Article;