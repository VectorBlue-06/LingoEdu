import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const I18N_LANG_KEY = 'lingo-ui-lang'

/**
 * Lazy on-demand i18n: only translates keys that are actually rendered.
 * Keys are batched with a short debounce so one API call covers all
 * strings visible on the current page (~15-20) instead of all ~100.
 */

const BATCH_DELAY_MS = 200 // debounce before sending a translation batch

export const DEFAULT_STRINGS = {
  // Common
  'app.name': 'LingoEdu',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.back': '← Back',
  'common.search': 'Search...',
  'common.loading': 'Loading...',
  'common.comingSoon': 'Coming soon',
  'common.create': 'Create',

  // Sidebar
  'nav.dashboard': 'Dashboard',
  'nav.courses': 'My Courses',
  'nav.allCourses': 'All Courses',
  'nav.calendar': 'Calendar',
  'nav.classes': 'Classes',
  'nav.settings': 'Settings',

  // UserPanel
  'panel.todoTitle': 'My To-Do List',
  'panel.addTask': 'Add a task...',
  'panel.noTasks': 'No tasks yet',
  'panel.todoNotice': 'Saved locally only — will not sync to cloud',
  'panel.logout': 'Logout',
  'panel.settings': 'Settings',
  'panel.darkMode': 'Switch to dark mode',
  'panel.lightMode': 'Switch to light mode',
  'panel.collapse': 'Collapse panel',
  'panel.expand': 'Expand panel',

  // Login
  'login.title': 'Get Started Now',
  'login.subtitle': "It's free to join and gain full access to exciting learning opportunities.",
  'login.teacher': "I'm a Teacher",
  'login.student': "I'm a Student",
  'login.email': 'Email Address',
  'login.name': 'Name',
  'login.password': 'Password',
  'login.continue': 'Continue',
  'login.signIn': 'Already have an account?',
  'login.signInLink': 'Sign In',
  'login.orContinue': 'OR Continue With',
  'login.selectRole': 'Please select a role.',
  'login.nameRequired': 'Name is required',
  'login.uiLanguage': 'Interface Language',
  'login.comingSoonFeature': 'Coming soon — this feature is not yet available',
  'login.connect': 'Connect. Learn. Grow.',
  'login.privacy': 'I agree to the website\'s Privacy Policy & Terms and Conditions.',
  'login.certify': 'I certify that I am an accredited Teacher.',

  // Student
  'student.welcome': 'Welcome',
  'student.noCourses': 'No texts in this classroom yet.',
  'student.original': 'Original content',
  'student.targetLang': 'Target language',
  'student.translate': 'Translate',
  'student.translating': 'Translating…',
  'student.translated': 'Translated text',
  'student.fromCache': '(from cache)',
  'student.newTranslation': '(new translation)',
  'student.joinClassroom': 'Join Classroom',
  'student.classroomCode': 'Enter classroom code',
  'student.join': 'Join',
  'student.joinedRooms': 'Joined Classrooms',
  'student.noRooms': 'No classrooms joined yet.',
  'student.sourceLang': 'Source language',
  'student.loadError': 'Could not load the selected text.',
  'student.translateError': 'Translation failed. Please try again.',
  'student.alreadyJoined': 'You have already joined this classroom.',
  'student.classroom': 'Classroom',
  'student.leave': 'Leave',
  'student.noRecentCourse': 'No course viewed yet',
  'student.lastViewed': 'Last Viewed',

  // Teacher
  'teacher.welcome': 'Welcome back',
  'teacher.totalUploads': 'Total Uploads',
  'teacher.uploadContent': 'Upload Content',
  'teacher.title': 'Title',
  'teacher.language': 'Language',
  'teacher.content': 'Content',
  'teacher.saveText': 'Save text',
  'teacher.saving': 'Saving…',
  'teacher.existingTexts': 'Existing Texts',
  'teacher.noTexts': 'No texts yet. Create the first one above.',
  'teacher.fillFields': 'Please fill in all fields before saving.',
  'teacher.uploadPdf': 'Upload PDF',
  'teacher.uploadPhoto': 'Upload Photo',
  'teacher.addVideoLink': 'Add Video Link',
  'teacher.myClassrooms': 'My Classrooms',
  'teacher.classroomName': 'Classroom name...',
  'teacher.noClassrooms': 'No classrooms yet. Create one to share content with students.',
  'teacher.copyCode': 'Copy classroom code',
  'teacher.deleteClassroom': 'Delete classroom',
  'teacher.videoTitle': 'Video title',
  'teacher.videoUrl': 'Video URL (YouTube, Vimeo, etc.)',
  'teacher.choosePdf': 'Choose PDF file',
  'teacher.chooseImage': 'Choose image file',
  'teacher.uploading': 'Uploading…',
  'teacher.classrooms': 'Classrooms',
  'teacher.text': 'Text',
  'teacher.pdf': 'PDF',
  'teacher.photo': 'Photo',
  'teacher.videoLink': 'Video Link',
  'teacher.textSaved': 'Text uploaded successfully!',
  'teacher.saveError': 'Could not save the text. Please try again.',
  'teacher.selectFileError': 'Please select a file and provide a title.',
  'teacher.fileReady': 'File ready for upload.',
  'teacher.uploadError': 'File upload failed.',
  'teacher.videoFieldsError': 'Please provide both a title and URL.',
  'teacher.videoAdded': 'Video link added!',
  'teacher.manageClassroom': 'Manage classroom',
  'teacher.code': 'Code',

  // Settings
  'settings.title': 'Settings',
  'settings.subtitle': 'Manage your preferences',
  'settings.appearance': 'Appearance',
  'settings.theme': 'Theme',
  'settings.light': 'Light',
  'settings.dark': 'Dark',
  'settings.language': 'Interface Language',
  'settings.account': 'Account',
  'settings.name': 'Display Name',
  'settings.role': 'Role',

  // Calendar
  'calendar.title': 'Calendar',
  'calendar.subtitle': 'Keep track of your schedule',
  'calendar.prev': 'Prev',
  'calendar.next': 'Next',
  'calendar.upcoming': 'Recent Activity',
  'calendar.noUpcoming': 'No recent activity from your classes.',

  // Classes
  'classes.title': 'Classes',
  'classes.teacherSubtitle': 'Manage your classrooms',
  'classes.studentSubtitle': 'Browse and join available classes',
  'classes.newClassName': 'New class name...',
  'classes.noClasses': 'No classes yet.',
  'classes.copyCode': 'Copy classroom code',
  'classes.classCreated': 'Classroom created!',
  'classes.createError': 'Could not create classroom.',
  'classes.searchPlaceholder': 'Search by name or code...',
  'classes.myClasses': 'My Classes',
  'classes.allClasses': 'All Available Classes',
  'classes.searchResults': 'Search Results',
  'classes.noResults': 'No classes found.',
  'classes.joined': 'Joined',
  'classes.joinedSuccess': 'Joined successfully!',
  'classes.joinError': 'Could not join classroom.',

  // Courses
  'courses.title': 'My Courses',
  'courses.subtitle': 'Browse available study materials',
  'courses.noCourses': 'No courses available yet.',
}

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    try {
      return localStorage.getItem(I18N_LANG_KEY) || 'en'
    } catch {
      return 'en'
    }
  })

  // Holds only the keys that have been translated so far (not all 100+)
  const [translated, setTranslated] = useState({})
  const [loading, setLoading] = useState(false)

  // --- Refs for lazy batching ---
  const pendingKeys = useRef(new Set())       // keys waiting to be sent
  const inflightKeys = useRef(new Set())      // keys currently being translated
  const debounceTimer = useRef(null)
  const localeRef = useRef(locale)            // always-current locale for async closures

  // Keep localeRef in sync
  useEffect(() => { localeRef.current = locale }, [locale])

  // ------------------------------------------------------------------
  // 1. On language change: load whatever we already cached in Supabase
  //    (only previously-translated keys, not the full dictionary)
  // ------------------------------------------------------------------
  useEffect(() => {
    try { localStorage.setItem(I18N_LANG_KEY, locale) } catch { /* ignore */ }

    // Reset state for the new locale
    pendingKeys.current.clear()
    inflightKeys.current.clear()
    clearTimeout(debounceTimer.current)

    if (locale === 'en') {
      setTranslated({})
      return
    }

    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('ui_translations')
          .select('translations')
          .eq('language', locale)
          .maybeSingle()

        if (!error && data?.translations) {
          setTranslated(data.translations)
        } else {
          setTranslated({})
        }
      } catch {
        setTranslated({})
      }
    })()
  }, [locale])

  // ------------------------------------------------------------------
  // 2. Flush: translate only the pending keys in one small batch
  // ------------------------------------------------------------------
  const flush = useCallback(async () => {
    const lang = localeRef.current
    if (lang === 'en') return

    // Grab keys that need translating (skip already inflight)
    const keys = [...pendingKeys.current].filter(k => !inflightKeys.current.has(k))
    pendingKeys.current.clear()
    if (keys.length === 0) return

    keys.forEach(k => inflightKeys.current.add(k))
    setLoading(true)

    try {
      const apiKey = import.meta.env.VITE_LINGO_API_KEY
      if (!apiKey) {
        console.warn('[i18n] No VITE_LINGO_API_KEY — skipping UI translation')
        return
      }

      const { LingoDotDevEngine } = await import('lingo.dev/sdk')
      const config = { apiKey }
      if (import.meta.env.DEV) {
        config.apiUrl = `${window.location.origin}/api/lingo`
      }
      const engine = new LingoDotDevEngine(config)

      // Translate only the needed values (not all 100+)
      const values = keys.map(k => DEFAULT_STRINGS[k] || k)
      const batch = values.join('\n')

      const result = await engine.localizeText(batch, {
        sourceLocale: 'en',
        targetLocale: lang,
      })

      // If locale changed while we were waiting, discard
      if (localeRef.current !== lang) return

      const translatedValues = result.split('\n')
      const newEntries = {}
      keys.forEach((key, i) => {
        newEntries[key] = translatedValues[i]?.trim() || DEFAULT_STRINGS[key]
      })

      setTranslated(prev => {
        const merged = { ...prev, ...newEntries }

        // Persist merged cache to Supabase (fire-and-forget)
        supabase
          .from('ui_translations')
          .upsert({ language: lang, translations: merged }, { onConflict: 'language' })
          .then(null, e => console.error('[i18n] cache save failed:', e))

        return merged
      })
    } catch (err) {
      console.error('[i18n] Batch translation failed:', err)
    } finally {
      keys.forEach(k => inflightKeys.current.delete(k))
      setLoading(false)
    }
  }, [])

  // ------------------------------------------------------------------
  // 3. t(key) — returns cached translation or English fallback
  //    Queues uncached keys for the next batch (debounced).
  // ------------------------------------------------------------------
  const t = useCallback(
    (key) => {
      if (locale === 'en') return DEFAULT_STRINGS[key] || key

      // Already translated → return it
      if (translated[key]) return translated[key]

      // Queue this key for translation if it's a known string
      if (
        DEFAULT_STRINGS[key] &&
        !pendingKeys.current.has(key) &&
        !inflightKeys.current.has(key)
      ) {
        pendingKeys.current.add(key)

        // Debounce: collect all keys requested during the same render cycle
        clearTimeout(debounceTimer.current)
        debounceTimer.current = setTimeout(flush, BATCH_DELAY_MS)
      }

      // Return English while the translation is in flight
      return DEFAULT_STRINGS[key] || key
    },
    [locale, translated, flush],
  )

  /** Always returns the English default — used for hover tooltips. */
  const tOriginal = useCallback(
    (key) => DEFAULT_STRINGS[key] || key,
    [],
  )

  const isTranslated = locale !== 'en'

  const value = useMemo(
    () => ({ locale, setLocale, t, tOriginal, isTranslated, loading }),
    [locale, setLocale, t, tOriginal, isTranslated, loading],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be inside I18nProvider')
  return ctx
}
