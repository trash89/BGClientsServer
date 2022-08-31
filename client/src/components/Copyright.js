export default function Copyright() {
  return (
    <footer className="navbar navbar-expand-sm bg-black text-white navbar-dark fixed-bottom p-0 m-0">
      <div className="d-flex flex-row flex-fill justify-content-center">
        {"© "} {new Date().getFullYear()}
        {" by "}
        <a href="https://github.com/trash89/" target="_blank" rel="noreferrer">
          trash89
        </a>
        {". All rights reserved. Built with "}{" "}
        <a href="https://reactjs.org/" target="_blank" rel="noreferrer">
          React
        </a>
      </div>
    </footer>
  );
}
