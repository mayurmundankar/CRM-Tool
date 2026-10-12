"use client"

import * as React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { generateWithGroq, getStoredGroqKey } from "@/lib/groq-client"
import { exportSpecToPdf } from "@/lib/pdf-export"
import {
  Sparkles,
  Zap,
  Lightbulb,
  Droplet,
  Layers,
  Check,
  Copy,
  Download,
  FileCheck,
  Cpu,
  AlertCircle
} from "lucide-react"

export function AiRevitSpecStudio() {
  const [roomType, setRoomType] = React.useState('Master Ensuite Bathroom')
  const [styleStyle, setStyleStyle] = React.useState('Warm Minimalist with Travertine')
  const [areaSqFt, setAreaSqFt] = React.useState('380')
  const [clientPrompt, setClientPrompt] = React.useState(
    'Concealed warm cove lighting behind the floating double vanity mirror, freestanding stone soak tub with floor-mount tub filler, zero-threshold rain shower with linear wall drain, niche accent lighting.'
  )
  const [selectedModel, setSelectedModel] = React.useState(process.env.NEXT_PUBLIC_GROQ_MODEL || 'gpt-4o-mini')

  const [isProcessing, setIsProcessing] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [groqContent, setGroqContent] = React.useState<string | null>(null)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const handleGenerate = async () => {
    setIsProcessing(true)
    setErrorMessage(null)

    const fullPrompt = `Architectural & BIM Interior Specification Request:
Room Type: ${roomType}
Style Direction: ${styleStyle}
Square Footage: ${areaSqFt} sq ft
Client Requirements & Details: ${clientPrompt}

Please output a comprehensive, structured Revit (LOD 350) technical design schedule with:
1. Architectural Lighting & Photometric Specification (Exact Lux target, CRI 90+, CCT 2400K-3000K, recessed spotlight model & spacing, linear cove run wattage, dimming control protocol).
2. Plumbing Rough-in & Fixture Elevation Schedule (Rough-in AFF heights, fixture types, valve specs, shower drain specs, pipe sizing).
3. Joinery, Millwork & Veneer Finish Codes (Material, finish code, Blum hardware specs, sheet reference).`

    try {
      const res = await generateWithGroq({
        prompt: fullPrompt,
        model: selectedModel,
        task: 'spec',
      })

      if (res.error) {
        setErrorMessage(res.error)
        // If no Groq key configured, fall back to architectural template
        setGroqContent(null)
      } else if (res.content) {
        setGroqContent(res.content)
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Generation failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const copyToClipboard = () => {
    const textToCopy = groqContent || defaultStructuredText
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadPdf = () => {
    const textToExport = groqContent || defaultStructuredText
    exportSpecToPdf({
      roomType,
      styleStyle,
      areaSqFt,
      clientPrompt,
      content: textToExport,
      modelName: selectedModel === 'gpt-4o-mini' ? 'Groq GPT-4o-Mini Engine' : selectedModel,
    })
  }

  const defaultStructuredText = `1. Lighting: Flos architectural 2700K 90+ CRI recessed spot (4 units, spaced 48" o.c.), 24V IP65 continuous silicone diffuse channel (9.6W/m, 2400K dim-to-warm), 0-10V Lutron HomeWorks.
2. Plumbing: Floor mount tub valve 31" AFF, wall-mount spout 42" AFF, Infinity linear channel drain with 1/4" slope.
3. Millwork: Roman Navona honed travertine, Rift-cut white oak with custom matte polyurethane sealer.`

  return (
    <div className="space-y-5">
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="gold" className="gap-1 text-xs">
              <Cpu className="h-3 w-3" /> Powered by Groq LLM
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              Model: {selectedModel.split('-')[0].toUpperCase()} {selectedModel.split('-')[1]}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif tracking-tight text-foreground mt-1">
            Intelligent BIM Specification Studio
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Instantly turn natural language room design briefs into structured Revit schedules, lux lighting calculations, and fixture parameters with Groq.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <select
            className="h-8 rounded-md border border-input bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            <option value="gpt-4o-mini">GPT-4o Mini (Default Env)</option>
            <option value="openai/gpt-oss-120b">GPT-OSS 120B (Groq Engine)</option>
            <option value="openai/gpt-oss-20b">GPT-OSS 20B (Groq Ultra-Fast)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Input parameters */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-border/80 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Sparkles className="h-4 w-4 text-amber-500" /> Space Parameters & Design Prompt
              </CardTitle>
              <CardDescription className="text-xs">
                Provide room dimensions and client requirements to query Groq LLM.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase text-muted-foreground">Space / Room Zone</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground"
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                >
                  <option value="Master Ensuite Bathroom">Master Ensuite Bathroom</option>
                  <option value="Gourmet Open Kitchen & Island">Gourmet Open Kitchen & Island</option>
                  <option value="Great Room & Salon">Great Room & Salon</option>
                  <option value="Penthouse Primary Bedroom">Penthouse Primary Bedroom</option>
                  <option value="Executive Boardroom Suite">Executive Boardroom Suite</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase text-muted-foreground">Aesthetic Direction</label>
                  <Input
                    className="h-8 text-xs"
                    value={styleStyle}
                    onChange={(e) => setStyleStyle(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase text-muted-foreground">Area (Sq Ft)</label>
                  <Input
                    type="number"
                    className="h-8 text-xs"
                    value={areaSqFt}
                    onChange={(e) => setAreaSqFt(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase text-muted-foreground">
                  Client Brief / Specific Requirements
                </label>
                <Textarea
                  rows={4}
                  className="text-xs"
                  value={clientPrompt}
                  onChange={(e) => setClientPrompt(e.target.value)}
                  placeholder="Describe lighting requirements, plumbing fixtures, or custom joinery..."
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isProcessing}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs h-9 gap-2 shadow-xs shadow-amber-500/20"
              >
                {isProcessing ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin text-black" />
                    <span>Querying Groq LLM...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 fill-black" />
                    <span>Generate Specs with Groq AI</span>
                  </>
                )}
              </Button>

              {errorMessage && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-[11px]">Groq Key Notice</p>
                    <p className="text-[11px] leading-tight">{errorMessage}</p>
                    <p className="text-[10px] text-muted-foreground">
                      Showing precomputed architectural LOD 350 template below.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Generated output */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-border/80 bg-card">
            <CardHeader className="pb-3 border-b border-border/50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-serif flex items-center gap-2 text-foreground">
                  <FileCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{groqContent ? 'Groq AI Generated Specification' : 'Revit Parameter Specification'}</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Revit 2026.1 (LOD 350) • Sheet Reference: E-101 / P-201
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPdf}
                  className="h-7 text-xs gap-1 border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                  title="Generate formatted architectural specification PDF"
                >
                  <Download className="h-3 w-3" />
                  <span>Download PDF</span>
                </Button>
                <Button variant="outline" size="sm" onClick={copyToClipboard} className="h-7 text-xs gap-1">
                  {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3.5">
              {groqContent ? (
                /* Live Groq Markdown Output */
                <div className="rounded-lg border border-border/70 bg-muted/30 p-4 text-xs font-mono whitespace-pre-wrap leading-relaxed text-foreground max-h-[640px] overflow-y-auto">
                  {groqContent}
                </div>
              ) : (
                /* Architectural Template Display */
                <>
                  {/* Lighting section */}
                  <div className="rounded-lg border border-border/70 bg-amber-500/5 dark:bg-amber-500/10 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <Lightbulb className="h-3.5 w-3.5" /> 1. Lighting & Photometrics
                      </h4>
                      <Badge variant="gold" className="text-[10px]">Calculated: 320 Lux Target</Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="rounded border border-border/60 bg-background p-2">
                        <span className="text-muted-foreground block text-[10px]">Primary Ambient:</span>
                        <strong className="text-foreground text-[11px]">Flos architectural 2700K 90+ CRI recessed spot (4 units, spaced 48&quot; o.c.)</strong>
                      </div>
                      <div className="rounded border border-border/60 bg-background p-2">
                        <span className="text-muted-foreground block text-[10px]">Vanity Cove Accent:</span>
                        <strong className="text-foreground text-[11px]">24V IP65 continuous silicone diffuse channel (9.6W/m, 2400K dim-to-warm)</strong>
                      </div>
                      <div className="rounded border border-border/60 bg-background p-2">
                        <span className="text-muted-foreground block text-[10px]">Shower Recessed Niche:</span>
                        <strong className="text-foreground text-[11px]">Wet-rated IP67 miniature linear down-wash (120 lm/ft)</strong>
                      </div>
                      <div className="rounded border border-border/60 bg-background p-2">
                        <span className="text-muted-foreground block text-[10px]">Dimming Control:</span>
                        <strong className="text-foreground text-[11px]">0-10V Lutron HomeWorks architectural 4-scene keypad</strong>
                      </div>
                    </div>
                  </div>

                  {/* Plumbing section */}
                  <div className="rounded-lg border border-border/70 bg-blue-500/5 dark:bg-blue-500/10 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                        <Droplet className="h-3.5 w-3.5" /> 2. Plumbing Rough-in Schedule
                      </h4>
                      <Badge variant="blue" className="text-[10px]">Revit LOD 350</Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="rounded border border-border/60 bg-background p-2">
                        <span className="text-muted-foreground block text-[10px]">Tub Fill Elevation:</span>
                        <strong className="text-foreground text-[11px]">Floor mount valve centerline 31&quot; AFF, 6&quot; clearance</strong>
                      </div>
                      <div className="rounded border border-border/60 bg-background p-2">
                        <span className="text-muted-foreground block text-[10px]">Vanity Sinks:</span>
                        <strong className="text-foreground text-[11px]">Wall-mount spout rough-in at 42&quot; AFF, basin rim at 34&quot; AFF</strong>
                      </div>
                      <div className="rounded border border-border/60 bg-background p-2">
                        <span className="text-muted-foreground block text-[10px]">Shower Drainage:</span>
                        <strong className="text-foreground text-[11px]">Infinity linear channel drain, wall-adjacent with 1/4&quot; slope</strong>
                      </div>
                      <div className="rounded border border-border/60 bg-background p-2">
                        <span className="text-muted-foreground block text-[10px]">Supply Lines:</span>
                        <strong className="text-foreground text-[11px]">3/4&quot; dedicated hot/cold branches for rainhead</strong>
                      </div>
                    </div>
                  </div>

                  {/* Joinery section */}
                  <div className="rounded-lg border border-border/70 bg-purple-500/5 dark:bg-purple-500/10 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5" /> 3. Millwork & Material Elevation Codes
                      </h4>
                      <Badge variant="purple" className="text-[10px]">Sheet ID-304</Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground space-y-1">
                      <p>• <strong className="text-foreground">Stone:</strong> Roman Navona honed travertine with mitered 2&quot; apron edge.</p>
                      <p>• <strong className="text-foreground">Wood Joinery:</strong> Rift-cut white oak with custom matte polyurethane sealer.</p>
                      <p>• <strong className="text-foreground">Hardware:</strong> Concealed Blum Tip-On push-to-open heavy-duty soft-close runners.</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
