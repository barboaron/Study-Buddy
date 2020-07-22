import React, { Component } from "react";
import Card from "react-bootstrap/Card";

export default class GroupCard extends Component {
  render() {
    const { groupName, courseName, typeOfGroup, description } = this.props;

    return (
      <Card style={{ width: "18rem" }}>
        <Card.Body>
          <Card.Title>{groupName || "Study Group"}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">
            {(courseName || "Complexity") + " - " + (typeOfGroup || "Homework")}
          </Card.Subtitle>
          <Card.Text>
            {description ||
              "Some quick example text to build on the card title and make up the bulk of the card's content."}
          </Card.Text>
          <Card.Link href="#">View Details</Card.Link>
        </Card.Body>
      </Card>
    );
  }
}
