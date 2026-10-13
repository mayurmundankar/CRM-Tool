import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { prompt, systemPrompt, task = 'spec', model, apiKey } = body

    const configuredModel = process.env.GROQ_MODEL || process.env.NEXT_PUBLIC_GROQ_MODEL || 'gpt-4o-mini'
    const targetModel = model || configuredModel

    // System prompt ensuring complete, non-truncated architectural specifications
    let defaultSystem = `You are a licensed Senior Architect and Interior Design BIM Director specialized in Autodesk Revit (LOD 350/400).
Your job is to provide complete, thorough, production-ready architectural specifications.
Cover all 3 required sections completely without truncation, placeholders, or cutting off early:
1. ARCHITECTURAL LIGHTING & PHOTOMETRIC SPECIFICATION (exact lux target, CRI 90+, CCT 2400K-3000K, recessed spotlight model & spacing, linear cove run wattage, dimming control protocol).
2. PLUMBING ROUGH-IN & FIXTURE ELEVATION SCHEDULE (rough-in AFF heights, fixture types, valve specs, shower drain specs, pipe sizing).
3. MILLWORK, JOINERY & FINISH CODES (stone veneer, wood species, matte finish code, Blum hardware specs, sheet reference).
Always format clearly with bullet points, precise dimensions, and technical rigor.`

    if (task === 'whatsapp') {
      defaultSystem = `You are an executive client concierge for a high-end interior architecture and Revit automation studio.
Write warm, concise, professional WhatsApp messages to luxury residential and commercial clients regarding their design progress, Revit sheet approvals, and milestone updates. Keep messages elegant, engaging, and under 90 words.`
    }

    if (task === 'chat') {
      defaultSystem = `You are Studio Chat inside FlowMS. Answer from the studio records included in the conversation. If a fact is not in those records, say you do not have it. Do not invent project details. Do not use markdown. Open with the name, then one "Label: value" line per fact.`
    }

    // 1. If an OpenAI API Key is present and user requested gpt-4o-mini or gpt-*:
    const openAiKey = process.env.OPENAI_API_KEY
    if (openAiKey && targetModel.startsWith('gpt-')) {
      const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: targetModel,
          messages: [
            { role: 'system', content: systemPrompt || defaultSystem },
            { role: 'user', content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 4096,
        }),
      })

      if (openAiRes.ok) {
        const data = await openAiRes.json()
        return NextResponse.json({
          content: data.choices[0]?.message?.content || '',
          model: data.model,
          usage: data.usage,
        })
      }
    }

    // 2. Otherwise use Groq API:
    const keyToUse = apiKey || process.env.GROQ_API_KEY

    if (!keyToUse) {
      return NextResponse.json(
        {
          error: 'GROQ_API_KEY is not configured.',
          requiresKey: true,
        },
        { status: 400 }
      )
    }

    const groq = new Groq({ apiKey: keyToUse })

    // Try target model on Groq; if it's gpt-4o-mini and Groq throws 404, fall back to Groq's high-speed GPT model openai/gpt-oss-120b
    let completion
    try {
      completion = await groq.chat.completions.create({
        model: targetModel,
        messages: [
          { role: 'system', content: systemPrompt || defaultSystem },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 4096,
      })
    } catch (groqErr: any) {
      // If Groq rejects gpt-4o-mini with model_not_found, fall back to Groq's supported GPT engine
      if (
        groqErr?.status === 404 ||
        groqErr?.message?.includes('model_not_found') ||
        groqErr?.message?.includes('does not exist')
      ) {
        completion = await groq.chat.completions.create({
          model: 'openai/gpt-oss-120b',
          messages: [
            { role: 'system', content: systemPrompt || defaultSystem },
            { role: 'user', content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 4096,
        })
      } else {
        throw groqErr
      }
    }

    const text = completion.choices[0]?.message?.content || ''

    return NextResponse.json({
      content: text,
      model: completion.model,
      usage: completion.usage,
    })
  } catch (error: any) {
    console.error('Groq API route error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to generate with Groq API' },
      { status: 500 }
    )
  }
}
