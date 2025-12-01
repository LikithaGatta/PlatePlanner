import { ArrowLeft, Clock, Flame, Users, Heart, Share2, Home, Calendar, BookOpen, User, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './ImageWithFallback';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

interface RecipeDetailProps {
  onNavigate: (screen: any) => void;
}

export function RecipeDetail({ onNavigate }: RecipeDetailProps) {
  const { selectedRecipe, toggleFavorite, addActivity, rateRecipe } = useApp();

  // 👇 All hooks go at the top and are unconditional
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [currentRating, setCurrentRating] = useState<number>(selectedRecipe?.rating ?? 0);

  // Keep local rating in sync if selectedRecipe changes
  useEffect(() => {
    setCurrentRating(selectedRecipe?.rating ?? 0);
  }, [selectedRecipe]);

  if (!selectedRecipe) {
    return (
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
        <p className="text-gray-500">No recipe selected</p>
        <Button
          onClick={() => onNavigate('recipe')}
          className="mt-4 bg-purple-600 hover:bg-purple-700"
        >
          Browse Recipes
        </Button>
      </div>
    );
  }

  const handleToggleFavorite = () => {
    toggleFavorite(selectedRecipe.id);
    if (!selectedRecipe.isFavorite) {
      toast.success('Added to favorites!');
      addActivity({
        type: 'favorite',
        description: `Favorited ${selectedRecipe.name}`
      });
    } else {
      toast.success('Removed from favorites');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: selectedRecipe.name,
        text: `Check out this recipe: ${selectedRecipe.name} - ${selectedRecipe.calories} calories`,
        url: window.location.href
      }).catch(() => {
        copyToClipboard();
      });
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    const text = `${selectedRecipe.name} - ${selectedRecipe.calories} calories`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          toast.success('Recipe details copied to clipboard!');
        })
        .catch(() => {
          fallbackCopyToClipboard(text);
        });
    } else {
      fallbackCopyToClipboard(text);
    }
  };

  const fallbackCopyToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        toast.success('Recipe details copied!');
      } else {
        toast.error('Could not copy to clipboard');
      }
    } catch (err) {
      toast.error('Could not copy to clipboard');
    }
    
    document.body.removeChild(textArea);
  };

  const handleAddToMeals = () => {
    addActivity({
      type: 'meal',
      description: `Added ${selectedRecipe.name} to meal plan`
    });
    toast.success('Added to your meals!', {
      description: 'You can plan it in your meal planner'
    });
  };

  // ⭐ Rating handler – updates local state AND context/backend
  const handleRating = (rating: number) => {
    setCurrentRating(rating); // keeps stars filled after click
    rateRecipe(selectedRecipe.id, rating);

    toast.success(`Rated ${rating} star${rating > 1 ? 's' : ''}!`);
    addActivity({
      type: 'rating',
      description: `Rated ${selectedRecipe.name} ${rating} stars`
    });
  };

  const ingredients = selectedRecipe.ingredients || [
    'Ingredients not available',
    'Check the recipe source for details'
  ];

  const instructions = selectedRecipe.instructions || [
    'Instructions not available',
    'Check the recipe source for details'
  ];

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Image Header */}
      <div className="relative h-64">
        <ImageWithFallback 
          src={selectedRecipe.image}
          alt={selectedRecipe.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        <button 
          onClick={() => onNavigate('recipe')}
          className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-900" />
        </button>
        
        <div className="absolute top-4 right-4 flex gap-2">
          <button 
            onClick={handleToggleFavorite}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
          >
            <Heart 
              className={`w-5 h-5 ${selectedRecipe.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-900'}`} 
            />
          </button>
          <button 
            onClick={handleShare}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
          >
            <Share2 className="w-5 h-5 text-gray-900" />
          </button>
        </div>
        
        <div className="absolute bottom-4 left-4 right-4">
          <h2 className="text-white mb-2">{selectedRecipe.name}</h2>
          <div className="flex items-center gap-4 text-white/90 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {selectedRecipe.time}
            </div>
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4" />
              {selectedRecipe.calories} cal
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              2 servings
            </div>
          </div>
          {selectedRecipe.dietaryTags && selectedRecipe.dietaryTags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mt-2">
              {selectedRecipe.dietaryTags.map((tag) => (
                <span 
                  key={tag} 
                  className="px-2 py-0.5 bg-purple-600/90 backdrop-blur-sm text-white text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
        <Tabs defaultValue="ingredients" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12 rounded-xl">
            <TabsTrigger value="ingredients" className="rounded-lg">Ingredients</TabsTrigger>
            <TabsTrigger value="instructions" className="rounded-lg">Instructions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ingredients" className="space-y-3 mt-4">
            {ingredients.map((ingredient, index) => (
              <Card key={index} className="p-4 border-2 border-gray-200 hover:border-purple-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-900 text-sm">{ingredient}</span>
                </div>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="instructions" className="space-y-3 mt-4">
            {instructions.map((instruction, index) => (
              <Card key={index} className="p-4 border-2 border-gray-200">
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 text-sm">{instruction}</p>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Nutritional Info */}
        {(selectedRecipe.protein || selectedRecipe.carbs || selectedRecipe.fat) && (
          <Card className="p-4 border-2 border-purple-100 bg-purple-50/30">
            <p className="text-sm text-gray-700 mb-3">Nutritional Information (per serving)</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-purple-900">{selectedRecipe.protein || 0}g</p>
                <p className="text-xs text-gray-500">Protein</p>
              </div>
              <div>
                <p className="text-purple-900">{selectedRecipe.carbs || 0}g</p>
                <p className="text-xs text-gray-500">Carbs</p>
              </div>
              <div>
                <p className="text-purple-900">{selectedRecipe.fat || 0}g</p>
                <p className="text-xs text-gray-500">Fat</p>
              </div>
            </div>
          </Card>
        )}

        {/* Rating Section */}
        <Card className="p-4 border-2 border-gray-200">
          <p className="text-sm text-gray-700 mb-3">Rate this recipe</p>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(null)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    (hoveredRating !== null ? star <= hoveredRating : star <= currentRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          {currentRating > 0 && (
            <p className="text-center text-xs text-gray-500 mt-2">
              Your rating: {currentRating} star{currentRating > 1 ? 's' : ''}
            </p>
          )}
        </Card>

        <Button
          onClick={handleAddToMeals}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white h-12 rounded-xl shadow-md"
        >
          Add to My Meals
        </Button>
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <div className="flex justify-around">
          <button 
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"
            onClick={() => onNavigate('home')}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"
            onClick={() => onNavigate('track-meals')}
          >
            <Calendar className="w-6 h-6" />
            <span className="text-xs">Track</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1 text-purple-600"
            onClick={() => onNavigate('recipe')}
          >
            <BookOpen className="w-6 h-6" />
            <span className="text-xs">Recipes</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"
            onClick={() => onNavigate('profile')}
          >
            <User className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
