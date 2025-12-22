import { Language } from '@/contexts/LanguageContext';

type TranslationKeys = {
  // Common
  hello: string;
  loading: string;
  save: string;
  cancel: string;
  confirm: string;
  delete: string;
  edit: string;
  share: string;
  search: string;
  
  // Header
  dsPortal: string;
  dataScience: string;
  games: string;
  calculator: string;
  upload: string;
  
  // Dashboard
  totalSubjects: string;
  resources: string;
  thirdSemester: string;
  fourthSemester: string;
  coreSubjects: string;
  comingSoon: string;
  noSubjectsFound: string;
  fourthSemResources: string;
  stayTuned: string;
  cgpaCalculator: string;
  student: string;
  admin: string;
  
  // Profile
  myProfile: string;
  settings: string;
  notification: string;
  notifications: string;
  shareApp: string;
  logOut: string;
  theme: string;
  language: string;
  
  // Auth
  signIn: string;
  signUp: string;
  email: string;
  password: string;
  fullName: string;
  welcomeBack: string;
  createAccount: string;
  dontHaveAccount: string;
  alreadyHaveAccount: string;
  signingIn: string;
  signingUp: string;
  
  // Games
  dailyGames: string;
  miniSudoku: string;
  zipGame: string;
  playNow: string;
  leaderboard: string;
  
  // Notifications
  notificationsEnabled: string;
  notificationsDisabled: string;
  toDisableNotifications: string;
  youWillReceiveNotifications: string;
  
  // Calculator
  cgpaCalc: string;
  semester: string;
  subject: string;
  credits: string;
  grade: string;
  calculate: string;
  result: string;
  
  // Quiz
  quiz: string;
  startQuiz: string;
  score: string;
  correct: string;
  incorrect: string;
  next: string;
  previous: string;
  submit: string;
  
  // Resources
  downloadResource: string;
  viewResource: string;
  notes: string;
  questionPapers: string;
  syllabus: string;
};

const translations: Record<Language, TranslationKeys> = {
  en: {
    // Common
    hello: 'Hello',
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    share: 'Share',
    search: 'Search',
    
    // Header
    dsPortal: 'DS Portal',
    dataScience: 'Data Science Resources',
    games: 'Games',
    calculator: 'Calculator',
    upload: 'Upload',
    
    // Dashboard
    totalSubjects: 'Total Subjects',
    resources: 'Resources',
    thirdSemester: '3rd Semester',
    fourthSemester: '4th Semester',
    coreSubjects: 'Core subjects',
    comingSoon: 'Coming soon',
    noSubjectsFound: 'No subjects found for 3rd semester.',
    fourthSemResources: '4th Semester Resources',
    stayTuned: 'Subjects and materials will be added soon. Stay tuned!',
    cgpaCalculator: 'CGPA Calculator',
    student: 'Student',
    admin: 'Admin',
    
    // Profile
    myProfile: 'My Profile',
    settings: 'Settings',
    notification: 'Notification',
    notifications: 'Notifications',
    shareApp: 'Share App',
    logOut: 'Log Out',
    theme: 'Theme',
    language: 'Language',
    
    // Auth
    signIn: 'Sign In',
    signUp: 'Sign Up',
    email: 'Email',
    password: 'Password',
    fullName: 'Full Name',
    welcomeBack: 'Welcome back',
    createAccount: 'Create an account',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    signingIn: 'Signing in...',
    signingUp: 'Signing up...',
    
    // Games
    dailyGames: 'Daily Games',
    miniSudoku: 'Mini Sudoku',
    zipGame: 'Zip Game',
    playNow: 'Play Now',
    leaderboard: 'Leaderboard',
    
    // Notifications
    notificationsEnabled: 'Notifications Enabled',
    notificationsDisabled: 'Notifications',
    toDisableNotifications: 'To disable notifications, please use your browser settings',
    youWillReceiveNotifications: 'You will now receive notifications',
    
    // Calculator
    cgpaCalc: 'CGPA Calculator',
    semester: 'Semester',
    subject: 'Subject',
    credits: 'Credits',
    grade: 'Grade',
    calculate: 'Calculate',
    result: 'Result',
    
    // Quiz
    quiz: 'Quiz',
    startQuiz: 'Start Quiz',
    score: 'Score',
    correct: 'Correct',
    incorrect: 'Incorrect',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    
    // Resources
    downloadResource: 'Download Resource',
    viewResource: 'View Resource',
    notes: 'Notes',
    questionPapers: 'Question Papers',
    syllabus: 'Syllabus',
  },
  
  hi: {
    // Common
    hello: 'नमस्ते',
    loading: 'लोड हो रहा है...',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    confirm: 'पुष्टि करें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    share: 'साझा करें',
    search: 'खोजें',
    
    // Header
    dsPortal: 'DS पोर्टल',
    dataScience: 'डेटा साइंस संसाधन',
    games: 'खेल',
    calculator: 'कैलकुलेटर',
    upload: 'अपलोड',
    
    // Dashboard
    totalSubjects: 'कुल विषय',
    resources: 'संसाधन',
    thirdSemester: 'तीसरा सेमेस्टर',
    fourthSemester: 'चौथा सेमेस्टर',
    coreSubjects: 'मुख्य विषय',
    comingSoon: 'जल्द आ रहा है',
    noSubjectsFound: 'तीसरे सेमेस्टर के लिए कोई विषय नहीं मिला।',
    fourthSemResources: 'चौथे सेमेस्टर के संसाधन',
    stayTuned: 'विषय और सामग्री जल्द जोड़ी जाएगी। बने रहें!',
    cgpaCalculator: 'CGPA कैलकुलेटर',
    student: 'छात्र',
    admin: 'प्रशासक',
    
    // Profile
    myProfile: 'मेरी प्रोफाइल',
    settings: 'सेटिंग्स',
    notification: 'सूचना',
    notifications: 'सूचनाएं',
    shareApp: 'ऐप शेयर करें',
    logOut: 'लॉग आउट',
    theme: 'थीम',
    language: 'भाषा',
    
    // Auth
    signIn: 'साइन इन',
    signUp: 'साइन अप',
    email: 'ईमेल',
    password: 'पासवर्ड',
    fullName: 'पूरा नाम',
    welcomeBack: 'वापस स्वागत है',
    createAccount: 'खाता बनाएं',
    dontHaveAccount: 'खाता नहीं है?',
    alreadyHaveAccount: 'पहले से खाता है?',
    signingIn: 'साइन इन हो रहा है...',
    signingUp: 'साइन अप हो रहा है...',
    
    // Games
    dailyGames: 'दैनिक खेल',
    miniSudoku: 'मिनी सुडोकू',
    zipGame: 'ज़िप गेम',
    playNow: 'अभी खेलें',
    leaderboard: 'लीडरबोर्ड',
    
    // Notifications
    notificationsEnabled: 'सूचनाएं सक्षम',
    notificationsDisabled: 'सूचनाएं',
    toDisableNotifications: 'सूचनाएं बंद करने के लिए ब्राउज़र सेटिंग्स का उपयोग करें',
    youWillReceiveNotifications: 'अब आपको सूचनाएं मिलेंगी',
    
    // Calculator
    cgpaCalc: 'CGPA कैलकुलेटर',
    semester: 'सेमेस्टर',
    subject: 'विषय',
    credits: 'क्रेडिट',
    grade: 'ग्रेड',
    calculate: 'गणना करें',
    result: 'परिणाम',
    
    // Quiz
    quiz: 'प्रश्नोत्तरी',
    startQuiz: 'प्रश्नोत्तरी शुरू करें',
    score: 'स्कोर',
    correct: 'सही',
    incorrect: 'गलत',
    next: 'अगला',
    previous: 'पिछला',
    submit: 'जमा करें',
    
    // Resources
    downloadResource: 'संसाधन डाउनलोड करें',
    viewResource: 'संसाधन देखें',
    notes: 'नोट्स',
    questionPapers: 'प्रश्न पत्र',
    syllabus: 'पाठ्यक्रम',
  },
  
  mr: {
    // Common
    hello: 'नमस्कार',
    loading: 'लोड होत आहे...',
    save: 'जतन करा',
    cancel: 'रद्द करा',
    confirm: 'पुष्टी करा',
    delete: 'हटवा',
    edit: 'संपादित करा',
    share: 'शेअर करा',
    search: 'शोधा',
    
    // Header
    dsPortal: 'DS पोर्टल',
    dataScience: 'डेटा सायन्स संसाधने',
    games: 'खेळ',
    calculator: 'कॅल्क्युलेटर',
    upload: 'अपलोड',
    
    // Dashboard
    totalSubjects: 'एकूण विषय',
    resources: 'संसाधने',
    thirdSemester: 'तिसरे सेमिस्टर',
    fourthSemester: 'चौथे सेमिस्टर',
    coreSubjects: 'मुख्य विषय',
    comingSoon: 'लवकरच येत आहे',
    noSubjectsFound: 'तिसऱ्या सेमिस्टरसाठी कोणतेही विषय सापडले नाहीत.',
    fourthSemResources: 'चौथ्या सेमिस्टरची संसाधने',
    stayTuned: 'विषय आणि साहित्य लवकरच जोडले जातील. संपर्कात रहा!',
    cgpaCalculator: 'CGPA कॅल्क्युलेटर',
    student: 'विद्यार्थी',
    admin: 'प्रशासक',
    
    // Profile
    myProfile: 'माझी प्रोफाइल',
    settings: 'सेटिंग्ज',
    notification: 'सूचना',
    notifications: 'सूचना',
    shareApp: 'अॅप शेअर करा',
    logOut: 'लॉग आउट',
    theme: 'थीम',
    language: 'भाषा',
    
    // Auth
    signIn: 'साइन इन',
    signUp: 'साइन अप',
    email: 'ईमेल',
    password: 'पासवर्ड',
    fullName: 'पूर्ण नाव',
    welcomeBack: 'परत स्वागत',
    createAccount: 'खाते तयार करा',
    dontHaveAccount: 'खाते नाही?',
    alreadyHaveAccount: 'आधीच खाते आहे?',
    signingIn: 'साइन इन होत आहे...',
    signingUp: 'साइन अप होत आहे...',
    
    // Games
    dailyGames: 'दैनिक खेळ',
    miniSudoku: 'मिनी सुडोकू',
    zipGame: 'झिप गेम',
    playNow: 'आता खेळा',
    leaderboard: 'लीडरबोर्ड',
    
    // Notifications
    notificationsEnabled: 'सूचना सक्षम',
    notificationsDisabled: 'सूचना',
    toDisableNotifications: 'सूचना बंद करण्यासाठी ब्राउझर सेटिंग्ज वापरा',
    youWillReceiveNotifications: 'आता तुम्हाला सूचना मिळतील',
    
    // Calculator
    cgpaCalc: 'CGPA कॅल्क्युलेटर',
    semester: 'सेमिस्टर',
    subject: 'विषय',
    credits: 'क्रेडिट',
    grade: 'ग्रेड',
    calculate: 'गणना करा',
    result: 'निकाल',
    
    // Quiz
    quiz: 'प्रश्नमंजुषा',
    startQuiz: 'प्रश्नमंजुषा सुरू करा',
    score: 'स्कोअर',
    correct: 'बरोबर',
    incorrect: 'चुकीचे',
    next: 'पुढील',
    previous: 'मागील',
    submit: 'सबमिट करा',
    
    // Resources
    downloadResource: 'संसाधन डाउनलोड करा',
    viewResource: 'संसाधन पहा',
    notes: 'नोट्स',
    questionPapers: 'प्रश्नपत्रिका',
    syllabus: 'अभ्यासक्रम',
  },
  
  kn: {
    // Common
    hello: 'ನಮಸ್ಕಾರ',
    loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    save: 'ಉಳಿಸಿ',
    cancel: 'ರದ್ದುಮಾಡಿ',
    confirm: 'ದೃಢೀಕರಿಸಿ',
    delete: 'ಅಳಿಸಿ',
    edit: 'ಸಂಪಾದಿಸಿ',
    share: 'ಹಂಚಿಕೊಳ್ಳಿ',
    search: 'ಹುಡುಕಿ',
    
    // Header
    dsPortal: 'DS ಪೋರ್ಟಲ್',
    dataScience: 'ಡೇಟಾ ಸೈನ್ಸ್ ಸಂಪನ್ಮೂಲಗಳು',
    games: 'ಆಟಗಳು',
    calculator: 'ಕ್ಯಾಲ್ಕುಲೇಟರ್',
    upload: 'ಅಪ್‌ಲೋಡ್',
    
    // Dashboard
    totalSubjects: 'ಒಟ್ಟು ವಿಷಯಗಳು',
    resources: 'ಸಂಪನ್ಮೂಲಗಳು',
    thirdSemester: '3ನೇ ಸೆಮಿಸ್ಟರ್',
    fourthSemester: '4ನೇ ಸೆಮಿಸ್ಟರ್',
    coreSubjects: 'ಮುಖ್ಯ ವಿಷಯಗಳು',
    comingSoon: 'ಶೀಘ್ರದಲ್ಲಿ ಬರುತ್ತಿದೆ',
    noSubjectsFound: '3ನೇ ಸೆಮಿಸ್ಟರ್‌ಗೆ ಯಾವುದೇ ವಿಷಯಗಳು ಕಂಡುಬಂದಿಲ್ಲ.',
    fourthSemResources: '4ನೇ ಸೆಮಿಸ್ಟರ್ ಸಂಪನ್ಮೂಲಗಳು',
    stayTuned: 'ವಿಷಯಗಳು ಮತ್ತು ಸಾಮಗ್ರಿಗಳನ್ನು ಶೀಘ್ರದಲ್ಲಿ ಸೇರಿಸಲಾಗುವುದು. ನಮ್ಮೊಂದಿಗಿರಿ!',
    cgpaCalculator: 'CGPA ಕ್ಯಾಲ್ಕುಲೇಟರ್',
    student: 'ವಿದ್ಯಾರ್ಥಿ',
    admin: 'ನಿರ್ವಾಹಕ',
    
    // Profile
    myProfile: 'ನನ್ನ ಪ್ರೊಫೈಲ್',
    settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    notification: 'ಅಧಿಸೂಚನೆ',
    notifications: 'ಅಧಿಸೂಚನೆಗಳು',
    shareApp: 'ಆ್ಯಪ್ ಹಂಚಿಕೊಳ್ಳಿ',
    logOut: 'ಲಾಗ್ ಔಟ್',
    theme: 'ಥೀಮ್',
    language: 'ಭಾಷೆ',
    
    // Auth
    signIn: 'ಸೈನ್ ಇನ್',
    signUp: 'ಸೈನ್ ಅಪ್',
    email: 'ಇಮೇಲ್',
    password: 'ಪಾಸ್‌ವರ್ಡ್',
    fullName: 'ಪೂರ್ಣ ಹೆಸರು',
    welcomeBack: 'ಮರಳಿ ಸ್ವಾಗತ',
    createAccount: 'ಖಾತೆ ರಚಿಸಿ',
    dontHaveAccount: 'ಖಾತೆ ಇಲ್ಲವೇ?',
    alreadyHaveAccount: 'ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?',
    signingIn: 'ಸೈನ್ ಇನ್ ಆಗುತ್ತಿದೆ...',
    signingUp: 'ಸೈನ್ ಅಪ್ ಆಗುತ್ತಿದೆ...',
    
    // Games
    dailyGames: 'ದೈನಂದಿನ ಆಟಗಳು',
    miniSudoku: 'ಮಿನಿ ಸುಡೋಕು',
    zipGame: 'ಜಿಪ್ ಗೇಮ್',
    playNow: 'ಈಗ ಆಡಿ',
    leaderboard: 'ಲೀಡರ್‌ಬೋರ್ಡ್',
    
    // Notifications
    notificationsEnabled: 'ಅಧಿಸೂಚನೆಗಳು ಸಕ್ರಿಯವಾಗಿವೆ',
    notificationsDisabled: 'ಅಧಿಸೂಚನೆಗಳು',
    toDisableNotifications: 'ಅಧಿಸೂಚನೆಗಳನ್ನು ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಲು ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ಬಳಸಿ',
    youWillReceiveNotifications: 'ಈಗ ನೀವು ಅಧಿಸೂಚನೆಗಳನ್ನು ಸ್ವೀಕರಿಸುತ್ತೀರಿ',
    
    // Calculator
    cgpaCalc: 'CGPA ಕ್ಯಾಲ್ಕುಲೇಟರ್',
    semester: 'ಸೆಮಿಸ್ಟರ್',
    subject: 'ವಿಷಯ',
    credits: 'ಕ್ರೆಡಿಟ್‌ಗಳು',
    grade: 'ಗ್ರೇಡ್',
    calculate: 'ಲೆಕ್ಕ ಹಾಕಿ',
    result: 'ಫಲಿತಾಂಶ',
    
    // Quiz
    quiz: 'ಕ್ವಿಜ್',
    startQuiz: 'ಕ್ವಿಜ್ ಪ್ರಾರಂಭಿಸಿ',
    score: 'ಅಂಕ',
    correct: 'ಸರಿ',
    incorrect: 'ತಪ್ಪು',
    next: 'ಮುಂದೆ',
    previous: 'ಹಿಂದೆ',
    submit: 'ಸಲ್ಲಿಸಿ',
    
    // Resources
    downloadResource: 'ಸಂಪನ್ಮೂಲ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
    viewResource: 'ಸಂಪನ್ಮೂಲ ವೀಕ್ಷಿಸಿ',
    notes: 'ಟಿಪ್ಪಣಿಗಳು',
    questionPapers: 'ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆಗಳು',
    syllabus: 'ಪಠ್ಯಕ್ರಮ',
  },
  
  te: {
    // Common
    hello: 'నమస్కారం',
    loading: 'లోడ్ అవుతోంది...',
    save: 'సేవ్ చేయి',
    cancel: 'రద్దు చేయి',
    confirm: 'నిర్ధారించు',
    delete: 'తొలగించు',
    edit: 'సవరించు',
    share: 'షేర్ చేయి',
    search: 'వెతకండి',
    
    // Header
    dsPortal: 'DS పోర్టల్',
    dataScience: 'డేటా సైన్స్ వనరులు',
    games: 'గేమ్స్',
    calculator: 'కాల్క్యులేటర్',
    upload: 'అప్‌లోడ్',
    
    // Dashboard
    totalSubjects: 'మొత్తం సబ్జెక్టులు',
    resources: 'వనరులు',
    thirdSemester: '3వ సెమిస్టర్',
    fourthSemester: '4వ సెమిస్టర్',
    coreSubjects: 'ప్రధాన సబ్జెక్టులు',
    comingSoon: 'త్వరలో వస్తోంది',
    noSubjectsFound: '3వ సెమిస్టర్ కోసం సబ్జెక్టులు కనుగొనబడలేదు.',
    fourthSemResources: '4వ సెమిస్టర్ వనరులు',
    stayTuned: 'సబ్జెక్టులు మరియు మెటీరియల్స్ త్వరలో జోడించబడతాయి. అనుసంధానంలో ఉండండి!',
    cgpaCalculator: 'CGPA కాల్క్యులేటర్',
    student: 'విద్యార్థి',
    admin: 'అడ్మిన్',
    
    // Profile
    myProfile: 'నా ప్రొఫైల్',
    settings: 'సెట్టింగ్స్',
    notification: 'నోటిఫికేషన్',
    notifications: 'నోటిఫికేషన్లు',
    shareApp: 'యాప్ షేర్ చేయండి',
    logOut: 'లాగ్ అవుట్',
    theme: 'థీమ్',
    language: 'భాష',
    
    // Auth
    signIn: 'సైన్ ఇన్',
    signUp: 'సైన్ అప్',
    email: 'ఇమెయిల్',
    password: 'పాస్‌వర్డ్',
    fullName: 'పూర్తి పేరు',
    welcomeBack: 'తిరిగి స్వాగతం',
    createAccount: 'ఖాతా సృష్టించండి',
    dontHaveAccount: 'ఖాతా లేదా?',
    alreadyHaveAccount: 'ఇప్పటికే ఖాతా ఉందా?',
    signingIn: 'సైన్ ఇన్ అవుతోంది...',
    signingUp: 'సైన్ అప్ అవుతోంది...',
    
    // Games
    dailyGames: 'రోజువారీ గేమ్స్',
    miniSudoku: 'మినీ సుడోకు',
    zipGame: 'జిప్ గేమ్',
    playNow: 'ఇప్పుడు ఆడండి',
    leaderboard: 'లీడర్‌బోర్డ్',
    
    // Notifications
    notificationsEnabled: 'నోటిఫికేషన్లు ఎనేబుల్ చేయబడ్డాయి',
    notificationsDisabled: 'నోటిఫికేషన్లు',
    toDisableNotifications: 'నోటిఫికేషన్లను నిలిపివేయడానికి బ్రౌజర్ సెట్టింగ్స్ ఉపయోగించండి',
    youWillReceiveNotifications: 'ఇప్పుడు మీరు నోటిఫికేషన్లు అందుకుంటారు',
    
    // Calculator
    cgpaCalc: 'CGPA కాల్క్యులేటర్',
    semester: 'సెమిస్టర్',
    subject: 'సబ్జెక్ట్',
    credits: 'క్రెడిట్లు',
    grade: 'గ్రేడ్',
    calculate: 'లెక్కించు',
    result: 'ఫలితం',
    
    // Quiz
    quiz: 'క్విజ్',
    startQuiz: 'క్విజ్ ప్రారంభించు',
    score: 'స్కోర్',
    correct: 'సరైనది',
    incorrect: 'తప్పు',
    next: 'తదుపరి',
    previous: 'మునుపటి',
    submit: 'సమర్పించు',
    
    // Resources
    downloadResource: 'వనరును డౌన్‌లోడ్ చేయండి',
    viewResource: 'వనరును చూడండి',
    notes: 'నోట్స్',
    questionPapers: 'ప్రశ్న పత్రాలు',
    syllabus: 'సిలబస్',
  },
};

export const getTranslation = (language: Language, key: keyof TranslationKeys): string => {
  return translations[language][key] || translations.en[key] || key;
};

export type { TranslationKeys };
