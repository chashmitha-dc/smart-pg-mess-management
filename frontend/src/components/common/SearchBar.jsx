import { TextField } from "@mui/material";

function SearchBar({ value, onChange, placeholder = "Search" }) {
  return (
    <TextField
      fullWidth
      size="small"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      sx={{ maxWidth: 320 }}
    />
  );
}

export default SearchBar;
