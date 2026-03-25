import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Flame, Calendar, TrendingUp, Check, X, ChevronLeft, ChevronRight, Eye, XCircle, Shield, AlertTriangle, Camera, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'react-toastify';

const WorkoutStreakTracker = () => {
    const [streakData, setStreakData] = useState({
        currentStreak: 0,
        longestStreak: 0,
        lastWorkoutDate: null
    });
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showQuestion, setShowQuestion] = useState(true);
    const [workoutHistory, setWorkoutHistory] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [selectedViewDate, setSelectedViewDate] = useState(null);
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [showVerification, setShowVerification] = useState(false);
    const [verificationMethod, setVerificationMethod] = useState(null);
    const [workoutDuration, setWorkoutDuration] = useState('');
    const [workoutType, setWorkoutType] = useState('');
    const [workoutProof, setWorkoutProof] = useState(null);
    const [suspiciousActivity, setSuspiciousActivity] = useState(false);
    const { backendUrl, isLoggedIn } = useContext(AuthContext);

    // Create axios instance with credentials
    const axiosInstance = axios.create({
        baseURL: backendUrl,
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    useEffect(() => {
        if (isLoggedIn) {
            fetchStreakData();
            fetchStreakStats();
            fetchWorkoutHistory();
            checkSuspiciousActivity();
        }
    }, [isLoggedIn]);

    useEffect(() => {
        if (isLoggedIn && showCalendarModal) {
            fetchWorkoutHistory();
        }
    }, [currentMonth, currentYear, showCalendarModal]);

    const fetchStreakData = async () => {
        try {
            const response = await axiosInstance.get('/api/workout/streak');
            if (response.data?.data) {
                setStreakData(response.data.data);
                const today = new Date().toISOString().split('T')[0];
                const lastDate = response.data.data.lastWorkoutDate 
                    ? new Date(response.data.data.lastWorkoutDate).toISOString().split('T')[0] 
                    : null;
                if (lastDate === today) {
                    setShowQuestion(false);
                } else {
                    setShowQuestion(true);
                }
            }
        } catch (error) {
            console.error('Error fetching streak:', error);
            if (error.response?.status === 401) {
                toast.error('Please login to track your streak');
            }
        }
    };

    const fetchStreakStats = async () => {
        try {
            const response = await axiosInstance.get('/api/workout/streak/stats');
            if (response.data?.data) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchWorkoutHistory = async () => {
        try {
            const startDate = new Date(currentYear, currentMonth, 1);
            const endDate = new Date(currentYear, currentMonth + 1, 0);
            
            const response = await axiosInstance.get('/api/workout/streak/history', {
                params: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                }
            });
            
            if (response.data?.data) {
                setWorkoutHistory(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching workout history:', error);
        }
    };

    const checkSuspiciousActivity = async () => {
        try {
            const response = await axiosInstance.get('/api/workout/streak/verify-activity');
            if (response.data?.suspicious) {
                setSuspiciousActivity(true);
                toast.warning(
                    <div className="text-center">
                        <div className="text-2xl mb-2">⚠️</div>
                        <div className="font-bold mb-1">Suspicious Activity Detected!</div>
                        <div className="text-sm">Please verify your workouts to maintain your streak</div>
                    </div>,
                    {
                        autoClose: 5000,
                        position: "top-center",
                    }
                );
            }
        } catch (error) {
            console.error('Error checking suspicious activity:', error);
        }
    };

    const handleLogWorkout = async (didWorkout) => {
        if (!isLoggedIn) {
            toast.error('Please login first to track your workout streak');
            return;
        }

        if (!didWorkout) {
            setIsLoading(true);
            try {
                const response = await axiosInstance.post('/api/workout/streak/reset', {});
                if (response.data.success) {
                    setStreakData(response.data.data);
                    setShowQuestion(false);
                    toast.info(
                        <div className="text-center">
                            <div className="text-2xl mb-2">😢</div>
                            <div className="font-bold mb-1">Streak Reset!</div>
                            <div className="text-sm">Your streak has ended. Start fresh tomorrow! 💪</div>
                        </div>,
                        {
                            autoClose: 4000,
                            position: "top-center",
                        }
                    );
                    fetchStreakStats();
                    fetchWorkoutHistory();
                }
            } catch (error) {
                console.error('Error resetting streak:', error);
                toast.error('Failed to reset streak');
            } finally {
                setIsLoading(false);
            }
            return;
        }

        // Show verification modal before logging
        setShowVerification(true);
    };

    const verifyAndLogWorkout = async () => {
        if (!verificationMethod) {
            toast.error('Please select a verification method');
            return;
        }

        setIsLoading(true);
        
        try {
            // Send verification data to backend
            const verificationData = {
                method: verificationMethod,
                duration: workoutDuration,
                type: workoutType,
                proof: workoutProof,
                timestamp: new Date().toISOString()
            };

            const response = await axiosInstance.post('/api/workout/streak/log', verificationData);
            
            if (response.data.success) {
                const newStreak = response.data.data.streak.currentStreak;
                setStreakData(response.data.data.streak);
                setShowQuestion(false);
                setShowVerification(false);
                
                // Reset verification form
                setVerificationMethod(null);
                setWorkoutDuration('');
                setWorkoutType('');
                setWorkoutProof(null);
                
                // Simple toast messages like your other files
                if (newStreak === 1) {
                    toast.success('Your Streak is Successfully Started! 🎉');
                } else {
                    toast.success(`Your Streak is Successfully Updated! 🔥 ${newStreak} days in a row!`);
                }
                
                fetchStreakStats();
                fetchWorkoutHistory();
            }
        } catch (error) {
            console.error('Error logging workout:', error);
            
            if (error.response?.data?.alreadyLogged) {
                toast.info('You have already logged your workout today!');
                setShowVerification(false);
            } else if (error.response?.status === 401) {
                toast.error('Please login again');
            } else if (error.response?.data?.verificationFailed) {
                toast.error('Verification Failed! Please provide valid workout proof');
            } else {
                toast.error(`Failed: ${error.response?.data?.error || error.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getStreakEmoji = () => {
        const streak = streakData?.currentStreak || 0;
        if (streak === 0) return '❄️';
        if (streak === 1) return '🌱';
        if (streak === 2) return '🔥';
        if (streak === 3) return '🔥🔥';
        if (streak === 4) return '🔥🔥🔥';
        if (streak === 5) return '⚡';
        if (streak >= 7 && streak < 14) return '🔥⚡';
        if (streak >= 14 && streak < 30) return '🏆';
        if (streak >= 30) return '👑';
        return '💪';
    };

    const getStreakNumberStyle = () => {
        const streak = streakData?.currentStreak || 0;
        if (streak === 1) return 'text-green-500';
        if (streak === 2) return 'text-yellow-500';
        if (streak === 3) return 'text-orange-500';
        if (streak >= 4) return 'text-red-500';
        return 'text-gray-500';
    };

    const getMotivationMessage = () => {
        const streak = streakData?.currentStreak || 0;
        if (streak === 0) return "Start your journey today! 🔥";
        if (streak === 1) return "Day 1! Keep the momentum going! 💪";
        if (streak === 2) return "2 days strong! You're building a habit! 🔥";
        if (streak === 3) return "3 days in a row! You're on fire! 🔥🔥";
        if (streak < 7) return `${streak} days! Don't break the chain! ⚡`;
        if (streak < 14) return "Amazing consistency! Keep pushing! 🏆";
        if (streak < 30) return "You're unstoppable! Legendary streak! 👑";
        return "ULTIMATE CHAMPION! You're an inspiration! 🌟";
    };

    const getWorkoutStatusColor = (workedOut, isToday) => {
        if (workedOut) return 'bg-green-500 text-white shadow-md';
        if (isToday) return 'bg-blue-500 text-white ring-2 ring-blue-300 shadow-md';
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600';
    };

    const handleDateClick = (dateStr) => {
        const date = new Date(dateStr);
        setSelectedViewDate(date);
        
        const workout = workoutHistory.find(w => w.date === dateStr);
        const today = new Date().toISOString().split('T')[0];
        
        if (workout && workout.workedOut) {
            toast.success(`Workout completed on ${date.toLocaleDateString()}`);
        } else if (dateStr === today) {
            toast.info("You haven't logged today's workout yet");
        } else if (dateStr < today) {
            toast.warning(`Missed workout on ${date.toLocaleDateString()}`);
        }
    };

    const renderCalendar = () => {
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
        const today = new Date().toISOString().split('T')[0];
        
        const calendarDays = [];
        
        // Create a map of workout dates
        const workoutMap = {};
        workoutHistory.forEach(day => {
            workoutMap[day.date] = day.workedOut;
        });
        
        // Add empty cells for days before month starts
        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarDays.push(
                <div key={`empty-${i}`} className="h-10 w-10"></div>
            );
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const workedOut = workoutMap[dateStr];
            const isToday = dateStr === today;
            
            calendarDays.push(
                <div key={day} className="flex justify-center">
                    <button
                        onClick={() => handleDateClick(dateStr)}
                        className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all transform hover:scale-110 relative
                            ${getWorkoutStatusColor(workedOut, isToday)}
                        `}
                    >
                        {day}
                        {workedOut && (
                            <div className="absolute -top-1 -right-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                        )}
                    </button>
                </div>
            );
        }
        
        return calendarDays;
    };

    const changeMonth = (increment) => {
        let newMonth = currentMonth + increment;
        let newYear = currentYear;
        
        if (newMonth < 0) {
            newMonth = 11;
            newYear--;
        } else if (newMonth > 11) {
            newMonth = 0;
            newYear++;
        }
        
        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
    };

    const goToToday = () => {
        setCurrentMonth(new Date().getMonth());
        setCurrentYear(new Date().getFullYear());
    };

    if (!isLoggedIn) {
        return (
            <Card className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <CardContent className="p-6 text-center">
                    <Flame className="text-orange-500 mx-auto mb-3" size={32} />
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Workout Streak</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Login to track your workout streak and stay motivated!</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            {/* Main Streak Card */}
            <Card className="w-full bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 border border-orange-200 dark:border-gray-700 shadow-xl">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-orange-500/10 rounded-full">
                                <Flame className="text-orange-500" size={24} />
                            </div>
                            <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">Workout Streak</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            {suspiciousActivity && (
                                <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-full">
                                    <AlertTriangle size={14} className="text-yellow-600" />
                                    <span className="text-xs text-yellow-600">Verify</span>
                                </div>
                            )}
                            <button
                                onClick={() => setShowCalendarModal(true)}
                                className="p-2 bg-orange-500/10 hover:bg-orange-500/20 rounded-lg transition-all duration-200 transform hover:scale-105"
                                title="View Calendar"
                            >
                                <Calendar className="text-orange-500" size={20} />
                            </button>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-gray-600 dark:text-gray-400">Live</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-center mb-6">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <span className="text-5xl animate-pulse">{getStreakEmoji()}</span>
                            <div>
                                <span className={`text-6xl font-black ${getStreakNumberStyle()}`}>
                                    {streakData?.currentStreak || 0}
                                </span>
                                {streakData?.currentStreak > 0 && (
                                    <div className="text-xs text-gray-500 mt-1">
                                        {streakData.currentStreak === 1 ? 'day' : 'days'} in a row
                                    </div>
                                )}
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-2">
                            {getMotivationMessage()}
                        </p>
                        {(streakData?.longestStreak || 0) > 0 && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                Best: {streakData.longestStreak} days
                            </p>
                        )}
                    </div>
                    
                    {stats && (
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm">
                                <div className="text-2xl font-bold text-orange-600">{stats.totalWorkouts || 0}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
                            </div>
                            <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm">
                                <div className="text-2xl font-bold text-orange-600">{stats.monthlyWorkouts || 0}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">This Month</div>
                            </div>
                            <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm">
                                <div className="text-2xl font-bold text-orange-600">{stats.weeklyWorkouts || 0}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">This Week</div>
                            </div>
                        </div>
                    )}
                    
                    {showQuestion ? (
                        <div className="text-center">
                            <p className="text-gray-900 dark:text-gray-100 font-semibold mb-4">Did you workout today? 🔥</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleLogWorkout(true)}
                                    disabled={isLoading}
                                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition transform hover:scale-105 flex items-center justify-center gap-2 font-bold shadow-lg"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Check size={18} />
                                            Yes! 🔥
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleLogWorkout(false)}
                                    disabled={isLoading}
                                    className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition flex items-center justify-center gap-2 font-medium border border-gray-300 dark:border-gray-700"
                                >
                                    <X size={18} />
                                    Not today
                                </button>
                            </div>
                            {suspiciousActivity && (
                                <p className="text-xs text-yellow-600 mt-3 flex items-center justify-center gap-1">
                                    <Shield size={12} />
                                    Verification required to maintain streak
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-3 rounded-xl">
                                <p className="text-sm font-medium">
                                    {streakData?.currentStreak > 0 
                                        ? `🎉 Great job! ${streakData.currentStreak} day streak! Come back tomorrow! 🎉` 
                                        : "💪 Start fresh tomorrow! Don't break the chain!"}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowQuestion(true)}
                                className="mt-3 text-sm text-orange-600 dark:text-orange-400 hover:underline font-medium"
                            >
                                Log another workout?
                            </button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Verification Modal */}
            {showVerification && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-slideUp">
                        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Shield className="text-orange-500" size={20} />
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Verify Your Workout</h3>
                                </div>
                                <button
                                    onClick={() => setShowVerification(false)}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                                >
                                    <XCircle size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Please verify your workout to maintain your streak:
                            </p>

                            {/* Verification Methods */}
                            <div className="space-y-3 mb-6">
                                <button
                                    onClick={() => setVerificationMethod('timer')}
                                    className={`w-full p-4 rounded-xl border-2 transition-all ${verificationMethod === 'timer' 
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                                        : 'border-gray-200 dark:border-gray-700'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Clock size={24} className={verificationMethod === 'timer' ? 'text-green-500' : 'text-gray-400'} />
                                        <div className="flex-1 text-left">
                                            <div className="font-medium">Workout Timer</div>
                                            <div className="text-xs text-gray-500">Log duration of your workout</div>
                                        </div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setVerificationMethod('photo')}
                                    className={`w-full p-4 rounded-xl border-2 transition-all ${verificationMethod === 'photo' 
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                                        : 'border-gray-200 dark:border-gray-700'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Camera size={24} className={verificationMethod === 'photo' ? 'text-green-500' : 'text-gray-400'} />
                                        <div className="flex-1 text-left">
                                            <div className="font-medium">Photo Proof</div>
                                            <div className="text-xs text-gray-500">Upload a photo of your workout</div>
                                        </div>
                                    </div>
                                </button>
                            </div>

                            {verificationMethod === 'timer' && (
                                <div className="space-y-3 mb-6">
                                    <input
                                        type="number"
                                        placeholder="Workout duration (minutes)"
                                        value={workoutDuration}
                                        onChange={(e) => setWorkoutDuration(e.target.value)}
                                        className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                                    />
                                    <select
                                        value={workoutType}
                                        onChange={(e) => setWorkoutType(e.target.value)}
                                        className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                                    >
                                        <option value="">Select workout type</option>
                                        <option value="cardio">Cardio</option>
                                        <option value="strength">Strength Training</option>
                                        <option value="yoga">Yoga</option>
                                        <option value="hiit">HIIT</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            )}

                            {verificationMethod === 'photo' && (
                                <div className="mb-6">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setWorkoutProof(e.target.files[0])}
                                        className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">Upload a photo of your workout (optional but recommended)</p>
                                </div>
                            )}

                            <button
                                onClick={verifyAndLogWorkout}
                                disabled={isLoading || !verificationMethod}
                                className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition disabled:opacity-50"
                            >
                                {isLoading ? 'Verifying...' : 'Verify & Log Workout'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Calendar Modal */}
            {showCalendarModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-slideUp">
                        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between rounded-t-2xl">
                            <div className="flex items-center gap-2">
                                <Calendar className="text-orange-500" size={20} />
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Workout Calendar</h3>
                            </div>
                            <button
                                onClick={() => setShowCalendarModal(false)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                            >
                                <XCircle size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <button
                                    onClick={() => changeMonth(-1)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <div className="text-center">
                                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                                <button
                                    onClick={() => changeMonth(1)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>

                            <div className="flex justify-end mb-4">
                                <button
                                    onClick={goToToday}
                                    className="px-3 py-1 text-xs bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                                >
                                    Today
                                </button>
                            </div>

                            <div className="grid grid-cols-7 gap-2 mb-4 text-center">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                                    <div key={day} className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-2">
                                {renderCalendar()}
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-center gap-6 text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="text-gray-600 dark:text-gray-400">Workout</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        <span className="text-gray-600 dark:text-gray-400">Today</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                                        <span className="text-gray-600 dark:text-gray-400">Missed</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default WorkoutStreakTracker;