import React, { Component } from "react";
import { Feed } from "semantic-ui-react";

/* FeedEvent component is a util component for group's page- shows a post in the collaboration tab in the GroupPage*/
export default class FeedEvent extends Component {
  render() {
    const { imgSrc, userName, action, date, content } = this.props;
    return (
      <Feed.Event>
        <Feed.Label
          image={
            imgSrc ||
            "https://react.semantic-ui.com/images/avatar/small/elliot.jpg"
          }
        />
        <Feed.Content>
          <Feed.Summary>
            <Feed.User>{userName || "name"}</Feed.User>
            {` ${action}`}
            <Feed.Date>{date}</Feed.Date>
            <Feed.Meta>
              <a>Delete</a>
            </Feed.Meta>
          </Feed.Summary>
          <Feed.Extra text>{content}</Feed.Extra>
          {/* <Feed.Extra images>
            <a>
              <img src="https://react.semantic-ui.com/images/wireframe/image.png" />
            </a>
            <a>
              <img src="https://react.semantic-ui.com/images/wireframe/image.png" />
            </a>
          </Feed.Extra> */}
        </Feed.Content>
      </Feed.Event>
    );
  }
}
