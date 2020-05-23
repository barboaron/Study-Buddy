import React from "react";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

export default function DropDownSelect({
  options = [],
  label_name,
  selected,
  name = "option",
}) {
  const [option, setSelection] = React.useState("");

  const handleChange = (event) => {
    setSelection(event.target.value);
  };
  return (
    <FormControl className="formControl">
      <InputLabel id="demo-simple-select-label">{label_name}</InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
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
