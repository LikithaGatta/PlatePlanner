import { Logo } from './Logo';
import { useState } from 'react';
import { useApp } from '../context/AppContext';

interface OnboardingScreenProps {
  onNavigate: (screen: any) => void;
}

export function OnboardingScreen({ onNavigate }: OnboardingScreenProps) {
  const { user, setUser, login } = useApp();
  const [step, setStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({
    gender: '' as 'male' | 'female' | 'not-specified' | '',
    heightFeet: '',
    heightInches: '',
    weight: '',
    goalType: '' as 'lose' | 'gain' | 'maintain' | '',
    allergies: [] as string[],
    otherAllergy: ''
  });

  const calculateBMI = () => {
    if (!onboardingData.heightFeet || !onboardingData.weight) {
      return 0;
    }
    const feet = parseFloat(onboardingData.heightFeet);
    const inches = parseFloat(onboardingData.heightInches || '0');
    const totalInches = (feet * 12) + inches;
    const weightLb = parseFloat(onboardingData.weight);
    
    // BMI = (weight in lb / (height in inches)²) × 703
    const bmi = (weightLb / (totalInches * totalInches)) * 703;
    return Math.round(bmi * 10) / 10;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { category: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-600' };
    return { category: 'Obese', color: 'text-red-600' };
  };

  const calculateCalorieGoal = () => {
    if (!onboardingData.heightFeet || !onboardingData.weight || !onboardingData.gender || !onboardingData.goalType) {
      return 2000; // default
    }

    // Convert height to cm (feet and inches to cm)
    const feet = parseFloat(onboardingData.heightFeet);
    const inches = parseFloat(onboardingData.heightInches || '0');
    const totalInches = (feet * 12) + inches;
    const heightCm = totalInches * 2.54;
    
    // Convert weight to kg (lb to kg)
    const weightLb = parseFloat(onboardingData.weight);
    const weightKg = weightLb * 0.453592;
    
    // Calculate BMI
    const bmi = calculateBMI();
    
    // Basic BMR calculation (Mifflin-St Jeor equation) - more accurate than BMI alone
    // This considers gender, weight, and height
    let bmr = 0;
    if (onboardingData.gender === 'male') {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * 25 + 5; // assuming age 25
    } else if (onboardingData.gender === 'female') {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * 25 - 161;
    } else {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * 25 - 78; // average
    }

    // Activity factor (assuming moderate activity)
    let tdee = bmr * 1.55;
    
    // Adjust activity factor based on BMI
    if (bmi < 18.5) {
      tdee = bmr * 1.6; // slightly higher for underweight
    } else if (bmi > 30) {
      tdee = bmr * 1.5; // slightly lower for obese
    }

    // Adjust based on goal
    if (onboardingData.goalType === 'lose') {
      return Math.round(tdee - 500); // 500 cal deficit
    } else if (onboardingData.goalType === 'gain') {
      return Math.round(tdee + 300); // 300 cal surplus
    } else {
      return Math.round(tdee); // maintain
    }
  };

  const handleFinish = async () => {
    const calorieGoal = calculateCalorieGoal();
    const allAllergies = [...onboardingData.allergies];
    if (onboardingData.otherAllergy) {
      allAllergies.push(onboardingData.otherAllergy);
    }

    // Convert height to total inches for storage
    const feet = parseFloat(onboardingData.heightFeet);
    const inches = parseFloat(onboardingData.heightInches || '0');
    const totalInches = (feet * 12) + inches;

    const profileData = {
      gender: onboardingData.gender || undefined,
      height: totalInches, // stored in inches
      weight: parseFloat(onboardingData.weight), // stored in lb
      goalType: onboardingData.goalType || undefined,
      calorieGoal: calorieGoal,
      allergies: allAllergies,
      dietaryRestrictions: allAllergies
    };

    // Save to backend
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await fetch("http://localhost:5050/api/auth/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(profileData)
        });

        const data = await response.json();
        
        if (response.ok && data.user) {
          // Update localStorage with new user data
          localStorage.setItem("user", JSON.stringify(data.user));
          
          // Update context
          setUser(data.user);
          login(user?.username || data.user.username);
          onNavigate('home');
          return;
        }
      }
    } catch (error) {
      console.error("Profile update error:", error);
    }

    // Fallback: Update local context if backend update fails
    if (user) {
      setUser({
        ...user,
        gender: onboardingData.gender as 'male' | 'female' | 'not-specified' | undefined,
        height: totalInches,
        weight: parseFloat(onboardingData.weight),
        goalType: onboardingData.goalType as 'lose' | 'gain' | 'maintain' | undefined,
        calorieGoal: calorieGoal,
        allergies: allAllergies,
        dietaryRestrictions: allAllergies
      });
      login(user.username);
    }
    
    onNavigate('home');
  };

  const allergyOptions = [
    'Nuts',
    'Milk/Dairy',
    'Soy',
    'Eggs',
    'Fish',
    'Shellfish',
    'Wheat',
    'Gluten-Free',
    'Vegetarian',
    'Vegan',
    'Halal',
    'Kosher'
  ];

  const toggleAllergy = (allergy: string) => {
    if (onboardingData.allergies.includes(allergy)) {
      setOnboardingData({
        ...onboardingData,
        allergies: onboardingData.allergies.filter(a => a !== allergy)
      });
    } else {
      setOnboardingData({
        ...onboardingData,
        allergies: [...onboardingData.allergies, allergy]
      });
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 md:p-12 max-h-[90vh] overflow-y-auto">
      <div className="flex flex-col items-center text-center space-y-6 mb-8">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
          <Logo size="md" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-gray-900">Set Your Goals</h2>
          <p className="text-gray-500">Let's personalize your experience</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex gap-2 w-full justify-center">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step ? 'w-8 bg-purple-500' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step 1: Gender */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-center block text-sm text-gray-700">What is your gender?</label>
            <p className="text-sm text-gray-500 text-center">This helps us calculate your calorie needs</p>
          </div>
          
          <div className="grid gap-3">
            <button
              onClick={() => setOnboardingData({...onboardingData, gender: 'male'})}
              className={`h-14 rounded-xl transition-colors ${
                onboardingData.gender === 'male'
                  ? 'bg-purple-600 text-white'
                  : 'border-2 border-gray-300 bg-white hover:bg-gray-50'
              }`}
            >
              Male
            </button>
            <button
              onClick={() => setOnboardingData({...onboardingData, gender: 'female'})}
              className={`h-14 rounded-xl transition-colors ${
                onboardingData.gender === 'female'
                  ? 'bg-purple-600 text-white'
                  : 'border-2 border-gray-300 bg-white hover:bg-gray-50'
              }`}
            >
              Female
            </button>
            <button
              onClick={() => setOnboardingData({...onboardingData, gender: 'not-specified'})}
              className={`h-14 rounded-xl transition-colors ${
                onboardingData.gender === 'not-specified'
                  ? 'bg-purple-600 text-white'
                  : 'border-2 border-gray-300 bg-white hover:bg-gray-50'
              }`}
            >
              Prefer not to answer
            </button>
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!onboardingData.gender}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white h-12 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 2: Height & Weight */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-center block text-sm text-gray-700">Your Measurements</label>
            <p className="text-sm text-gray-500 text-center">This helps personalize your calorie goals</p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="heightFeet" className="block text-sm text-gray-700">Height (feet)</label>
              <input
                id="heightFeet"
                type="number"
                placeholder="5"
                value={onboardingData.heightFeet}
                onChange={(e) => setOnboardingData({...onboardingData, heightFeet: e.target.value})}
                className="w-full h-12 rounded-xl border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="heightInches" className="block text-sm text-gray-700">Height (inches)</label>
              <input
                id="heightInches"
                type="number"
                placeholder="10"
                value={onboardingData.heightInches}
                onChange={(e) => setOnboardingData({...onboardingData, heightInches: e.target.value})}
                className="w-full h-12 rounded-xl border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="weight" className="block text-sm text-gray-700">Weight (lb)</label>
              <input
                id="weight"
                type="number"
                placeholder="150"
                value={onboardingData.weight}
                onChange={(e) => setOnboardingData({...onboardingData, weight: e.target.value})}
                className="w-full h-12 rounded-xl border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 h-12 rounded-xl border-2 border-gray-300 bg-white hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!onboardingData.heightFeet || !onboardingData.weight}
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white h-12 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Goals */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-center block text-sm text-gray-700">What are your goals?</label>
            <p className="text-sm text-gray-500 text-center">Choose what you want to achieve</p>
          </div>
          
          <div className="grid gap-3">
            <button
              onClick={() => setOnboardingData({...onboardingData, goalType: 'lose'})}
              className={`h-16 rounded-xl flex flex-col items-center justify-center transition-colors ${
                onboardingData.goalType === 'lose'
                  ? 'bg-purple-600 text-white'
                  : 'border-2 border-gray-300 bg-white hover:bg-gray-50'
              }`}
            >
              <span>Lose Weight</span>
              <span className="text-xs opacity-70">500 cal deficit</span>
            </button>
            <button
              onClick={() => setOnboardingData({...onboardingData, goalType: 'maintain'})}
              className={`h-16 rounded-xl flex flex-col items-center justify-center transition-colors ${
                onboardingData.goalType === 'maintain'
                  ? 'bg-purple-600 text-white'
                  : 'border-2 border-gray-300 bg-white hover:bg-gray-50'
              }`}
            >
              <span>Maintain Weight</span>
              <span className="text-xs opacity-70">Stay healthy</span>
            </button>
            <button
              onClick={() => setOnboardingData({...onboardingData, goalType: 'gain'})}
              className={`h-16 rounded-xl flex flex-col items-center justify-center transition-colors ${
                onboardingData.goalType === 'gain'
                  ? 'bg-purple-600 text-white'
                  : 'border-2 border-gray-300 bg-white hover:bg-gray-50'
              }`}
            >
              <span>Gain Weight</span>
              <span className="text-xs opacity-70">300 cal surplus</span>
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 h-12 rounded-xl border-2 border-gray-300 bg-white hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              disabled={!onboardingData.goalType}
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white h-12 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Health Question */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-center block text-sm text-gray-700">Your Health Profile</label>
            <p className="text-sm text-gray-500 text-center">Based on your information</p>
          </div>
          
          {/* BMI Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4">
            <div className="text-sm text-gray-700 mb-1">Your BMI</div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-blue-600">{calculateBMI()}</div>
              <div className={`text-sm font-medium ${getBMICategory(calculateBMI()).color}`}>
                {getBMICategory(calculateBMI()).category}
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Body Mass Index helps personalize your calorie goals
            </p>
          </div>
          
          {/* Calorie Goal Card */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-6 text-center">
            <div className="text-purple-900 mb-2">Recommended Daily Intake</div>
            <div className="text-3xl font-bold text-purple-600">{calculateCalorieGoal()}</div>
            <div className="text-sm text-purple-700">calories per day</div>
            <p className="text-xs text-gray-600 mt-3">
              Customized for your {onboardingData.goalType === 'lose' ? 'weight loss' : onboardingData.goalType === 'gain' ? 'weight gain' : 'maintenance'} goal
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-900">
              💡 <strong>Tip:</strong> This calculation uses your BMI, gender, and activity level. You can adjust your goals anytime in your profile.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(3)}
              className="flex-1 h-12 rounded-xl border-2 border-gray-300 bg-white hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep(5)}
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white h-12 rounded-xl transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Allergies & Dietary Restrictions */}
      {step === 5 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-center block text-sm text-gray-700">Dietary Restrictions</label>
            <p className="text-sm text-gray-500 text-center">Select any that apply to you</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
            {allergyOptions.map((allergy) => (
              <div
                key={allergy}
                className={`flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  onboardingData.allergies.includes(allergy)
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleAllergy(allergy)}
              >
                <input
                  type="checkbox"
                  id={allergy}
                  checked={onboardingData.allergies.includes(allergy)}
                  onChange={() => toggleAllergy(allergy)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label
                  htmlFor={allergy}
                  className="text-sm cursor-pointer flex-1"
                >
                  {allergy}
                </label>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <label htmlFor="otherAllergy" className="block text-sm text-gray-700">Other (specify)</label>
            <input
              id="otherAllergy"
              type="text"
              placeholder="Enter any other dietary restriction"
              value={onboardingData.otherAllergy}
              onChange={(e) => setOnboardingData({...onboardingData, otherAllergy: e.target.value})}
              className="w-full h-12 rounded-xl border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(4)}
              className="flex-1 h-12 rounded-xl border-2 border-gray-300 bg-white hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleFinish}
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white h-12 rounded-xl transition-colors"
            >
              Finish Setup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}