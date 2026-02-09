import { PlusIcon, SearchIcon } from 'lucide-react'
import React, { use, useContext, useEffect, useState } from 'react'
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

const FriendsMain = () => {
    const navigate = useNavigate();
    const { userData, backendUrl } = useContext(AuthContext);
    const [friendsList, setFriendsList] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [suggestedFriends, setSuggestedFriends] = useState([]);

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
        if (userData == null || sentRequests == null) return;

        const sentRequestReceiverIds = sentRequests.map(req => req.receiver.id);
        const friendsIds = userData.friends.map(friend => friend.friendId);
        console.log(sentRequestReceiverIds);

        const filteredSuggestions = allUsers.filter(user => user.id !== userData.id && !sentRequestReceiverIds.includes(user.id) && !friendsIds.includes(user.id));
        console.log(filteredSuggestions);

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
                                            <div className='absolute bottom-0 right-0 size-4 bg-green-500 rounded-full border-2 border-background/20'></div>
                                        </Avatar>

                                        <div className='flex flex-col gap-1'>
                                            <span className='ml-3 font-semibold'>{friend.fullName}</span>
                                            <span className='ml-3 text-xs text-slate-400'>Online</span>
                                        </div>
                                    </div>

                                    <div className='flex items-center'>
                                        <span className='flex gap-2 items-center px-4 py-2 bg-primary/20 text-primary rounded-full cursor-pointer'>
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
        </div>
    )
}

export default FriendsMain