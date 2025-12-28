export default function Spinner({ white = false }) {
  return <div className={`spinner ${white ? "spinner-white" : ""}`}></div>;
}
