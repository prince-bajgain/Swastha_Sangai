import { PlusIcon, SearchIcon } from 'lucide-react'
import { useContext, useEffect, useState } from 'react'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { MdNotifications, MdVideoCall } from 'react-icons/md'
import { AuthContext } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { SocketContext } from '../context/SocketContext'
import { useRef } from 'react'

const FriendsMain = () => {
    const navigate = useNavigate();
    const { userData, backendUrl } = useContext(AuthContext);
    const [currentCallUserId, setCurrentCallUserId] = useState(null);
    const socket = useContext(SocketContext);
    const [friendsList, setFriendsList] = useState([]);
    const [isCall, setIsCall] = useState(false);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const peerConnection = useRef(null);
    const [onlineFriends, setOnlineFriends] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [suggestedFriends, setSuggestedFriends] = useState([]);

    useEffect(() => {
        console.log("My local stream is :", localStream);
    }, [localStream])

    const fetchAllUsers = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/user/getAllUsers', { withCredentials: true });
            setAllUsers(response.data?.users);
        } catch (error) {
            console.error("Error fetching all users:", error);
        }
    }

    const fetchSentRequests = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/friendship/sent-requests`, { withCredentials: true });
            setSentRequests(response.data.sentRequests);
            console.log("All pending sent requests fetched successfully");

        } catch (error) {
            console.log("Error while fetching sent pending requests.", error?.response?.data?.message);
        }
    }

    const startCall = async (friendId) => {
        try {
            console.log("Requesting Caller media devices...");

            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });

            console.log("Caller Media stream acquired:", stream);

            setLocalStream(stream);

            const pc = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                ]
            });

            peerConnection.current = pc;

            stream.getTracks().forEach(track => {
                pc.addTrack(track, stream);
            });

            pc.onconnectionstatechange = () => {
                console.log("Peer connection state:", pc.connectionState);
            };

            pc.oniceconnectionstatechange = () => {
                console.log("ICE connection state:", pc.iceConnectionState);
            };

            pc.ontrack = (event) => {
                console.log("Remote track received:", event.streams);
                setRemoteStream(event.streams[0]);
            };

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    console.log("Sending ICE candidate");
                    socket.emit("ice-candidate", {
                        candidate: event.candidate,
                        to: friendId,
                    });
                }
            };

            pc.onconnectionstatechange = () => {
                if (pc.connectionState === "disconnected" ||
                    pc.connectionState === "failed" ||
                    pc.connectionState === "closed") {
                    endCallCleanup();
                }
            };

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            console.log("Sending offer:", offer);

            socket.emit("outgoing:call", {
                fromOffer: offer,
                to: friendId,
            });

            setCurrentCallUserId(friendId);
            setIsCall(true);

        } catch (error) {
            console.error("Media error:", error);

            if (error.name === "NotAllowedError") {
                toast.error("Camera/Microphone permission denied.");
            } else if (error.name === "NotFoundError") {
                toast.error("No camera or microphone found.");
            } else if (error.name === "NotReadableError") {
                toast.error("Camera is already in use by another application.");
            } else if (error.name === "OverconstrainedError") {
                toast.error("Requested media constraints not supported.");
            } else if (error.name === "SecurityError") {
                toast.error("Media access requires HTTPS.");
            } else {
                toast.error("Failed to access camera/microphone.");
            }
        }
    };

    const endCallCleanup = () => {
        if (peerConnection.current) {
            peerConnection.current.ontrack = null;
            peerConnection.current.onicecandidate = null;
            peerConnection.current.close();
            peerConnection.current = null;
        }

        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }

        setLocalStream(null);
        setRemoteStream(null);
        setCurrentCallUserId(null);
        setIsCall(false);
    };

    useEffect(() => {
        if (!socket) return;

        const handleIncomingCall = async ({ offer, from }) => {
            console.log("📞 Incoming call from:", from);

            try {
                // 1️⃣ Request media
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });
                setLocalStream(stream);
                console.log("✅ Local media ready:", stream);

                // 2️⃣ Create peer connection
                const pc = new RTCPeerConnection({
                    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
                });
                peerConnection.current = pc;

                // 3️⃣ Add local tracks
                stream.getTracks().forEach(track => pc.addTrack(track, stream));

                // 4️⃣ Handle remote tracks
                pc.ontrack = (event) => {
                    console.log("🎥 Remote stream received:", event.streams);
                    setRemoteStream(event.streams[0]);
                };

                // 5️⃣ Handle ICE candidates
                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        socket.emit("ice-candidate", {
                            candidate: event.candidate,
                            to: from, // must be sender's userId
                        });
                    }
                };

                pc.onconnectionstatechange = () => {
                    if (pc.connectionState === "disconnected" ||
                        pc.connectionState === "failed" ||
                        pc.connectionState === "closed") {
                        endCallCleanup();
                    }
                };

                // 6️⃣ Set remote description
                await pc.setRemoteDescription(new RTCSessionDescription(offer));
                console.log("📥 Remote description set");

                // 7️⃣ Create answer
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                // 8️⃣ Send answer back
                socket.emit("call:accepted", { answer, to: from });
                console.log("📤 Answer sent");

                setIsCall(true);
                setCurrentCallUserId(from); // This is socket ID

            } catch (err) {
                console.error("❌ Error during incoming call:", err);
            }
        };

        const handleIncomingAnswer = async ({ answer }) => {
            if (!peerConnection.current) return;
            console.log("📥 Answer received:", answer);
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        };

        const handleIncomingIce = async ({ candidate }) => {
            if (!peerConnection.current) return;
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        };

        const handleCallEnded = () => {
            console.log("📴 Call ended by remote user");
            endCallCleanup();
        };


        socket.on("incoming:call", handleIncomingCall);
        socket.on("incoming:answer", handleIncomingAnswer);
        socket.on("ice-candidate", handleIncomingIce);
        socket.on("call-ended", handleCallEnded);

        return () => {
            socket.off("incoming:call", handleIncomingCall);
            socket.off("incoming:answer", handleIncomingAnswer);
            socket.off("ice-candidate", handleIncomingIce);
            socket.off("call-ended", handleCallEnded);
        };
    }, [socket]);

    useEffect(() => {
        console.log("Hello I am soket", socket);

    }, [socket])

    useEffect(() => {
        if (!userData || !allUsers) return;


        const friendIds = userData.friends.map(friend =>
            friend.userId === userData.id ? friend.friendId : friend.userId
        );

        const friends = allUsers.filter(user =>
            friendIds.includes(user.id)
        );

        setFriendsList(friends);
    }, [userData, allUsers]);

    useEffect(() => {

        if (!socket || !userData) return;

        console.log("Socket instance:", socket);
        console.log("User ID:", userData.id);

        socket.on("onlineUsers", (users) => {
            console.log("Received onlineUsers event:", users);
            setOnlineFriends(users);
        });

        return () => {
            socket.off("onlineUsers");
        };
    }, [socket, userData]);








    useEffect(() => {
        if (userData == null || sentRequests == null) return;

        const sentRequestReceiverIds = sentRequests.map(req => req.receiver.id);
        const friendsIds = userData.friends.map(friend => friend.friendId);

        const filteredSuggestions = allUsers.filter(user => user.id !== userData.id && !sentRequestReceiverIds.includes(user.id) && !friendsIds.includes(user.id));

        setSuggestedFriends(filteredSuggestions);
    }, [allUsers, userData, sentRequests]);

    useEffect(() => {
        fetchAllUsers();
        fetchSentRequests();
    }, []);


    const sendFriendRequest = async (receiverId) => {
        try {
            const response = await axios.post(`${backendUrl}/api/friendship/send-request`, { receiverId: receiverId }, { withCredentials: true });
            toast.success(response?.data?.message);
            fetchSentRequests();
        } catch (error) {
            console.log(error?.response?.data?.message);
        }
    }

    return (
        <div className='w-full h-full flex px-10 py-10 flex-col'>
            <div id="top" className='w-full h-15 bg-foreground/10 rounded-xl p-3 flex justify-between mb-10'>
                <div className='w-80 h-full rounded-full bg-foreground/20 flex gap-6 items-center justify-center px-4 py-2 mb-4'>
                    <input type="text" placeholder='Search for Friends' className='outline-none  w-full' />
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
            <div id="bottom" className='h-[95%] flex flex-col gap-5'>
                <div id="top" className='flex flex-col gap-2'>
                    <span className='from-accent-foreground text-4xl font-semibold'>Your <span className='text-transparent bg-linear-to-bl from-primary via-priamry/20 to-foreground bg-clip-text'>Contacts</span></span>
                    <p className='text-muted-foreground w-100'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Temporibus, quis.
                    </p>
                </div>
                <div id="bottom" className='flex gap-3 w-full h-full'>
                    <div id="left" className='w-2/4 h-full flex flex-col gap-3 py-3 px-5 rounded-xl bg-foreground/10'>
                        <span className='text-2xl tracking-[0.1em] text-foreground/80 font-space-grotesk'>_ Friends</span>
                        <div className='main_list flex flex-col p-2 overflow-scroll gap-3 h-[85%]'>
                            {friendsList.length > 0 ? friendsList.map(friend => (
                                <div
                                    key={friend.id}
                                    className='w-full min-h-20 bg-foreground/20 flex justify-between gap-4 items-center px-3 rounded-xl'
                                >
                                    <div className="flex gap-4 items-center">
                                        <Avatar className="size-15 relative overflow-visible">
                                            <AvatarImage
                                                src={
                                                    friend.profileImage
                                                        ? `${backendUrl}/profile-pics/${friend.profileImage}`
                                                        : "/profile_pic_placeholder.jpg"
                                                }
                                                className='rounded-full'
                                            />
                                            <AvatarFallback>{friend.fullName[0]}</AvatarFallback>
                                            <div className={`absolute bottom-0 right-0 size-4 ${onlineFriends?.includes(friend.id) ? "block" : "hidden"} bg-green-500 rounded-full border-2 border-background/20`}></div>
                                        </Avatar>

                                        <div className='flex flex-col gap-1'>
                                            <span className='ml-3 font-semibold'>{friend.fullName}</span>
                                            <span className='ml-3 text-xs text-slate-400'>
                                                {onlineFriends?.includes(friend.id) ? "Online" : "Offline"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className='flex items-center'>
                                        <span className={`${onlineFriends.map(Number).includes(friend.id) ? "flex" : "hidden"} gap-2 items-center px-4 py-2 bg-primary/20 text-primary rounded-full cursor-pointer`} onClick={() => startCall(friend.id)}>
                                            <MdVideoCall />
                                            <span>Call Now</span>
                                        </span>
                                    </div>
                                </div>
                            )) : (
                                <span className='text-muted-foreground'>No friends yet.</span>
                            )}
                        </div>



                    </div>
                    <div id="right" className='w-2/4 h-full flex flex-col gap-3 py-3 px-5 rounded-xl bg-foreground/10'>
                        <span className='text-2xl tracking-[0.1em] text-foreground/80 font-space-grotesk'>_ Suggestions</span>
                        <div className='main_list flex flex-col p-2 overflow-scroll gap-3 h-[85%]'>
                            {suggestedFriends.length > 0 ? suggestedFriends.map((user) => (
                                <div id="left" className='w-full min-h-20 bg-foreground/20 flex justify-between gap-4 items-center px-3 rounded-xl'>
                                    <div className="left flex gap-4 items-center">
                                        <Avatar className="size-15 relative overflow-visible cursor-pointer" onClick={() => { navigate('/home/fitness-profile') }}>
                                            <AvatarImage
                                                src={
                                                    user.profileImage
                                                        ? `${backendUrl}/profile-pics/${user.profileImage}`
                                                        : "/profile_pic_placeholder.jpg"
                                                }
                                                className="rounded-full"
                                            />


                                            <AvatarFallback>profileImage</AvatarFallback>
                                            <div className='absolute bottom-0 right-0 size-4 bg-green-500 rounded-full border-2 border-background/20'></div>
                                        </Avatar>

                                        <div className='flex flex-col gap-1'>
                                            <span className='ml-3 font-semibold'>{user.fullName}</span>
                                            <span className='ml-3 text-xs text-slate-400'>Online</span>
                                        </div>
                                    </div>
                                    <div className='flex items-center'>
                                        <span className='flex gap-2 items-center px-4 py-2 bg-primary/20 text-primary rounded-full cursor-pointer hover:bg-primary/30 transition-all duration-500' onClick={() => sendFriendRequest(user.id)}>
                                            <PlusIcon />
                                            <span>Add Friend</span>
                                        </span>
                                    </div>

                                </div>
                            )) : <span className='text-muted-foreground'>No suggestions available.</span>}

                        </div>

                    </div>
                </div>
            </div>
           {/* VIDEO CALL POPUP */}
{isCall && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
        <div className="relative w-[95vw] h-[90vh] bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            
            {/* Remote Video (Main) */}
            {remoteStream ? (
                <video
                    autoPlay
                    playsInline
                    ref={(video) => { if (video) video.srcObject = remoteStream; }}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white/50">
                    <div className="animate-pulse w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
                        <MdVideoCall size={40} />
                    </div>
                    <p className="text-xl font-medium tracking-wide">Waiting for connection...</p>
                </div>
            )}

            {/* Local Video (Overlay) */}
            {localStream && (
                <div className="absolute top-6 right-6 w-64 h-40 bg-gray-800 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl transition-all hover:scale-105">
                    <video
                        autoPlay
                        playsInline
                        muted
                        ref={(video) => { if (video) video.srcObject = localStream; }}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {/* Controls Bar */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-8 py-4 bg-white/10 backdrop-blur-xl rounded-full border border-white/10">
                <button
                    onClick={() => {
                        socket.emit("end-call", { to: currentCallUserId });
                        endCallCleanup();
                    }}
                    className="px-8 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                >
                    End Call
                </button>
            </div>
        </div>
    </div>
)}
        </div>
    )
}

export default FriendsMain