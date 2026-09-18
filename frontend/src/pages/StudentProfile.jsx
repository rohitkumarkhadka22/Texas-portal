import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  GraduationCap,
  Users,
  Hash,
  BookOpen,
  Pencil,
  ShieldCheck,
  Save,
  X,
  Loader2,
  Camera,
  Trash2,
} from "lucide-react";
import api from "../services/api";

/* =========================================================
   INPUT FIELD
   Defined outside StudentProfile to prevent input remounting
   ========================================================= */

const InputField = ({
  label,
  name,
  type = "text",
  icon: Icon,
  placeholder,
  value,
  onChange,
}) => {
  return (
    <div>
      <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.16em] text-black/35">
        {label}
      </label>

      <div className="relative">
        <Icon
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/30"
        />

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="
            h-11 w-full
            rounded-xl
            border border-black/[0.09]
            bg-white/[0.75]
            pl-10 pr-3
            text-xs
            text-black
            outline-none
            transition-all duration-200
            placeholder:text-black/25
            focus:border-black/[0.20]
            focus:bg-white
            focus:ring-2
            focus:ring-black/[0.04]
          "
        />
      </div>
    </div>
  );
};

/* =========================================================
   STUDENT PROFILE
   ========================================================= */

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [imageUploading, setImageUploading] = useState(false);
  const [imageRemoving, setImageRemoving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    guardianName: "",
    guardianRelationship: "",
    guardianPhone: "",
  });

  /* =========================================================
     FETCH PROFILE
     ========================================================= */

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      const response = await api.get("/students/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfile(response.data);
    } catch (err) {
      console.error("Profile fetch error:", err);

      setError(
        err.response?.data?.message || "Unable to load your profile right now.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     GET STUDENT + USER
     ========================================================= */

  const getStudentAndUser = () => {
    const root = profile || {};

    const student = root?.student || root?.data || root;

    const user = root?.user || student?.user || {};

    return {
      student,
      user,
    };
  };

  /* =========================================================
     HELPERS
     ========================================================= */

  const getValue = (value, fallback = "Not provided") => {
    if (value === undefined || value === null || value === "") {
      return fallback;
    }

    return value;
  };

  const formatDate = (date) => {
    if (!date) return "Not provided";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return String(date);
    }

    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateForInput = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toISOString().split("T")[0];
  };

  /* =========================================================
     IMAGE URL
     ========================================================= */

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return "";
    }

    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    return `http://localhost:5001${imagePath}`;
  };

  /* =========================================================
     START EDITING
     ========================================================= */

  const startEditing = () => {
    const { student, user } = getStudentAndUser();

    const guardian = student?.guardian || profile?.guardian || {};

    setForm({
      name: user?.name || student?.name || "",
      phone: user?.phone || student?.phone || "",

      dateOfBirth: formatDateForInput(
        student?.dateOfBirth ||
          student?.dob ||
          profile?.dateOfBirth ||
          profile?.dob,
      ),

      gender: student?.gender || profile?.gender || "",

      address: student?.address || profile?.address || "",

      guardianName:
        typeof guardian === "object" ? guardian?.name || "" : guardian || "",

      guardianRelationship:
        typeof guardian === "object" ? guardian?.relationship || "" : "",

      guardianPhone: typeof guardian === "object" ? guardian?.phone || "" : "",
    });

    setError("");
    setSuccess("");
    setEditMode(true);
  };

  /* =========================================================
     HANDLE INPUT CHANGE
     ========================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================================
     CANCEL EDIT
     ========================================================= */

  const handleCancel = () => {
    setEditMode(false);
    setError("");
    setSuccess("");
  };

  /* =========================================================
     UPLOAD PROFILE IMAGE
     ========================================================= */

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPG, JPEG, PNG, or WEBP image.");

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must not exceed 5 MB.");

      event.target.value = "";
      return;
    }

    try {
      setImageUploading(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      const formData = new FormData();

      formData.append("profileImage", file);

      const response = await api.put("/students/profile/image", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const newImage = response.data?.profileImage || "";

      /* ================================================
         UPDATE LOCAL STORAGE
         ================================================ */

      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          const currentUser = JSON.parse(storedUser);

          localStorage.setItem(
            "user",
            JSON.stringify({
              ...currentUser,
              profileImage: newImage,
            }),
          );
        } catch (err) {
          console.error("Unable to update local user:", err);
        }
      }

      setSuccess("Profile image updated successfully.");

      /* Fetch latest database profile */
      await fetchProfile();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Profile image upload error:", err);

      setError(
        err.response?.data?.message || "Unable to upload profile image.",
      );
    } finally {
      setImageUploading(false);

      event.target.value = "";
    }
  };

  /* =========================================================
     REMOVE PROFILE IMAGE
     ========================================================= */

  const handleRemoveImage = async () => {
    try {
      setImageRemoving(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      await api.delete("/students/profile/image", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      /* ================================================
         UPDATE LOCAL STORAGE
         ================================================ */

      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          const currentUser = JSON.parse(storedUser);

          localStorage.setItem(
            "user",
            JSON.stringify({
              ...currentUser,
              profileImage: "",
            }),
          );
        } catch (err) {
          console.error("Unable to update local user:", err);
        }
      }

      setSuccess("Profile image removed successfully.");

      await fetchProfile();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Remove profile image error:", err);

      setError(
        err.response?.data?.message || "Unable to remove profile image.",
      );
    } finally {
      setImageRemoving(false);
    }
  };

  /* =========================================================
     SAVE PROFILE
     ========================================================= */

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),

        dateOfBirth: form.dateOfBirth || undefined,

        gender: form.gender,

        address: form.address.trim(),

        guardian: {
          name: form.guardianName.trim(),
          relationship: form.guardianRelationship.trim(),
          phone: form.guardianPhone.trim(),
        },
      };

      const response = await api.put("/students/profile", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfile(response.data);

      /* =====================================================
         UPDATE LOCAL STORAGE USER
         ===================================================== */

      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          const currentUser = JSON.parse(storedUser);

          const currentProfileImage = currentUser.profileImage || "";

          const updatedUser = {
            ...currentUser,
            name: form.name.trim(),
            phone: form.phone.trim(),
            profileImage: currentProfileImage,
          };

          localStorage.setItem("user", JSON.stringify(updatedUser));
        } catch (err) {
          console.error("Unable to update local user:", err);
        }
      }

      setSuccess("Profile updated successfully.");

      setEditMode(false);

      await fetchProfile();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Profile update error:", err);

      setError(err.response?.data?.message || "Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     LOADING
     ========================================================= */

  if (loading) {
    return (
      <section className="py-8">
        <div className="animate-pulse">
          <div className="h-8 w-40 rounded-lg bg-black/[0.06]" />

          <div className="mt-2 h-4 w-72 rounded-lg bg-black/[0.04]" />

          <div className="mt-8 h-[280px] rounded-[28px] bg-black/[0.04]" />

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <div className="h-64 rounded-[24px] bg-black/[0.04]" />

            <div className="h-64 rounded-[24px] bg-black/[0.04]" />
          </div>
        </div>
      </section>
    );
  }

  /* =========================================================
     ERROR
     ========================================================= */

  if (error && !profile) {
    return (
      <section className="py-8">
        <div className="rounded-[24px] border border-black/[0.08] bg-white/[0.65] p-8 text-center shadow-[0_18px_50px_rgba(0,0,0,0.05)] backdrop-blur-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-black/[0.05]">
            <User size={20} className="text-black/50" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-black">
            Unable to load profile
          </h2>

          <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-black/40">
            {error}
          </p>
        </div>
      </section>
    );
  }

  /* =========================================================
     PROFILE DATA
     ========================================================= */

  const { student, user } = getStudentAndUser();

  const name = user?.name || student?.name || "Student";

  const email = user?.email || student?.email || "";

  const phone = user?.phone || student?.phone || "";

  const role = user?.role || student?.role || "student";

  const profileImage = user?.profileImage || student?.profileImage || "";

  const studentId = student?.studentId || profile?.studentId;

  const course = student?.course || profile?.course;

  const semester = student?.semester ?? profile?.semester;

  const section = student?.section || profile?.section;

  const gender = student?.gender || profile?.gender;

  const dateOfBirth =
    student?.dateOfBirth ||
    student?.dob ||
    profile?.dateOfBirth ||
    profile?.dob;

  const address = student?.address || profile?.address;

  const admissionDate = student?.admissionDate || profile?.admissionDate;

  const guardian = student?.guardian || profile?.guardian || {};

  const guardianName = typeof guardian === "object" ? guardian?.name : guardian;

  const guardianRelationship =
    typeof guardian === "object" ? guardian?.relationship : "";

  const guardianPhone = typeof guardian === "object" ? guardian?.phone : "";

  /* =========================================================
     INITIALS
     ========================================================= */

  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  /* =========================================================
     INFO ROW
     ========================================================= */

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 border-b border-black/[0.06] py-4 last:border-0">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black/[0.04]">
        <Icon size={15} className="text-black/45" />
      </div>

      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-black/30">
          {label}
        </p>

        <p className="mt-1 break-words text-xs font-medium text-black/75">
          {getValue(value)}
        </p>
      </div>
    </div>
  );

  /* =========================================================
     UI
     ========================================================= */

  return (
    <section className="py-6 sm:py-8">
      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-black/30">
            Account
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-black sm:text-3xl">
            My Profile
          </h1>

          <p className="mt-2 max-w-xl text-xs leading-5 text-black/40">
            Your personal and academic information connected to the student
            portal.
          </p>
        </div>

        {!editMode ? (
          <button
            type="button"
            onClick={startEditing}
            className="
              inline-flex w-fit items-center gap-2
              rounded-full
              border border-black/[0.08]
              bg-white/[0.65]
              px-4 py-2.5
              text-[10px] font-medium
              text-black/55
              shadow-[0_10px_30px_rgba(0,0,0,0.04)]
              backdrop-blur-xl
              transition-all duration-300
              hover:bg-black/[0.05]
              hover:text-black
            "
          >
            <Pencil size={14} />
            Edit Profile
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving || imageUploading}
              className="
                inline-flex items-center gap-2
                rounded-full
                border border-black/[0.08]
                bg-white/[0.65]
                px-4 py-2.5
                text-[10px] font-medium
                text-black/50
                transition-all duration-300
                hover:bg-black/[0.05]
                hover:text-black
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <X size={14} />
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || imageUploading}
              className="
                inline-flex items-center gap-2
                rounded-full
                bg-black
                px-4 py-2.5
                text-[10px] font-medium
                text-white
                shadow-[0_10px_25px_rgba(0,0,0,0.14)]
                transition-all duration-300
                hover:bg-black/85
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}

              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      {/* =====================================================
          SUCCESS
          ===================================================== */}

      {success && (
        <div className="mb-5 rounded-2xl border border-black/[0.08] bg-white/[0.70] px-4 py-3 text-xs text-black/65 shadow-[0_10px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} />

            {success}
          </div>
        </div>
      )}

      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && profile && (
        <div className="mb-5 rounded-2xl border border-black/[0.08] bg-black/[0.025] px-4 py-3 text-xs text-black/65">
          {error}
        </div>
      )}

      {/* =====================================================
          EDIT FORM
          ===================================================== */}

      {editMode && (
        <div className="mb-6 rounded-[28px] border border-black/[0.08] bg-white/[0.68] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur-[28px] sm:p-7">
          <div className="mb-6">
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-black/30">
              Profile Editor
            </p>

            <h2 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-black">
              Update your information
            </h2>

            <p className="mt-1 text-xs text-black/40">
              Changes will be saved directly to your student account.
            </p>
          </div>

          {/* PERSONAL EDITABLE FIELDS */}

          <div className="grid gap-5 md:grid-cols-2">
            <InputField
              label="Full Name"
              name="name"
              icon={User}
              placeholder="Your full name"
              value={form.name}
              onChange={handleChange}
            />

            <InputField
              label="Phone"
              name="phone"
              icon={Phone}
              placeholder="Your phone number"
              value={form.phone}
              onChange={handleChange}
            />

            <InputField
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              icon={CalendarDays}
              value={form.dateOfBirth}
              onChange={handleChange}
            />

            {/* GENDER */}

            <div>
              <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.16em] text-black/35">
                Gender
              </label>

              <div className="relative">
                <User
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/30"
                />

                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="
                    h-11 w-full
                    appearance-none
                    rounded-xl
                    border border-black/[0.09]
                    bg-white/[0.75]
                    pl-10 pr-3
                    text-xs
                    text-black
                    outline-none
                    transition-all duration-200
                    focus:border-black/[0.20]
                    focus:bg-white
                    focus:ring-2
                    focus:ring-black/[0.04]
                  "
                >
                  <option value="">Select gender</option>

                  <option value="male">Male</option>

                  <option value="female">Female</option>

                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* ADDRESS */}

            <div className="md:col-span-2">
              <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.16em] text-black/35">
                Address
              </label>

              <div className="relative">
                <MapPin
                  size={15}
                  className="pointer-events-none absolute left-3 top-3.5 text-black/30"
                />

                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Your current address"
                  rows={3}
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border border-black/[0.09]
                    bg-white/[0.75]
                    py-3 pl-10 pr-3
                    text-xs
                    text-black
                    outline-none
                    transition-all duration-200
                    placeholder:text-black/25
                    focus:border-black/[0.20]
                    focus:bg-white
                    focus:ring-2
                    focus:ring-black/[0.04]
                  "
                />
              </div>
            </div>
          </div>

          {/* =================================================
              GUARDIAN
              ================================================= */}

          <div className="mt-7 border-t border-black/[0.07] pt-6">
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-black">
                Guardian Information
              </h3>

              <p className="mt-1 text-[10px] text-black/35">
                Update your emergency or family contact information.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <InputField
                label="Guardian Name"
                name="guardianName"
                icon={Users}
                placeholder="Guardian name"
                value={form.guardianName}
                onChange={handleChange}
              />

              <InputField
                label="Relationship"
                name="guardianRelationship"
                icon={User}
                placeholder="Father, Mother, etc."
                value={form.guardianRelationship}
                onChange={handleChange}
              />

              <InputField
                label="Guardian Phone"
                name="guardianPhone"
                icon={Phone}
                placeholder="Guardian phone"
                value={form.guardianPhone}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* =================================================
              PROTECTED INFORMATION
              ================================================= */}

          <div className="mt-7 rounded-2xl border border-black/[0.07] bg-black/[0.025] p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={16}
                className="mt-0.5 shrink-0 text-black/35"
              />

              <div>
                <p className="text-[10px] font-semibold text-black/60">
                  Academic information is protected
                </p>

                <p className="mt-1 text-[9px] leading-4 text-black/35">
                  Student ID, course, semester, section, and admission date can
                  only be changed by authorized college staff.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          VIEW MODE
          ===================================================== */}

      {!editMode && (
        <>
          {/* PROFILE HERO */}

          <div
            className="
              relative overflow-hidden
              rounded-[28px]
              border border-black/[0.08]
              bg-white/[0.68]
              p-6
              shadow-[0_20px_60px_rgba(0,0,0,0.06)]
              backdrop-blur-[28px]
              sm:p-8
            "
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -left-20 -top-24 h-56 w-80 rounded-full bg-white/90 blur-3xl" />

              <div className="absolute -right-20 top-0 h-48 w-72 rounded-full bg-black/[0.025] blur-3xl" />
            </div>

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              {/* USER */}

              <div className="flex items-center gap-4 sm:gap-5">
                {/* =========================================
                    PROFILE IMAGE
                    ========================================= */}

                <div className="relative shrink-0">
                  {profileImage ? (
                    <img
                      src={getImageUrl(profileImage)}
                      alt={name}
                      className="
                        h-20 w-20
                        rounded-[22px]
                        border border-black/[0.08]
                        object-cover
                        shadow-[0_10px_30px_rgba(0,0,0,0.08)]
                      "
                    />
                  ) : (
                    <div
                      className="
                        flex h-20 w-20
                        items-center justify-center
                        rounded-[22px]
                        bg-black
                        text-xl
                        font-bold
                        text-white
                        shadow-[0_12px_30px_rgba(0,0,0,0.14)]
                      "
                    >
                      {initials}
                    </div>
                  )}

                  {/* CAMERA / UPLOAD */}

                  <label
                    htmlFor="profile-image-upload"
                    title="Change profile photo"
                    className="
                      absolute
                      -bottom-2
                      -right-2
                      flex
                      h-8
                      w-8
                      cursor-pointer
                      items-center
                      justify-center
                      rounded-full
                      border-2
                      border-white
                      bg-black
                      text-white
                      shadow-lg
                      transition-all
                      duration-200
                      hover:scale-105
                      hover:bg-black/80
                    "
                  >
                    {imageUploading ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Camera size={13} />
                    )}

                    <input
                      id="profile-image-upload"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageUpload}
                      disabled={imageUploading || imageRemoving}
                      className="hidden"
                    />
                  </label>

                  {/* REMOVE */}

                  {profileImage && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={imageUploading || imageRemoving}
                      title="Remove profile photo"
                      className="
                        absolute
                        -right-2
                        -top-2
                        flex
                        h-7
                        w-7
                        items-center
                        justify-center
                        rounded-full
                        border-2
                        border-white
                        bg-white
                        text-black/55
                        shadow-md
                        transition-all
                        duration-200
                        hover:bg-black
                        hover:text-white
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                    >
                      {imageRemoving ? (
                        <Loader2 size={11} className="animate-spin" />
                      ) : (
                        <Trash2 size={11} />
                      )}
                    </button>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-xl font-semibold tracking-[-0.03em] text-black">
                      {name}
                    </h2>

                    <span className="inline-flex items-center gap-1 rounded-full bg-black/[0.05] px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.12em] text-black/45">
                      <ShieldCheck size={11} />

                      {role}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-black/40">
                    {getValue(email, "No email available")}
                  </p>

                  <p className="mt-2 text-[10px] text-black/30">
                    Student ID · {getValue(studentId)}
                  </p>

                  <p className="mt-2 text-[9px] text-black/25">
                    Click the camera icon to change your photo
                  </p>
                </div>
              </div>

              {/* ACADEMIC SUMMARY */}

              <div className="grid grid-cols-3 gap-2 sm:min-w-[330px]">
                <div className="rounded-2xl border border-black/[0.07] bg-black/[0.025] p-3 text-center">
                  <p className="text-[8px] uppercase tracking-[0.14em] text-black/30">
                    Semester
                  </p>

                  <p className="mt-1 text-sm font-semibold text-black">
                    {getValue(semester, "—")}
                  </p>
                </div>

                <div className="rounded-2xl border border-black/[0.07] bg-black/[0.025] p-3 text-center">
                  <p className="text-[8px] uppercase tracking-[0.14em] text-black/30">
                    Section
                  </p>

                  <p className="mt-1 text-sm font-semibold text-black">
                    {getValue(section, "—")}
                  </p>
                </div>

                <div className="rounded-2xl border border-black/[0.07] bg-black/[0.025] p-3 text-center">
                  <p className="text-[8px] uppercase tracking-[0.14em] text-black/30">
                    Course
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold text-black">
                    {course
                      ? course.includes(" ")
                        ? course.split(" ").slice(-1)[0]
                        : course
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              INFORMATION GRID
              ================================================= */}

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* PERSONAL */}

            <div
              className="
                rounded-[24px]
                border border-black/[0.08]
                bg-white/[0.62]
                p-5
                shadow-[0_18px_50px_rgba(0,0,0,0.05)]
                backdrop-blur-[26px]
                sm:p-6
              "
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/[0.05]">
                  <User size={17} className="text-black/55" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-black">
                    Personal Information
                  </h3>

                  <p className="mt-0.5 text-[9px] uppercase tracking-[0.16em] text-black/30">
                    Basic details
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <InfoRow icon={Mail} label="Email" value={email} />

                <InfoRow icon={Phone} label="Phone" value={phone} />

                <InfoRow
                  icon={CalendarDays}
                  label="Date of Birth"
                  value={formatDate(dateOfBirth)}
                />

                <InfoRow icon={User} label="Gender" value={gender} />

                <InfoRow icon={MapPin} label="Address" value={address} />
              </div>
            </div>

            {/* ACADEMIC */}

            <div
              className="
                rounded-[24px]
                border border-black/[0.08]
                bg-white/[0.62]
                p-5
                shadow-[0_18px_50px_rgba(0,0,0,0.05)]
                backdrop-blur-[26px]
                sm:p-6
              "
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/[0.05]">
                  <GraduationCap size={17} className="text-black/55" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-black">
                    Academic Information
                  </h3>

                  <p className="mt-0.5 text-[9px] uppercase tracking-[0.16em] text-black/30">
                    College records
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <InfoRow icon={Hash} label="Student ID" value={studentId} />

                <InfoRow icon={BookOpen} label="Course" value={course} />

                <InfoRow
                  icon={GraduationCap}
                  label="Semester"
                  value={semester}
                />

                <InfoRow icon={Users} label="Section" value={section} />

                <InfoRow
                  icon={CalendarDays}
                  label="Admission Date"
                  value={formatDate(admissionDate)}
                />
              </div>
            </div>
          </div>

          {/* =================================================
              GUARDIAN
              ================================================= */}

          <div
            className="
              mt-6
              rounded-[24px]
              border border-black/[0.08]
              bg-white/[0.62]
              p-5
              shadow-[0_18px_50px_rgba(0,0,0,0.05)]
              backdrop-blur-[26px]
              sm:p-6
            "
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/[0.05]">
                <Users size={17} className="text-black/55" />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-black">
                  Guardian Information
                </h3>

                <p className="mt-0.5 text-[9px] uppercase tracking-[0.16em] text-black/30">
                  Emergency / family contact
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-black/[0.07] bg-black/[0.025] p-4">
                <p className="text-[9px] uppercase tracking-[0.16em] text-black/30">
                  Guardian
                </p>

                <div className="mt-2 space-y-1.5">
                  <p className="text-sm font-medium text-black/75">
                    {getValue(guardianName)}
                  </p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <p className="text-[10px] text-black/40">
                      Relationship:{" "}
                      <span className="text-black/60">
                        {getValue(guardianRelationship, "Not provided")}
                      </span>
                    </p>

                    <p className="text-[10px] text-black/40">
                      Phone:{" "}
                      <span className="text-black/60">
                        {getValue(guardianPhone, "Not provided")}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* ACCOUNT STATUS */}

              <div className="rounded-2xl border border-black/[0.07] bg-black/[0.025] p-4">
                <p className="text-[9px] uppercase tracking-[0.16em] text-black/30">
                  Account Status
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-black" />

                  <span className="text-sm font-medium text-black/75">
                    Active Student Account
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default StudentProfile;
