import React, { Component } from "react";
import axios from "axios";
import { Header } from "../Header";
import "../styles/postPageStyles.css";
import FeedEvent from "./../StudyGroups/FeedEvent";
import { Feed } from "semantic-ui-react";

export default class PostPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currPage: 0,
      post: {},
    };
  }

  async componentDidMount() {
    if (!this.breakRender) {
      const post = await this.getPostDetails();
      const comments = await this.getComments();
      const myId = await this.getUserID();
      this.setState({ post, comments, myId, isLoading: true });
    }
  }

  getUserID = async () => {
    let token = await localStorage.getItem("jwtToken");
    const reqData = {
      jwt: token,
    };
  
    return axios
      .post("/api/users/getUserId", reqData)
      .then((res) => {
        if (res.status !== 200) {
          console.log("error");
        } else {
          return res.data.id;
        }
      })
      .catch((err) => {
        console.log("error");
      });
  }


  componentWillMount() {
    if (!this.props?.location?.state?.post) {
      this.props.history.push("/");
      this.breakRender = true;
    }
  }

  getPostDetails = async () => {
    let token = await localStorage.getItem("jwtToken");

    const reqBody = {
      jwt: token,
      forumId: this.props.location.state.forumId,
      postId: this.props.location.state.post._id,
    };

    return axios
      .post("/api/forums/post", reqBody)
      .then((res) => {
        if (res.status !== 200) {
          console.log("error");
        } else {
          return res.data;
        }
      })
      .catch((err) => {
        console.log("error");
      });
  };

  getComments = async () => {
    let token = await localStorage.getItem("jwtToken");

    const reqBody = {
      jwt: token,
      forumId: this.props.location.state.forumId,
      postId: this.props.location.state.post._id,
    };

    return axios
      .post("/api/forums/comments", reqBody)
      .then((res) => {
        if (res.status !== 200) {
          console.log("error");
        } else {
          return res.data;
        }
      })
      .catch((err) => {
        console.log("error");
      });
  };

  getCommentsList = () => {
    const comments = this.state.comments.map((comment) => {
      return (
        <FeedEvent
          imgSrc={comment.creatorImgSrc}
          userName={comment.creatorName}
          action={"answered"}
          date={new Date(comment.creationDate).toLocaleString()}
          content={comment.content}
          canDelete={this.state.myId.toString() === comment.creatorId.toString()}
          deletePost={this.deleteComment}
          postId={comment._id}
          files={comment.files}
        />
      );
    });
    return comments;
  };

  deleteComment = async (commentId) => {
    let token = await localStorage.getItem("jwtToken");

    const commentDetails = {
      jwt: token,
      forumId: this.props.location.state.forumId,
      postId: this.props.location.state.post._id,
      commentId,
    };

    return axios
      .post("/api/forums/deleteComment", commentDetails)
      .then((res) => {
        if (res.status !== 200) {
          console.log("error");
        } else {
          this.setState({ comments: res.data });
        }
      })
      .catch((err) => {
        console.log("error");
      });
  }


  addNewComment = async (event) => {
    event.persist();
    event.preventDefault();

    let token = await localStorage.getItem("jwtToken");
    const forumId = this.props.location.state.forumId;
    const postId = this.props.location.state.post._id;
    const comment = event?.target?.elements?.comment?.value;
    const files = event?.target?.elements[1]?.files;
    const data = new FormData();

    data.append("jwt", token);
    data.append("forumId", forumId);
    data.append("postId", postId);
    data.append("comment", comment);

    if (files?.length > 0)
      Object.values(files).map((file, index) => data.append("file", file));

    if (comment) event.target.elements.comment.value = "";

    axios
      .post("/api/forums/addComment", data)
      .then((res) => {
        if (res.status !== 200) {
          console.log("error");
        } else {
          this.setState({ comments: res.data });
        }
      })
      .catch((err) => {
        console.log("error");
      });
  };

  handleChange = (_, newValue) => {
    this.setState({ currPage: newValue });
  };

  render() {
    // const elementStyle = {
    //   border: "solid",
    //   borderRadius: "10px",
    //   left: "10px",
    //   height: "3px",
    //   marginBottom: "20px",
    // };
    const { isLoading, post } = this.state;

    if (!isLoading) {
      return null;
    }
    const items = post ? this.getCommentsList() : "Loading...";

    return (
      <div className="profile_user">
        <Header />
        <link
          href="//maxcdn.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css"
          rel="stylesheet"
          id="bootstrap-css"
        />
        <div className="container emp-profile">
          <div className="post-page">
            <div className="post-head">
              <div className="post-title">{post.title || "Post Page"}</div>
              <div className="post-details">
                <div className="creator-title">{"posted by:"}</div>
                <div className="post-creator">{`${
                  post.creatorName
                } at ${new Date(post.creationDate).toLocaleString()}`}</div>
              </div>
              <div className="post-content-container">
                <div className="post-content">
                  {post.content || "Post Content"}
                </div>
              </div>
            </div>
            <div className="listOfComments">
              <div className="comments-title">Comments:</div>
              <Feed>{items}</Feed>
            </div>
            <form className={"form-comments"} onSubmit={this.addNewComment}>
              <textarea
                name="comment"
                id="commentTextArea"
                rows="2"
                cols="50"
                placeholder="Add comment..."
              />
              <br />
              <input id="chooseFile" type="file" name="myfile" multiple />
              <button className="add-comment-btn" type="submit">
                Add Comment
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}
