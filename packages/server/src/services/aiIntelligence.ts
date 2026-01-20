import axios from 'axios'
import { config } from '../config.js'
import type { Signal } from '../types.js'

export interface OracleAnalysis {
  summary: string
  sentiment: number
  confidence: number
  keyInsights: string[]
  recommendations: string[]
  riskFactors: string[]
}

export interface OracleAssessment {
  query: string
  overallSentiment: 'bullish' | 'bearish' | 'neutral'
  sentimentScore: number
  keyFindings: string[]
  recommendation: string
  riskLevel: 'low' | 'medium' | 'high'
  confidenceLevel: number
}

/**
 * Call AI API for intelligent signal analysis
 * Supports multiple providers: OpenAI, Anthropic, DeepSeek, etc.
 */
export async function analyzeSignalsWithAI(
  signals: Signal[],
  query: string
): Promise<OracleAssessment> {
  if (!config.hasAiApi) {
    console.warn('[ai] ⚠️  AI_API_KEY not set, using heuristic analysis')
    return generateHeuristicAssessment(signals, query)
  }

  try {
    console.log(`[ai] 🧠 analyzing ${signals.length} signals with ${config.aiApiProvider}`)
    const analysis = await callAIAPI(signals, query)
    console.log(`[ai] ✅ analysis complete: sentiment=${analysis.overallSentiment}`)
    return analysis
  } catch (error) {
    console.error('[ai] ❌ ERROR:', error instanceof Error ? error.message : error)
    console.log('[ai] ⚠️  falling back to heuristic analysis')
    return generateHeuristicAssessment(signals, query)
  }
}

async function callAIAPI(signals: Signal[], query: string): Promise<OracleAssessment> {
  const prompt = buildAnalysisPrompt(signals, query)

  // Parse provider from config
  const [provider] = config.aiApiProvider.split(':')

  if (provider === 'openai') {
    return callOpenAI(prompt, query)
  } else if (provider === 'anthropic') {
    return callAnthropic(prompt, query)
  } else if (provider === 'deepseek') {
    return callDeepSeek(prompt, query)
  } else {
    throw new Error(`Unknown AI provider: ${provider}`)
  }
}

async function callOpenAI(prompt: string, query: string): Promise<OracleAssessment> {
  try {
    console.log('[ai:openai] 📤 sending request to OpenAI')
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are Oracle, an AI research agent analyzing market signals. Provide concise, actionable intelligence.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${config.aiApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    )

    console.log('[ai:openai] ✅ response received')
    const content = response.data.choices[0].message.content
    return parseAIResponse(content, query)
  } catch (error) {
    console.error('[ai:openai] ❌ ERROR:', error instanceof Error ? error.message : error)
    throw error
  }
}

async function callAnthropic(prompt: string, query: string): Promise<OracleAssessment> {
  try {
    console.log('[ai:anthropic] 📤 sending request to Anthropic')
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-sonnet-20240229',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        system:
          'You are Oracle, an AI research agent analyzing market signals. Provide concise, actionable intelligence.'
      },
      {
        headers: {
          'x-api-key': config.aiApiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        timeout: 15000
      }
    )

    console.log('[ai:anthropic] ✅ response received')
    const content = response.data.content[0].text
    return parseAIResponse(content, query)
  } catch (error) {
    console.error('[ai:anthropic] ❌ ERROR:', error instanceof Error ? error.message : error)
    throw error
  }
}

async function callDeepSeek(prompt: string, query: string): Promise<OracleAssessment> {
  try {
    console.log('[ai:deepseek] 📤 sending request to DeepSeek')
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-reasoner',
        messages: [
          {
            role: 'system',
            content:
              'You are Oracle, an AI research agent analyzing market signals. Provide concise, actionable intelligence.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 1.0,
        max_tokens: 5000
      },
      {
        headers: {
          'Authorization': `Bearer ${config.aiApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    )

    console.log('[ai:deepseek] ✅ response received')
    const content = response.data.choices[0].message.content
    return parseAIResponse(content, query)
  } catch (error) {
    console.error('[ai:deepseek] ❌ ERROR:', error instanceof Error ? error.message : error)
    throw error
  }
}

function buildAnalysisPrompt(signals: Signal[], query: string): string {
  const topSignals = signals.slice(0, 8)
  const signalSummary = topSignals
    .map(s => `${s.sentiment > 0 ? '↑' : s.sentiment < 0 ? '↓' : '→'} ${s.title} [${s.source}]`)
    .join('\n')

  const avgSentiment = signals.reduce((sum, s) => sum + s.sentiment, 0) / signals.length
  const avgImpact = signals.reduce((sum, s) => sum + s.impact, 0) / signals.length
  const bullish = signals.filter(s => s.sentiment > 0.2).length
  const bearish = signals.filter(s => s.sentiment < -0.2).length

  return `Query: ${query}
Signals: ${signals.length} total (${bullish} bullish, ${bearish} bearish)
Sentiment: ${avgSentiment.toFixed(2)}/1 | Impact: ${(avgImpact * 100).toFixed(0)}%

Top signals:
${signalSummary}

Respond as JSON with: sentiment (bullish|bearish|neutral), sentimentScore (-1 to 1), keyInsights (2-3 bullets), recommendation (1 sentence), riskLevel (low|medium|high), confidence (0-1).`.trim()
}

function parseAIResponse(content: string, query: string): OracleAssessment {
  try {
    // Try to parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        query,
        overallSentiment: parseSentiment(parsed.sentiment || parsed.overallSentiment),
        sentimentScore: parseFloat(parsed.sentimentScore || parsed.sentiment) || 0,
        keyFindings: parsed.keyInsights || parsed.keyFindings || [],
        recommendation: parsed.recommendation || 'Continue monitoring',
        riskLevel: parseRiskLevel(parsed.riskLevel || 'medium'),
        confidenceLevel: parseFloat(parsed.confidence || parsed.confidenceLevel) || 0.7
      }
    }
  } catch (e) {
    console.error('[ai:parse]', e)
  }

  // Fallback parsing
  const sentiment = content.toLowerCase().includes('bullish')
    ? 'bullish'
    : content.toLowerCase().includes('bearish')
      ? 'bearish'
      : 'neutral'

  return {
    query,
    overallSentiment: sentiment,
    sentimentScore: sentiment === 'bullish' ? 0.5 : sentiment === 'bearish' ? -0.5 : 0,
    keyFindings: ['AI analysis complete'],
    recommendation: 'Review signals and market conditions',
    riskLevel: 'medium',
    confidenceLevel: 0.6
  }
}

function parseSentiment(value: any): 'bullish' | 'bearish' | 'neutral' {
  const str = String(value).toLowerCase()
  return str.includes('bullish') ? 'bullish' : str.includes('bearish') ? 'bearish' : 'neutral'
}

function parseRiskLevel(value: any): 'low' | 'medium' | 'high' {
  const str = String(value).toLowerCase()
  return str.includes('high') ? 'high' : str.includes('low') ? 'low' : 'medium'
}

/**
 * Fallback assessment using heuristic analysis
 */
function generateHeuristicAssessment(signals: Signal[], query: string): OracleAssessment {
  const avgSentiment = signals.length > 0 ? signals.reduce((sum, s) => sum + s.sentiment, 0) / signals.length : 0

  const avgImpact = signals.length > 0 ? signals.reduce((sum, s) => sum + s.impact, 0) / signals.length : 0

  const highImpactSignals = signals.filter(s => s.impact >= 0.7)

  const bullishSignals = signals.filter(s => s.sentiment > 0.2)
  const bearishSignals = signals.filter(s => s.sentiment < -0.2)

  let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral'
  if (avgSentiment > 0.2) sentiment = 'bullish'
  if (avgSentiment < -0.2) sentiment = 'bearish'

  let riskLevel: 'low' | 'medium' | 'high' = 'medium'
  if (highImpactSignals.length > signals.length * 0.3) riskLevel = 'high'
  if (highImpactSignals.length < signals.length * 0.1) riskLevel = 'low'

  return {
    query,
    overallSentiment: sentiment,
    sentimentScore: avgSentiment,
    keyFindings: [
      `${signals.length} signals analyzed`,
      `${bullishSignals.length} bullish, ${bearishSignals.length} bearish`,
      `Average impact score: ${(avgImpact * 100).toFixed(0)}%`
    ],
    recommendation:
      sentiment === 'bullish'
        ? 'Market conditions appear favorable for long positions'
        : sentiment === 'bearish'
          ? 'Consider cautious approach or hedging strategies'
          : 'Mixed signals suggest balanced monitoring',
    riskLevel,
    confidenceLevel: Math.min(1, Math.sqrt(signals.length / 10))
  }
}
