import React from "react";
import "../styles/scheduleWrapperStyle.css";

/* DateAndTimePicker component is a util component for ScheduleWrapper.
This component appears in the creator's group page in the schedule tab, so the creator can create a poll for the group.*/
export default class DateAndTimePicker extends React.Component {
  constructor() {
    super();
    this.state = {
      name: "",
      pickers: [{ name: "" }],
    };
  }

  handleNameChange = (evt) => {
    this.setState({ name: evt.target.value });
  };

  handleShareholderNameChange = (idx) => (evt) => {
    const newShareholders = this.state.pickers.map((picker, sidx) => {
      if (idx !== sidx) return picker;
      return { ...picker, name: evt.target.value };
    });

    this.setState({ pickers: newShareholders });
  };

  handleAddShareholder = () => {
    const { pickers } = this.state;
    pickers.length === 4
      ? this.setState({
          pickers: pickers.concat([{ name: "" }]),
          maxPickersErr: true,
        })
      : this.setState({
          pickers: pickers.concat([{ name: "" }]),
        });
  };

  handleRemoveShareholder = (idx) => () => {
    this.setState({
      pickers: this.state.pickers.filter((s, sidx) => idx !== sidx),
      maxPickersErr: false,
    });
  };

  render() {
    const { maxPickersErr } = this.state;
    return (
      <div className="pickersLabels">
        {this.state.pickers.map((picker, idx) => (
          <div className="picker" key={idx}>
            <input
              name={`Picker${idx + 1}`}
              className="inputPicker"
              type="datetime-local"
              placeholder={`Date #${idx + 1}`}
              value={picker.name}
              onChange={this.handleShareholderNameChange(idx)}
            />
            <button
              onClick={this.handleRemoveShareholder(idx)}
              className="deletePickerBtn"
              type="button"
            >
              -
            </button>
          </div>
        ))}
        {!maxPickersErr && (
          <button
            onClick={this.handleAddShareholder}
            disabled={maxPickersErr}
            className="addNewPickerBtn"
            type="button"
          >
            Add More Dates And Time
          </button>
        )}
      </div>
    );
  }
}
