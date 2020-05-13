import React from "react";
import "../styles/questionsStyle.css";

export default class Questions extends React.Component {
  constructor() {
    super();
    this.state = {
      name: "",
      questions: [{ name: "" }],
    };
  }

  handleNameChange = (evt) => {
    this.setState({ name: evt.target.value });
  };

  handleShareholderNameChange = (idx) => (evt) => {
    const newShareholders = this.state.questions.map((question, sidx) => {
      if (idx !== sidx) return question;
      return { ...question, name: evt.target.value };
    });

    this.setState({ questions: newShareholders });
  };

  handleSubmit = (evt) => {
    const { name, questions } = this.state;
    alert(`Incorporated: ${name} with ${questions.length} questions`);
  };

  handleAddShareholder = () => {
    this.setState({
      questions: this.state.questions.concat([{ name: "" }]),
    });
  };

  handleRemoveShareholder = (idx) => () => {
    this.setState({
      questions: this.state.questions.filter((s, sidx) => idx !== sidx),
    });
  };

  render() {
    return (
      //   <form onSubmit={this.handleSubmit}>
      //     <input
      //       type="text"
      //       placeholder="Company name, e.g. Magic Everywhere LLC"
      //       value={this.state.name}
      //       onChange={this.handleNameChange}
      //     />

      //     <h4>Shareholders</h4>
      <div className="questionsLabels">
        {this.state.questions.map((question, idx) => (
          <div className="question">
            <input
              className="inputQuestion"
              type="text"
              placeholder={`Question #${idx + 1}`}
              value={question.name}
              onChange={this.handleShareholderNameChange(idx)}
            />
            <button
              // type="button"
              onClick={this.handleRemoveShareholder(idx)}
              className="deleteQuestionBtn"
            >
              -
            </button>
          </div>
        ))}
        <button
          // type="button"
          onClick={this.handleAddShareholder}
          className="addNewQuestionBtn"
        >
          Add Question
        </button>
      </div>
      //     {/* <button>Incorporate</button>
      //   </form> */}
    );
  }
}

// const rootElement = document.getElementById("root");
// ReactDOM.render(<temp />, rootElement);
