import React, { Component } from "react";
import Information from "./info-json";

class SearchCourses extends Component {
  constructor() {
    super();

    this.state = {
      search: null,
    };
  }

  searchSpace = (event) => {
    let keyword = event.target.value;
    this.setState({ search: keyword });
  };

  render() {
    const elementStyle = {
      border: "solid",
      borderRadius: "10px",
      left: "10px",
      height: "3px",
      marginBottom: "9px",
    };
    const items = Information.filter((data) => {
      if (this.state.search == null) return data;
      else if (
        data.degree.toLowerCase().includes(this.state.search.toLowerCase()) ||
        data.course.toLowerCase().includes(this.state.search.toLowerCase())
      ) {
        return data;
      } else {
        return;
      }
    }).map((data) => {
      return (
        <tr>
          <td>{data.degree}</td>
          <td>{data.course}</td>
          <td>
            <button>Delete Course</button>
          </td>
        </tr>
      );
    });

    return (
      <div>
        <input
          type="text"
          placeholder="Search..."
          style={elementStyle}
          onChange={(e) => this.searchSpace(e)}
        />
        <div className="listOfCourses">
          <table className="tableOfCourses">
            <thead>
              <tr>
                <th className="headerColumn">Degree Name</th>
                <th className="headerColumn">Course Name</th>
                <th className="headerColumn"> </th>
              </tr>
            </thead>
            <tbody> {items}</tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default SearchCourses;
