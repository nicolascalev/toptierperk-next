import Error from "components/AppError";

export default function e403View() {
  return (
    <Error status={403} message="Forbidden." />
  );
}
