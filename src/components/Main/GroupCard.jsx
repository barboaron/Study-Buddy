import React, { Component } from "react";
import Card from "react-bootstrap/Card";

/* GroupCard component is a util component for MainPage- create a card in the main page with the main information of a study-group*/
export default class GroupCard extends Component {
  render() {
    const { group, viewDetails } = this.props;

    const {
      creatorName,
      courseName,
      groupType,
      description,
      groupName,
    } = group;

    return (
      <Card style={{ width: "18rem" }}>
        <Card.Body>
          <Card.Title>{groupName || "Group Name"}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">
            {(courseName || "Complexity") + "- " + (groupType || "Homework")}
          </Card.Subtitle>
          <Card.Subtitle className="mb-2 text-muted">
            {(creatorName || "Bar Boaron") + "'s Group"}
          </Card.Subtitle>
          <Card.Text>
            {description ||
              "Some quick example text to build on the card title and make up the bulk of the card's content."}
          </Card.Text>
          <Card.Link href="#" onClick={() => viewDetails(group)}>
            View Details
          </Card.Link>
        </Card.Body>
      </Card>
    );
  }
}
