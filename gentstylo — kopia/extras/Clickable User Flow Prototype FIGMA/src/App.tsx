import { useState } from "react";
import { NavigationMenu } from "./components/NavigationMenu";

// Scanner prototype
import { IntroScreen } from "./components/IntroScreen";
import { CameraScreen } from "./components/CameraScreen";
import { ConfirmationScreen } from "./components/ConfirmationScreen";
import { SuccessScreen } from "./components/SuccessScreen";

// Outfit prototype
import { HomeScreen } from "./components/outfit/HomeScreen";
import { OutfitSuggestionScreen } from "./components/outfit/OutfitSuggestionScreen";
import { ExplanationScreen } from "./components/outfit/ExplanationScreen";

// Capsule prototype
import { StyleSelectionScreen } from "./components/capsule/StyleSelectionScreen";
import { EssentialsListScreen } from "./components/capsule/EssentialsListScreen";
import { ProductCardScreen } from "./components/capsule/ProductCardScreen";

// Shopping prototype
import { SearchInitiationScreen } from "./components/shopping/SearchInitiationScreen";
import { SearchRefinementScreen } from "./components/shopping/SearchRefinementScreen";
import { RecommendationsScreen } from "./components/shopping/RecommendationsScreen";

// Occasion prototype
import { OccasionSelectionScreen } from "./components/occasion/OccasionSelectionScreen";
import { ContextDefinitionScreen } from "./components/occasion/ContextDefinitionScreen";
import { OutfitSuggestionsScreen } from "./components/occasion/OutfitSuggestionsScreen";

// Planner prototype
import { WeeklyViewScreen } from "./components/planner/WeeklyViewScreen";
import { OutfitSelectionScreen } from "./components/planner/OutfitSelectionScreen";
import { ConfirmationScreen as PlannerConfirmationScreen } from "./components/planner/ConfirmationScreen";

// Packing prototype
import { TripConfigurationScreen } from "./components/packing/TripConfigurationScreen";
import { CapsuleSuggestionScreen } from "./components/packing/CapsuleSuggestionScreen";
import { InteractivePackingScreen } from "./components/packing/InteractivePackingScreen";

// Wardrobe prototype
import { WardrobeGalleryScreen } from "./components/wardrobe/WardrobeGalleryScreen";
import { ClothingDetailsScreen } from "./components/wardrobe/ClothingDetailsScreen";
import { OutfitsWithItemScreen } from "./components/wardrobe/OutfitsWithItemScreen";

// Stats prototype
import { StatsDashboardScreen } from "./components/stats/StatsDashboardScreen";
import { HitsAndMissesScreen } from "./components/stats/HitsAndMissesScreen";
import { AISuggestionScreen } from "./components/stats/AISuggestionScreen";

// Challenge prototype
import { ChallengeCardScreen } from "./components/challenge/ChallengeCardScreen";
import { ChallengeDetailsScreen } from "./components/challenge/ChallengeDetailsScreen";
import { ChallengeFeedbackScreen } from "./components/challenge/ChallengeFeedbackScreen";

// Inspiration prototype
import { LookbookScreen } from "./components/inspiration/LookbookScreen";
import { MoodboardScreen } from "./components/inspiration/MoodboardScreen";
import { RecreateScreen } from "./components/inspiration/RecreateScreen";

// Fitting prototype
import { VirtualFittingScreen } from "./components/fitting/VirtualFittingScreen";

// New flow prototypes (flows #14-20)
import { UploadInspirationScreen } from "./components/photo-creator/UploadInspirationScreen";
import { AIAnalysisScreen } from "./components/photo-creator/AIAnalysisScreen";
import { YourVersionScreen } from "./components/photo-creator/YourVersionScreen";

import { SelectItemsScreen } from "./components/complete-outfit/SelectItemsScreen";
import { SuggestionsScreen } from "./components/complete-outfit/SuggestionsScreen";
import { FinalSelectionScreen } from "./components/complete-outfit/FinalSelectionScreen";

import { QuickScanScreen } from "./components/fitting-room/QuickScanScreen";
import { InstantSuggestionsScreen } from "./components/fitting-room/InstantSuggestionsScreen";
import { AnalysisConfirmationScreen } from "./components/fitting-room/AnalysisConfirmationScreen";

import { WeatherChangeScreen } from "./components/weather-alert/WeatherChangeScreen";
import { SuggestedModificationScreen } from "./components/weather-alert/SuggestedModificationScreen";
import { AcceptChangesScreen } from "./components/weather-alert/AcceptChangesScreen";

import { WeeklySummaryScreen } from "./components/outfit-readiness/WeeklySummaryScreen";
import { ChecklistScreen } from "./components/outfit-readiness/ChecklistScreen";
import { ReplacementScreen } from "./components/outfit-readiness/ReplacementScreen";

import { SpecialButtonScreen } from "./components/impression/SpecialButtonScreen";
import { StyleGuideScreen } from "./components/impression/StyleGuideScreen";
import { ShowstopperScreen } from "./components/impression/ShowstopperScreen";

import { StyleAcademyScreen } from "./components/style-academy/StyleAcademyScreen";
import { LessonScreen } from "./components/style-academy/LessonScreen";
import { LessonDetailScreen } from "./components/style-academy/LessonDetailScreen";

type Prototype = 'menu' | 'scanner' | 'outfit' | 'capsule' | 'shopping' | 'occasion' | 'planner' | 'packing' | 'wardrobe' | 'stats' | 'challenge' | 'inspiration' | 'fitting' | 'photo-creator' | 'complete-outfit' | 'fitting-room' | 'weather-alert' | 'outfit-readiness' | 'impression' | 'style-academy';
type ScannerScreen = 'intro' | 'camera' | 'confirmation' | 'success';
type OutfitScreen = 'home' | 'suggestion' | 'explanation';
type CapsuleScreen = 'style' | 'essentials' | 'product';
type ShoppingScreen = 'search' | 'refinement' | 'recommendations';
type OccasionScreen = 'selection' | 'context' | 'suggestions';
type PlannerScreen = 'weekly' | 'outfit-selection' | 'confirmation';
type PackingScreen = 'configuration' | 'capsule' | 'packing';
type WardrobeScreen = 'gallery' | 'details' | 'outfits';
type StatsScreen = 'dashboard' | 'hits-misses' | 'ai-suggestion';
type ChallengeScreen = 'card' | 'details' | 'feedback';
type InspirationScreen = 'lookbook' | 'moodboard' | 'recreate';
type FittingScreen = 'virtual-fitting';
type PhotoCreatorScreen = 'upload' | 'analysis' | 'your-version';
type CompleteOutfitScreen = 'select-items' | 'suggestions' | 'final-selection';
type FittingRoomScreen = 'quick-scan' | 'instant-suggestions' | 'analysis-confirmation';
type WeatherAlertScreen = 'weather-change' | 'suggested-modification' | 'accept-changes';
type OutfitReadinessScreen = 'weekly-summary' | 'checklist' | 'replacement';
type ImpressionScreen = 'special-button' | 'style-guide' | 'showstopper';
type StyleAcademyScreen = 'academy' | 'lessons' | 'lesson-detail';

export default function App() {
  const [currentPrototype, setCurrentPrototype] = useState<Prototype>('menu');
  
  // Scanner state
  const [scannerScreen, setScannerScreen] = useState<ScannerScreen>('intro');
  
  // Outfit state
  const [outfitScreen, setOutfitScreen] = useState<OutfitScreen>('home');
  
  // Capsule state
  const [capsuleScreen, setCapsuleScreen] = useState<CapsuleScreen>('style');
  const [selectedStyle, setSelectedStyle] = useState<string>('smart-casual');
  const [selectedItem, setSelectedItem] = useState<string>('Navy Blazer');

  // Shopping state
  const [shoppingScreen, setShoppingScreen] = useState<ShoppingScreen>('search');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchFilters, setSearchFilters] = useState<any>(null);

  // Occasion state
  const [occasionScreen, setOccasionScreen] = useState<OccasionScreen>('selection');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('');
  const [occasionContext, setOccasionContext] = useState<any>(null);

  // Planner state
  const [plannerScreen, setPlannerScreen] = useState<PlannerScreen>('weekly');
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedOutfit, setSelectedOutfit] = useState<any>(null);

  // Packing state
  const [packingScreen, setPackingScreen] = useState<PackingScreen>('configuration');
  const [tripData, setTripData] = useState<any>(null);

  // Wardrobe state
  const [wardrobeScreen, setWardrobeScreen] = useState<WardrobeScreen>('gallery');
  const [selectedWardrobeItem, setSelectedWardrobeItem] = useState<any>(null);

  // Stats state
  const [statsScreen, setStatsScreen] = useState<StatsScreen>('dashboard');
  const [forgottenItem, setForgottenItem] = useState<any>(null);

  // Challenge state
  const [challengeScreen, setChallengeScreen] = useState<ChallengeScreen>('card');
  const [challengeCompleted, setChallengeCompleted] = useState<boolean>(false);

  // Inspiration state
  const [inspirationScreen, setInspirationScreen] = useState<InspirationScreen>('lookbook');
  const [selectedLook, setSelectedLook] = useState<any>(null);

  // Fitting state
  const [fittingScreen, setFittingScreen] = useState<FittingScreen>('virtual-fitting');
  const [newItemForFitting, setNewItemForFitting] = useState<any>(null);

  // New flows state
  const [photoCreatorScreen, setPhotoCreatorScreen] = useState<PhotoCreatorScreen>('upload');
  const [uploadedPhoto, setUploadedPhoto] = useState<any>(null);
  const [analyzedOutfits, setAnalyzedOutfits] = useState<any[]>([]);

  const [completeOutfitScreen, setCompleteOutfitScreen] = useState<CompleteOutfitScreen>('select-items');
  const [selectedBaseItems, setSelectedBaseItems] = useState<any[]>([]);
  const [outfitSuggestions, setOutfitSuggestions] = useState<any[]>([]);

  const [fittingRoomScreen, setFittingRoomScreen] = useState<FittingRoomScreen>('quick-scan');
  const [scannedItem, setScannedItem] = useState<any>(null);
  const [compatibilityResults, setCompatibilityResults] = useState<any>(null);

  const [weatherAlertScreen, setWeatherAlertScreen] = useState<WeatherAlertScreen>('weather-change');
  const [weatherChange, setWeatherChange] = useState<any>(null);
  const [modificationSuggestion, setModificationSuggestion] = useState<any>(null);

  const [outfitReadinessScreen, setOutfitReadinessScreen] = useState<OutfitReadinessScreen>('weekly-summary');
  const [weeklyOutfits, setWeeklyOutfits] = useState<any[]>([]);
  const [checklistItems, setChecklistItems] = useState<any[]>([]);

  const [impressionScreen, setImpressionScreen] = useState<ImpressionScreen>('special-button');
  const [selectedStyleGuide, setSelectedStyleGuide] = useState<any>(null);

  const [styleAcademyScreen, setStyleAcademyScreen] = useState<StyleAcademyScreen>('academy');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  // Navigation handlers
  const handleSelectPrototype = (prototype: string) => {
    setCurrentPrototype(prototype as Prototype);
    // Reset screens when switching prototypes
    setScannerScreen('intro');
    setOutfitScreen('home');
    setCapsuleScreen('style');
    setShoppingScreen('search');
    setOccasionScreen('selection');
    setPlannerScreen('weekly');
    setPackingScreen('configuration');
    setWardrobeScreen('gallery');
    setStatsScreen('dashboard');
    setChallengeScreen('card');
    setInspirationScreen('lookbook');
    setFittingScreen('virtual-fitting');
    // Reset new flows screens
    setPhotoCreatorScreen('upload');
    setCompleteOutfitScreen('select-items');
    setFittingRoomScreen('quick-scan');
    setWeatherAlertScreen('weather-change');
    setOutfitReadinessScreen('weekly-summary');
    setImpressionScreen('special-button');
    setStyleAcademyScreen('academy');
  };

  const handleBackToMenu = () => {
    setCurrentPrototype('menu');
  };

  // Scanner handlers
  const handleScanClick = () => setScannerScreen('camera');
  const handlePhotoTaken = () => setScannerScreen('confirmation');
  const handleAddToCloset = () => setScannerScreen('success');
  const handleRestartScanner = () => setScannerScreen('intro');

  // Outfit handlers
  const handleShowSuggestion = () => setOutfitScreen('suggestion');
  const handleShowAnother = () => {
    // In a real app, this would generate a new suggestion
    setOutfitScreen('suggestion');
  };
  const handleLikeIt = () => setOutfitScreen('explanation');
  const handleDoneOutfit = () => handleBackToMenu();

  // Capsule handlers
  const handleStyleSelect = (style: string) => {
    setSelectedStyle(style);
    setCapsuleScreen('essentials');
  };
  const handleItemClick = (item: string) => {
    setSelectedItem(item);
    setCapsuleScreen('product');
  };
  const handleMarkOwned = () => {
    setCapsuleScreen('essentials');
  };

  // Shopping handlers
  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
    setShoppingScreen('refinement');
  };
  const handleShowRecommendations = (filters: any) => {
    setSearchFilters(filters);
    setShoppingScreen('recommendations');
  };

  // Occasion handlers
  const handleOccasionSelect = (occasion: string) => {
    setSelectedOccasion(occasion);
    setOccasionScreen('context');
  };
  const handleContextContinue = (context: any) => {
    setOccasionContext(context);
    setOccasionScreen('suggestions');
  };
  const handleGoShopping = () => {
    setCurrentPrototype('shopping');
    setShoppingScreen('search');
  };

  // Planner handlers
  const handleAddOutfit = (day: string) => {
    setSelectedDay(day);
    setPlannerScreen('outfit-selection');
  };
  const handleOutfitSelect = (outfit: any) => {
    setSelectedOutfit(outfit);
    setPlannerScreen('confirmation');
  };
  const handleBackToWeekly = () => {
    setPlannerScreen('weekly');
  };

  // Packing handlers
  const handleTripContinue = (data: any) => {
    setTripData(data);
    setPackingScreen('capsule');
  };
  const handleViewPackingList = () => {
    setPackingScreen('packing');
  };

  // Wardrobe handlers
  const handleWardrobeItemClick = (item: any) => {
    setSelectedWardrobeItem(item);
    setWardrobeScreen('details');
  };
  const handleSeeOutfits = () => {
    setWardrobeScreen('outfits');
  };
  const handleMarkToGiveAway = () => {
    // In a real app, this would mark the item
    console.log('Marked item for giving away');
  };
  const handleDeleteItem = () => {
    // In a real app, this would delete the item
    console.log('Deleted item');
    setWardrobeScreen('gallery');
  };
  const handleBackToGallery = () => {
    setWardrobeScreen('gallery');
  };
  const handleBackToDetails = () => {
    setWardrobeScreen('details');
  };

  // Stats handlers
  const handleViewDetails = () => {
    setStatsScreen('hits-misses');
  };
  const handleInspireMe = (item: any) => {
    setForgottenItem(item);
    setStatsScreen('ai-suggestion');
  };
  const handleBackToDashboard = () => {
    setStatsScreen('dashboard');
  };
  const handleBackToStats = () => {
    setStatsScreen('hits-misses');
  };
  const handleSaveOutfit = (outfit: any) => {
    console.log('Saved outfit:', outfit);
  };
  const handlePlanOutfit = (outfit: any) => {
    console.log('Planned outfit:', outfit);
    setCurrentPrototype('planner');
  };

  // Challenge handlers
  const handleViewChallenge = () => {
    setChallengeScreen('details');
  };
  const handleTakeChallenge = () => {
    setChallengeCompleted(true);
    setChallengeScreen('feedback');
  };
  const handleSkipChallenge = () => {
    setChallengeCompleted(false);
    setChallengeScreen('feedback');
  };
  const handleBackToChallenge = () => {
    setChallengeScreen('card');
  };

  // Inspiration handlers
  const handleSaveToMoodboard = (look: any) => {
    console.log('Saved to moodboard:', look);
  };
  const handleViewMoodboard = () => {
    setInspirationScreen('moodboard');
  };
  const handleRecreate = (look: any) => {
    setSelectedLook(look);
    setInspirationScreen('recreate');
  };
  const handleRecreateFromMoodboard = (look: any) => {
    setSelectedLook(look);
    setInspirationScreen('recreate');
  };
  const handleBackToLookbook = () => {
    setInspirationScreen('lookbook');
  };
  const handleBackToInspiration = () => {
    setInspirationScreen('lookbook');
  };

  // Fitting handlers
  const handleGoToPurchase = () => {
    console.log('Going to purchase');
  };
  const handleBackToShopping = () => {
    setCurrentPrototype('shopping');
  };

  // Photo Creator handlers
  const handlePhotoUpload = (photo: any) => {
    setUploadedPhoto(photo);
    setPhotoCreatorScreen('analysis');
  };
  const handleAnalysisComplete = (outfits: any[]) => {
    setAnalyzedOutfits(outfits);
    setPhotoCreatorScreen('your-version');
  };
  const handleBackToUpload = () => {
    setPhotoCreatorScreen('upload');
  };
  const handleBackToAnalysis = () => {
    setPhotoCreatorScreen('analysis');
  };

  // Complete Outfit handlers
  const handleItemsSelected = (items: any[]) => {
    setSelectedBaseItems(items);
    setCompleteOutfitScreen('suggestions');
  };
  const handleSelectSuggestion = (suggestion: any) => {
    setCompleteOutfitScreen('final-selection');
  };
  const handleBackToItems = () => {
    setCompleteOutfitScreen('select-items');
  };
  const handleBackToSuggestions = () => {
    setCompleteOutfitScreen('suggestions');
  };

  // Fitting Room handlers
  const handleItemScanned = (item: any) => {
    setScannedItem(item);
    setFittingRoomScreen('instant-suggestions');
  };
  const handleViewFullAnalysis = (results: any) => {
    setCompatibilityResults(results);
    setFittingRoomScreen('analysis-confirmation');
  };
  const handleBackToScan = () => {
    setFittingRoomScreen('quick-scan');
  };
  const handleBackToInstantSuggestions = () => {
    setFittingRoomScreen('instant-suggestions');
  };

  // Weather Alert handlers
  const handleWeatherUpdate = (change: any) => {
    setWeatherChange(change);
    setWeatherAlertScreen('suggested-modification');
  };
  const handleAcceptModification = (modification: any) => {
    setModificationSuggestion(modification);
    setWeatherAlertScreen('accept-changes');
  };
  const handleBackToWeather = () => {
    setWeatherAlertScreen('weather-change');
  };
  const handleBackToModification = () => {
    setWeatherAlertScreen('suggested-modification');
  };

  // Outfit Readiness handlers
  const handleStartChecklist = (outfits: any[]) => {
    setWeeklyOutfits(outfits);
    setOutfitReadinessScreen('checklist');
  };
  const handleNeedReplacement = (items: any[]) => {
    setChecklistItems(items);
    setOutfitReadinessScreen('replacement');
  };
  const handleBackToSummary = () => {
    setOutfitReadinessScreen('weekly-summary');
  };
  const handleBackToChecklist = () => {
    setOutfitReadinessScreen('checklist');
  };

  // Impression handlers
  const handleGetStyleGuide = () => {
    setImpressionScreen('style-guide');
  };
  const handleSelectGuide = (guide: any) => {
    setSelectedStyleGuide(guide);
    setImpressionScreen('showstopper');
  };
  const handleBackToButton = () => {
    setImpressionScreen('special-button');
  };
  const handleBackToGuide = () => {
    setImpressionScreen('style-guide');
  };

  // Style Academy handlers
  const handleCategorySelect = (category: any) => {
    setSelectedCategory(category);
    setStyleAcademyScreen('lessons');
  };
  const handleLessonSelect = (lesson: any) => {
    setSelectedLesson(lesson);
    setStyleAcademyScreen('lesson-detail');
  };
  const handleLessonComplete = () => {
    // Mark lesson as completed and go back to lessons
    setStyleAcademyScreen('lessons');
  };
  const handleBackToAcademy = () => {
    setStyleAcademyScreen('academy');
  };
  const handleBackToLessons = () => {
    setStyleAcademyScreen('lessons');
  };

  const renderScanner = () => {
    switch (scannerScreen) {
      case 'intro':
        return <IntroScreen onScanClick={handleScanClick} />;
      case 'camera':
        return <CameraScreen onPhotoTaken={handlePhotoTaken} />;
      case 'confirmation':
        return <ConfirmationScreen onAddToCloset={handleAddToCloset} />;
      case 'success':
        return <SuccessScreen onRestart={handleRestartScanner} onBackToMenu={handleBackToMenu} />;
    }
  };

  const renderOutfit = () => {
    switch (outfitScreen) {
      case 'home':
        return <HomeScreen onShowSuggestion={handleShowSuggestion} onBack={handleBackToMenu} />;
      case 'suggestion':
        return <OutfitSuggestionScreen onShowAnother={handleShowAnother} onLikeIt={handleLikeIt} />;
      case 'explanation':
        return <ExplanationScreen onDone={handleDoneOutfit} />;
    }
  };

  const renderCapsule = () => {
    switch (capsuleScreen) {
      case 'style':
        return <StyleSelectionScreen onStyleSelect={handleStyleSelect} onBack={handleBackToMenu} />;
      case 'essentials':
        return <EssentialsListScreen selectedStyle={selectedStyle} onItemClick={handleItemClick} />;
      case 'product':
        return <ProductCardScreen item={selectedItem} onMarkOwned={handleMarkOwned} />;
    }
  };

  const renderShopping = () => {
    switch (shoppingScreen) {
      case 'search':
        return <SearchInitiationScreen onSearchSubmit={handleSearchSubmit} onBack={handleBackToMenu} />;
      case 'refinement':
        return <SearchRefinementScreen searchQuery={searchQuery} onShowRecommendations={handleShowRecommendations} />;
      case 'recommendations':
        return <RecommendationsScreen filters={searchFilters} onBackToMenu={handleBackToMenu} />;
    }
  };

  const renderOccasion = () => {
    switch (occasionScreen) {
      case 'selection':
        return <OccasionSelectionScreen onOccasionSelect={handleOccasionSelect} onBack={handleBackToMenu} />;
      case 'context':
        return <ContextDefinitionScreen occasion={selectedOccasion} onContinue={handleContextContinue} />;
      case 'suggestions':
        return <OutfitSuggestionsScreen context={occasionContext} onBackToMenu={handleBackToMenu} onGoShopping={handleGoShopping} />;
    }
  };

  const renderPlanner = () => {
    switch (plannerScreen) {
      case 'weekly':
        return <WeeklyViewScreen onAddOutfit={handleAddOutfit} onBack={handleBackToMenu} />;
      case 'outfit-selection':
        return <OutfitSelectionScreen selectedDay={selectedDay} onOutfitSelect={handleOutfitSelect} />;
      case 'confirmation':
        return <PlannerConfirmationScreen selectedDay={selectedDay} selectedOutfit={selectedOutfit} onBackToWeekly={handleBackToWeekly} />;
    }
  };

  const renderPacking = () => {
    switch (packingScreen) {
      case 'configuration':
        return <TripConfigurationScreen onContinue={handleTripContinue} onBack={handleBackToMenu} />;
      case 'capsule':
        return <CapsuleSuggestionScreen tripData={tripData} onViewPackingList={handleViewPackingList} />;
      case 'packing':
        return <InteractivePackingScreen tripData={tripData} onBackToMenu={handleBackToMenu} />;
    }
  };

  const renderWardrobe = () => {
    switch (wardrobeScreen) {
      case 'gallery':
        return <WardrobeGalleryScreen onItemClick={handleWardrobeItemClick} onBack={handleBackToMenu} />;
      case 'details':
        return <ClothingDetailsScreen item={selectedWardrobeItem} onSeeOutfits={handleSeeOutfits} onMarkToGiveAway={handleMarkToGiveAway} onDelete={handleDeleteItem} onBackToGallery={handleBackToGallery} />;
      case 'outfits':
        return <OutfitsWithItemScreen item={selectedWardrobeItem} onBackToDetails={handleBackToDetails} />;
    }
  };

  const renderStats = () => {
    switch (statsScreen) {
      case 'dashboard':
        return <StatsDashboardScreen onViewDetails={handleViewDetails} onBack={handleBackToMenu} />;
      case 'hits-misses':
        return <HitsAndMissesScreen onInspireMe={handleInspireMe} onBackToDashboard={handleBackToDashboard} />;
      case 'ai-suggestion':
        return <AISuggestionScreen forgottenItem={forgottenItem} onSaveOutfit={handleSaveOutfit} onPlanOutfit={handlePlanOutfit} onBackToStats={handleBackToStats} />;
    }
  };

  const renderChallenge = () => {
    switch (challengeScreen) {
      case 'card':
        return <ChallengeCardScreen onViewChallenge={handleViewChallenge} onBack={handleBackToMenu} />;
      case 'details':
        return <ChallengeDetailsScreen onTakeChallenge={handleTakeChallenge} onSkipChallenge={handleSkipChallenge} onBackToChallenge={handleBackToChallenge} />;
      case 'feedback':
        return <ChallengeFeedbackScreen challengeCompleted={challengeCompleted} onBackToMenu={handleBackToMenu} />;
    }
  };

  const renderInspiration = () => {
    switch (inspirationScreen) {
      case 'lookbook':
        return <LookbookScreen onSaveToMoodboard={handleSaveToMoodboard} onViewMoodboard={handleViewMoodboard} onRecreate={handleRecreate} onBack={handleBackToMenu} />;
      case 'moodboard':
        return <MoodboardScreen onRecreateFromMoodboard={handleRecreateFromMoodboard} onBackToLookbook={handleBackToLookbook} />;
      case 'recreate':
        return <RecreateScreen inspirationLook={selectedLook} onGoShopping={handleGoShopping} onSaveOutfit={handleSaveOutfit} onBackToInspiration={handleBackToInspiration} />;
    }
  };

  const renderFitting = () => {
    const mockNewItem = {
      name: "Premium Navy Blazer",
      price: "$280",
      image: "https://images.unsplash.com/photo-1626872640220-e5f4454198b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXZ5JTIwYmxhemVyJTIwbWVuc3dlYXJ8ZW58MXx8fHwxNzU4NjkxMjQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    };
    
    return <VirtualFittingScreen 
      newItem={newItemForFitting || mockNewItem} 
      onSaveOutfit={handleSaveOutfit} 
      onGoToPurchase={handleGoToPurchase} 
      onBackToShopping={handleBackToShopping} 
    />;
  };

  // New flows render functions
  const renderPhotoCreator = () => {
    switch (photoCreatorScreen) {
      case 'upload':
        return <UploadInspirationScreen onPhotoUpload={handlePhotoUpload} onBack={handleBackToMenu} />;
      case 'analysis':
        return <AIAnalysisScreen uploadedPhoto={uploadedPhoto} onAnalysisComplete={handleAnalysisComplete} onBack={handleBackToUpload} />;
      case 'your-version':
        return <YourVersionScreen analyzedOutfits={analyzedOutfits} onSaveOutfit={handleSaveOutfit} onBack={handleBackToAnalysis} onBackToMenu={handleBackToMenu} />;
    }
  };

  const renderCompleteOutfit = () => {
    switch (completeOutfitScreen) {
      case 'select-items':
        return <SelectItemsScreen onItemsSelected={handleItemsSelected} onBack={handleBackToMenu} />;
      case 'suggestions':
        return <SuggestionsScreen baseItems={selectedBaseItems} onSelectSuggestion={handleSelectSuggestion} onBack={handleBackToItems} />;
      case 'final-selection':
        return <FinalSelectionScreen onSaveOutfit={handleSaveOutfit} onPlanOutfit={handlePlanOutfit} onBack={handleBackToSuggestions} onBackToMenu={handleBackToMenu} />;
    }
  };

  const renderFittingRoom = () => {
    switch (fittingRoomScreen) {
      case 'quick-scan':
        return <QuickScanScreen onItemScanned={handleItemScanned} onBack={handleBackToMenu} />;
      case 'instant-suggestions':
        return <InstantSuggestionsScreen scannedItem={scannedItem} onViewFullAnalysis={handleViewFullAnalysis} onBack={handleBackToScan} />;
      case 'analysis-confirmation':
        return <AnalysisConfirmationScreen results={compatibilityResults} onGoToPurchase={handleGoToPurchase} onBack={handleBackToInstantSuggestions} onBackToMenu={handleBackToMenu} />;
    }
  };

  const renderWeatherAlert = () => {
    switch (weatherAlertScreen) {
      case 'weather-change':
        return <WeatherChangeScreen onWeatherUpdate={handleWeatherUpdate} onBack={handleBackToMenu} />;
      case 'suggested-modification':
        return <SuggestedModificationScreen weatherChange={weatherChange} onAcceptModification={handleAcceptModification} onBack={handleBackToWeather} />;
      case 'accept-changes':
        return <AcceptChangesScreen modification={modificationSuggestion} onBackToMenu={handleBackToMenu} onBack={handleBackToModification} />;
    }
  };

  const renderOutfitReadiness = () => {
    switch (outfitReadinessScreen) {
      case 'weekly-summary':
        return <WeeklySummaryScreen onStartChecklist={handleStartChecklist} onBack={handleBackToMenu} />;
      case 'checklist':
        return <ChecklistScreen outfits={weeklyOutfits} onNeedReplacement={handleNeedReplacement} onBack={handleBackToSummary} />;
      case 'replacement':
        return <ReplacementScreen items={checklistItems} onGoShopping={handleGoShopping} onBack={handleBackToChecklist} onBackToMenu={handleBackToMenu} />;
    }
  };

  const renderImpression = () => {
    switch (impressionScreen) {
      case 'special-button':
        return <SpecialButtonScreen onGetStyleGuide={handleGetStyleGuide} onBack={handleBackToMenu} />;
      case 'style-guide':
        return <StyleGuideScreen onSelectGuide={handleSelectGuide} onBack={handleBackToButton} />;
      case 'showstopper':
        return <ShowstopperScreen styleGuide={selectedStyleGuide} onSaveOutfit={handleSaveOutfit} onPlanOutfit={handlePlanOutfit} onBack={handleBackToGuide} onBackToMenu={handleBackToMenu} />;
    }
  };

  const renderStyleAcademy = () => {
    switch (styleAcademyScreen) {
      case 'academy':
        return <StyleAcademyScreen onCategorySelect={handleCategorySelect} onBack={handleBackToMenu} />;
      case 'lessons':
        return <LessonScreen category={selectedCategory} onLessonSelect={handleLessonSelect} onBack={handleBackToAcademy} />;
      case 'lesson-detail':
        return <LessonDetailScreen lesson={selectedLesson} onComplete={handleLessonComplete} onBack={handleBackToLessons} />;
    }
  };

  const renderCurrentPrototype = () => {
    switch (currentPrototype) {
      case 'menu':
        return <NavigationMenu onSelectPrototype={handleSelectPrototype} />;
      case 'scanner':
        return renderScanner();
      case 'outfit':
        return renderOutfit();
      case 'capsule':
        return renderCapsule();
      case 'shopping':
        return renderShopping();
      case 'occasion':
        return renderOccasion();
      case 'planner':
        return renderPlanner();
      case 'packing':
        return renderPacking();
      case 'wardrobe':
        return renderWardrobe();
      case 'stats':
        return renderStats();
      case 'challenge':
        return renderChallenge();
      case 'inspiration':
        return renderInspiration();
      case 'fitting':
        return renderFitting();
      case 'photo-creator':
        return renderPhotoCreator();
      case 'complete-outfit':
        return renderCompleteOutfit();
      case 'fitting-room':
        return renderFittingRoom();
      case 'weather-alert':
        return renderWeatherAlert();
      case 'outfit-readiness':
        return renderOutfitReadiness();
      case 'impression':
        return renderImpression();
      case 'style-academy':
        return renderStyleAcademy();
    }
  };

  return (
    <div className="size-full">
      {renderCurrentPrototype()}
    </div>
  );
}