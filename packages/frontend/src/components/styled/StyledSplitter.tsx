import React from "react";
import Splitter, { SplitDirection, SplitProps } from "@devbookhq/splitter";
import "./StyledSplitter.css";

interface StyledSplitterProps extends SplitProps {
  direction?: SplitDirection;
  children: React.ReactNode;
}

const StyledSplitter: React.FC<StyledSplitterProps> = ({
  direction = SplitDirection.Horizontal,
  children,
  ...props
}) => {
  return (
    <Splitter
      direction={direction}
      gutterClassName={
        direction === SplitDirection.Horizontal
          ? "custom-gutter-horizontal"
          : "custom-gutter-vertical"
      }
      draggerClassName={
        direction === SplitDirection.Horizontal
          ? "custom-dragger-horizontal"
          : "custom-dragger-vertical"
      }
      {...props}
    >
      {children}
    </Splitter>
  );
};

export default StyledSplitter;
