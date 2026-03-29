
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { GrGrow } from "react-icons/gr"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "../ui/card";
import { Flame, Goal, Pencil } from "lucide-react";
import TypeWriter from "../TypeWriter";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";


export default function ProfileHeader() {
    const [isEditing, setIsEditing] = useState(false);
    const { backendUrl, userData, getUserData } = useContext(AuthContext);


    const [profile, setProfile] = useState({});

    useEffect(() => {
        if (userData) {
            setProfile({
                age: userData.age,
                weight: userData.weight,
                height: userData.height,
                goal: userData.goal
            });
        }
    }, [userData]);

    const updateFitnessProfile = async () => {
        try {
            const response = await axios.put(`${backendUrl}/api/user/update-fitness-profile`, profile, { withCredentials: true });
            console.log("Fitness profile updated:", response.data);
            toast.success("Fitness profile updated successfully");
            setIsEditing(false);
            await getUserData();
        } catch (error) {
            console.error("Error updating fitness profile:", error);
            toast.error("Failed to update fitness profile");
        }
    }

    return (
        <div className="flex flex-col px-3 gap-10 items-center bg-background w-full">
            <div className="flex items-center gap-3">
                <Avatar className="size-20 relative overflow-visible">
                    <AvatarImage src="https://i.pravatar.cc/100" alt="@shadcn" className="rounded-full" />
                    <AvatarFallback>profileImage</AvatarFallback>
                    <label className="absolute w-8 h-8 bg-primary cursor-pointer rounded-full z-30 flex justify-center items-center -bottom-1 left-1/3 border-background border-3">
                        <input type="file" className="hidden" accept="image/*"/>
                        <div>
                            <Pencil className="text-background" size={15} />
                        </div>
                    </label>

                </Avatar>
                <div className="flex flex-col">
                    <span className="font-semibold">Prince Bajgain</span>
                    <span className="text-muted-foreground">prrncebajgain@gmail.com</span>
                </div>
            </div>
            <TypeWriter className="bg-linear-to-br from-chart-2 text-3xl to-foreground font-space-grotesk text-transparent bg-clip-text w-160 text-center">
                <span className="text-primary">“</span>Your body can stand almost anything. It’s your mind you have to convince.<span className="text-primary">”</span>
            </TypeWriter>
            <span className=""></span>
            <div className="flex flex-row gap-3">
                <Card className={'w-50 bg-linear-to-br from-primary/30 to-muted'}>
                    <CardContent className={'flex gap-3 flex-col items-center'}>
                        <GrGrow size={30} className="text-primary" />
                        {isEditing ? (
                            <input
                                type="number"
                                value={profile.age}
                                onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                                className="bg-transparent border-b border-primary focus:outline-none w-10 text-center"
                            />
                        ) : (
                            <span className="font-bold">{profile.age}</span>
                        )}
                        <span className="text-muted-foreground">Age</span>
                    </CardContent>
                </Card>
                <Card className={'w-50 bg-linear-to-br from-primary/30 to-muted'}>
                    <CardContent className={'flex gap-3 flex-col items-center'}>
                        <GrGrow size={30} className="text-primary" />
                        {isEditing ? (
                            <input
                                type="number"
                                value={profile.weight}
                                onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                                className="bg-transparent border-b border-primary focus:outline-none w-10 text-center"
                            />
                        ) : (
                            <span className="font-bold">{profile.weight}</span>
                        )}
                        <span className="text-muted-foreground">Weight</span>
                    </CardContent>
                </Card>
                <Card className={'w-50 bg-linear-to-br from-primary/30 to-muted'}>
                    <CardContent className={'flex gap-3 flex-col items-center'}>
                        <GrGrow size={30} className="text-primary" />
                        {isEditing ? (
                            <input
                                type="number"
                                value={profile.height}
                                onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                                className="bg-transparent border-b border-primary focus:outline-none w-10 text-center"
                            />
                        ) : (
                            <span className="font-bold">{profile.height}</span>
                        )}
                        <span className="text-muted-foreground">Height</span>
                    </CardContent>
                </Card>
            </div>
            <div className="flex gap-3 text-2xl items-center">
                <Goal className="text-primary size-8" />
                <span className="text-foreground"><span className="font-semibold font-space-grotesk bg-linear-to-bl from-primary to-amber-200 text-transparent bg-clip-text">Goal:</span> {isEditing ? <input type="text" value={profile.goal} onChange={(e) => setProfile({ ...profile, goal: e.target.value })} className="bg-transparent border-b border-primary focus:outline-none w-20 text-center" /> : profile.goal || "Lean Physique"}</span>
            </div>

            <Badge variant="outline">
                <Flame className="text-primary" />
                Streak Badge: 10 days
            </Badge>
            <button className="bubbleeffectbtn" type="button" onClick={() => { if (isEditing) { updateFitnessProfile(); } else { setIsEditing(!isEditing) } }}>
                <style jsx>{`
          .bubbleeffectbtn {
            min-width: 130px;
            height: 40px;
            color: #fff;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            display: inline-block;
            outline: none;
            border-radius: 25px;
            border: none;
            background: linear-gradient(45deg, #212529, #343a40);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            z-index: 1;
            overflow: hidden;
          }

          .bubbleeffectbtn:before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(
              45deg,
              rgba(255, 255, 255, 0.1),
              rgba(255, 255, 255, 0)
            );
            transform: rotate(45deg);
            transition: all 0.5s ease;
            z-index: -1;
          }

          .bubbleeffectbtn:hover:before {
            top: -100%;
            left: -100%;
          }

          .bubbleeffectbtn:after {
            border-radius: 25px;
            position: absolute;
            content: '';
            width: 0;
            height: 100%;
            top: 0;
            z-index: -1;
            box-shadow:
              inset 2px 2px 2px 0px rgba(255, 255, 255, 0.5),
              7px 7px 20px 0px rgba(0, 0, 0, 0.1),
              4px 4px 5px 0px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            background: linear-gradient(45deg, #343a40, #495057);
            right: 0;
          }

          .bubbleeffectbtn:hover:after {
            width: 100%;
            left: 0;
          }

          .bubbleeffectbtn:active {
            top: 2px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            background: linear-gradient(45deg, #212529, #343a40);
          }

          .bubbleeffectbtn span {
            position: relative;
            z-index: 2;
          }
        `}</style>

                <span className="text-sm font-medium">{isEditing ? "Save Changes" : "Change"}</span>
            </button>

        </div>
    );
}