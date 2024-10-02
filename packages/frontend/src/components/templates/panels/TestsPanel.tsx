import React, { useEffect, useState } from "react";
import { HTTPEditor } from "@/components/httpeditor/HTTPEditor";
import { StyledBox } from "caido-material-ui";
import { StyledSplitter } from "caido-material-ui";
import { Button } from "@mui/material";
import useTestStore from "@/stores/testsStore";

const TestsPanel = () => {
  const { testContent, setTestContent, testResults } = useTestStore();
  const [currentTestResultIndex, setCurrentTestResultIndex] = useState(0);

  useEffect(() => {
    setCurrentTestResultIndex(0);
  }, [testResults]);

  return (
    <StyledSplitter>
      <StyledBox className="p-0 flex flex-col gap-6">
        <HTTPEditor
          onChange={(e) => {
            setTestContent(e);
          }}
          type="request"
          value={testContent}
          removeFooter={true}
        />
      </StyledBox>
      <StyledBox className="p-0 flex flex-col gap-6">
        <div className="flex flex-col justify-between h-full">
          <HTTPEditor
            type="request"
            value={testResults[currentTestResultIndex] || ""}
            removeFooter={true}
          />
          <div className="flex justify-between items-center">
            <p className="m-0">
              {testResults.length > 1 &&
                " (" +
                  (currentTestResultIndex + 1) +
                  "/" +
                  testResults.length +
                  " requests)"}
            </p>
            {testResults.length > 1 && (
              <div className="flex gap-2">
                <Button
                  variant="contained"
                  onClick={() =>
                    setCurrentTestResultIndex((prev) =>
                      prev === 0 ? prev : prev - 1
                    )
                  }
                  disabled={currentTestResultIndex === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="contained"
                  onClick={() =>
                    setCurrentTestResultIndex((prev) =>
                      prev === testResults.length - 1 ? prev : prev + 1
                    )
                  }
                  disabled={currentTestResultIndex === testResults.length - 1}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </StyledBox>
    </StyledSplitter>
  );
};

export default TestsPanel;
