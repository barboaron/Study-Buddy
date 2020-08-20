/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from "react";
import { Feed } from "semantic-ui-react";

/* FeedEvent component is a util component for group's page- shows a post in the collaboration tab in the GroupPage*/
export default class FeedEvent extends Component {
  render() {
    const {
      imgSrc,
      userName,
      action,
      date,
      content,
      deletePost,
      postId,
      canDelete,
      files = [],
    } = this.props;

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
            <Feed.Meta style={{ marginLeft: "2%" }}>
              {canDelete ? (
                <a onClick={() => deletePost(postId)}>Delete</a>
              ) : null}
            </Feed.Meta>
          </Feed.Summary>
          <Feed.Extra text>{content}</Feed.Extra>
          <Feed.Extra images>
            {files.map((file) => {
              const path = file.isImage
                ? file.path
                : "uploads/1597914073240-fileImg.jpeg";
              return (
                <a href={file.path} target="_blank" rel="noopener noreferrer">
                  <img src={path} style={{ height: "75px", width: "70px" }} />
                </a>
              );
            })}
          </Feed.Extra>
        </Feed.Content>
      </Feed.Event>
    );
  }
}
