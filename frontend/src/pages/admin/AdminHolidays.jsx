import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import styles from "../../style/DashboardSections.module.css";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AdminHolidays = () => {
  const [holidays, setHolidays] = useState([]);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [editedImage, setEditedImage] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/holidays`);
      setHolidays(data);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Add New Holiday
  const onAddSubmit = async (formData) => {
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("date", formData.date);
      if (formData.image && formData.image[0]) {
        data.append("image", formData.image[0]);
      }

      await axios.post(`${API_URL}/holidays`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Holiday added successfully!");
      reset();
      setPreviewImage("");
      fetchHolidays();
    } catch (err) {
      console.error(err);
      alert("Error adding holiday.");
    }
  };

  // ✅ Update Existing Holiday
  const onEditSubmit = async (formData) => {
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("date", formData.date);

      if (editedImage) {
        data.append("image", editedImage);
      }

      await axios.patch(`${API_URL}/holidays/${selectedHoliday.id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Holiday updated successfully!");
      reset();
      setSelectedHoliday(null);
      setPreviewImage("");
      setEditedImage(null);
      fetchHolidays();
    } catch (err) {
      console.error(err);
      alert("Error updating holiday.");
    }
  };

  // ✅ Edit Button Handler
  const handleEdit = (holiday) => {
    setSelectedHoliday(holiday);
    setValue("name", holiday.name);

    // ✅ Set date string directly (already plain "YYYY-MM-DD" now)
    setValue("date", holiday.date);

    setPreviewImage(holiday.image ? `${holiday.image}` : "");
    setEditedImage(null);
  };

  // ✅ Delete Handler
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this holiday?")) {
      try {
        await axios.delete(`${API_URL}/holidays/${id}`);
        fetchHolidays();
      } catch (err) {
        console.error(err);
        alert("Error deleting holiday.");
      }
    }
  };

  // ✅ Handle image preview (for both add & edit)
  const handleImagePreview = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      setEditedImage(file);
    } else {
      setPreviewImage("");
      setEditedImage(null);
    }
  };

  // ✅ Build full image URL
  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API_URL.replace("/api", "")}${path}?t=${Date.now()}`;
  };

  // ✅ Format date for display
  const displayDate = (dateStr) => {
    if (!dateStr) return "-";
    const [year, month, day] = dateStr.split("-");
    const date = new Date(`${year}-${month}-${day}T00:00:00`);
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <>
      <Navbar />
      <Sidebar />
      <main>
        <div className="container py-4">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="fw-semibold">Holiday Management</h5>
            <button
              className="btn btn-primary btn-sm rounded-0"
              data-bs-toggle="modal"
              data-bs-target="#holidayModal"
              onClick={() => {
                reset();
                setPreviewImage("");
                setEditedImage(null);
              }}
            >
              + Add Holiday
            </button>
          </div>

          {/* Holidays Table */}
          <div className={`${styles.card} p-3`}>
            <div className="table-responsive">
              <table className="table table-striped align-middle mb-0">
                <thead>
                  <tr>
                    <th className="f_13">#</th>
                    <th className="f_13">Name</th>
                    <th className="f_13">Date</th>
                    <th className="f_13 text-center">Image</th>
                    <th className="f_13 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {holidays.length > 0 ? (
                    holidays.map((holiday, index) => (
                      <tr key={holiday.id}>
                        <td>{index + 1}</td>
                        <td>{holiday.name}</td>
                        <td>{displayDate(holiday.date)}</td>
                        <td className="text-center">
                          {holiday.image ? (
                            <img
                              src={getImageUrl(holiday.image)}
                              alt={holiday.name}
                              width={50}
                              className="rounded"
                            />
                          ) : (
                            <span className="text-muted f_12">–</span>
                          )}
                        </td>
                        <td className="text-center">
                          <button
                            className="btn btn-sm btn-outline-primary me-2 rounded-0"
                            data-bs-toggle="offcanvas"
                            data-bs-target="#editOffcanvas"
                            onClick={() => handleEdit(holiday)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger rounded-0"
                            onClick={() => handleDelete(holiday.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center text-muted f_13">
                        No holidays found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Holiday Modal */}
          <div
            className="modal fade"
            id="holidayModal"
            tabIndex="-1"
            aria-labelledby="holidayModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <form onSubmit={handleSubmit(onAddSubmit)}>
                  <div className="modal-header">
                    <h6 className="modal-title" id="holidayModalLabel">
                      Add Holiday
                    </h6>
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label f_13">Holiday Name</label>
                      <input
                        type="text"
                        className="form-control form-control-sm rounded-0"
                        {...register("name", { required: "Name is required" })}
                      />
                      {errors.name && (
                        <small className="text-danger">
                          {errors.name.message}
                        </small>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label f_13">Date</label>
                      <input
                        type="date"
                        className="form-control form-control-sm rounded-0"
                        {...register("date", { required: "Date is required" })}
                      />
                      {errors.date && (
                        <small className="text-danger">
                          {errors.date.message}
                        </small>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label f_13">Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control form-control-sm rounded-0"
                        {...register("image")}
                        onChange={handleImagePreview}
                      />
                      {previewImage && (
                        <div className="mt-2">
                          <img
                            src={previewImage}
                            alt="preview"
                            width={80}
                            className="rounded shadow-sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm rounded-0"
                      data-bs-dismiss="modal"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-success btn-sm rounded-0"
                      data-bs-dismiss="modal"
                    >
                      Add
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Edit Holiday Offcanvas */}
          <div
            className="offcanvas offcanvas-end"
            tabIndex="-1"
            id="editOffcanvas"
            aria-labelledby="editOffcanvasLabel"
          >
            <div className="offcanvas-header">
              <h6 id="editOffcanvasLabel">Edit Holiday</h6>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              ></button>
            </div>
            <div className="offcanvas-body">
              {selectedHoliday ? (
                <form onSubmit={handleSubmit(onEditSubmit)}>
                  <div className="mb-3">
                    <label className="form-label f_13">Holiday Name</label>
                    <input
                      type="text"
                      className="form-control form-control-sm rounded-0"
                      {...register("name", { required: "Name is required" })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label f_13">Date</label>
                    <input
                      type="date"
                      className="form-control form-control-sm rounded-0"
                      {...register("date", { required: "Date is required" })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label f_13">Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control form-control-sm rounded-0"
                      {...register("image")}
                      onChange={handleImagePreview}
                    />
                    {previewImage && (
                      <div className="mt-2">
                        <img
                          src={previewImage}
                          alt="preview"
                          width={80}
                          className="rounded shadow-sm"
                        />
                      </div>
                    )}
                  </div>

                  <div className="d-flex justify-content-end">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm rounded-0 me-2"
                      data-bs-dismiss="offcanvas"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-success btn-sm rounded-0"
                      data-bs-dismiss="offcanvas"
                    >
                      Update
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-muted">Select a holiday to edit.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default AdminHolidays;
