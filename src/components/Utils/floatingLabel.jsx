import React, { Component } from "react";

export default class FloatingLabel extends Component {
  render() {
    const { placeholder, type, name, content, Icon } = this.props;
    return (
      <div className="floating-label">
        <input placeholder={placeholder} type={type} name={name} />
        <label for={name}>{content}</label>
        {Icon && (
          <div className="icon">
            <Icon />
          </div>
        )}
      </div>
    );
  }
}
