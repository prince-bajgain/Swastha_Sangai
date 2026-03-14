import { SearchIcon } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { MdCreate, MdDelete, MdNotifications, MdComment } from "react-icons/md";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import CommentSection from "../components/CommentSection";

const DonateMain = () => {
  const navigate = useNavigate();
  const { userData, backendUrl } = useContext(AuthContext);

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [creating, setCreating] = useState(false);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/api/donations`, {
        withCredentials: true,
      });
      setDonations(res.data.donations);
    } catch (error) {
      toast.error("Failed to fetch donations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

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

      fetchDonations();
    } catch (error) {
      toast.error("Failed to create donation");
    } finally {
      setCreating(false);
    }
  };

  const myDonations = donations.filter((d) => d.creatorId === userData?.id);
  const otherDonations = donations.filter(
    (d) => d.creatorId !== userData?.id && d.isActive === true
  );

  const [activeComments, setActiveComments] = useState(null);

  const handleToggleComments = (donationId) => {
    setActiveComments((prev) => (prev === donationId ? null : donationId));
  };

  return (
     <div className='w-full h-full flex px-10 py-10 flex-col'>
           
            <div id="top" className='w-full h-15 bg-foreground/10 rounded-xl p-3 flex justify-between mb-10'>
                <div className='w-80 h-full rounded-full bg-foreground/20 flex gap-6 items-center justify-center px-4 py-2 mb-4'>
                    <input type="text" placeholder='Search for Donation' className='outline-none  w-full' />
                    <SearchIcon />
                </div>
                <div className='flex items-center  gap-6'>
                    <MdNotifications size={20} />
                    <Avatar className="size-6 relative overflow-visible cursor-pointer" onClick={() => { navigate('/home/fitness-profile') }}>
                        <AvatarImage
                            src={userData?.profileImage ?
                                `${backendUrl}/profile-pics/${userData?.profileImage}`
                                : "/profile_pic_placeholder.jpg"
                            }
                            className="rounded-full"
                        />
                        <AvatarFallback>profileImage</AvatarFallback>
                    </Avatar>
                </div>
            </div>
    
      <div className="flex justify-between items-center">

        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-white">
            Donation <span className="text-green-400">Posts</span>
          </h1>
          <span className="text-sm text-muted-foreground">
            Share or apply for donation posts
          </span>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex gap-2 items-center px-5 py-2 bg-green-600 rounded-full hover:bg-green-500 cursor-pointer"
        >
          <MdCreate /> Create Donation
        </button>

      </div>

      
      <div className="flex gap-4 h-full">

       
        <div className="w-1/2 bg-foreground/10 rounded-xl p-4 flex flex-col">
          <span className="text-xl tracking-wide">_ Your Posts</span>

          <div className="flex flex-col gap-3 mt-4 overflow-y-auto h-[80vh]">

            {myDonations.length === 0 && (
              <span className="text-muted-foreground">
                You haven’t created any donation posts.
              </span>
            )}

            {myDonations.map((donation) => (
              <div
                key={donation.id}
                className="flex flex-col bg-foreground/20 rounded-xl p-3 gap-4"
              >

                <div className="flex gap-4">

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
                      <h2 className="text-lg font-semibold">
                        {donation.title}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {donation.description}
                      </p>
                    </div>

                    <div className="flex justify-between mt-2 items-center">

                      <div className="flex gap-3">

                        <button
                        onClick={() => {
                           setNewTitle(donation.title);
                          setNewDescription(donation.description);
                           setShowCreateModal(true);
                          }}
                           className="flex gap-2 items-center px-3 py-1 bg-green-500 text-white rounded-full hover:bg-green-600"
                           >
                          <MdCreate /> Edit
                          </button>

                        <button
                          onClick={() => deleteDonation(donation.id)}
                          className="flex gap-2 items-center px-3 py-1 bg-red-200 text-red-600 rounded-full"
                        >
                          <MdDelete /> Delete
                        </button>

                      </div>

                      <span
                        className={`flex gap-2 items-center px-4 py-2 rounded-full text-sm ${
                          donation.isActive
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {donation.isActive ? "Active" : "Inactive"}
                      </span>

                    </div>

                  </div>

                </div>

                <button
                  className="flex gap-2 items-center px-3 py-1 mt-2 bg-primary/20 text-primary rounded-full"
                  onClick={() => handleToggleComments(donation.id)}
                >
                  <MdComment />
                  {activeComments === donation.id
                    ? "Hide Comments"
                    : "Show Comments"}
                </button>

                {activeComments === donation.id && (
                  <CommentSection donationId={donation.id} />
                )}

              </div>
            ))}

          </div>
        </div>

      
        <div className="w-1/2 bg-foreground/10 rounded-xl p-4 flex flex-col">
          <span className="text-xl tracking-wide">_ Donations</span>

          <div className="flex flex-col gap-3 mt-4 overflow-y-auto h-[80vh]">

            {otherDonations.length === 0 && (
              <span className="text-muted-foreground">
                No active donation posts available.
              </span>
            )}

            {otherDonations.map((donation) => (
              <div
                key={donation.id}
                className="flex flex-col bg-foreground/20 rounded-xl p-3 gap-4"
              >

                <div className="flex gap-4">

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
                      <h2 className="text-lg font-semibold">
                        {donation.title}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {donation.description}
                      </p>
                    </div>

                    <button
                      onClick={() => applyForDonation(donation.id)}
                      className="flex gap-2 w-fit items-center px-4 py-1 bg-primary/20 text-primary rounded-full"
                    >
                      <MdCreate /> Apply
                    </button>

                  </div>

                </div>

                <button
                  className="flex gap-2 items-center px-3 py-1 mt-2 bg-primary/20 text-primary rounded-full"
                  onClick={() => handleToggleComments(donation.id)}
                >
                  <MdComment />
                  {activeComments === donation.id
                    ? "Hide Comments"
                    : "Show Comments"}
                </button>

                {activeComments === donation.id && (
                  <CommentSection donationId={donation.id} />
                )}

              </div>
            ))}

          </div>
        </div>

      </div>

      
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">

          <div className="bg-foreground p-6 rounded-xl w-1/3 flex flex-col gap-4">

            <h2 className="text-lg font-semibold">Create Donation</h2>

            <input
              type="text"
              placeholder="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="px-3 py-2 rounded bg-background/20"
            />

            <textarea
              placeholder="Description"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="px-3 py-2 rounded bg-background/20"
            />

            <input
              type="file"
              onChange={(e) => setNewImage(e.target.files[0])}
            />

            <div className="flex justify-end gap-3">

              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded bg-red-500 text-white"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateDonation}
                disabled={creating}
                className="px-4 py-2 rounded bg-green-600 text-white"
              >
                {creating ? "Creating..." : "Create"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default DonateMain;