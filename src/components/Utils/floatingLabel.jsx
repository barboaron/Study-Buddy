import React, { Component } from "react";
import classNames from "classnames";

export default class FloatingLabel extends Component {
  render() {
    const { placeholder, type, name, content, Icon, className } = this.props;
    return (
      <div className={classNames("floating-label", className)}>
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