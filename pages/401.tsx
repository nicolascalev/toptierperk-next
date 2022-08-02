import Error from "components/AppError";

export default function e401View() {
  return (
    <Error status={401} message="Unauthorized." />
  );
}
