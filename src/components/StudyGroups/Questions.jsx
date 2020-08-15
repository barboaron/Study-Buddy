import React from "react";
import "../styles/questionsStyle.css";

/* Questions component is a util component for createStudyGroup component- a creator of studyGroup can add questions
that each user that want to join the group have to answer this questions 
and then the creator will decide if he accept/ignore the join request*/

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

  handleAddShareholder = () => {
    const { questions } = this.state;
    questions.length === 4
      ? this.setState({
          questions: questions.concat([{ name: "" }]),
          maxQuestionsErr: true,
        })
      : this.setState({
          questions: questions.concat([{ name: "" }]),
        });
  };

  handleRemoveShareholder = (idx) => () => {
    this.setState({
      questions: this.state.questions.filter((s, sidx) => idx !== sidx),
      maxQuestionsErr: false,
    });
  };

  render() {
    const { maxQuestionsErr } = this.state;
    return (
      <div className="questionsLabels">
        {this.state.questions.map((question, idx) => (
          <div className="question" key={idx}>
            <input
              name={`Question${idx + 1}`}
              className="inputQuestion"
              type="text"
              placeholder={`Question #${idx + 1}`}
              value={question.name}
              onChange={this.handleShareholderNameChange(idx)}
            />
            <button
              onClick={this.handleRemoveShareholder(idx)}
              className="deleteQuestionBtn"
              type="button"
            >
              -
            </button>
          </div>
        ))}
        {!maxQuestionsErr && (
          <button
            onClick={this.handleAddShareholder}
            disabled={maxQuestionsErr}
            className="addNewQuestionBtn"
            type="button"
          >
            Add Question
          </button>
        )}
      </div>
    );
  }
}
