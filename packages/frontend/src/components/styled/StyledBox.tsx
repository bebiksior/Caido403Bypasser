import { Box, styled } from "@mui/material";

const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: 'var(--c-bg-subtle)',
  color: 'var(--p-card-color)',
  boxShadow: 'var(--p-card-shadow)',
  borderRadius: 'var(--p-card-border-radius)',
  height: '100%',
  width: '100%', 
}));

export default StyledBox;