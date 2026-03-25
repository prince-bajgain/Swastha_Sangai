import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { Card, CardContent } from "../ui/card";
import { Goal, Pencil, Activity, Scale, Ruler } from "lucide-react";
import TypeWriter from "../TypeWriter";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";

export default function ProfileHeader() {
    const [isEditing, setIsEditing] = useState(false);
    const [motivationalQuote, setMotivationalQuote] = useState("");
    const [profile, setProfile] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);
    
    const { backendUrl, userData, getUserData } = useContext(AuthContext);

    useEffect(() => {
        const savedQuote = localStorage.getItem("dailyQuote");
        const lastGenerated = localStorage.getItem("dailyQuoteTime");

        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        if (savedQuote && lastGenerated && now - lastGenerated < oneDay) {
            setMotivationalQuote(savedQuote);
            return;
        }

        if (typeof puter !== 'undefined' && puter.ai) {
            puter.ai.chat("Give me a short motivational quote for fitness journey.", { model: "gpt-5-nano" })
                .then(response => {
                    setMotivationalQuote(response.message.content);
                    localStorage.setItem("dailyQuote", response.message.content);
                    localStorage.setItem("dailyQuoteTime", Date.now());
                })
                .catch(err => console.error("Error fetching quote:", err));
        }
    }, []);

    useEffect(() => {
        if (userData) {
            setProfile({
                age: userData.age,
                weight: userData.weight,
                height: userData.height,
                goal: userData.goal,
                imageFile: userData.profileImage,
                email: userData.email,
                fullName: userData.fullName,
            });
        }
    }, [userData]);

    if (!userData) {
        return (
            <Card className="w-full bg-card border border-border shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="animate-pulse">
                        <div className="h-24 w-24 bg-muted rounded-full mx-auto mb-4"></div>
                        <div className="h-5 w-40 bg-muted rounded mx-auto mb-2"></div>
                        <div className="h-4 w-32 bg-muted rounded mx-auto"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const updateFitnessProfile = async () => {
        try {
            const formData = new FormData();

            formData.append("age", profile.age);
            formData.append("weight", profile.weight);
            formData.append("height", profile.height);
            formData.append("goal", profile.goal);

            if (selectedImage) {
                formData.append("profileImage", selectedImage);
            }

            const response = await axios.put(`${backendUrl}/api/user/update-fitness-profile`, formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success("Profile updated successfully");
            setIsEditing(false);
            setSelectedImage(null);
            await getUserData();
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile");
        }
    }

    return (
        <Card className="w-full bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-6 md:p-8">
                {/* Profile Image Section */}
                <div className="flex flex-col items-center mb-6">
                    <div className="relative mb-4">
                        <Avatar className="h-28 w-28 ring-4 ring-primary/10">
                            <AvatarImage
                                src={
                                    selectedImage
                                        ? URL.createObjectURL(selectedImage)
                                        : `${backendUrl}/profile-pics/${profile.imageFile}` || "/profile_pic_placeholder.jpg"
                                }
                                className="object-cover"
                            />
                            <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                                {profile.fullName?.charAt(0) || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <label className="absolute bottom-1 right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary/90 transition-colors">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => setSelectedImage(e.target.files[0])}
                            />
                            <Pencil className="text-white" size={14} />
                        </label>
                    </div>
                    
                    <h2 className="text-2xl font-semibold text-foreground mb-1">
                        {userData?.fullName || userData?.name || 'User'}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        {userData?.email || ''}
                    </p>
                </div>
                
                {/* Divider */}
                <div className="border-t border-border my-6"></div>
                
                {/* Motivational Quote */}
                {motivationalQuote && (
                    <div className="mb-6 p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
                        <TypeWriter className="text-foreground/80 text-sm leading-relaxed">
                            “{motivationalQuote}”
                        </TypeWriter>
                    </div>
                )}
                
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <Activity className="w-5 h-5 text-primary mx-auto mb-2" />
                        {isEditing ? (
                            <input
                                type="number"
                                value={profile.age || ''}
                                onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                                className="w-full text-center bg-transparent border-b border-primary focus:outline-none text-lg font-semibold"
                            />
                        ) : (
                            <div className="text-2xl font-bold text-foreground">{profile.age || '—'}</div>
                        )}
                        <div className="text-xs text-muted-foreground mt-1">Age (years)</div>
                    </div>
                    
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <Scale className="w-5 h-5 text-primary mx-auto mb-2" />
                        {isEditing ? (
                            <input
                                type="number"
                                value={profile.weight || ''}
                                onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                                className="w-full text-center bg-transparent border-b border-primary focus:outline-none text-lg font-semibold"
                            />
                        ) : (
                            <div className="text-2xl font-bold text-foreground">{profile.weight || '—'}</div>
                        )}
                        <div className="text-xs text-muted-foreground mt-1">Weight (kg)</div>
                    </div>
                    
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <Ruler className="w-5 h-5 text-primary mx-auto mb-2" />
                        {isEditing ? (
                            <input
                                type="number"
                                value={profile.height || ''}
                                onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                                className="w-full text-center bg-transparent border-b border-primary focus:outline-none text-lg font-semibold"
                            />
                        ) : (
                            <div className="text-2xl font-bold text-foreground">{profile.height || '—'}</div>
                        )}
                        <div className="text-xs text-muted-foreground mt-1">Height (cm)</div>
                    </div>
                </div>
                
                {/* Goal Section */}
                <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-muted/20 rounded-lg">
                    <Goal className="text-primary w-5 h-5" />
                    <span className="text-foreground">
                        <span className="font-medium">Fitness Goal:</span> 
                        {isEditing ? (
                            <input 
                                type="text" 
                                value={profile.goal || ''} 
                                onChange={(e) => setProfile({ ...profile, goal: e.target.value })} 
                                className="bg-transparent border-b border-primary focus:outline-none w-32 text-center ml-2 font-medium" 
                            />
                        ) : (
                            <span className="ml-2 font-medium text-primary">{profile.goal || "Lean Physique"}</span>
                        )}
                    </span>
                </div>
                
                {/* Action Button */}
                <button 
                    className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 font-medium text-sm"
                    onClick={() => { if (isEditing) { updateFitnessProfile(); } else { setIsEditing(!isEditing) } }}
                >
                    {isEditing ? "Save Changes" : "Edit Profile"}
                </button>
            </CardContent>
        </Card>
    );
}