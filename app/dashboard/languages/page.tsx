"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Globe, Check, ChevronDown, Languages, ImportIcon as Translate, Settings, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { apiClient } from "@/lib/api-client"
import type { SupportedLanguage } from "@/lib/api-client"

// Language type definition
type Language = {
  code: string;
  name: string;
  flag: string;
  progress: number;
};

// Language flags mapping
const LANGUAGE_FLAGS: Record<string, string> = {
  'en-US': '🇺🇸',
  'en-GB': '🇬🇧',
  'es-ES': '🇪🇸',
  'fr-FR': '🇫🇷',
  'de-DE': '🇩🇪',
  'it-IT': '🇮🇹',
  'pt-PT': '🇵🇹',
  'ru-RU': '🇷🇺',
  'ja-JP': '🇯🇵',
  'ko-KR': '🇰🇷',
  'zh-CN': '🇨🇳',
  'ar-SA': '🇸🇦',
  'hi-IN': '🇮🇳',
  'ms-MY': '🇲🇾',
  'nl-NL': '🇳🇱',
  'sv-SE': '🇸🇪',
  'no-NO': '🇳🇴',
  'da-DK': '🇩🇰',
}

// Sample medical phrases in different languages
const samplePhrases = [
  {
    english: "Where does it hurt?",
    translations: {
      'es-ES': "¿Dónde le duele?",
      'fr-FR': "Où avez-vous mal?",
      'de-DE': "Wo tut es weh?",
      'zh-CN': "哪里疼?",
      'ar-SA': "أين يؤلمك؟",
    },
  },
  {
    english: "How long have you had these symptoms?",
    translations: {
      'es-ES': "¿Cuánto tiempo ha tenido estos síntomas?",
      'fr-FR': "Depuis combien de temps avez-vous ces symptômes?",
      'de-DE': "Wie lange haben Sie diese Symptome schon?",
      'zh-CN': "这些症状持续多久了?",
      'ar-SA': "منذ متى وأنت تعاني من هذه الأعراض؟",
    },
  },
  {
    english: "Take this medication twice daily",
    translations: {
      'es-ES': "Tome este medicamento dos veces al día",
      'fr-FR': "Prenez ce médicament deux fois par jour",
      'de-DE': "Nehmen Sie dieses Medikament zweimal täglich ein",
      'zh-CN': "一天服用两次这种药物",
      'ar-SA': "تناول هذا الدواء مرتين يوميًا",
    },
  },
]

export default function LanguagesPage() {
  const [languages, setLanguages] = useState<Language[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null)
  const [autoTranslate, setAutoTranslate] = useState(true)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Load supported languages from API
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const response = await apiClient.getSupportedLanguages()
        if (response.success && response.data) {
          const languageList: Language[] = response.data.map((lang: SupportedLanguage) => ({
            code: lang.code,
            name: lang.name,
            flag: LANGUAGE_FLAGS[lang.code] || '🌐',
            progress: 100, // All supported languages are fully implemented
          }))
          setLanguages(languageList)
          if (languageList.length > 0) {
            setSelectedLanguage(languageList[0])
          }
        }
      } catch (error) {
        // Failed to load languages
        // Fallback to basic languages
        const fallbackLanguages: Language[] = [
          { code: 'en-US', name: 'English (US)', flag: '🇺🇸', progress: 100 },
          { code: 'es-ES', name: 'Spanish (ES)', flag: '🇪🇸', progress: 100 },
          { code: 'fr-FR', name: 'French (FR)', flag: '🇫🇷', progress: 100 },
          { code: 'de-DE', name: 'German (DE)', flag: '🇩🇪', progress: 100 },
          { code: 'ms-MY', name: 'Malay (Malaysia)', flag: '🇲🇾', progress: 100 },
        ]
        setLanguages(fallbackLanguages)
        setSelectedLanguage(fallbackLanguages[0])
      } finally {
        setLoading(false)
      }
    }

    loadLanguages()
  }, [])

  const handleLanguageChange = (language: Language) => {
    setSelectedLanguage(language)
    toast({
      title: "Language Changed",
      description: `Interface language changed to ${language.name}`,
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading languages...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
            <Globe className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Multi-language Support</h1>
            <p className="text-muted-foreground">Break language barriers in healthcare communication</p>
          </div>
        </div>
      </motion.div>

      <div className="flex justify-between items-center mt-6 mb-4">
        <h2 className="text-xl font-semibold">Language Settings</h2>
        {selectedLanguage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <span className="text-lg mr-1">{selectedLanguage.flag}</span>
                {selectedLanguage.name}
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {languages.map((language) => (
                <DropdownMenuItem
                  key={language.code}
                  onClick={() => handleLanguageChange(language)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{language.flag}</span>
                    <span>{language.name}</span>
                  </div>
                  {selectedLanguage.code === language.code && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <Tabs defaultValue="interface" className="space-y-4">
        <TabsList>
          <TabsTrigger value="interface">Interface</TabsTrigger>
          <TabsTrigger value="translation">Translation</TabsTrigger>
          <TabsTrigger value="phrases">Medical Phrases</TabsTrigger>
        </TabsList>

        <TabsContent value="interface">
          <Card>
            <CardHeader>
              <CardTitle>Interface Language</CardTitle>
              <CardDescription>Customize how Novate appears in different languages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Auto-detect language</h3>
                      <p className="text-sm text-muted-foreground">
                        Automatically detect and switch to the user's preferred language
                      </p>
                    </div>
                    <Switch checked={autoTranslate} onCheckedChange={setAutoTranslate} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Voice recognition in multiple languages</h3>
                      <p className="text-sm text-muted-foreground">Enable voice recognition for selected languages</p>
                    </div>
                    <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Available Languages</h3>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {languages.map((language) => (
                      <div key={language.code} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{language.flag}</span>
                          <span>{language.name}</span>
                        </div>
                        <div className="flex items-center gap-2 w-1/3">
                          <Progress value={language.progress} className="h-2" />
                          <span className="text-xs text-muted-foreground w-8">{language.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600">
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="translation">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Translation</CardTitle>
              <CardDescription>Translate medical notes and patient communications instantly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Translation Features</h3>
                  <div className="space-y-3">
                    {[
                      {
                        icon: Translate,
                        title: "Real-time Document Translation",
                        description: "Translate medical notes and documents instantly",
                      },
                      {
                        icon: Languages,
                        title: "Conversation Interpreter",
                        description: "Facilitate patient-doctor communication across languages",
                      },
                      {
                        icon: Settings,
                        title: "Terminology Customization",
                        description: "Customize medical terminology translations for accuracy",
                      },
                      {
                        icon: Info,
                        title: "Cultural Context",
                        description: "Provides cultural context for better communication",
                      },
                    ].map((feature, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.1 }}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <div className="p-2 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20">
                          <feature.icon className="h-4 w-4 text-purple-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{feature.title}</h4>
                          <p className="text-xs text-muted-foreground">{feature.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Translation Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-translate">Auto-translate patient documents</Label>
                      <Switch id="auto-translate" checked={true} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="preserve-format">Preserve document formatting</Label>
                      <Switch id="preserve-format" checked={true} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="terminology">Use specialized medical terminology</Label>
                      <Switch id="terminology" checked={true} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="highlight">Highlight uncertain translations</Label>
                      <Switch id="highlight" checked={true} />
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-lg bg-muted">
                    <h4 className="font-medium text-sm mb-2">Translation Quality</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Our medical translations are verified by healthcare professionals for accuracy
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <Progress value={98} className="h-2" />
                      </div>
                      <span className="text-xs font-medium">98% Accuracy</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="phrases">
          <Card>
            <CardHeader>
              <CardTitle>Common Medical Phrases</CardTitle>
              <CardDescription>Essential medical phrases in multiple languages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {samplePhrases.map((phrase, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    className="border rounded-lg p-4"
                  >
                    <h3 className="font-medium mb-3">{phrase.english}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(phrase.translations).map(([code, translation]) => {
                        const lang = languages.find((l) => l.code === code)
                        return (
                          <div key={code} className="flex items-start gap-2">
                            <span className="text-lg">{lang?.flag || LANGUAGE_FLAGS[code] || '🌐'}</span>
                            <div>
                              <p className="text-sm">{translation}</p>
                              <p className="text-xs text-muted-foreground">{lang?.name || code}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Medical Phrases
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
