import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import axios from "axios";
import { SearchIcon } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { BiLike } from "react-icons/bi";
import { MdCreate, MdDelete, MdNotifications } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";

const DonateMain = () => {
  const navigate = useNavigate();
  const { userData, backendUrl } = useContext(AuthContext);

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);

  // ----- Create Donation -----
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [creating, setCreating] = useState(false);

  // ---------------- FETCH DONATIONS ----------------
  const fetchDonations = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/api/donations`, {
        withCredentials: true,
      });
      setDonations(res.data.donations);
      console.log("Donations: ", res.data.donations);

    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch donations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleLikeToggle = async (donation) => {
  try {
    const res = await axios.post(
      `${backendUrl}/api/donations/${donation.id}/react`,
      { type: "LIKE" }, // always "LIKE"
      { withCredentials: true }
    );

    // Update local state
    setDonations((prev) =>
      prev.map((d) => {
        if (d.id === donation.id) {
          return {
            ...d,
            userReaction: d.userReaction === "LIKE" ? null : "LIKE",
            likeCount: res.data.likeCount, // backend should return updated count
            dislikeCount: res.data.dislikeCount, // if needed
          };
        }
        return d;
      })
    );
  } catch (error) {
    console.error(error);
    toast.error("Failed to toggle like");
  }
};

  // ---------------- APPLY FOR DONATION ----------------
  const applyForDonation = async (donationPostId) => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/donations/apply`,
        { donationPostId },
        { withCredentials: true }
      );
      toast.success(res.data.message);
      fetchDonations();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Already applied");
    }
  };

  // ---------------- DELETE DONATION ----------------
  const deleteDonation = async (id) => {
    try {
      await axios.delete(`${backendUrl}/api/donations/${id}`, {
        withCredentials: true,
      });
      toast.success("Donation deleted");
      fetchDonations();
    } catch (error) {
      toast.error("Failed to delete donation");
    }
  };

  // ---------------- CREATE DONATION ----------------
  const handleCreateDonation = async () => {
    if (!newTitle || !newDescription) {
      return toast.error("Title and description are required");
    }

    try {
      setCreating(true);
      const formData = new FormData();
      formData.append("title", newTitle);
      formData.append("description", newDescription);
      if (newImage) formData.append("image", newImage);

      const res = await axios.post(`${backendUrl}/api/donations`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res.data.message);
      setShowCreateModal(false);
      setNewTitle("");
      setNewDescription("");
      setNewImage(null);

      fetchDonations(); // refresh list
    } catch (error) {
      console.error(error);
      toast.error("Failed to create donation");
    } finally {
      setCreating(false);
    }
  };

  // ---------------- FILTER ----------------
  const myDonations = donations.filter((d) => d.creatorId === userData?.id);
  const otherDonations = donations.filter((d) => d.creatorId !== userData?.id && d.isActive === true);

  return (
    <div className="w-full h-full flex px-10 py-10 flex-col">
      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-1/3 flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Create Donation Post</h2>

            <input
              type="text"
              placeholder="Title"
              className="border p-2 rounded"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />

            <textarea
              placeholder="Description"
              className="border p-2 rounded"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />

            <input type="file" onChange={(e) => setNewImage(e.target.files[0])} />

            <div className="flex justify-end gap-3 mt-2">
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-primary text-white rounded"
                onClick={handleCreateDonation}
                disabled={creating}
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP BAR */}
      <div className="w-full h-15 bg-foreground/10 rounded-xl p-3 flex justify-between mb-10">
        <div className="w-80 h-full rounded-full bg-foreground/20 flex gap-6 items-center px-4">
          <input
            type="text"
            placeholder="Search for Donations"
            className="outline-none w-full bg-transparent"
          />
          <SearchIcon />
        </div>
        <div className="flex items-center gap-6">
          <MdNotifications size={20} />
          <Avatar
            className="size-6 cursor-pointer"
            onClick={() => navigate("/home/fitness-profile")}
          >
            <AvatarImage
              src={
                userData?.profileImage
                  ? `${backendUrl}/profile-pics/${userData.profileImage}`
                  : "/profile_pic_placeholder.jpg"
              }
            />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-semibold">
            Donation{" "}
            <span className="text-transparent bg-linear-to-bl from-primary to-foreground bg-clip-text">
              Posts
            </span>
          </h1>
          <p className="text-muted-foreground">
            Share or apply for donation posts
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex gap-2 items-center px-4 py-2 bg-primary/20 text-primary rounded-full hover:bg-primary/30"
        >
          <MdCreate />
          Create Donation
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex gap-4 h-full">
        {/* LEFT - YOUR POSTS */}
        <div className="w-1/2 bg-foreground/10 rounded-xl p-4">
          <span className="text-xl tracking-wide">_ Your Posts</span>
          <div className="flex flex-col gap-3 mt-4 overflow-y-auto h-[85%]">
            {myDonations.length === 0 && (
              <span className="text-muted-foreground">
                You haven’t created any donation posts.
              </span>
            )}

            {myDonations.map((donation) => (
              <div
                key={donation.id}
                className="flex bg-foreground/20 rounded-xl p-3 gap-4"
              >
                <img
                  src={
                    donation.image
                      ? `${backendUrl}/donation-images/${donation.image}`
                      : "/donation_placeholder.jpg"
                  }
                  className="w-40 h-28 object-cover rounded-lg"
                />
                <div className="flex flex-col justify-between w-full">
                  <div>
                    <h2 className="text-lg font-semibold">{donation.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {donation.description}
                    </p>
                  </div>

                  <div className="flex justify-between mt-2">
                    {/* Edit functionality can be implemented later */}
                    <div className="flex gap-3">
                      <button className="flex gap-2 items-center px-3 py-1 bg-primary/20 text-primary rounded-full">
                        <MdCreate /> Edit
                      </button>
                      <button
                        onClick={() => deleteDonation(donation.id)}
                        className="flex gap-2 items-center px-3 py-1 bg-background/20 text-red-400 rounded-full"
                      >
                        <MdDelete /> Delete
                      </button>
                      {/* LIKE TOGGLE BUTTON */}
                      <button
                        onClick={() => handleLikeToggle(donation)}
                        className={`flex items-center gap-1 px-2 py-1 rounded ${donation.userReaction === "LIKE"
                            ? "bg-blue-500 text-white"
                            : "bg-background/20"
                          }`}
                      >
                        <BiLike />
                        {donation.likeCount || 0}
                      </button>
                    </div>
                    <span className={`flex gap-2 items-center px-4 py-2 bg-background/20  rounded-full transition-all duration-500 ${donation.isActive === true ? "text-green-300" : "text-red-400"}`}>{donation.isActive === true ? "Active" : "Inactive"}</span>


                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT - ALL DONATIONS */}
        <div className="w-1/2 bg-foreground/10 rounded-xl p-4">
          <span className="text-xl tracking-wide">_ Donations</span>
          <div className="flex flex-col gap-3 mt-4 overflow-y-auto h-[85%]">
            {otherDonations.length === 0 && (
              <span className="text-muted-foreground">
                No active donation posts available.
              </span>
            )}

            {otherDonations.map((donation) => (
              <div
                key={donation.id}
                className="flex bg-foreground/20 rounded-xl p-3 gap-4"
              >
                <img
                  src={
                    donation.image
                      ? `${backendUrl}/donation-images/${donation.image}`
                      : "/donation_placeholder.jpg"
                  }
                  className="w-40 h-28 object-cover rounded-lg"
                />
                <div className="flex flex-col justify-between w-full">
                  <div>
                    <h2 className="text-lg font-semibold">{donation.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {donation.description}
                    </p>
                  </div>

                  <button
                    onClick={() => applyForDonation(donation.id)}
                    className="flex gap-2 w-fit items-center px-4 py-1 bg-primary/20 text-primary rounded-full hover:bg-primary/30"
                  >
                    <MdCreate />
                    Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonateMain;
