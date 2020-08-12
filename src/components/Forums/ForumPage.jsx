import React, { Component } from "react";
// import Popover from "react-bootstrap/Popover";
// import OverlayTrigger from "react-bootstrap/OverlayTrigger";
// import Paper from "@material-ui/core/Paper";
// import Tabs from "@material-ui/core/Tabs";
// import Tab from "@material-ui/core/Tab";
import axios from "axios";
import { Header } from "../Header";
import "../styles/forumPageStyles.css";
import { Link } from "react-router-dom";


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
    if(!this.breakRender) {
        const forum = await this.getForumDetails();
        this.setState({ forum, isLoading: true });
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
    // const { participants } = this.props.location.state.group;
    // Promise.all(
    //   participants.map(async (user) => await this.getUserDetails(user.id))
    // ).then((data) => {
    //   this.setState({ detailsArray: data, isLoading: true });
    // });
  }

  getPostsList = () => {
    const posts = this.state.forum.posts
      .filter((post) => {
        if (this.state.search == null) return post;
        else if (
          post.title
            .toLowerCase()
            .includes(this.state.search.toLowerCase()) ||
          post.content
            .toLowerCase()
            .includes(this.state.search.toLowerCase())
        ) {
          return post;
        }
        return;
      })
      .map((post) => {
        return (
          <tr>
            <td>
              <Link to={{ pathname: "/PostPage", state: { post, forumId: this.state.forum._id } }}>
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
    }


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
    const { isLoading, currTab, forum } = this.state;

    if (!isLoading) {
        return null;
    }

    const items = forum ? this.getPostsList() : 'Loading...';
    console.log('items:', items);

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
        </div>
      </div>
    );
  }
}
