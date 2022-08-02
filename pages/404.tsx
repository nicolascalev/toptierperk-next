import Error from "components/AppError";

export default function e404View() {
  return (
    <Error status={404} message="This page could not be found." />
  );
}
