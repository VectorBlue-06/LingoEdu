import { LingoDotDevEngine } from 'lingo.dev/sdk'
import { supabase } from './supabaseClient'

const apiKey = import.meta.env.VITE_LINGO_API_KEY

let engine
if (apiKey) {
  const config = { apiKey }
  // in development, we use a proxy to avoid CORS issues
  if (import.meta.env.DEV) {
    config.apiUrl = `${window.location.origin}/api/lingo`
  }
  engine = new LingoDotDevEngine(config)
}

export async function translateText({ textId, content, targetLanguage, sourceLanguage }) {
  if (!engine) {
    throw new Error('Missing VITE_LINGO_API_KEY for Lingo.dev')
  }

  // Check cache first if we have a textId
  if (textId) {
    const { data: cached, error: cacheError } = await supabase
      .from('translations')
      .select('translated_content')
      .eq('text_id', textId)
      .eq('target_language', targetLanguage)
      .maybeSingle()

    if (!cacheError && cached) {
      return {
        translatedText: cached.translated_content,
        fromCache: true,
      }
    }
  }

  // No cache hit, call the API
  const translatedText = await engine.localizeText(content, {
    sourceLocale: sourceLanguage || null,
    targetLocale: targetLanguage,
  })

  // Save to cache if we have a textId
  if (textId) {
    const { error: insertError } = await supabase
      .from('translations')
      .insert({
        text_id: textId,
        source_language: sourceLanguage || 'auto',
        target_language: targetLanguage,
        translated_content: translatedText,
      })

    if (insertError) {
      // Log error but don't fail the request
      console.error('Failed to cache translation:', insertError)
    }
  }

  return {
    translatedText,
    fromCache: false,
  }
}

