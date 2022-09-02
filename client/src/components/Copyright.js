export default function Copyright() {
  return (
    <footer className="navbar navbar-expand-sm bg-dark text-white navbar-dark fixed-bottom p-0 m-0">
      <div className="d-flex flex-row flex-fill justify-content-center pe-1">
        <div>
          {"© "} {new Date().getFullYear()}
          {" by "}
          <a href="https://github.com/trash89/" target="_blank" rel="noopener noreferrer">
            trash89
          </a>
          {". All rights reserved. Built with "}{" "}
          <a href="https://reactjs.org/" target="_blank" rel="noopener noreferrer">
            React
          </a>
        </div>
      </div>
    </footer>
  );
}
