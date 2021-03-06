import React from "react";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

/* This component is a util component for rendering of dropdown list*/
export default function DropDownSelect({
  options = [],
  label_name,
  selected,
  data_id,
  name = "option",
  form_style,
}) {
  const [option, setSelection] = React.useState("");

  const handleChange = (event) => {
    setSelection(event.target.value);
  };

  return (
    <FormControl className="formControl" style={form_style}>
      <InputLabel id="simple-select-label">{label_name}</InputLabel>
      <Select
        labelId="simple-select-label"
        id={data_id || "simple-select"}
        value={option || selected}
        name={name}
        onChange={handleChange}
      >
        {options.map((item, index) => (
          <MenuItem key={index} value={item}>
            {item}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
