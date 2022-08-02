import Error from "components/AppError";

export default function e500View() {
  return (
    <Error status={500} message="Server error, an unexpected error happened." />
  );
}
