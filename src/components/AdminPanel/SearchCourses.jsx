/* eslint-disable array-callback-return */
import React, { Component } from "react";

class SearchCourses extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: null,
    };
  }

  searchSpace = (event) => {
    let keyword = event.target.value;
    this.setState({ search: keyword });
  };

  getCoursesList = () =>
    this.props.coursesList
      .filter((data) => {
        if (this.state.search == null) return data;
        else if (
          data.degreeName
            .toLowerCase()
            .includes(this.state.search.toLowerCase()) ||
          data.courseName
            .toLowerCase()
            .includes(this.state.search.toLowerCase())
        ) {
          return data;
        }
        return;
      })
      .map((data) => {
        return (
          <tr>
            <td>{data.degreeName}</td>
            <td>{data.courseName}</td>
            <td>
              <button onClick={() => this.props.deleteCourse(data)}>
                Delete Course
              </button>
            </td>
          </tr>
        );
      });

  render() {
    const elementStyle = {
      border: "solid",
      borderRadius: "10px",
      left: "10px",
      height: "3px",
      marginBottom: "9px",
    };
    const items = this.getCoursesList();

    return (
      <div>
        <input
          className="input"
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
