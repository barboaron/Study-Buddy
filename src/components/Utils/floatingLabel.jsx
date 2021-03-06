import React, { Component } from "react";
import classNames from "classnames";

/* FloatingLabel component is a util component for rendering an input and label in forms*/
export default class FloatingLabel extends Component {
  render() {
    const {
      placeholder,
      type,
      name,
      content,
      Icon,
      className,
      defaultValue,
      minVal,
      maxVal,
      isRequired,
    } = this.props;
    return (
      <div className={classNames("floating-label", className)}>
        <input
          className="input"
          placeholder={placeholder}
          type={type}
          name={name}
          defaultValue={defaultValue}
          min={minVal}
          max={maxVal}
          required={isRequired}
        />
        <label htmlFor={name}>{content}</label>
        {Icon && (
          <div className="icon">
            <Icon />
          </div>
        )}
      </div>
    );
  }
}
