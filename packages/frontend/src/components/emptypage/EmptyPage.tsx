import { StyledBox } from "caido-material-ui";

export const EmptyPage = (text: string) => {
  return (
    <StyledBox>
      <div className="flex justify-center items-center h-full text-center text-zinc-500">
        <p>{text}</p>
      </div>
    </StyledBox>
  );
};
