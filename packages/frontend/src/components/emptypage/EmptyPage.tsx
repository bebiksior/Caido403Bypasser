import { StyledBox } from "caido-material-ui";

export const EmptyPage = (text: string) => {
  console.log("EmptyPage", text);
  return (
    <StyledBox>
      <div className="flex justify-center items-center h-full text-center text-zinc-500">
        <p>{text}</p>
      </div>
    </StyledBox>
  );
};
