import React from "react";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

export default function UniversitySelect() {
  const [university, setSelection] = React.useState("");

  const handleChange = (event) => {
    setSelection(event.target.value);
  };

  return (
    <FormControl className="formControl">
      <InputLabel id="demo-simple-select-label">University Name</InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={university}
        name="university"
        onChange={handleChange}
      >
        <MenuItem value="MTA">MTA</MenuItem>
        <MenuItem value="Tel Aviv University">Tel Aviv University</MenuItem>
        <MenuItem value="Ben Gurion University">Ben Gurion University</MenuItem>
        <MenuItem value="HIT">HIT</MenuItem>
      </Select>
    </FormControl>
  );
}
