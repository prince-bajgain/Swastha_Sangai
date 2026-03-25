import React, { useEffect } from 'react'
import ProfileHeader from '../components/userFitnessProfile/ProfileHeader'
import WorkoutStreakTracker from '../components/WorkoutStreakTracker'

const FitnessProfile = () => {
    useEffect(() => {
        document.documentElement.classList.add("dark");
    }, []);
    
    return (
        <div className='min-h-screen bg-gradient-to-br from-background via-background to-muted/20'>
            <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 md:py-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Left Column - Profile Card */}
                    <div className="lg:sticky lg:top-8">
                        <ProfileHeader />
                    </div>
                    
                    {/* Right Column - Streak Tracker */}
                    <div>
                        <WorkoutStreakTracker />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FitnessProfile