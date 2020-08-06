import React, { Component } from "react";
import { Feed } from "semantic-ui-react";

export default class FeedEvent extends Component {
  render() {
    return (
      <Feed.Event>
        <Feed.Label image="https://react.semantic-ui.com/images/avatar/small/elliot.jpg" />
        <Feed.Content>
          <Feed.Summary>
            <Feed.User>name</Feed.User> posted/uploaded file
            <Feed.Date>when posted</Feed.Date>
          </Feed.Summary>
          <Feed.Extra text>
            Ours is a life of constant reruns. We're always circling back to
            where we'd we started, then starting all over again. Even if we
            don't run extra laps that day, we surely will come back for more of
            the same another day soon.
          </Feed.Extra>
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
