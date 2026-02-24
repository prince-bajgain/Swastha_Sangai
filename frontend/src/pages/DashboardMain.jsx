import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { MdApproval } from "react-icons/md";
import axios from "axios";
import { toast } from "react-toastify";

const DashboardMain = () => {
  const navigate = useNavigate();
  const { userData, backendUrl } = useContext(AuthContext);
  const [sentPendingRequests, setSentPendingRequests] = useState([]);
  const [donations, setDonations] = useState([]);
  const [incomingDonationApps, setIncomingDonationApps] = useState([]);
  const [outgoingDonationApps, setOutgoingDonationApps] = useState([]);
  const [receivedPendingRequests, setReceivedPendingRequests] = useState([]);

  // Fetching Incoming donation applications

  const fetchIncomingDonationApplications = async () => {
    try {
        const response = await axios.get(`${backendUrl}/api/donations/incoming-applications`,{withCredentials: true});
        console.log(response.data?.applications);
        setIncomingDonationApps(response.data.applications);
        console.log("Successfully fetched incoming donation applications.");
    } catch (error) {
      console.log(error?.response?.data?.message);
      console.log("Error occured while fetching incoming donation applications.");
      
      
    }
  }

  useEffect(()=>{
    fetchIncomingDonationApplications();
  },[]);

  // Fetching Outgoing donation applications

  const fetchOutgoingDonationApplications = async () => {
    try {
        const response = await axios.get(`${backendUrl}/api/donations/outgoing-applications`,{withCredentials: true});
        console.log(response.data?.applications);
        setOutgoingDonationApps(response.data.applications);
        console.log("Successfully fetched outgoing donation applications.");
    } catch (error) {
      console.log(error?.response?.data?.message);
      console.log("Error occured while fetching outgoing donation applications.");
      
      
    }
  }

  useEffect(()=>{
    fetchOutgoingDonationApplications();
  },[]);

  // ---------------- FETCH DONATIONS ----------------
  const fetchDonations = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/donations`, {
        withCredentials: true,
      });
      console.log(res.data.donations);
      
      setDonations(res.data.donations);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch donations");
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchSentPendingRequests = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/friendship/sent-pending-requests`, { withCredentials: true });
      setSentPendingRequests(response.data.sentRequests);
      console.log("All pending sent requests fetched successfully");

    } catch (error) {
      console.log("Error while fetching sent pending requests.", error?.response?.data?.message);
    }
  }

  const acceptApplication = async (data) => {
    try {
      const response = await axios.patch(`${backendUrl}/api/donations/application/status`,data, { withCredentials: true });
      toast.success("Application accepted successfully.")
      console.log("The donation application got accepted successfully.");
    } catch (error) {
      console.log("Error while accepting donation application.", error?.response?.data?.message);
      toast.error(error.response?.data?.message);
    }
  }


  const fetchReceivedPendingRequests = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/friendship/received-pending-requests`, { withCredentials: true });
      setReceivedPendingRequests(response.data.receivedRequests);
      console.log(response.data?.message);
      console.log(response.data.receivedPendingRequests);


    } catch (error) {
      console.log("Error while fetching received pending requests.", error?.response?.data?.message);
    }
  }

  const acceptFriendRequest = async (senderId) => {
    try {
      const response = await axios.post(`${backendUrl}/api/friendship/accept-request`, { senderId: senderId }, { withCredentials: true });
      toast.success(response?.data?.message);
      fetchReceivedPendingRequests();
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  }

  useEffect(() => {
    fetchReceivedPendingRequests();
    fetchSentPendingRequests();
  }, [])


  return (
    <div className='flex flex-col w-full h-full p-3'>
      <div id="top" className='flex w-full gap-3 p-3 h-1/2'>
        <div id="left" className='w-2/4 h-full flex flex-col gap-3 py-3 px-5 rounded-xl bg-foreground/10'>
          <span className='text-2xl tracking-[0.1em] text-foreground/80 font-space-grotesk'>_ Incoming Pending Requests</span>
          <div className='main_list flex flex-col p-2 overflow-scroll gap-3 h-[85%]'>
            {receivedPendingRequests.length > 0 ? receivedPendingRequests.map((request) => (
              <div id="left" className='w-full min-h-20 bg-foreground/20 flex justify-between gap-4 items-center px-3 rounded-xl'>
                <div className="left flex gap-4 items-center">
                  <Avatar className="size-15 relative overflow-visible cursor-pointer" onClick={() => { navigate('/home/fitness-profile') }}>
                    <AvatarImage
                      src={
                        request?.sender?.profileImage
                          ? `${backendUrl}/profile-pics/${request?.sender?.profileImage}`
                          : "/profile_pic_placeholder.jpg"
                      }
                      className="rounded-full"
                    />


                    <AvatarFallback>profileImage</AvatarFallback>
                    <div className='absolute bottom-0 right-0 size-4 bg-green-500 rounded-full border-2 border-background/20'></div>
                  </Avatar>

                  <div className='flex flex-col gap-1'>
                    <span className='ml-3 font-semibold'>{request.sender.fullName}</span>
                    <span className='ml-3 text-xs text-slate-400'>Online</span>
                  </div>
                </div>
                <div className='flex items-center'>
                  <span className='flex gap-2 items-center px-4 py-2 bg-primary/20 text-primary rounded-full cursor-pointer hover:bg-primary/30 transition-all duration-500' onClick={() => acceptFriendRequest(request.sender.id)}>
                    <MdApproval />
                    <span>Accept Now</span>
                  </span>
                </div>

              </div>
            )) : <span className='text-muted-foreground'>No any pending incoming requests.</span>}

          </div>


        </div>
        <div id="left" className='w-2/4 h-full flex flex-col gap-3 py-3 px-5 rounded-xl bg-foreground/10'>
          <span className='text-2xl tracking-[0.1em] text-foreground/80 font-space-grotesk'>_ Outgoing Pending Requests</span>
          <div className='main_list flex flex-col p-2 overflow-scroll gap-3 h-[85%]'>
            {sentPendingRequests.length > 0 ? sentPendingRequests.map((request) => (
              <div id="left" className='w-full min-h-20 bg-foreground/20 flex justify-between gap-4 items-center px-3 rounded-xl'>
                <div className="left flex gap-4 items-center">
                  <Avatar className="size-15 relative overflow-visible cursor-pointer" onClick={() => { navigate('/home/fitness-profile') }}>
                    <AvatarImage
                      src={
                        request?.receiver?.profileImage
                          ? `${backendUrl}/profile-pics/${request?.receiver?.profileImage}`
                          : "/profile_pic_placeholder.jpg"
                      }
                      className="rounded-full"
                    />


                    <AvatarFallback>profileImage</AvatarFallback>
                    <div className='absolute bottom-0 right-0 size-4 bg-green-500 rounded-full border-2 border-background/20'></div>
                  </Avatar>

                  <div className='flex flex-col gap-1'>
                    <span className='ml-3 font-semibold'>{request.receiver.fullName}</span>
                    <span className='ml-3 text-xs text-slate-400'>Online</span>
                  </div>
                </div>
                <div className='flex items-center'>
                  <span className='flex gap-2 items-center px-4 py-2 bg-background/20 text-amber-300 rounded-full cursor-pointer hover:bg-foreground/30 transition-all duration-500'>
                    <MdApproval />
                    <span>pending</span>
                  </span>
                </div>

              </div>
            )) : <span className="text-muted-foreground">No any pending outgoing requests.</span>}

          </div>


        </div>
      </div>
      <div id="bottom" className='flex w-full gap-3 p-3 h-1/2'>
        <div id="left" className='w-2/4 h-full flex flex-col gap-3 py-3 px-5 rounded-xl bg-foreground/10'>
          <span className='text-2xl tracking-[0.1em] text-foreground/80 font-space-grotesk'>_ Incoming Donation Applications</span>
          <div className='main_list flex flex-col p-2 overflow-scroll gap-3 h-[85%]'>
            {incomingDonationApps.length > 0 ? incomingDonationApps.map((app) => (
              <div id="left" className='w-full min-h-20 bg-foreground/20 flex justify-between gap-4 items-center px-3 rounded-xl'>
                <div className="left flex gap-4 items-center">
                  <Avatar className="size-15 relative overflow-visible cursor-pointer" onClick={() => { navigate('/home/fitness-profile') }}>
                    <AvatarImage
                      src={
                        app?.donationPost?.image
                          ? `${backendUrl}/donation-images/${app?.donationPost?.image}`
                          : "/profile_pic_placeholder.jpg"
                      }
                    />


                    <AvatarFallback>donationPostImage</AvatarFallback>
                    <div className='absolute bottom-0 right-0 size-4 bg-green-500 rounded-full border-2 border-background/20'></div>
                  </Avatar>

                  <div className='flex flex-col gap-1'>
                    <span className='ml-3 font-semibold'>{app.donationPost.title}</span>
                    <span className='ml-3 text-xs text-slate-400'>{app.donationPost.description}</span>
                  </div>
                </div>
                <div className='flex items-center'>
                  <span className='flex gap-2 items-center px-4 py-2 bg-primary/20 text-primary rounded-full cursor-pointer hover:bg-primary/30 transition-all duration-500' onClick={() => acceptApplication({applicationId: app?.id, status:"APPROVED"})}>
                    <MdApproval />
                    <span>Accept Now</span>
                  </span>
                </div>

              </div>
            )) : <span className='text-muted-foreground'>No any pending incoming applications.</span>}

          </div>


        </div>
        <div id="left" className='w-2/4 h-full flex flex-col gap-3 py-3 px-5 rounded-xl bg-foreground/10'>
          <span className='text-2xl tracking-[0.1em] text-foreground/80 font-space-grotesk'>_ Outgoing Donation Applications</span>
          <div className='main_list flex flex-col p-2 overflow-scroll gap-3 h-[85%]'>
            {outgoingDonationApps.length > 0 ? outgoingDonationApps.map((app) => (
              <div id="left" className='w-full min-h-20 bg-foreground/20 flex justify-between gap-4 items-center px-3 rounded-xl'>
                <div className="left flex gap-4 items-center">
                  <Avatar className="size-15 relative overflow-visible cursor-pointer" onClick={() => { navigate('/home/fitness-profile') }}>
                    <AvatarImage
                      src={
                        app?.donationPost?.image
                          ? `${backendUrl}/donation-images/${app?.donationPost?.image}`
                          : "/profile_pic_placeholder.jpg"
                      }
                    />


                    <AvatarFallback>donationPostImage</AvatarFallback>
                    <div className='absolute bottom-0 right-0 size-4 bg-green-500 rounded-full border-2 border-background/20'></div>
                  </Avatar>

                  <div className='flex flex-col gap-1'>
                    <span className='ml-3 font-semibold'>{app.donationPost.title}</span>
                    <span className='ml-3 text-xs text-slate-400'>{app.donationPost.description}</span>
                  </div>
                </div>
                 <div className='flex items-center'>
                  <span className={`flex gap-2 items-center px-4 py-2 bg-background/20 ${app?.status.toLowerCase() === 'approved' ? "text-green-300" : "text-amber-300"} rounded-full transition-all duration-500`}>
                    <span>{app?.status.toLowerCase()}</span>
                  </span>
                </div>

              </div>
            )) : <span className='text-muted-foreground'>No any pending outgoing applications.</span>}

          </div>


        </div>
      </div>
    </div>
  )
}

export default DashboardMain