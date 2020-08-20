import React, { Component } from "react";
import axios from "axios";
import { Header } from "../Header";
import "../styles/forumPageStyles.css";
import { Link } from "react-router-dom";
import DropDownOptions from "../Utils/DropDownOptions";

export default class ForumPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currTab: 0,
      forum: {},
      search: null,
    };
  }

  async componentDidMount() {
    if (!this.breakRender) {
      const forum = await this.getForumDetails();
      const postTypes = await this.getPostTypes();
      this.setState({ forum, posts: forum.posts, postTypes, isLoading: true });
    }
  }

  searchSpace = (event) => {
    let keyword = event.target.value;
    this.setState({ search: keyword });
  };

  componentWillMount() {
    if (!this.props?.location?.state?.forum) {
      this.props.history.push("/");
      this.breakRender = true;
    }
  }

  getForumDetails = async () => {
    let token = await localStorage.getItem("jwtToken");

    const reqBody = {
      jwt: token,
      forumId: this.props.location.state.forum.forumId,
    };

    return axios
      .post("/api/forums/forum", reqBody)
      .then((res) => {
        if (res.status !== 200) {
          console.log("error");
        } else {
          return res.data.forum;
        }
      })
      .catch((err) => {
        console.log("error");
      });
  };

  getPostTypes = async () => {
    let token = await localStorage.getItem("jwtToken");

    const reqBody = {
      jwt: token,
    };

    return axios
      .post("/api/forums/postTypes", reqBody)
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

  getPostsList = () => {
    const posts = this.state.posts
      .filter(
        (post) =>
          this.state.search == null ||
          post.title.toLowerCase().includes(this.state.search.toLowerCase()) ||
          post.content.toLowerCase().includes(this.state.search.toLowerCase())
      )
      .map((post) => {
        return (
          <tr>
            <td>
              <Link
                to={{
                  pathname: "/PostPage",
                  state: { post, forumId: this.state.forum._id },
                }}
              >
                {`${post.type} | ${post.title}`}
              </Link>
            </td>
            <td>{post.creatorName}</td>
            <td>{post.comments.length}</td>
            <td>{new Date(post.creationDate).toLocaleString()}</td>
          </tr>
        );
      });
    return posts;
  };

  addNewPost = async (event) => {
    event.persist();
    event.preventDefault();

    let token = await localStorage.getItem("jwtToken");
    const forumId = this.state.forum._id;
    const title = event?.target?.elements?.title?.value;
    const content = event?.target?.elements?.contentTextArea?.value;
    const type = event?.target?.elements?.postType?.value;
    const files = event?.target?.elements[3]?.files;
    const data = new FormData();

    data.append("jwt", token);
    data.append("forumId", forumId);
    data.append("title", title);
    data.append("content", content);
    data.append("type", type);

    if (files?.length > 0)
      Object.values(files).map((file, index) => data.append("file", file));

    if (title) event.target.elements.title.value = "";
    if (content) event.target.elements.contentTextArea.value = "";
    if (type) event.target.elements.postType.value = ""; //doesn't work!

    return axios
      .post("/api/forums/createPost", data)
      .then((res) => {
        if (res.status !== 200) {
          console.log("error");
        } else {
          this.setState({ posts: res.data });
        }
      })
      .catch((err) => {
        console.log("error");
      });
  };

  handleChange = (_, newValue) => {
    this.setState({ currTab: newValue });
  };

  render() {
    const elementStyle = {
      border: "solid",
      borderRadius: "10px",
      left: "10px",
      height: "3px",
      marginBottom: "20px",
    };
    const { isLoading, forum, postTypes } = this.state;

    if (!isLoading) {
      return null;
    }

    const items = forum ? this.getPostsList() : "Loading...";
    console.log("items:", items);

    return (
      <div className="profile_user">
        <Header />
        <link
          href="//maxcdn.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css"
          rel="stylesheet"
          id="bootstrap-css"
        />
        <div className="container emp-profile">
          <div className="row">
            <div className="col-md-6">
              <div className="forum-head">
                <h2 className="forumTitle">
                  {forum.forumName || "Forum Page"}
                </h2>
              </div>
              <input
                className="input"
                type="text"
                placeholder="Search..."
                style={elementStyle}
                onChange={(e) => this.searchSpace(e)}
              />
              <div className="listOfPosts">
                <table className="tableOfPosts">
                  <thead>
                    <tr>
                      <th className="headerColumn">Title</th>
                      <th className="headerColumn">Created By</th>
                      <th className="headerColumn">Comments</th>
                      <th className="headerColumn">Creation Date</th>
                      <th className="headerColumn"></th>
                      <th className="headerColumn"></th>
                    </tr>
                  </thead>
                  <tbody> {items}</tbody>
                </table>
              </div>
            </div>
          </div>
          <form className={"form-comments"} onSubmit={this.addNewPost}>
            <DropDownOptions
              options={postTypes}
              label_name="Type Of Post:"
              name="postType"
            />
            <input type="text" name="title" placeholder="Add Post Title" />
            <textarea name="content" id="contentTextArea" rows="2" cols="50" />
            <br />
            <input id="chooseFile" type="file" name="myfile" multiple />
            <button className="add-comment-btn" type="submit">
              Publish
            </button>
          </form>
        </div>
      </div>
    );
  }
}
