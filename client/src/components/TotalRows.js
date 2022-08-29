import { Link } from "react-router-dom";

const TotalRows = ({ link, count, download = "", title = "", state = null }) => {
  return (
    <div className="d-flex justify-content-between mb-1 mt-1">
      <span>
        {link !== "" && (
          <Link to={link} state={state} className="btn btn-outline-primary btn-sm" data-bs-toggle="tooltip" title="Create a new row">
            <i className="fa-solid fa-plus" />
          </Link>
        )}
      </span>
      {title && title !== "" && <p className="h5 text-capitalize">{title}</p>}
      {download && download !== "" && (
        <button type="button" className="btn btn-outline-primary btn-sm" data-bs-toggle="tooltip" title="CSV Download" onClick={download}>
          <i className="fa-solid fa-file-csv"></i>
        </button>
      )}
      <span className="text-primary text-capitalize">{count} rows</span>
    </div>
  );
};

export default TotalRows;