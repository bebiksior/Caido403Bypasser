import React from "react";
import { Allotment, AllotmentProps } from "allotment";
import "./StyledSplitter.css";

interface StyledSplitterProps extends AllotmentProps {
  vertical?: boolean;
  children: React.ReactNode;
}

const StyledSplitter: React.FC<StyledSplitterProps> = ({
  vertical = false,
  children,
  ...props
}) => {
  return (
    <Allotment vertical={vertical} separator={false} {...props}>
      {children}
    </Allotment>
  );
};

export default StyledSplitter;
